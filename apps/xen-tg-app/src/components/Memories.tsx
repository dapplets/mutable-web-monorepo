import { FC } from 'react'
import { TUserInfo, TMemory } from '../types'
import Memory from './Memory'

type TMemoriesProps = {
  user: TUserInfo | null
}

// ToDo: remove mocked data
const MOCKED_DATA: { memories: TMemory[] } = {
  memories: [
    {
      text: 'User is interested in Ether and cryptocurrencies.',
      timestamp: '2 days ago',
    },
    {
      text: 'User is experienced in cryptocurrency and not interested in advice for beginners.',
      timestamp: '2 weeks ago',
    },
    {
      text: 'The user expresses a keen interest in well-reasoned discussions about the logical connections between cryptocurrency trends and the broader economic and financial context, emphasizing the need for clear, factual arguments.',
      timestamp: '2 month ago',
    },
  ],
}

const Memories: FC<TMemoriesProps> = ({ user }) => {
  console.log(user)

  const handleDeleteAll = () => {
    console.log('delete all')
  }

  const handleDeleteMemory = (id: string) => {
    console.log('delete memory', id)
  }

  return (
    <div className="flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] p-2.5 backdrop-blur-3xl backdrop-opacity-50">
      <div className="my-1.5 flex w-full items-center justify-between">
        <h1 className="text-center text-2xl font-bold">{`Memories (${MOCKED_DATA.memories.length})`}</h1>
        <button
          className="flex cursor-pointer px-2.5 py-1.5 text-[#7A818B] transition hover:text-(--color-main-text)"
          onClick={handleDeleteAll}
        >
          Clear all
        </button>
      </div>
      {MOCKED_DATA.memories.map((memory) => (
        <Memory
          key={memory.text}
          memory={memory}
          onDisconnect={() => handleDeleteMemory(memory.text)}
        />
      ))}
    </div>
  )
}

export default Memories
