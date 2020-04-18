const Discord = require('discord.js');
const client = new Discord.Client();
const cron = require("cron");
const SteamList = require('./events/SteamList')
const EpicList = require('./events/EpicList')
const AsciiTable = require('ascii-table')
const format = require('date-fns/format')

const scheduled = new cron.CronJob('0 14 * * *')
require('dotenv').config()

const freeSteamGameChannel = process.env.CHANNEL_ID;

async function createTable() {
  const SteamTable = new AsciiTable();
  const EpicTable = new AsciiTable()

  SteamTable.setHeading('Steam Games', 'Dates');
  EpicTable.setHeading('Epic Games Store Games', 'Dates');

  const Steam = await SteamList();
  const Epic = await EpicList();

  Steam.forEach((el) => {
    SteamTable.addRow(`${el.APP_TYPE}: ${el.TITLE}`, `${format(el.START_DATE, 'MMM dd')} - ${format(el.END_DATE, 'MMM dd')}`)
  })

  Epic.forEach((el) => {
    EpicTable.addRow(`Game: ${el.TITLE}`, `${format(el.START_DATE, 'MMM dd')} - ${format(el.END_DATE, 'MMM dd')}`)
  })

  return `${SteamTable.toString()}\n${EpicTable.toString()}`
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
