const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { DisTubeError } = require('distube');
const musicIcons = require('../../UI/icons/musicicons');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription(lang.loopDescription)
        .addStringOption(option =>
            option.setName('mode')
                .setDescription(lang.loopModeDescription)
                .setRequired(false)),

    async execute(interaction) {
        if (!interaction.isCommand()) return;

        await interaction.deferReply(); // Hoãn trả lời để tránh lỗi "InteractionAlreadyReplied"

        try {
            await executeLoop(interaction);
        } catch (error) {
            console.error(error);
            const errorMessage = lang.loopError;
            await interaction.editReply(errorMessage);
        }
    },

    async executePrefix(message, args) {
        try {
            await executeLoop(message);
        } catch (error) {
            console.error(error);
            const errorMessage = lang.loopError;
            await message.channel.send(errorMessage);
        }
    },
};

async function executeLoop(source) {
    const voiceChannel = source.member.voice.channel;

    if (!voiceChannel) {
        const errorMessage = lang.loopNoVoiceChannel;
        return sendReply(source, errorMessage);
    }

    const permissions = voiceChannel.permissionsFor(source.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        const permissionMessage = lang.loopNoPermissions;
        return sendReply(source, permissionMessage);
    }

    const loopMode = source.options?.getString('mode') || (source.content.split(/\s+/)[1] || '').toLowerCase();
    const guildId = source.guildId;
    const queue = source.client.distube.getQueue(guildId);

    if (!queue) {
        const noQueueEmbed = new EmbedBuilder()
            .setColor(0x0000FF)
            .setAuthor({ 
                name: lang.loopNoQueueTitle, 
                iconURL: musicIcons.wrongIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setFooter({ text: lang.loopFooterText, iconURL: musicIcons.footerIcon })
            .setDescription(lang.loopNoQueue);

        return sendReply(source, { embeds: [noQueueEmbed] });
    }

    const toggleLoopEmbed = new EmbedBuilder()
        .setColor(0x0000FF)
        .setFooter({ text: lang.loopFooterText, iconURL: musicIcons.footerIcon })
        .setAuthor({ 
            name: lang.loopTitle, 
            iconURL: musicIcons.loopIcon,
            url: "https://discord.gg/xQF9f9yUEM"
        });

    if (loopMode === 'queue') {
        await source.client.distube.setRepeatMode(guildId, 2);
        toggleLoopEmbed.setDescription(lang.loopQueueEnabled);
    } else if (loopMode === 'song') {
        await source.client.distube.setRepeatMode(guildId, 1);
        toggleLoopEmbed.setDescription(lang.loopSongEnabled);
    } else {
        const repeatMode = queue.repeatMode === 1 ? 0 : 1;
        await source.client.distube.setRepeatMode(guildId, repeatMode);
        toggleLoopEmbed.setDescription(repeatMode === 1 ? lang.loopSongEnabled : lang.loopDisabled);
    }

    return sendReply(source, { embeds: [toggleLoopEmbed] });
}

// Hỗ trợ trả lời cho cả interaction và message
function sendReply(source, message) {
    if (source.isCommand()) {
        return source.editReply(message);  // Dùng editReply cho interaction
    } else {
        return source.channel.send(message);  // Dùng send cho messag
