import '@near-wallet-selector/modal-ui/styles.css'

import { Engine } from 'mutable-web-engine'

const NetworkId = 'mainnet'

async function main() {
  const engine = new Engine({
    networkId: NetworkId,
  })
  await engine.start()

  console.log('Mutable Web Engine started!', engine)
}

main().catch(console.error)
