const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { DisTubeError } = require('distube');
const musicIcons = require('../../UI/icons/musicicons');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription(lang.skipDescription),

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        // Kiểm tra xem người dùng có ở kênh voice không
        if (!voiceChannel) {
            return interaction.reply(lang.skipNoVoiceChannel);
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return interaction.reply(lang.skipNoPermissions);
        }

        try {
            // Hoãn trả lời tương tác để tránh lỗi InteractionAlreadyReplied
            await interaction.deferReply();

            // Lấy queue hiện tại
            const queue = interaction.client.distube.getQueue(interaction.guildId);
            if (!queue || !queue.songs.length) {
                const noSongsEmbed = new EmbedBuilder()
                    .setColor(0x0000FF)
                    .setAuthor({ 
                        name: lang.skipNoSongsTitle, 
                        iconURL: musicIcons.wrongIcon,
                        url: "https://discord.gg/xQF9f9yUEM"
                    })
                    .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })   
                    .setDescription(lang.skipNoSongsMessage);

                return interaction.editReply({ embeds: [noSongsEmbed] });
            }

            // Skip the song
            await interaction.client.distube.skip(voiceChannel);

            // Kiểm tra nếu có bài hát tiếp theo trong hàng đợi
            const nextSong = queue.songs[0];
            const nextSongEmbed = new EmbedBuilder()
                .setColor(0x0000FF)
                .setAuthor({ 
                    name: lang.skipSuccessTitle, 
                    iconURL: musicIcons.skipIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })  
                .addFields(
                    { name: lang.skipTitleField, value: nextSong.name },
                    { name: lang.skipDurationField, value: nextSong.formattedDuration }
                );

            await interaction.editReply({ embeds: [nextSongEmbed] });

        } catch (error) {
            console.error(error);

            // Xử lý lỗi DisTubeError
            if (error instanceof DisTubeError && error.code === 'NO_QUEUE') {
                const noQueueEmbed = new EmbedBuilder()
                    .setColor(0x0000FF)
                    .setAuthor({ 
                        name: lang.skipNoQueueTitle, 
                        iconURL: musicIcons.wrongIcon,
                        url: "https://discord.gg/xQF9f9yUEM"
                    })
                    .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })  
                    .setDescription(lang.skipNoQueueMessage);

                return interaction.editReply({ embeds: [noQueueEmbed] });

            } else if (error instanceof DisTubeError && error.code === 'NO_UP_NEXT') {
                const noUpNextEmbed = new EmbedBuilder()
                    .setColor(0x0000FF)
                    .setAuthor({ 
                        name: lang.skipNoUpNextTitle, 
                        iconURL: musicIcons.wrongIcon,
                        u
