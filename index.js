const Discord = require('discord.js');
const client = new Discord.Client();
const cron = require("cron");
const SteamList = require('./events/SteamList')
const EpicList = require('./events/EpicList')
const AsciiTable = require('ascii-table')
const scheduled = new cron.CronJob('0 14 * * *')
require('dotenv').config()

const freeSteamGameChannel = process.env.CHANNEL_ID;

async function createTable() {
  const SteamTable = new AsciiTable();
  const EpicTable = new AsciiTable()

  SteamTable.setHeading('Steam Games', 'Ends in')
  EpicTable.setHeading('Epic Games Store Games', 'Ends in')

  const Steam = await SteamList();
  const Epic = await EpicList();

  Steam.forEach((e) => {
    SteamTable.addRow(e.title, e.endin)
  })

  Epic.forEach((e) => {
    EpicTable.addRow(e.title, e.endin)
  })

  return await `${SteamTable.toString()}\n${EpicTable.toString()}`
}

client.login(process.env.DISCORD_KEY)

client.on('ready', (e) => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setStatus('online');
  client.user.setActivity(`Finding FREE game | $FGAME`);

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
