import { InsertionType } from '../../../src/core/adapters/interface'

export const configDynamicHtmlAdapter = {
  namespace: 'sampleNamespace',
  contexts: {
    root: {
      selector: '#root',
      props: {
        id: "string('root')",
        username: "number(.//*[@data-testid='UserName']//span[1])",
        fullname: "string(.//*[@aria-label='Account menu']//img/@alt)",
        img: 'string(.//*[@data-testid="nothingImg"]/@src)',
      },
      children: ['post', 'profile'],
      insertionPoints: {
        rootPointBefore: {
          selector: '.root-selector',
          bosLayoutManager: 'layoutManager1',
          insertionType: InsertionType.Before,
        },
        rootPointAfter: {
          selector: '.root-selector',
          bosLayoutManager: 'layoutManager1',
          insertionType: InsertionType.After,
        },
        rootPointEnd: {
          selector: '.root-selector',
          bosLayoutManager: 'layoutManager1',
          insertionType: InsertionType.End,
        },
        rootPointBegin: {
          selector: '.root-selector',
          bosLayoutManager: 'layoutManager1',
          insertionType: InsertionType.Begin,
        },
      },
    },
    post: {
      selector: 'div[data-testid=postTestId]',
      props: {
        id: "string('post')",
        text: "string(.//*[@data-testid='postText'])",
      },
      insertionPoints: {
        root: {
          selector: '.post-root-selector',
          bosLayoutManager: 'layoutManager1',
          insertionType: InsertionType.After,
        },
        text: {
          selector: '.post-text-selector',
          bosLayoutManager: 'layoutManager1',
          insertionType: InsertionType.Before,
        },
      },
    },
    profile: {
      selector: 'div[data-testid=profileTestId]',
      props: {
        id: "string('profile')",
        text: "string(.//*[@data-testid='profileText'])",
      },
      insertionPoints: {
        root: {
          selector: '.profile-root-selector',
          bosLayoutManager: 'layoutManager1',
          insertionType: InsertionType.Begin,
        },
        avatar: {
          selector: '.profile-text-selector',
          bosLayoutManager: 'layoutManager1',
          insertionType: InsertionType.End,
        },
      },
    },
  },
}

export const dynamicHtmlAdapterDataStr = `
<div id="root" >

  <!-- root props -->
  <div data-testid='UserName'>
    <span>2</span>
  </div> 

  <div aria-label='Account menu'>
    <img src="https://img.com/profile_images/id/Q_300x300.jpg" alt="Test-fullname" data-testid="nothingImg"/>
  </div>

  <!-- Insertion Point for Root -->
  <div class="root-selector" data-bos-layout-manager="layoutManager1">

    <!-- Children: Post -->
    <div class="post-selector-point" id="post" data-testid="postTestId">
        <div class="post-root-selector" data-testid='postText' data-bos-layout-manager="layoutManager1">Post Root Insertion Point Content</div>
        <div class="post-text-selector" data-bos-layout-manager="layoutManager1">Post Text Insertion Point Content</div>
    </div>

    <!-- Children: Profile -->
    <div class="profile-selector" id="profile" data-testid="profileTestId">
        <div class="profile-root-selector" data-bos-layout-manager="layoutManager1" data-testid='profileText'>Profile Root Insertion Point Content</div>
        <div class="profile-text-selector" data-bos-layout-manager="layoutManager1">Profile Avatar Insertion Point Content</div>
    </div>

  </div>

</div>`
