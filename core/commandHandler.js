const fs = require('fs')
const path = require('path')

module.exports = (client, commandsPath) => {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file))
    client.commands.set(command.name, command)
  }

  console.log(`✅ Loaded ${commandFiles.length} commands`)
}