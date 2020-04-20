const Discord = require('discord.js');

const client = new Discord.Client();
const cron = require('cron');
const { table } = require('table');
const format = require('date-fns/format');
const SteamList = require('./events/SteamList');
const EpicList = require('./events/EpicList');

const scheduled = new cron.CronJob('0 12 * * *');
require('dotenv').config();

const freeSteamGameChannel = process.env.CHANNEL_ID;

async function createTable() {
  const Steam = await SteamList();
  const Epic = await EpicList();
  const data = [];

  data.push(['Steam Games', 'Dates']);

  Steam.forEach((el) => {
    data.push([`${el.APP_TYPE}: ${el.TITLE}`, `${format(el.START_DATE, 'MMM dd')} - ${format(el.END_DATE, 'MMM dd')}`]);
  });

  data.push(['', ''])
  data.push(['Epic Store Games', 'Dates']);

  Epic.forEach((el) => {
    data.push([`Game: ${el.TITLE}`, `${format(el.START_DATE, 'MMM dd')} - ${format(el.END_DATE, 'MMM dd')}`]);
  });

  return table(data);
}

client.login(process.env.DISCORD_KEY);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setStatus('online');
  client.user.setActivity('Finding FREE game | $FGAME');

  scheduled.addCallback(() => {
    createTable().then((result) => {
      client.channels.fetch(freeSteamGameChannel).then((reponse) => {
        reponse.send(result, { code: 'moon' });
      });
    });
  });

  scheduled.start();
});

client.on('message', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '$fgame') {
    createTable().then((result) => {
      message.channel.send(result, { code: 'elm' });
    });
  }
});
