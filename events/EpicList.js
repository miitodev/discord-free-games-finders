const puppeteer = require( 'puppeteer' );
const userAgent = require( 'user-agents' );
const { SortStable } = require( '../helper' )
const formatDistanceToNow = require('date-fns/formatDistanceToNow')

const FREE_GAMES_PAGE_URL = 'https://www.epicgames.com/store/en-US/free-games/';

async function EpicList() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.toString())
  await page.setViewport({
    width: 1920,
    height: 1080
  })
  await page.exposeFunction("formatDistanceToNow", formatDistanceToNow);
  await page.goto(FREE_GAMES_PAGE_URL, { waitUntil: 'networkidle2' });
  let data = await page.evaluate(() => {
    function getAll(selector) {
      return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
    }

    let array = []
    let titleAll = []
    let endinAll = []

    getAll('[class*="FreeGamesCollection-fullbleedSection"] span[data-testid="offer-title-info-title"]').forEach((e) => {
      titleAll.push(e.innerText)
    })

    getAll('[class*="FreeGamesCollection-fullbleedSection"] span[data-testid="offer-title-info-subtitle"] time:nth-child(1)').forEach((e) => {
      endinAll.push(e.getAttribute('datetime'))
    })

    for (let i = 0; i < titleAll.length; i++) {
      array.push({
        title: titleAll[i],
        endin: endinAll[i]
      })
    }

    return array
  })

  data.forEach((el) => {
    el.endin = formatDistanceToNow(new Date(el.endin), { addSuffix: false })
  })

  await browser.close();

  return SortStable(data)
}

if (require.main === module) {
  EpicList().then(console.log)
}

module.exports = EpicList;
