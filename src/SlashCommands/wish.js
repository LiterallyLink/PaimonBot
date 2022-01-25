const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont('assets/fonts/zh-cn.ttf', { family: 'Zh-cn' });

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wish')
		.setDescription('Wishing Simulator')
		.addStringOption(option =>
			option
				.setName('banner')
				.setDescription('The specified banner.')
				.addChoices([
					['Wanderlust Invocation', 'wanderlust'],
					['Epitome Invocation', 'epitome'],
					['The Transcendent One Returns', 'transcendent']
				])
				.setRequired(true)),
	async run({ paimonClient, application }) {
		const banner = application.options.getString('banner');
		const { bannerName, gachaPool, image, emote } = require(`../../assets/data/banners/${banner}.json`);

		const wishButtons = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('multi')
					.setEmoji(`${emote}`)
					.setLabel(`10x`)
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('single')
					.setEmoji(`${emote}`)
					.setLabel('1x')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('delete')
					.setLabel('🗑️')
					.setStyle('PRIMARY')
			);

		const bannerImage = new MessageAttachment(`.\\assets\\images\\banners\\${image}.png`);

		const bannerEmbed = new MessageEmbed()
			.setTitle(`${bannerName}`)
			.setImage(`attachment://${image}.png`)
			.setColor('WHITE');
		const wishEmbed = await application.followUp({ embeds: [bannerEmbed], components: [wishButtons], files: [bannerImage] });

		const filter = i => i.user.id === application.user.id;
		const collector = wishEmbed.createMessageComponentCollector({ filter, time: 300000 });

		let totalWishes = 0;
		const canvasWidth = 1920;
		const canvasHeight = 1080;
		const canvas = createCanvas(canvasWidth, canvasHeight);
		const ctx = canvas.getContext('2d');

		return collector.on('collect', async i => {
			i.deferUpdate();
			const { customId } = i;

			if (customId === 'delete') {
				collector.stop();
				wishEmbed.delete().catch(() => null);
			} else if (customId === 'single') {
				this.generateBackground(ctx);

				const singleReward = await this.singleSummon(paimonClient, application.user, gachaPool);
				await this.generateSinglePullImage(ctx, singleReward);

				totalWishes += 1;

				const singlePullEmbed = new MessageEmbed()
					.setTitle(`${bannerName}`)
					.setImage('attachment://singlepull.png')
					.setFooter({ text: `Wish ${totalWishes}` })
					.setColor('WHITE');
				application.editReply({ embeds: [singlePullEmbed], files: [{ attachment: canvas.toBuffer(), name: 'singlepull.png' }] });
			} else if (customId === 'multi') {
				this.generateBackground(ctx);

				const multiRewards = await this.multiSummon(paimonClient, application.user, gachaPool);
				await this.generateMultiPullImage(ctx, multiRewards);

				totalWishes += 10;

				const singlePullEmbed = new MessageEmbed()
					.setTitle(`${bannerName}`)
					.setImage('attachment://multipull.png')
					.setFooter({ text: `Wish ${totalWishes}` })
					.setColor('WHITE');
				application.editReply({ embeds: [singlePullEmbed], files: [{ attachment: canvas.toBuffer(), name: 'multipull.png' }] });
			}
		});
	},

	async generateBackground(ctx) {
		const wishBackground = await loadImage(`.\\assets\\images\\banners\\wishBackground.jpg`);
		ctx.drawImage(wishBackground, 0, 0, ctx.canvas.width, ctx.canvas.height);
	},

	// eslint-disable-next-line consistent-return
	summon(pool) {
		let total = 0;

		for (let i = 0; i < pool.length; i++) {
			total += pool[i].chance;
		}

		let rand = Math.random() * total;

		for (let i = 0; i < pool.length; i++) {
			const { chance, itemPool, rarity } = pool[i];

			if (rand < chance) {
				return { prize: itemPool[Math.floor(Math.random() * itemPool.length)], rarity: rarity };
			}

			rand -= chance;
		}
	},

	async singleSummon(client, user, gachaPool) {
		const player = await client.database.fetchPlayerData(user.id);

		await player.updateOne({ $inc: { totalWishes: 1, fourStarPity: 1, fiveStarPity: 1 } });

		if ((player.fiveStarPity + 10) === 90) {
			gachaPool = this.filterGachaPool(gachaPool, 5);
		} else if ((player.fourStarPity + 1) === 10) {
			gachaPool = this.filterGachaPool(gachaPool, 4);
		}

		const { prize, rarity } = this.summon(gachaPool);

		if (rarity === 4) {
			await player.updateOne({ $set: { fourStarPity: 0 } });
		} else if (rarity === 5) {
			await player.updateOne({ $set: { fiveStarPity: 0 } });
		}

		await this.updatePlayerInventory(player, prize);

		return prize;
	},

	async multiSummon(client, user, gachaPool) {
		let itemArray = [];
		const player = await client.database.fetchPlayerData(user.id);

		await player.updateOne({ $inc: { totalWishes: 10, fiveStarPity: 10 } });
		await player.updateOne({ $set: { fourStarPity: 0 } });

		if ((player.fiveStarPity + 10) >= 90) {
			const fiveStarPool = this.filterGachaPool(gachaPool, 5);
			const fiveStarPull = this.summon(fiveStarPool);
			itemArray.push(fiveStarPull);
		}

		const fourStarPool = this.filterGachaPool(gachaPool, 4);
		const fourStarPull = this.summon(fourStarPool);
		itemArray.push(fourStarPull);

		const iterations = 10 - itemArray.length;

		for (let i = 0; i < iterations; i++) {
			const pull = this.summon(gachaPool);
			itemArray.push(pull);
		}

		itemArray = client.utils.shuffle(itemArray);
		const pulledFiveStar = itemArray.some(i => i.rarity === 5);

		const itemMap = new Map();

		for (let i = 0; i < 10; i++) {
			itemMap.set(i, this.updatePlayerInventory(player, itemArray[i].prize));
		}

		await Promise.all(itemMap.values());

		if (pulledFiveStar) await player.updateOne({ $set: { fiveStarPity: 0 } });

		return itemArray;
	},

	async generateMultiPullImage(ctx, multiRewards) {
		let panelXPositionIncrement = 10;
		const dy = 170;

		for (let i = 0; i < 10; i++) {
			const { prize } = multiRewards[i];

			const portrait = await loadImage(`.\\assets\\images\\banners\\wishSprites\\${prize}Panel.png`);
			ctx.drawImage(portrait, panelXPositionIncrement, dy, portrait.width, portrait.height);

			panelXPositionIncrement += (portrait.width / 2) + 25;
		}
	},

	async generateSinglePullImage(ctx, singleReward) {
		const itemImage = await loadImage(`.\\assets\\images\\banners\\wishSprites\\${singleReward}.png`);

		const itemXPosition = itemImage.width;
		const itemYPosition = itemImage.height;
		const drawHeight = (ctx.canvas.height / 2) - (itemYPosition / 2);
		const drawWidth = (ctx.canvas.width / 2) - (itemXPosition / 2);

		ctx.drawImage(itemImage, drawWidth, drawHeight, itemXPosition, itemYPosition);
	},

	filterGachaPool(gachaPool, rarity) {
		return gachaPool.filter(i => i.rarity === rarity);
	},

	async updatePlayerInventory(player, prize) {
		const item = player.inventory.find(i => i.name === prize);

		if (!item) {
			await player.updateOne({ $push: { inventory: { name: prize, count: 1 } } });
		} else {
			const itemIndex = player.inventory.findIndex(obj => obj.name === prize);
			await player.updateOne({ $inc: { [`inventory.${itemIndex}.count`]: 1 } });
		}
	}


};
