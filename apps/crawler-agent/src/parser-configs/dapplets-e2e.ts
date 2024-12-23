const parser = {
  id: 'dapplets-e2e',
  parserType: 'json',
  contexts: {
    root: {
      props: {
        id: "string('global')",
      },
      children: ['profile', 'timeline'],
    },
    profile: {
      selector: 'div[data-testid=profile]',
      props: {
        id: "substring-after(string(.//*[@data-testid='profile-username']), '@')",
        authorFullname: "string(.//*[@data-testid='profile-fullname'])",
        authorUsername: "substring-after(string(.//*[@data-testid='profile-username']), '@')",
        authorImg: "string(.//*[(@data-testid='profile-avatar')]/@src)",
      },
    },
    timeline: {
      selector: "[data-testid='posts-container']",
      props: {
        id: "string('timeline')",
      },
      children: ['post'],
    },
    post: {
      selector: 'div[data-testid=post]',
      props: {
        id: "substring-after(string(.//@href), 'post/')",
        text: "string(.//*[@data-testid='post-text'])",
        authorFullname: "string(.//*[@data-testid='post-fullname'])",
        authorUsername: "string(.//*[@data-testid='post-username'])",
        authorImg: 'string(.//img/@src)',
      },
    },
  },
}

export default parser
