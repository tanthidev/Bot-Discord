require('dotenv').config()

const startCron = require('../../core/cron')

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js')
const path = require('path')

const config = require('./config')
const loadCommands = require('../../core/commandHandler')
const loadEvents = require('../../core/eventHandler')

// Init client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
})

client.config = config

// Store commands
client.commands = new Collection()

// Load commands
loadCommands(client, path.join(__dirname, 'commands'))

// Load events
loadEvents(client, path.join(__dirname, 'events'))

// Login
client.login(config.token)

console.log(`🤖 Starting bot: ${config.name}`)

// sau client.login()
client.once('ready', () => {
  startCron(client)
})