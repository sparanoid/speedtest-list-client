/* global algoliasearch instantsearch */

// Remove URL protocol
const removeProto = url => url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '');

const searchClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_SEARCH_KEY
);

const search = instantsearch({
  indexName: process.env.ALGOLIA_INDEX,
  searchParameters: {
    facetingAfterDistinct: true,
    attributesToSnippet: ['extended:40'],
  },
  routing: true,
  searchClient,
});

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#searchbox',
    placeholder: 'Search for node…'
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: item => {
        const name =
          item._highlightResult && item._highlightResult.name
            ? item._highlightResult.name.value
            : item.name;

        const country =
          item._highlightResult && item._highlightResult.country
            ? item._highlightResult.country.value
            : item.country;

        const sponsor =
          item._highlightResult && item._highlightResult.sponsor
            ? item._highlightResult.sponsor.value
            : item.sponsor;

        const id =
          item._highlightResult && item._highlightResult.id
            ? item._highlightResult.id.value
            : item.id;

        const cord = `${item.lat},${item.lon}`;

        return `
          <h1>
            <span
              title="${item.cc}"
              class="flag-icon flag-icon-${item.cc.toLowerCase()}"
            ></span>
            <a href="${item.url}" target="_blank" ref="noopener noreferer">
              ${name}, ${country}
            </a>
          </h1>
          <div class="sponsor">${sponsor}</div>
          <div class="href">${item.host}</div>
          <div class="meta">
            <div class="cord">
              <a
                href="https://www.google.com/maps/search/${cord}"
                target="_blank" ref="noopener noreferer"
              >
                ${cord}
              </a>
            </div>
            <span class="id"><span class="no-sign">#</span>${id}</span>
          </div>
        `;
      },
    },
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
  })
);

search.start();
