/* global algoliasearch instantsearch clipboard tippy */

// Copy command to clipboard
const updateClipboard = id => {
  clipboard.writeText(`python speedtest.py --server ${id}`).then(
    function() {},
    function(err) {
      throw err;
    }
  );
};

// Remove URL protocol
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
    placeholder: 'Search for node…',
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
          item._highlightResult && item._highlightResult.objectID
            ? item._highlightResult.objectID.value
            : item.objectID;

        const cord = `${item._geoloc.lat},${item._geoloc.lon}`;

        return `
          <h1>
            <span
              data-tippy-content="${item.cc}"
              class="flag-icon flag-icon-${item.cc.toLowerCase()} tooltip"
            ></span>
            <a href="${item.url}" target="_blank" ref="noopener noreferer">
              ${name}, ${country}
            </a>
          </h1>
          <div class="sponsor">${sponsor}</div>
          <div class="href">${item.host}</div>
          <div class="meta">
            <div class="cord">
              <a class="tooltip"
                href="https://www.google.com/maps/search/${cord}"
                data-tippy-content="View in Google Maps"
                target="_blank" ref="noopener noreferer"
              >
                ${item._geoloc.lat}, ${item._geoloc.lon}
              </a>
            </div>
            <span class="id tooltip"
              data-tippy-trigger="click"
              data-tippy-content="Copied to clipboard"
              data-id="${id}"
            >
              <i class="no-sign">#</i>${id}
            </span>
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

// Init Tippy tooltips
tippy.setDefaults({
  arrow: true,
  arrowType: 'round',
  animateFill: false,
  animation: 'shift-toward',
  theme: 'light',
  delay: [50, 50],
});
tippy('.tooltip');

// Events
search.on('render', () => {
  const resultId = document.querySelectorAll('.id');

  resultId.forEach(el => {
    tippy('.tooltip');

    el.addEventListener('click', e => {
      e.preventDefault();
      updateClipboard(el.dataset.id);
    });
  });
});
