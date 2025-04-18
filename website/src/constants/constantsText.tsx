export const unicode = '\u0027';

export const getStartedMessage = {
  title: 'Get started',
  content: `The best dapps may receive grants
      from the platform to support further development.`,
};

export const getStartedLinks = [
  {
    id: '1',
    link: 'https://docs.dapplets.org/docs/get-started',
    title: 'Run your own dapplet',
    content:
      'Visit the documentation to learn how to create your own dapplet in just a few minutes.',
  },
  {
    id: '2',
    link: 'https://t.me/dapplets',
    title: 'Book a demo',
    content:
      'Schedule a 1:1 session with an expert from our team to learn more.',
  },
  {
    id: '3',
    link: 'https://discord.com/invite/YcxbkcyjMV',
    title: 'Join our community',
    content: 'of developers on Discord',
  },
];

export const HomeTitle = {
  title: `The Home
   of Mutable Web`,
  subtitle: `Dapplets Project - open-source platform which empowers developers to create a community-driven web, giving users and developers the ability to take control of the UX/UI on any existing websites.`,
};

export const HowItWorks = {
  title: 'how it works?',
  subtitle:
    'Mutable Web is a customization layer built on top of the existing web:',
};

export const HowItWorksItems = [
  {
    id: '1',
    title: 'Mutations',
    text: `Mutations are customized versions of the original websites, enhanced with sets of applications (dapplets).
    Communities control and manage mutations, which are used by their members as default versions instead the original ones.`,
  },
  {
    id: '2',
    title: 'Mutable Web Engine',
    text: `It uses Adapters to parse and expose the live semantic structure of legacy webpages on the fly.
    The Mutable Web Engine attaches dapplets to the elements of the semantic structure and executes them.`,
  },
];

export const PowerDapplets = [
  {
    id: '1',
    image: 'images/power-1.png',
    title: 'Paywall',
    text: `Paywall Dapplet introduces a new feature to Twitter's UX giving any user the ability to sell their content.`,
    link: 'https://github.com/dapplets/paywall-dapplet',
  },
  {
    id: '2',
    image: 'images/power-2.png',
    title: 'Community Tools',
    text: `This Dapplet adds badges to profiles and avatars
    on websites like Twitter and Github that reflect
    a person's rating and contributions within
    the NEAR community.`,
    link: 'https://github.com/dapplets/community-badges',
  },
  {
    id: '3',
    image: 'images/power-3.png',
    title: 'Swarm Search',
    text: `The set of modules augmenting Google and YouTube search pages with data from OpenSearch-compatible engines.`,
    link: 'https://github.com/dapplets/swarm-search',
  },
];

export const PlatformFeaturesMessage = `There is no need for developer
to go to the Google Extension Store yourself - the platform is already there`;

export const PlatformFeatures = [
  {
    id: 'Integration and Adaptation',
    features: [
      {
        link: 'https://docs.dapplets.org/docs/using-adapters/',
        title: 'Adapters system',
        text: `Enable developers to еmbed dapplets into existing websites. Use the adapters already available (Twitter, GitHub, Youtube, Google) or make your own.`,
      },
      {
        link: 'https://docs.dapplets.org/docs/config/#configuration',
        title: 'Live Parsing',
        text: `Parse web pages using configuration JSON files with CSS and XPath queries prepared for different websites. Work with valuable data without worrying about the internals of web pages.`,
      },
      {
        link: 'https://docs.dapplets.org/docs/whitepapers/technological-overview/#the-general-idea-of-a-content-augmentation-can-be-applied-to-web-content-as-well',
        title: 'Support for dynamic webpages',
        text: `Handle embedding widgets into dynamically created DOM-elements with Mutation Observer.`,
      },
    ],
  },
  {
    id: 'Built-in UI components',
    features: [
      {
        link: 'https://docs.dapplets.org/docs/using-widgets',
        title: 'Built-in Widgets',
        text: `Insert UI components into any website.
        The platform automatically loads community-provided CSS styles depending on the webpage context.`,
      },
      {
        link: 'https://docs.dapplets.org/docs/overlays',
        title: 'Overlay',
        text: `Use overlaid sidebar for displaying complex web pages when the site context is not enough, which includes: function forwarding, shared state,
        and RxJS-based widget state binding.`,
      },
      {
        link: 'https://docs.dapplets.org/docs/dark-theme-support',
        title: 'Themes',
        text: `Widgets can be styled according to the chosen theme supporting consistent embedding even on dark themes.`,
      },
    ],
  },
  {
    id: 'Decentralized services',
    features: [
      {
        link: 'https://docs.dapplets.org/docs/overlay-login',
        title: 'Registry on smart contracts',
        text: `Get your application and adapters will all metadata needed from a decentralized false-proof registry built on the Ethereum blockchain.`,
      },
      {
        link: 'https://docs.dapplets.org/docs/publishing',
        title: 'Decentralized repositories',
        text: `Publish your executable code in Ethereum Swarm and IPFS.`,
      },
      {
        link: 'https://docs.dapplets.org/docs/core-login',
        title: 'Wallets and smart contracts',
        text: `Apply user interfaces for connecting NEAR and Ethereum wallets and creating sessions that are already implemented at the extension level.`,
      },
    ],
  },
];
