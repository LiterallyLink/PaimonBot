const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');
const questionList = require('../../assets/data/other/trivia.json');
const alphabet = 'ABCDE';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trivia')
		.setDescription('Answer correctly to win Mora!'),
	async run({ paimonClient, application }) {
		const user = await paimonClient.database.fetchPlayerData(application.user.id);

		const { question, answers, answer, id } = this.retrieveRandomQuestion(user, questionList);
		const answerList = paimonClient.utils.shuffle(answers);

		const componentRow = new MessageActionRow();

		for (let i = 0; i < answerList.length; i++) {
			componentRow.addComponents(
				new MessageButton()
					.setCustomId(`${answerList[i]}`)
					.setLabel(`${alphabet[i]}`)
					.setStyle('PRIMARY')
			);
		}

		const paimonThinking = new MessageAttachment('.\\assets\\images\\paimon\\paimonThinking.png', 'paimonThinking.png');

		const triviaEmbed = new MessageEmbed()
			.setTitle(`A Thousand Questions With Paimon!`)
			.setThumbnail(`attachment://${paimonThinking.name}`)
			.setDescription(`_ _\n**Q.** ${question}\n\n${this.formatAnswers(answerList)}_ _`)
			.setFooter({ text: '30s to answer.' })
			.setColor('WHITE');
		const triviaQuestion = await application.followUp({ embeds: [triviaEmbed], components: [componentRow], files: [paimonThinking] });

		const filter = (i) => i.user.id === application.user.id;
		const { customId } = await triviaQuestion.awaitMessageComponent({ filter, time: 300000 }).catch(() => null) || false;

		if (customId === answer) {
			await user.updateOne({ $inc: { mora: 5000 }, $set: { lastQuestionId: id } });

			const randomImage = Math.random() > 0.5 ? 'paimonScoff.png' : 'paimonSmug.png';
			const image = new MessageAttachment(`.\\assets\\images\\paimon\\${randomImage}`, randomImage);

			const correctEmbed = new MessageEmbed()
				.setTitle('Correct!')
				.setThumbnail(`attachment://${image.name}`)
				.setDescription(`_ _\nQ. ${question}\n\nYou chose: \`${answer}\`\nThe correct answer was \`${answer}\`_ _`)
				.setFooter({ text: 'You won 5000 Mora for answering correctly.' })
				.setColor('GREEN');
			triviaQuestion.edit({ embeds: [correctEmbed], components: [], files: [image] });
		} else if (!customId) {
			const titlesArr = ["Couldn't think of anything?", "You're too slow!", 'Did you fall asleep?'];
			const title = titlesArr[Math.floor(Math.random() * titlesArr.length)];

			const paimonDrool = new MessageAttachment('.\\assets\\images\\paimon\\paimonDrool.png');

			const noAnswerEmbed = new MessageEmbed()
				.setTitle(title)
				.setThumbnail(`attachment://paimonDrool.png`)
				.setDescription(`_ _\n**Q.** ${question}\n\nYou chose: \`No Answer Given\`\nThe correct answer was: \`${answer}\``)
				.setColor('WHITE');
			triviaQuestion.edit({ embeds: [noAnswerEmbed], components: [], files: [paimonDrool] });
		} else {
			const titlesArr = ['Incorrect!', 'Wrong!', 'Nope!', 'Really?', 'WRONG!'];
			const title = titlesArr[Math.floor(Math.random() * titlesArr.length)];

			const paimonStare = new MessageAttachment('.\\assets\\images\\paimon\\paimonStare.png');

			const incorrectEmbed = new MessageEmbed()
				.setTitle(title)
				.setThumbnail(`attachment://paimonStare.png`)
				.setDescription(`_ _\nQ. ${question}\n\nYou chose: \`${customId}\`\nThe correct answer was: \`${answer}\`_ _`)
				.setFooter({ text: 'Better luck next time!' })
				.setColor('RED');
			triviaQuestion.edit({ embeds: [incorrectEmbed], components: [], files: [paimonStare] });
		}
	},

	retrieveRandomQuestion(user, questions) {
		const { question, answers, answer, id } = questions[Math.floor(Math.random() * questions.length)];

		if (user.lastQuestionId === id) this.retrieveRandomQuestion(user, questions);

		return { question, answers, answer, id };
	},

	formatAnswers(answers) {
		let formattedAnswers = '';

		for (let i = 0; i < answers.length; i++) {
			formattedAnswers += `${alphabet[i]}. ${answers[i]}\n`;
		}

		return formattedAnswers;
	}
};
