import { Engine } from '@mweb/backend'
import { CrawlerSdk } from '@mweb/crawler-sdk'

const apiUrl = process.env.REACT_APP_API_URL ?? 'http://localhost:3001'
const networkId = process.env.REACT_APP_NETWORK_ID ?? 'testnet' // ToDo: or mainnet?

export const api = new CrawlerSdk({ apiUrl })

export const mweb = new Engine({
  networkId: networkId,
  gatewayId: 'crawler-dashboard',
  selector: null as any,
})
