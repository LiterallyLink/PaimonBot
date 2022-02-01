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
				.setDescription('The desired banner to wish for.')
				.addChoices([
					['Wanderlust Invocation', 'wanderlust'],
					['Epitome Invocation', 'epitome'],
					['Gentry of Hermitage', 'gentry'],
					['Adrift in the Harbor', 'adrift']
				])
				.setRequired(true)),
	async run({ paimonClient, application }) {
		const bannerOption = application.options.getString('banner');
		const banner = require(`../../assets/data/banners/${bannerOption}.json`);
		const { emote, bannerName, image } = banner;

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
			}

			if (customId === 'single') {
				this.generateBackground(ctx);
				totalWishes++;

				const player = await paimonClient.database.fetchPlayerData(application.user.id);
				const reward = await this.singleSummon(player, banner);
				await this.generateSinglePullImage(ctx, reward);

				const singlePullEmbed = new MessageEmbed()
					.setTitle(`${bannerName}`)
					.setImage('attachment://singlepull.png')
					.setFooter({ text: `Wish ${totalWishes}` })
					.setColor('WHITE');
				application.editReply({ embeds: [singlePullEmbed], files: [{ attachment: canvas.toBuffer(), name: 'singlepull.png' }] });
			}

			if (customId === 'multi') {
				this.generateBackground(ctx);
				totalWishes += 10;

				const player = await paimonClient.database.fetchPlayerData(application.user.id);
				const rewards = await this.multiSummon(player, banner);
				await this.generateMultiImage(ctx, rewards);

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

	async singleSummon(player, banner) {
		const { type } = banner;
		let { gachaPool } = banner;

		const pityIndex = player.pity.findIndex(j => j.type === type);
		const { fourStarPity, fiveStarPity } = player.pity[pityIndex];

		if (fiveStarPity >= 89) gachaPool = this.filterGachaPool(gachaPool, 5);
		else if (fourStarPity >= 9) gachaPool = this.filterGachaPool(gachaPool, 4);

		const { prize, rarity } = this.summon(gachaPool);

		await player.updateOne({
			$inc: { totalWishes: 1, [`pity.${pityIndex}.fourStarPity`]: 1, [`pity.${pityIndex}.fiveStarPity`]: 1, [`pity.${pityIndex}.totalWishes`]: 1 },
			$push: { [`pity.${pityIndex}.wishHistory`]: `${rarity}⭐: ${prize}` }
		});

		if (rarity === 4) await player.updateOne({ $set: { [`pity.${pityIndex}.fourStarPity`]: 1 } });
		else if (rarity === 5) await player.updateOne({ $set: { [`pity.${pityIndex}.fiveStarPity`]: 1 } });

		await this.updatePlayerInventory(player, prize, 1);

		return prize;
	},

	async generateSinglePullImage(ctx, reward) {
		const itemImage = await loadImage(`.\\assets\\images\\banners\\wishSprites\\${reward}.png`);

		const itemXPosition = itemImage.width;
		const itemYPosition = itemImage.height;
		const drawHeight = (ctx.canvas.height / 2) - (itemYPosition / 2);
		const drawWidth = (ctx.canvas.width / 2) - (itemXPosition / 2);

		ctx.drawImage(itemImage, drawWidth, drawHeight, itemXPosition, itemYPosition);
	},

	async multiSummon(player, banner) {
		const { type, gachaPool } = banner;

		const pityIndex = player.pity.findIndex(j => j.type === type);
		const { fiveStarPity } = player.pity[pityIndex];

		await player.updateOne({ $set: { [`pity.${pityIndex}.fourStarPity`]: 0 }, $inc: { totalWishes: 10, [`pity.${pityIndex}.fiveStarPity`]: 10, [`pity.${pityIndex}.totalWishes`]: 10 } });

		const itemArray = [];

		if (fiveStarPity >= 80) {
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

		await player.updateOne({ $push: { [`pity.${pityIndex}.wishHistory`]: { $each: itemArray.map(j => `${j.rarity}⭐: ${j.prize}`) } } });

		const pulledFiveStar = itemArray.some(j => j.rarity === 5);
		if (pulledFiveStar) await player.updateOne({ $set: { [`pity.${pityIndex}.fiveStarPity`]: 0 } });

		const modifiedItemArray = itemArray.reduce((acc, cur) => {
			const existing = acc.find(i => i.prize === cur.prize);
			if (existing) {
				existing.count++;
			} else {
				acc.push({ prize: cur.prize, count: 1 });
			}

			return acc;
		}, []);

		const arr = [];

		for (let i = 0; i < modifiedItemArray.length; i++) {
			arr.push(this.updatePlayerInventory(player, modifiedItemArray[i].prize, modifiedItemArray[i].count));
		}

		await Promise.all(arr);

		for (let i = 0; i < itemArray.length - 1; i++) {
			const j = Math.floor(Math.random() * (i + 1));
			[itemArray[i], itemArray[j]] = [itemArray[j], itemArray[i]];
		}

		return itemArray;
	},

	async generateMultiImage(ctx, rewards) {
		let panelXPositionIncrement = 10;
		const dy = 170;

		for (let i = 0; i < 10; i++) {
			const { prize } = rewards[i];
			const portrait = await loadImage(`.\\assets\\images\\banners\\wishSprites\\${prize}Panel.png`);

			ctx.drawImage(portrait, panelXPositionIncrement, dy, portrait.width, portrait.height);
			panelXPositionIncrement += (portrait.width / 2) + 25;
		}
	},

	filterGachaPool(gachaPool, rarity) {
		return gachaPool.filter(i => i.rarity === rarity);
	},

	async updatePlayerInventory(player, prize, count) {
		const item = player.inventory.find(i => i.name === prize);

		if (!item) {
			await player.updateOne({ $push: { inventory: { name: prize, count: 1 } } });
		} else {
			const itemIndex = player.inventory.findIndex(obj => obj.name === prize);
			await player.updateOne({ $inc: { [`inventory.${itemIndex}.count`]: count } });
		}
	}

};
