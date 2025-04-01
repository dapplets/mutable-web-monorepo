import { FC, useState } from 'react'
import styles from './index.module.css'
import { customElements } from '@mweb/engine'

const { DappletPortal } = customElements

const CounterButton: FC = () => {
  const [counter, setCounter] = useState(0)

  const handleClick = () => {
    setCounter((prev) => prev + 1)
  }

  return (
    <button className={styles.button} onClick={handleClick}>
      Counter: {counter}
    </button>
  )
}

export default function Dapplet() {
  return (
    <DappletPortal
      target={{
        namespace: 'bos.dapplets.testnet/parser/twitter',
        contextType: 'post',
        if: { id: { not: null } },
        injectTo: 'southPanel',
      }}
      component={CounterButton}
    />
  )
}
