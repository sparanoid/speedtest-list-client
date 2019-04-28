/* global algoliasearch instantsearch dayjs dayjs_plugin_relativeTime */

// Day.js and its plugin
dayjs.extend(dayjs_plugin_relativeTime);

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
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: item => {
        const description =
          item._highlightResult && item._highlightResult.description
            ? item._highlightResult.description.value
            : item.description;

        const href =
          item._highlightResult && item._highlightResult.href
            ? removeProto(item._highlightResult.href.value)
            : removeProto(item.href);

        const extended =
          item._snippetResult && item._snippetResult.extended
            ? item._snippetResult.extended.value
            : item.extended;

        const time = dayjs().from(dayjs(item.time));

        const tags =
          (item.tags &&
            `<div class="tags">${item.tags
              .split(' ')
              .map(tag => `<span class="tag">${tag}</span>`)
              .join('')}</div>`) ||
          '';

        return `
          <article>
            <h1>
              <a href="${item.href}" target="_blank" ref="noopener noreferer">
                ${description}
              </a>
            </h1>
            <div class="href">${href}</div>
            <div class="extended">${extended}</div>
            <div class="meta">
              <div class="time" title="${item.time}">${time}</div>
              <div class="tags">${tags}</div>
            </div>
          </article>
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
