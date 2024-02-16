export const naiveBosParserElement = document.createElement('div')
naiveBosParserElement.innerHTML = `
<div id="root" data-props="root">
<!-- Example using data-component and data-props attributes -->
<div class="posts-compose" data-component="near/widget/Posts.Compose" data-props="{'prop1': 'value1', 'prop2': 'value2'}">
  <!-- Content goes here -->
</div>

<!-- Another example with different values -->
<div class="component-a" data-component="near/widget/ComponentA" data-props="{'color': 'blue', 'size': 'medium'}">
  <!-- More content goes here -->
</div>
</div>
`
