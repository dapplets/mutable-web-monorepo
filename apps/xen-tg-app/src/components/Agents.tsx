import { FC } from 'react'
import { TUserInfo } from '../types'
import ExternalLinkIcon from '../assets/external-link'
import Agent from './Agent'

type TAgentsProps = {
  user: TUserInfo | null
}

type TAgent = {
  name: string
  source: string
  status: string
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

const Agents: FC<TAgentsProps> = ({ user }) => {
  console.log(user)

  const handleDisconnect = (id: string) => {
    console.log('disconnect agent', id)
  }

  return (
    <div className="flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] p-2.5">
      <div className="my-1.5 flex w-full items-center justify-between">
        <h1 className="text-center text-2xl font-bold">Connected agents</h1>
        <a
          className="me-3 flex cursor-pointer p-1.5 text-[#7A818B] transition hover:text-(--color-white-text)"
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

export default Agents
