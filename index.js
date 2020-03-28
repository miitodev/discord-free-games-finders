const Discord = require('discord.js');
const client = new Discord.Client();
const cron = require("cron");
const list = require('./events/list')
const AsciiTable = require('ascii-table')
const scheduled = new cron.CronJob('0 14 * * *')
const freeSteamGameChannel = '693407805494919228';
require('dotenv').config()

function createTable() {
  const table = new AsciiTable('Free Steam Game Currently Available');

  table
    .setHeading('Game', 'Ends in')

  return list()
    .then(data => {
    data.forEach(e => {
      table.addRow(e.title, e.endin)
    })

    return table.toString()
  })
}

client.login(process.env.DISCORD_KEY)

client.on('ready', (e) => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setStatus('online');
  client.user.setActivity(`Finding FREE Steam Game! | $FGAME`);

  scheduled.addCallback(() => {
    createTable().then(result => {
      client.channels.fetch(freeSteamGameChannel).then(reponse => {
        reponse.send(result, { code: 'elm' })
      })
    })
  })

  scheduled.start();
});

client.on('message', async message => {
  if (message.author.bot) return

  if (message.content.toLowerCase() === '$fgame') {
    createTable().then(result => {
      message.channel.send(result, { code: 'elm' })
    })
  }
})
