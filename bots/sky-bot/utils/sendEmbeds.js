module.exports = async function sendEmbedsSafe(channel, embeds, reply = false) {
  const MAX = 10 // Discord limit: 10 embeds / message

  for (let i = 0; i < embeds.length; i += MAX) {
    const batch = embeds.slice(i, i + MAX)

    if (reply && i === 0) {
      // reply message đầu
      await channel.reply({ embeds: batch })
    } else {
      // các message sau
      await channel.channel.send({ embeds: batch })
    }
  }
}