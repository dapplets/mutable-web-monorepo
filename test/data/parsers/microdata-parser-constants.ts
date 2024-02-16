export const microdataParserElement = document.createElement('div')
microdataParserElement.innerHTML = ` 
<div id="root">
<!-- Example using itemtype, itemscope, and itemprop -->
<div itemscope class="child-person" itemtype="before">
  <span itemprop="name">John Doe</span>
  <span itemprop="jobTitle">Web Developer</span>
  <a itemprop="url" href="https://example.com/johndoe">Personal Website</a>
</div>

<!-- Example using itemid -->
<div class="child-product" itemid="https://example.com/product/123" itemscope itemtype="after">
  <span itemprop="name">Product Name</span>
  <span itemprop="price" content="19.99">$19.99</span>
</div>

<!-- Example using src attribute -->
<img src="https://example.com/image.jpg" alt="An Example Image" itemprop="image">

<!-- Example using data attribute -->
<div data-custom-attribute="customValue">This is a custom data attribute example.</div>

<!-- Example using href attribute -->
<a href="https://example.com" itemprop="url">Visit Example.com</a>

<!-- Example using datetime attribute -->
<time datetime="2024-01-30T12:00:00" itemprop="datePublished">January 30, 2024</time>
</div>
`
