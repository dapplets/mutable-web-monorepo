const TestnetDomains = {
  'test.near.social': true,
  '127.0.0.1': true,
  'social.testnet.dapplets.org': true,
}

const TestnetPreviewDeploymentsDomain = 'social.testnet.apps.dapplets.org'

export const NetworkId =
  window.location.hostname in TestnetDomains ||
  window.location.hostname.includes(TestnetPreviewDeploymentsDomain)
    ? 'testnet'
    : 'mainnet'

const TestnetWidgets = {
  image: 'mob.dapplets.testnet/widget/Image',
  default: 'mob.dapplets.testnet/widget/Homepage',
  viewSource: 'mob.dapplets.testnet/widget/WidgetSource',
  widgetMetadataEditor: 'mob.dapplets.testnet/widget/WidgetMetadataEditor',
  widgetMetadata: 'mob.dapplets.testnet/widget/WidgetMetadata',
  profileImage: 'mob.dapplets.testnet/widget/ProfileImage',
  notificationButton: 'mob.dapplets.testnet/widget/NotificationButton',
  profilePage: 'mob.dapplets.testnet/widget/ProfilePage',
  profileName: 'mob.dapplets.testnet/widget/ProfileName',
  editorComponentSearch: 'mob.dapplets.testnet/widget/Editor.ComponentSearch',
  profileInlineBlock: 'mob.dapplets.testnet/widget/Profile.InlineBlock',
  viewHistory: 'mob.dapplets.testnet/widget/WidgetHistory',
  starButton: 'mob.dapplets.testnet/widget/N.StarButton',
}

const MainnetWidgets = {
  image: 'mob.near/widget/Image',
  default: 'mob.near/widget/Homepage',
  viewSource: 'mob.near/widget/WidgetSource',
  widgetMetadataEditor: 'mob.near/widget/WidgetMetadataEditor',
  widgetMetadata: 'mob.near/widget/WidgetMetadata',
  profileImage: 'mob.near/widget/ProfileImage',
  notificationButton: 'mob.near/widget/NotificationButton',
  profilePage: 'mob.near/widget/ProfilePage',
  profileName: 'patrick.near/widget/ProfileName',
  editorComponentSearch: 'mob.near/widget/Editor.ComponentSearch',
  profileInlineBlock: 'mob.near/widget/Profile.InlineBlock',
  viewHistory: 'bozon.near/widget/WidgetHistory',
  starButton: 'mob.near/widget/N.StarButton',
}

export const Widgets = NetworkId === 'testnet' ? TestnetWidgets : MainnetWidgets
