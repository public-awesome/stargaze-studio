import { ImGithub, ImTwitter } from 'react-icons/im'
import { SiDiscord, SiTelegram } from 'react-icons/si'

import { BLOCK_EXPLORER_URL } from './constants'

export const links = {
  // main links
  deuslabs: `https://deuslabs.fi`,
  Discord: `https://discord.gg/stargaze`,
  Docs: `https://docs.stargaze.zone/`,
  GitHub: `https://github.com/public-awesome`,
  Stargaze: `https://stargaze.zone/`,
  Telegram: `https://t.me/joinchat/ZQ95YmIn3AI0ODFh`,
  Twitter: `https://twitter.com/stargazezone`,
  Explorer: BLOCK_EXPLORER_URL,
  Documentation: 'https://docs.stargaze.zone/guides/readme',
}

export const footerLinks = [
  { text: 'Block Explorer', href: links.Explorer },
  { text: 'Documentation', href: links.Docs },
  { text: 'Submit an issue', href: `${links.GitHub}/issues/new` },
  { text: 'Powered by Stargaze', href: links.Stargaze },
]

export const socialsLinks = [
  { text: 'Discord', href: links.Discord, Icon: SiDiscord },
  { text: 'GitHub', href: links.GitHub, Icon: ImGithub },
  { text: 'Telegram', href: links.Telegram, Icon: SiTelegram },
  { text: 'Twitter', href: links.Twitter, Icon: ImTwitter },
]
