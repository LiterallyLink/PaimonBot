/* eslint-disable id-length */
const Event = require('../Event.js');
const { token, clientId } = require('../../../config.json');
const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fetch = require('node-superfetch');
const cheerio = require('cheerio');
const fs = require('fs');
const emotes = require('../../../assets/other/emotes.json');

module.exports = class Util {

	constructor(client) {
		this.client = client;
	}

	get directory() {
		return `${path.dirname(require.main.filename)}${path.sep}`;
	}

	async sleep(ms) {
		if (typeof ms !== 'number') return new TypeError('ms must be a number');
		return await new Promise(resolve => setTimeout(resolve, ms));
	}

	trimArray(arr, maxLen = 10) {
		if (typeof maxLen !== 'number') return new TypeError('maxLen must be a number');

		if (arr.length > maxLen) {
			const len = arr.length - maxLen;
			arr = arr.slice(0, maxLen);
			arr.push(`${len} more...`);
		}
		return arr;
	}

	removeDuplicates(arr) {
		return [...new Set(arr)];
	}

	shuffle(array) {
		const arr = array.slice(0);
		for (let i = arr.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		return arr;
	}

	generateRandomInteger(min, max) {
		return Math.round(Math.random() * (max - min)) + min;
	}

	formatMS(ms) {
		const secondsInADay = 60 * 60 * 1000 * 24;
		const secondsInAHour = 60 * 60 * 1000;

		const days = Math.floor(ms / secondsInADay);
		const hours = Math.floor((ms % secondsInADay) / secondsInAHour);
		const minutes = Math.floor(((ms % secondsInADay) % secondsInAHour) / (60 * 1000));
		const seconds = Math.floor((ms % (1000 * 60)) / 1000);

		const mapped = {
			s: 's',
			m: 'm',
			h: 'h',
			d: 'd'
		};

		return [
			{ type: 'd', value: days },
			{ type: 'h', value: hours },
			{ type: 'm', value: minutes },
			{ type: 's', value: seconds }
		].filter(x => x.value > 0).map(x => `${x.value}${mapped[x.type]}`).join(' ');
	}

	parseEmote(str) {
		str = str.toLowerCase().replace(' ', '');
		return emotes[str] || '';
	}

	compareArrays(arrayX, arrayY) {
		return arrayY.filter(x => !arrayX.includes(x));
	}

	async storeAPIData() {
		await this.cacheCharacters();
		await this.cacheArtifacts();
		await this.cacheFood();
		await this.cachePotions();
		await this.cacheWeapons();
		await this.cacheEnemies();
	}

	async fetchWebdata(url) {
		const { body } = await fetch.get(url);
		return cheerio.load(body);
	}

	async fetchUpToDateCharacterList() {
		const characterListUrl = 'https://genshin-impact.fandom.com/wiki/Characters/List';
		const upToDateCharacterArray = [];

		const $ = await this.fetchWebdata(characterListUrl);

		$('.article-table').first().find('tr').each((_i, elem) => {
			const character = $(elem).find('a').attr('title');

			if (character && character !== 'Traveler') upToDateCharacterArray.push(character);
		});

		return upToDateCharacterArray;
	}

	async updateCharacterData(characterList) {
		const baseUrl = 'https://genshin-impact.fandom.com/wiki/';
		const characterJSON = JSON.parse(fs.readFileSync(`${this.directory}../assets/data/characters.json`, 'utf8'));

		for (let i = 0; i < characterList.length; i++) {
			const character = characterList[i];
			const $ = await this.fetchWebdata(`${baseUrl}${character}`);

			const element = $(`td[data-source="element"]`).text().trim();
			const weapon = $(`td[data-source="weapon"]`).text().trim();
			const constellation = $(`div[data-source="constellation"] .pi-data-value>`).html();
			const region = $(`div[data-source="region"] .pi-data-value>`).text().trim() || 'None';
			const birthday = $(`div[data-source="birthday"] .pi-data-value`).text().split(' ');
			const titles = $(`div[data-source="title2"] li`).map((_i, elem) => $(elem).text().trim()).get();
			const affiliations = $(`div[data-source="affiliation"] a`).map((_i, elem) => $(elem).text().trim()).get();
			const rarity = +$(`td[data-source="rarity"] img`).attr('alt').replace(/[^0-9]/g, '');

			const $lore = await this.fetchWebdata(`${baseUrl}${character}/Lore`);
			const lore = $lore('.pull-quote__text').html().replace(/<br>/g, ' ');

			const $media = await this.fetchWebdata(`${baseUrl}${character}/Media`);
			const partyIcon = $media(`img[data-caption="Party Icon"]`).attr('data-src');
			const characterIcon = $media(`img[data-caption="Character Icon"]`).attr('data-src');

			const characterData = {
				name: character,
				rarity,
				element,
				weapon,
				lore,
				constellation,
				region,
				titles,
				affiliations,
				birthMonth: birthday[0],
				birthDay: parseInt(birthday[1]),
				partyIcon,
				characterIcon
			};

			characterJSON.push(characterData);
		}

		fs.writeFileSync(`${this.directory}../assets/data/characters.json`, JSON.stringify(characterJSON, null, 2));
		return characterJSON;
	}

	async cacheCharacters() {
		const upToDateCharacterList = await this.fetchUpToDateCharacterList();
		const charactersJSON = require(`${this.directory}../assets/data/characters.json`);
		const charactersToAdd = this.compareArrays(charactersJSON.map(char => char.name), upToDateCharacterList);

		let JSONToCache = charactersJSON;

		if (charactersToAdd.length > 0) JSONToCache = await this.updateCharacterData(charactersToAdd);

		for (let i = 0; i < JSONToCache.length; i++) {
			this.client.characters.set(JSONToCache[i].name, JSONToCache[i]);
		}

		console.log(`Cached ${JSONToCache.length} characters.`);
	}

	async fetchUpToDateArtifactList() {
		const artifactSetsURL = 'https://genshin-impact.fandom.com/wiki/Artifacts/Sets';
		const upToDateArtifactArray = [];

		const $ = await this.fetchWebdata(artifactSetsURL);

		$('.wikitable').find('tr').each((_i, elem) => {
			const artifactSet = $(elem).find('a').attr('title');

			if (artifactSet) upToDateArtifactArray.push(artifactSet);
		});

		return upToDateArtifactArray;
	}

	async updateArtifactData(artifactList) {
		const baseUrl = 'https://genshin-impact.fandom.com/wiki/';
		const artifactsJSON = JSON.parse(fs.readFileSync(`${this.directory}../assets/data/artifacts.json`, 'utf8'));

		for (let i = 0; i < artifactList.length; i++) {
			const setName = artifactList[i];
			const $ = await this.fetchWebdata(`${baseUrl}${setName}`);

			const rarity = $(`.wds-tabs__tab`).map((_i, elem) => +$(elem).text().replace(/[^0-9]/g, '')).get();

			const artifactObj = {
				name: setName,
				rarity,
				bonuses: [],
				pieces: []
			};

			$('div[data-item-name="artifact set pieces"]').each((j, elem) => {
				const pieceId = $(elem).find('b').text().split(' ')[0].toLowerCase();
				const pieceName = $(elem).find('a').text().trim();
				const pieceLore = $(`.description i`).eq(j).text();

				const pieceSRCImage = $(elem).find('img').attr('src');
				const pieceDataSRCImage = $(elem).find('img').attr('data-src');

				const pieceImage = pieceSRCImage.startsWith('https') ? pieceSRCImage : pieceDataSRCImage;

				artifactObj.pieces.push({ id: pieceId, name: pieceName, lore: pieceLore, image: pieceImage });
			});

			const onePieceBonus = $(`div[data-source="1pcBonus"] .pi-data-value`).text().trim();
			if (onePieceBonus !== '') artifactObj.bonuses.push({ name: 'One Piece Bonus', effect: onePieceBonus });

			const twoPieceBonus = $(`div[data-source="2pcBonus"] .pi-data-value`).text().trim();
			if (twoPieceBonus !== '') artifactObj.bonuses.push({ name: 'Two Piece Bonus', effect: twoPieceBonus });

			const fourPieceBonus = $(`div[data-source="4pcBonus"] .pi-data-value`).text().trim();
			if (fourPieceBonus !== '') artifactObj.bonuses.push({ name: 'Four Piece Bonus', effect: fourPieceBonus });

			artifactsJSON.push(artifactObj);
		}

		fs.writeFileSync(`${this.directory}../assets/data/artifacts.json`, JSON.stringify(artifactsJSON, null, 2));
		return artifactsJSON;
	}

	async cacheArtifacts() {
		const artifactList = await this.fetchUpToDateArtifactList();
		const artifactJSON = require(`${this.directory}../assets/data/artifacts.json`);
		const artifactsToAdd = this.compareArrays(artifactJSON.map(set => set.name), artifactList);

		let JSONToCache = artifactJSON;

		if (artifactsToAdd.length > 0) JSONToCache = await this.updateArtifactData(artifactsToAdd);

		for (let i = 0; i < JSONToCache.length; i++) {
			this.client.artifacts.set(JSONToCache[i].name, JSONToCache[i]);
		}

		console.log(`Cached ${JSONToCache.length} artifact sets.`);
	}

	async cacheFood() {
		const upToDateFoodList = await this.fetchUpToDateFoodList();
		const foodJSON = require(`${this.directory}../assets/data/consumables/food.json`);
		const foodToAdd = this.compareArrays(foodJSON.map(dish => dish.name), upToDateFoodList);

		let JSONToCache = foodJSON;

		if (foodToAdd.length > 0) JSONToCache = await this.retrieveAndSubmitFoodData(foodToAdd);

		for (let i = 0; i < JSONToCache.length; i++) {
			this.client.food.set(JSONToCache[i].name, JSONToCache[i]);
		}

		console.log(`Cached ${JSONToCache.length} food items.`);
	}

	async fetchUpToDateFoodList() {
		const foodListUrl = 'https://genshin-impact.fandom.com/wiki/Food/Change_History?action=edit';

		const $ = await this.fetchWebdata(foodListUrl);
		const stringOfFood = $('textarea').text();

		return stringOfFood.match(/\|[^|]+\|/g).map(food => food.replace(/\|/g, '')) || [];
	}

	async retrieveAndSubmitFoodData(foodList) {
		const baseUrl = 'https://genshin-impact.fandom.com/wiki/';
		const foodJSON = JSON.parse(fs.readFileSync(`${this.directory}../assets/data/consumables/food.json`, 'utf8'));

		for (let i = 0; i < foodList.length; i++) {
			const foodUrl = `${baseUrl}${foodList[i]}`;

			const $ = await this.fetchWebdata(foodUrl);

			const rarity = parseInt($('td[data-source="rarity"]').find('img').attr('alt'));
			const type = $('div[data-source="type"] .mw-redirect').text();

			const foodObj = {
				name: foodList[i],
				rarity,
				type,
				recipe: [],
				tiers: []
			};

			$('.new_genshin_recipe_body .card_with_caption').each((_i, ele) => {
				const amount = $(ele).find('.card_text').text();
				const ingredient = $(ele).find('.card_caption').text();
				foodObj.recipe.push(`x${amount} ${ingredient}`);
			});

			foodObj.recipe.pop();

			const normalDescription = $('div[data-source="description"] .pi-data-value').text();

			if (normalDescription) {
				const normalEffect = $('div[data-source="effect"] .pi-data-value').text();
				const normalImage = $('[data-source="image"]').find('img').attr('src');

				foodObj.tiers.push({ tier: 'Normal', description: normalDescription, effect: normalEffect, image: normalImage });
			}

			const deliciousDescription = $('div[data-source="desc_delicious"] .pi-data-value').text();

			if (deliciousDescription) {
				const deliciousEffect = $('div[data-source="eff_delicious1"] .pi-data-value').text();
				const deliciousImage = $('[data-source="image_delicious"]').find('img').attr('src');

				foodObj.tiers.push({ tier: 'Delicious', description: deliciousDescription, effect: deliciousEffect, image: deliciousImage });
			}

			const suspiciousDescription = $('div[data-source="desc_suspicious"] .pi-data-value').text();

			if (suspiciousDescription) {
				const suspiciousEffect = $('div[data-source="eff_suspicious1"] .pi-data-value').text();
				const suspiciousImage = $('[data-source="image_suspicious"]').find('img').attr('src');

				foodObj.tiers.push({ tier: 'Suspicious', description: suspiciousDescription, effect: suspiciousEffect, image: suspiciousImage });
			}

			foodJSON.push(foodObj);
		}

		fs.writeFileSync(`${this.directory}../assets/data/consumables/food.json`, JSON.stringify(foodJSON, null, 2));
		return foodJSON;
	}

	async cachePotions() {
		const potionList = await this.fetchUpToDatePotionList();
		const currentPotionJSON = require(`${this.directory}../assets/data/consumables/potions.json`);
		const potionsToAdd = this.compareArrays(currentPotionJSON.map(potion => potion.name), potionList);

		let JSONToCache = currentPotionJSON;

		if (potionsToAdd.length > 0) JSONToCache = await this.retrieveAndSubmitPotionData(potionsToAdd);

		for (let i = 0; i < JSONToCache.length; i++) {
			this.client.potions.set(JSONToCache[i].name, JSONToCache[i]);
		}

		console.log(`Cached ${JSONToCache.length} potions.`);
	}

	async fetchUpToDatePotionList() {
		const potionListURL = 'https://genshin-impact.fandom.com/wiki/Potions/List';
		const $ = await this.fetchWebdata(potionListURL);

		const potionList = [];

		$('.article-table tr td a').each((_i, ele) => {
			const potion = $(ele).text();
			if (potion !== '') potionList.push(potion);
		});

		return potionList;
	}

	async retrieveAndSubmitPotionData(potionsToAdd) {
		const baseUrl = 'https://genshin-impact.fandom.com/wiki/';
		const potionJSON = JSON.parse(fs.readFileSync(`${this.directory}../assets/data/consumables/potions.json`, 'utf8'));

		for (let i = 0; i < potionsToAdd.length; i++) {
			const potionUrl = `${baseUrl}${potionsToAdd[i]}`;
			const $ = await this.fetchWebdata(potionUrl);

			const rarity = parseInt($('td[data-source="rarity"]').find('img').attr('alt'));

			const description = $('div[data-source="description"] .pi-data-value').text().trim();
			const effect = $('div[data-source="effect"] .pi-data-value').text();
			const type = $('div[data-source="type"] .pi-data-value').find('a').attr('title');

			const thumbnail = $('.image-thumbnail').attr('href');

			const potionObj = {
				name: potionsToAdd[i],
				type,
				recipe: [],
				rarity,
				description,
				effect,
				thumbnail
			};

			$('.new_genshin_recipe_body .card_with_caption').each((_i, ele) => {
				const amount = $(ele).find('.card_text').text();
				const item = $(ele).find('.card_caption').text();

				potionObj.recipe.push(`x${amount} ${item}`);
			});

			potionObj.recipe.pop();

			potionJSON.push(potionObj);
		}

		fs.writeFileSync(`${this.directory}../assets/data/consumables/potions.json`, JSON.stringify(potionJSON, null, 2));
		return potionJSON;
	}

	async cacheWeapons() {
		const weaponList = await this.fetchUpToDateWeaponList();
		const currentWeaponJSON = require(`${this.directory}../assets/data/weapons.json`);
		const weaponsToAdd = this.compareArrays(currentWeaponJSON.map(weapon => weapon.name), weaponList);

		let JSONToCache = currentWeaponJSON;

		if (weaponsToAdd.length > 0) JSONToCache = await this.retrieveAndSubmitWeaponData(weaponsToAdd);

		for (let i = 0; i < JSONToCache.length; i++) {
			this.client.weapons.set(JSONToCache[i].name, JSONToCache[i]);
		}

		console.log(`Cached ${JSONToCache.length} weapons.`);
	}

	async fetchUpToDateWeaponList() {
		const weaponListURL = 'https://genshin-impact.fandom.com/wiki/Weapons/List';
		const $ = await this.fetchWebdata(weaponListURL);

		const weaponsToAdd = [];

		$('.article-table').first().find('tr').each((_i, ele) => {
			const weapon = $(ele).find('td a').attr('title');

			if (weapon) weaponsToAdd.push(weapon);
		});

		return weaponsToAdd;
	}

	async retrieveAndSubmitWeaponData(weaponsToAdd) {
		const baseUrl = 'https://genshin-impact.fandom.com/wiki/';
		const weaponJSON = JSON.parse(fs.readFileSync(`${this.directory}../assets/data/weapons.json`, 'utf8'));

		for (let i = 0; i < weaponsToAdd.length; i++) {
			const name = weaponsToAdd[i];
			const $ = await this.fetchWebdata(`${baseUrl}${name}`);

			const lore = $('.description i').text();
			const baseThumbnail = $('.pi-image img').first().attr('src');
			const ascensionThumbnail = $('.pi-image img').last().attr('src');
			const type = $('div[data-source="type"] .pi-data-value').text();
			const rarity = parseInt($('div[data-source="rarity"] img').attr('alt'));
			const preview = $('div[class="ogv-gallery-item"] img').attr('data-src');
			const passive = $('th[data-source="eff_rank1_var1"]').text();
			const baseATK = $('.pi-smart-data-value').eq(0).text();
			const statType = $('.pi-smart-data-value').eq(1).text();
			const statValue = $('.pi-smart-data-value').eq(2).text();

			const weaponObj = {
				name,
				rarity,
				type,
				lore,
				passive,
				baseThumbnail,
				ascensionThumbnail,
				obtain: [],
				preview,
				refinement: [],
				materials: [],
				baseATK,
				statType,
				statValue
			};

			for (let j = 1; j < 6; j++) {
				weaponObj.refinement.push($(`td[data-source="eff_rank${j}_var1"]`).text());
			}

			$('.card_with_caption').each((_i, ele) => {
				const amount = $(ele).find('.card_text').text();
				const material = $(ele).find('.card_caption').text();
				const image = $(ele).find('.card_image a').find('img').attr('data-src');

				weaponObj.materials.push({ amount, material, image });
			});

			$('div[data-source="obtain"] .pi-data-value a').each((_i, ele) => {
				weaponObj.obtain.push($(ele).text());
			});

			weaponJSON.push(weaponObj);
		}

		fs.writeFileSync(`${this.directory}../assets/data/weapons.json`, JSON.stringify(weaponJSON, null, 2));
		return weaponJSON;
	}

	async cacheEnemies() {
		const listOfEnemies = await this.fetchUpToDateEnemyList();
		const currentEnemyJSON = require(`${this.directory}../assets/data/enemies.json`);
		const enemiesToAdd = this.compareArrays(currentEnemyJSON.map(enemy => enemy.id), listOfEnemies);

		let JSONToCache = currentEnemyJSON;

		if (enemiesToAdd.length) JSONToCache = await this.retrieveAndSubmitEnemyData(enemiesToAdd);

		for (let i = 0; i < JSONToCache.length; i++) {
			this.client.enemies.set(JSONToCache[i].name, JSONToCache[i]);
		}

		console.log(`Cached ${this.client.enemies.size} enemies`);
	}

	async fetchUpToDateEnemyList() {
		const enemyListURL = 'https://genshin-impact.fandom.com/wiki/Enemies/List';
		const $ = await this.fetchWebdata(enemyListURL);
		const enemyList = [];

		$('.card_caption').each((_i, ele) => {
			enemyList.push($(ele).find('a').attr('title'));
		});

		return enemyList;
	}

	async retrieveAndSubmitEnemyData(enemiesToAdd) {
		const baseUrl = 'https://genshin-impact.fandom.com/wiki/';
		const enemyJSON = JSON.parse(fs.readFileSync(`${this.directory}../assets/data/enemies.json`, 'utf8'));

		for (let i = 0; i < enemiesToAdd.length; i++) {
			const $ = await this.fetchWebdata(`${baseUrl}${enemiesToAdd[i]}`);

			const type = $('div[data-source="type"] .pi-data-value').last().text();

			const enemyObj = {
				id: enemiesToAdd[i],
				type,
				drops: []
			};

			$('.card_caption').each((_i, ele) => {
				const drop = $(ele).find('a').attr('title');
				if (!enemyObj.drops.includes(drop)) enemyObj.drops.push(drop);
			});

			if (type === 'Weekly Bosses') {
				enemyObj.name = $('[data-source="name"]').last().text();
				enemyObj.thumbnail = $('.pi-image-thumbnail').last().attr('src');
				enemyObj.description = $('.description div').first().text();
			} else {
				enemyObj.name = enemiesToAdd[i];
				enemyObj.description = $('.description i').first().text().replace('<br>', ' ');
				enemyObj.thumbnail = $('.pi-image-thumbnail').attr('src');
				enemyObj.group = $('div[data-source="group"] .pi-data-value').text();
				enemyObj.family = $('div[data-source="family"] .pi-data-value').text();
			}

			enemyJSON.push(enemyObj);
		}

		fs.writeFileSync(`${this.directory}../assets/data/enemies.json`, JSON.stringify(enemyJSON, null, 2));
		return enemyJSON;
	}

	async loadSlashCommands(guildId) {
		const slashCommandArray = [];

		const commands = await glob(`${this.directory}slashcommands/**/*.js`);

		for (const commandFile of commands) {
			const command = require(commandFile);
			slashCommandArray.push(command.data.toJSON());

			this.client.slashCommands.set(command.data.name, command);
		}

		const rest = new REST({ version: '9' }).setToken(token);

		await this.registerSlashCommands(rest, slashCommandArray, guildId);
	}

	async registerSlashCommands(rest, slashCommandArray, guildId) {
		try {
			if (guildId) {
				await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: slashCommandArray });
			} else {
				await rest.put(Routes.applicationCommands(clientId), { body: slashCommandArray });
			}
		} catch (error) {
			if (error) return console.error(error);
		}

		return console.log(`Registered ${slashCommandArray.length} Slashcommands.`);
	}

	async clearSlashCommands() {
		const rest = new REST({ version: '9' }).setToken(token);

		rest.get(Routes.applicationCommands(clientId)).then(data => {
			const promises = [];

			for (const command of data) {
				const deleteUrl = `${Routes.applicationCommands(clientId)}/${command.id}`;
				promises.push(rest.delete(deleteUrl));
			}

			return Promise.all(promises);
		});
	}

	async loadEvents() {
		const events = await glob(`${this.directory}events/**/*.js`);

		for (const file of events) {
			delete require.cache[file];

			const { name } = path.parse(file);
			const EventFile = require(file);
			const event = new EventFile(this.client, name);

			if (!(event instanceof Event)) throw new TypeError(`Event ${name} doesn't belong in Events`);

			this.client.events.set(event.name, event);
			event.emitter[event.type](name, (...args) => event.run(...args));
		}
	}

};
