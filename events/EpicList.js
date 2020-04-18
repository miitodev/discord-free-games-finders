const got = require('got');
const cheerio = require('cheerio');
const parseISO = require('date-fns/parseISO')

const FREE_GAMES_PAGE_URL = 'https://graphql.epicgames.com/graphql';

const GRAPHQL_QUERY = {
  query: 'query promotionsQuery($namespace: String!, $country: String!, $locale: String!) {\n  Catalog {\n    catalogOffers(namespace: $namespace, locale: $locale, params: {category: "freegames", country: $country, sortBy: "effectiveDate", sortDir: "asc"}) {\n      elements {\n        title\n        description\n        id\n        namespace\n        categories {\n          path\n        }\n        keyImages {\n          type\n          url\n        }\n        productSlug\n        promotions {\n          promotionalOffers {\n            promotionalOffers {\n              startDate\n              endDate\n              discountSetting {\n                discountType\n                discountPercentage\n              }\n            }\n          }\n          upcomingPromotionalOffers {\n            promotionalOffers {\n              startDate\n              endDate\n              discountSetting {\n                discountType\n                discountPercentage\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}',
  variables: {"namespace":"epic","country":"CA","locale":"en-US"}
}

async function EpicList() {
  const response = await got({
    method: 'POST',
    url: FREE_GAMES_PAGE_URL,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(GRAPHQL_QUERY)
  })
  const data = JSON.parse(response.body).data;

  const promotionRow = [...data.Catalog.catalogOffers.elements];
  const items = Promise.all(promotionRow
    .filter(function(element) {
      if (element?.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0]?.discountSetting?.discountPercentage === 0) {
        return true
      }

    return false
    })
    .map(function(element) {
      const TITLE = element.title;
      const APP_ID = element.id;
      const SUB_ID = element.productSlug;
      const START_DATE = parseISO(element.promotions.promotionalOffers[0].promotionalOffers[0].startDate);
      const END_DATE = parseISO(element.promotions.promotionalOffers[0].promotionalOffers[0].endDate);

      return {TITLE, APP_ID, SUB_ID, START_DATE, END_DATE};
    }))

  return items
}

if (require.main === module) {
  EpicList().then(console.log);
}

module.exports = EpicList;
