const got = require('got');
const cheerio = require('cheerio');
const parseISO = require('date-fns/parseISO')

const FREE_GAMES_PAGE_URL = 'https://graphql.epicgames.com/graphql';

const GRAPHQL_QUERY = {
  query: 'query searchStoreQuery($allowCountries: String, $category: String, $count: Int, $country: String!, $keywords: String, $locale: String, $namespace: String, $sortBy: String, $sortDir: String, $start: Int, $tag: String, $withPrice: Boolean = false, $withPromotions: Boolean = false) {\n  Catalog {\n    searchStore(allowCountries: $allowCountries, category: $category, count: $count, country: $country, keywords: $keywords, locale: $locale, namespace: $namespace, sortBy: $sortBy, sortDir: $sortDir, start: $start, tag: $tag) {\n      elements {\n        title\n        id\n        namespace\n        description\n        effectiveDate\n        keyImages {\n          type\n          url\n        }\n        seller {\n          id\n          name\n        }\n        productSlug\n        urlSlug\n        url\n        items {\n          id\n          namespace\n        }\n        customAttributes {\n          key\n          value\n        }\n        categories {\n          path\n        }\n        price(country: $country) @include(if: $withPrice) {\n          totalPrice {\n            discountPrice\n            originalPrice\n            voucherDiscount\n            discount\n            currencyCode\n            currencyInfo {\n              decimals\n            }\n            fmtPrice(locale: $locale) {\n              originalPrice\n              discountPrice\n              intermediatePrice\n            }\n          }\n          lineOffers {\n            appliedRules {\n              id\n              endDate\n              discountSetting {\n                discountType\n              }\n            }\n          }\n        }\n        promotions(category: $category) @include(if: $withPromotions) {\n          promotionalOffers {\n            promotionalOffers {\n              startDate\n              endDate\n              discountSetting {\n                discountType\n                discountPercentage\n              }\n            }\n          }\n          upcomingPromotionalOffers {\n            promotionalOffers {\n              startDate\n              endDate\n              discountSetting {\n                discountType\n                discountPercentage\n              }\n            }\n          }\n        }\n      }\n      paging {\n        count\n        total\n      }\n    }\n  }\n}',
  variables: { "allowCountries": "CA", "category": "freegames", "count": 1000, "country": "CA", "locale": "en-US", "sortBy": "effectiveDate", "sortDir": "asc", "withPrice": true, "withPromotions": true }
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

  const promotionRow = [...data.Catalog.searchStore.elements];
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
