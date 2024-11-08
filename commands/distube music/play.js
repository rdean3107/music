const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const config = require('./../../config.json');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription(lang.playDescription)
        .addStringOption(option =>
            option.setName('input')
                .setDescription(lang.playInputDescription)
                .setRequired(true)),

    async execute(interaction) {
        const input = interaction.options.getString('input') || extractInputFromMessage(interaction);

        if (!input) {
            return interaction.reply(lang.playNoInput);
        }

        return executePlay(interaction, input);
    },
};

// Hàm hỗ trợ trích xuất input từ message
function extractInputFromMessage(interaction) {
    const guildId = interaction.guildId;
    const prefix = config.prefixes.server_specific[guildId] || config.prefixes.default;
    const args = interaction.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if (command === 'play') {
        return args.join(' ');
    }
    return null;
}

async function executePlay(interaction, input) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
        return interaction.reply(lang.playNoVoiceChannel);
    }

    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return interaction.reply(lang.playNoPermissions);
    }

    try {
        await interaction.reply(`${lang.playInProgress} ${input}`);

        // Kiểm tra nếu input là playlist
        if (isPlaylist(input)) {
            // Xử lý playlist
            await interaction.client.distube.play(voiceChannel, input, {
                textChannel: interaction.channel,
                member: interaction.member,
            });
        } else {
            // Xử lý bài hát thông thường
            await interaction.client.distube.play(voiceChannel, input, {
                textChannel: interaction.channel,
                member: interaction.member,
            });
        }
    } catch (error) {
        console.error(error);
        // Chi tiết lỗi có thể giúp người dùng hiểu rõ hơn
        await interaction.editReply(`${lang.playError} - ${error.message}`);
    }
}

function isPlaylist(input) {
    const playlistPatterns = [
        /playlist\?list=/i, // YouTube playlist pattern
        /open\.spotify\.com\/playlist\//i, // Spotify playlist pattern
        /spotify:playlist:/i // Spotify playlist URI pattern
    ];
    return playlistPatterns.some(pattern => pattern.test(input));
}
