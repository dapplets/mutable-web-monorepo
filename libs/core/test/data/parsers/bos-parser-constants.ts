import { InsertionType } from '../../../src/core/adapters/interface'
import { BosParserConfig } from '../../../src/core/parsers/bos-parser'

export const config: BosParserConfig = {
  contexts: {
    main: {
      component: 'MainComponent',
      props: {
        prop1: 'value1',
        prop2: 'value2',
      },
      insertionPoints: {
        beforeHeader: {
          component: 'BeforeHeaderComponent',
          bosLayoutManager: 'LayoutManagerA',
          insertionType: InsertionType.Before,
        },
        afterHeader: {
          component: 'AfterHeaderComponent',
          bosLayoutManager: 'LayoutManagerB',
          insertionType: InsertionType.Before,
        },
        content: {
          component: 'ContentComponent',
          insertionType: InsertionType.After,
        },
      },
      children: ['header', 'footer'],
    },
    header: {
      component: 'HeaderComponent',
      props: {
        title: 'Header Title',
      },
    },
    footer: {
      component: 'FooterComponent',
      props: {
        text: 'Footer Text',
      },
    },
  },
}
export const bosParserDataHtml = document.createElement('div')
bosParserDataHtml.innerHTML = `<div data-namespace="example" data-component="MainComponent" data-prop1="value1" data-prop2="value2">
  <!-- Before Header -->
  <div data-component="BeforeHeaderComponent" class="before-header" data-bos-layout-manager="LayoutManagerA" data-insertion-type="Before">
    <!-- Insertion Point Content -->
  </div>

  <!-- After Header -->
  <div data-component="AfterHeaderComponent" data-bos-layout-manager="LayoutManagerB" data-insertion-type="Before">
    <!-- Insertion Point Content -->
  </div>

  <!-- Main Content -->
  <div data-component="ContentComponent" data-insertion-type="After">
    <!-- Insertion Point Content -->
  </div>

  <!-- Header -->
  <div data-component="HeaderComponent" class="header" data-title="Header Title">
    <!-- Header Content -->
  </div>

  <!-- Footer -->
  <div data-component="FooterComponent" class="footer" data-text="Footer Text">
    <!-- Footer Content -->
  </div>
</div>`
