import { FC } from 'react'
import ExternalLinkIcon from '../assets/external-link'
import { TAgent, TUserInfo } from '../types'
import Agent from './Agent'

type TCapabilitiesProps = {
  user: TUserInfo | null
}

// ToDo: remove mocked data
const MOCKED_DATA: { agents: TAgent[] } = {
  agents: [
    {
      name: 'learn_near_comments_agent',
      source: 'Near AI',
      status: 'active',
    },
    {
      name: 'nearvember-mint-agent',
      source: 'Near AI',
      status: 'active',
    },
    {
      name: 'dapplets-fake-analysis',
      source: 'Langchain',
      status: 'disabled',
    },
    {
      name: 'shopper',
      source: 'Local',
      status: 'disabled',
    },
  ],
}

const Capabilities: FC<TCapabilitiesProps> = ({ user }) => {
  console.log(user)

  const handleDisconnect = (id: string) => {
    console.log('disconnect agent', id)
  }

  return (
    <div className="z-1 flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] p-2.5 backdrop-blur-3xl backdrop-opacity-80">
      <div className="my-1.5 flex w-full items-center justify-between">
        <h1 className="text-center text-2xl font-bold">Capabilities</h1>
        <a
          className="me-3 flex cursor-pointer p-1.5 text-[#7A818B] transition hover:text-(--color-main-text)"
          href="https://near.ai" // ToDo: add link
        >
          <ExternalLinkIcon />
        </a>
      </div>
      {MOCKED_DATA.agents.map((agent) => (
        <Agent key={agent.name} agent={agent} onDisconnect={() => handleDisconnect(agent.name)} />
      ))}
    </div>
  )
}

export default Capabilities
