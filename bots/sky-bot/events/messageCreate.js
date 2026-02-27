const config = require('../config')

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return

    const args = message.content.slice(config.prefix.length).trim().split(/ +/)
    const cmd = args.shift().toLowerCase()

    const command = client.commands.get(cmd)
    if (!command) return

    try {
      await command.execute(message, args, client)
    } catch (err) {
      console.error(err)
      message.reply('Error executing command: ' + err.message)
    }
  }
}