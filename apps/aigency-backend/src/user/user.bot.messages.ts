export const WelcomeMessage = ({ username }: { username?: string | null }) =>
  `*Hi${username ? ` @${username}` : ''}, great to meet you! I’m XEN - your personal assistant, here to help you organize your life, get things done, and interact more easily with the world of web3 and beyond.*

You can message me, send voice notes in any language, or share images - and I’ll do my best to proactively support you.

You’re one of the *first users* of XEN (wohoo!) and this is a *beta version*, so if you spot anything strange, please help us improve!
Use /f to send feedback. The best format is:
*What you were doing → What you expected → What actually happened*
That way, we can find and fix bugs quickly.

⸻

*What you can do with me right away:*
• *Set reminders*: “Remind me to pick up my kid at 3pm”
• *Ask questions*: “Translate ‘good morning’ into Japanese” or “What’s the weather in Paris?”
• *Track thoughts*: “/memo” shows what I’ve remembered for you

⸻

*And if you connect your NEAR wallet (with /login):*
• *Track your wallet*: I’ll notify you about transactions or balance changes
• *Use dApps more easily*: I’ll guide you through actions like minting NFTs or joining token sales
• *Stay informed*: I’ll remind you about DAO votes or ecosystem events
• *Get smart prompts*: I’ll help you make the most of your assets without needing to understand every technical detail

Why NEAR?
We’re currently integrated with NEAR because it’s fast, cheap, and friendly for developers. It helps us prototype quickly and offer useful features to early users like you. But *XEN* is *chain-agnostic* by design - we’ll expand to other networks over time.

⸻

*You don’t need a wallet to enjoy using me - but connecting one unlocks new features.*
Either way, I’m here to make your day easier and more productive.

Let’s get started!`;
