
const splitMessage = require('./splitMessage')
const sendEmbedsSafe = require('./sendEmbeds')
module.exports = async function safeReply(message, { content, embeds, files }) {
  if (content) {
    const chunks = splitMessage(content)
    for (const c of chunks) await message.reply(c)
  }

  if (embeds?.length) {
    await sendEmbedsSafe(message, embeds, !content)
  }

  if (files?.length) {
    await message.channel.send({ files })
  }
}