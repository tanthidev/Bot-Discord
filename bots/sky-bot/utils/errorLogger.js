const { EmbedBuilder } = require('discord.js')

module.exports = async function logError(client, error, extra = '') {
  try {
    const channelId = "1476911530426630246" // ID kênh log lỗi

    if (!channelId) return

    const channel = await client.channels.fetch(channelId)
    if (!channel) return

    const embed = new EmbedBuilder()
      .setTitle('BOT ERROR')
      .setColor(0xff0000)
      .setDescription(`\`\`\`${error.stack || error}\`\`\``)
      .addFields(
        { name: 'Extra Info', value: extra || 'None', inline: false }
      )
      .setTimestamp()

    channel.send({ embeds: [embed] })
  } catch (err) {
    console.error('Error logger failed:', err)
  }
}