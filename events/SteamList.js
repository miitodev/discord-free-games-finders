const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');
const parseISO = require('date-fns/parseISO')

const FREE_GAMES_PAGE_URL = 'https://steamdb.info/upcoming/free/';
const HOVER_CARD_URL = (appid) => `https://steamdb.info/api/RenderAppHover/?appid=${appid}`;

async function getAppType(appid) {
  const html = await cloudscraper.get(HOVER_CARD_URL(appid));
  const $ = cheerio.load(html);

  const tagsRow = $('.hover_tag_row .app_tag');

  const tag = tagsRow
    .toArray()
    .map(function (element) {
      const el = $(element);
      return el.text();
    });

  if (tag.includes('DLC')) {
    return 'DLC';
  }
  return 'Game';
}

async function SteamList() {
  const html = await cloudscraper.get(FREE_GAMES_PAGE_URL);
  const $ = cheerio.load(html);

  const promotionRow = $('.container .table-products:first-of-type tbody .app');
  const items = Promise.all(promotionRow
    .toArray()
    .filter(function (element) {
      const el = $(element);
      const td = el.children('td');

      return $(td.get(3)).text().trim() !== 'Weekend';
    })
    .map(async function (element) {
      const el = $(element);
      const td = el.children('td');

      const TITLE = $(td.get(1)).text().trim();
      const APP_ID = el.attr('data-appid');
      const SUB_ID = el.attr('data-subid');
      const PROMO_TYPE = $(td.get(3)).text().trim();
      const APP_TYPE = await getAppType(APP_ID);
      const START_DATE = parseISO($(td.get(4)).attr('title'));
      const END_DATE = parseISO($(td.get(5)).attr('title'));

      return {TITLE, APP_ID, SUB_ID, PROMO_TYPE, APP_TYPE, START_DATE, END_DATE};
    }));

  return items
}

if (require.main === module) {
  SteamList().then(console.log);
}

module.exports = SteamList;
