export const mwebParserElement = document.createElement('div')
mwebParserElement.setAttribute('data-mweb-context-type', 'main')
mwebParserElement.setAttribute('data-mweb-context-parsed', '{"topic":"Mutable Web"}')
mwebParserElement.innerHTML = `
<h1>This is a Heading</h1>
<article
  id="article-1"
  data-mweb-context-type="article"
  data-mweb-context-parsed='{"text":"Article 1"}'
>
  <p>Article 1</p>
  <div id="ins-point-1" data-mweb-insertion-point="northPanel">
    <button>Like</button>
  </div>
</article>
<article
  id="article-2"
  data-mweb-context-type="article"
  data-mweb-context-parsed='{"text":"Article 2"}'
>
  <p>Article 2</p>
  <div id="ins-point-2" data-mweb-insertion-point="southPanel">
    <button>Like</button>
  </div>
</article>
`
const shadowElementHost = document.createElement('div')
shadowElementHost.setAttribute('data-mweb-shadow-host', '')
const shadow = shadowElementHost.attachShadow({ mode: 'open' })
const shadowElement = document.createElement('span')
shadowElement.innerHTML = `
<article
  id="article-3"
  data-mweb-context-type="article"
  data-mweb-context-parsed='{"text":"Article 3"}'
>
  <p>Article 3</p>
  <div id="ins-point-3" data-mweb-insertion-point="shadowPanel">
    <button>Like</button>
  </div>
</article>
`
shadow.appendChild(shadowElement)
mwebParserElement.appendChild(shadowElementHost)
