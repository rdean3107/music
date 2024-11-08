const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const musicIcons = require('../../UI/icons/musicicons');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription(lang.queueDescription),

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return sendReply(interaction, lang.queueNoVoiceChannel);
        }

        const queue = interaction.client.distube.getQueue(interaction.guildId);

        if (!queue || !queue.songs.length) {
            const noSongsEmbed = new EmbedBuilder() 
                .setColor(0x0000FF)
                .setAuthor({ 
                    name: lang.queueNoSongsTitle, 
                    iconURL: musicIcons.wrongIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })   
                .setDescription(lang.queueNoSongsMessage);

            return sendReply(interaction, { embeds: [noSongsEmbed] });
        }

        const queueEmbed = new EmbedBuilder()
            .setColor(0x0000FF)
            .setAuthor({ 
                name: lang.queueTitle, 
                iconURL: musicIcons.beatsIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })
            .setDescription(`${lang.queueSongs} ${queue.songs.length}`)
            .setTimestamp();

        // Duyệt qua danh sách bài hát trong hàng đợi và thêm vào Embed
        for (let i = 1; i < queue.songs.length; i++) {  // Bỏ qua bài hát đang phát
            const song = queue.songs[i];
            queueEmbed.addFields(
                { name: `${i}. ${song.name}`, value: `${lang.queueDuration} ${song.formattedDuration}` }
            );
        }

        return sendReply(interaction, { embeds: [queueEmbed] });
    },
};

// Hỗ trợ trả lời cho cả interaction và message
function sendReply(source, message) {
    if (source.isCommand()) {
        return source.reply(message);  // Dùng reply cho interaction
    }
    return source.channel.send(message);  // Dùng send cho message thường
}
