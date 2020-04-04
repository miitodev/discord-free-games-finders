const puppeteer = require('puppeteer');
const userAgent = require('user-agents');
const { SortStable } = require('../helper')

const FREE_GAMES_PAGE_URL = 'https://steamdb.info/sales/?min_discount=95&min_rating=0';

async function SteamList() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.toString())
  await page.setViewport({
    width: 1920,
    height: 1080
  })
  await page.goto(FREE_GAMES_PAGE_URL, { waitUntil: 'networkidle2' });
  let data = await page.evaluate(() => {
    function getAll(selector) {
      return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
    }

    let array = []
    let titleAll = []
    let endinAll = []

    getAll('tr[data-appid] > td:nth-child(3) > a').forEach((e) => {
      titleAll.push((e.innerText))
    })

    getAll('tr[data-appid] > td:nth-child(7)').forEach((e) => {
      endinAll.push((e.innerText))
    })

    for (let i = 0; i < titleAll.length; i++) {
      array.push({
        title: titleAll[i],
        endin: endinAll[i]
      })
    }

    return array
  })

  await browser.close();

  return SortStable(data)
}

if (require.main === module) {
  SteamList().then(console.log)
}

module.exports = SteamList;
