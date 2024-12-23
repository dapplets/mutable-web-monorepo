import { CrawlerSdk } from '@mweb/crawler-sdk'

const apiUrl = process.env.REACT_APP_API_URL ?? 'http://localhost:3001'

export const api = new CrawlerSdk({ apiUrl })
