import { InsertionType } from '../../../src/core/adapters/interface'

export const jsonParserDataHtml = document.createElement('div')
jsonParserDataHtml.innerHTML = `  <div id="root" >
<!-- root props -->
<div data-testid='UserName'>
<span>2</span>
</div> 

<div aria-label='Account menu'>
<img src="https://img.com/profile_images/id/Q_300x300.jpg" alt="Test-fullname" data-testid="nothingImg"/>
</div>

<!-- post -->
<div data-testid="post" id="post" class="post-1">
  <img id="post-img" />
  <div data-testid="postText">Post Text</div>
  <div class="insertion-point-selector">
    <!-- Insertion Point Content -->
  </div>
</div>

<!-- post -->
<div data-testid="post" id="post" class="post-2">
  <img id="post-img" />
  <div data-testid="postText">Post Text</div>
  <div class="insertion-point-selector">
    <!-- Insertion Point Content -->
  </div>
</div>

<!-- profile -->
<div data-testid="profile" id="profile" class="profile-1">
  <img id="profile-img" />
  <div data-testid="textProfile">Profile Text</div>
  <div class="insertion-point-selector-2">
    <!-- Insertion Point Content -->
  </div>
  <div data-insertion-point>
    <!-- Insertion Point Content -->
  </div>
</div>

<!-- profile -->
<div data-testid="profile" id="profile" class="profile-2">
  <img id="profile-img" />
  <div data-testid="textProfile">Profile Text</div>
  <div class="insertion-point-selector-2">
    <!-- Insertion Point Content -->
  </div>
  <div data-insertion-point>
    <!-- Insertion Point Content -->
  </div>
</div>

<!-- panel -->
`

export const configJsonParser = {
  namespace: 'sampleNamespace',
  contexts: {
    root: {
      selector: "[id='root']",
      props: {
        id: "string('root')",
        username: "number(.//*[@data-testid='UserName']//span[1])",
        fullname: "string(.//*[@aria-label='Account menu']//img/@alt)",
        img: 'string(.//*[@data-testid="nothingImg"]/@src)',
      },
      children: ['post', 'profile', 'panel'],
    },
    post: {
      selector: 'div[data-testid=post]',
      props: {
        id: 'string(.//img/@id)',
        text: "string(.//*[@data-testid='postText'])",
      },
      insertionPoints: {
        root: {
          selector: '[id=post]',
          bosLayoutManager: 'layoutManagerpost',
          insertionType: InsertionType.Before,
        },
        text: {
          selector: '.insertion-point-selector',
          bosLayoutManager: 'layoutManager1',
          insertionType: InsertionType.After,
        },
      },
    },
    profile: {
      selector: '[id=profile]',
      props: {
        id: 'string(.//img/@id)',
        text: "string(.//*[@data-testid='textProfile'])",
      },
      insertionPoints: {
        root: {
          selector: 'div[data-testid=profile]',
          bosLayoutManager: 'layoutManagerProfile',
          insertionType: InsertionType.Before,
        },
        avatar: {
          selector: '.insertion-point-selector-2',
          bosLayoutManager: 'layoutManager2',
          insertionType: InsertionType.After,
        },
        text: 'data-insertion-point',
      },
    },
    panel: {
      selector: 'div[data-testid=panel]',
      props: {
        id: 'string(.//img/@id)',
        text: "string(.//*[@data-testid='tweetPanel'])",
      },
      insertionPoints: {
        avatar: {
          selector: '.class-null',
          bosLayoutManager: 'null',
          insertionType: InsertionType.After,
        },
        text: 'data-null',
      },
    },
  },
}
