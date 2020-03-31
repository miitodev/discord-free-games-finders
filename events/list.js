const puppeteer = require('puppeteer');
const userAgent = require('user-agents');

async function list() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.toString())
  await page.setViewport({
    width: 1920,
    height: 1080
  })
  await page.goto('https://steamdb.info/sales/?min_discount=95&min_rating=0', { waitUntil: 'networkidle2' });
  let data = await page.evaluate(() => {
    function getAll(selector) {
      return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
    }

    let array = []
    let titleAll = []
    let endinAll = []

    getAll('tr[data-appid] > td:nth-child(3) > a').forEach(function (e) {
      titleAll.push((e.innerText))
    })

    getAll('tr[data-appid] > td:nth-child(7)').forEach(function (e) {
      endinAll.push((e.innerText))
    })

    for (let i = 0; i < titleAll.length; i++) {
      array.push({
        title: titleAll[i],
        endin: endinAll[i]
      })
    }

    return array.sort((a, b) => {
      const nameA = a.title.toUpperCase();
      const nameB = b.title.toUpperCase();

      if (nameA < nameB) {
        return -1;
      }

      if (nameA > nameB) {
        return 1;
      }

      return 0
    })
  })

  await browser.close();

  return data
}

module.exports = list;
