import { THistoryNote } from '../types'
import Header from './Header'
import Layout from './Layout'
import HistoryNote from './HistoryNote'
// import Spinner from './Spinner'

// ToDo: remove it
const MOCKED_DATA: { total: number; items: THistoryNote[] } = {
  total: 6,
  items: [
    {
      id: '1',
      agent: {
        name: 'dapplets-fake-analysis',
        domain: 'Near AI',
      },
      datetime: '1745994770529',
      payment: {
        amount: 0.06,
        direction: 'outcome',
        isFree: true,
      },
      data: {
        input:
          'Non elementum sed velit suspendisse arcu. Id sed venenatis sed tempus viverra tristique feugiat eu. Suspendisse bibendum pulvinar venenatis urna faucibus proin interdum. Urna semper nibh lorem blandit viverra fames pharetra. Venenatis nisl leo massa nullam nunc eros. ',
        output:
          'Non elementum sed velit suspendisse arcu. Id sed venenatis sed tempus viverra tristique feugiat eu. Suspendisse bibendum pulvinar venenatis urna faucibus proin interdum. Urna semper nibh lorem blandit viverra fames pharetra. Venenatis nisl leo massa nullam nunc eros. Netus libero id faucibus turpis platea donec tincidunt lacus. Tincidunt eu faucibus vitae in at eleifend. Nulla amet auctor platea id sit sagittis et.',
      },
    },
    {
      id: '2',
      agent: {
        name: 'dapplets-fake-analysis',
        domain: 'Near AI',
      },
      datetime: '1745994700529',
      payment: {
        amount: 0.06,
        direction: 'income',
        isFree: false,
      },
      data: {
        input:
          'Non elementum sed velit suspendisse arcu. Id sed venenatis sed tempus viverra tristique feugiat eu. Suspendisse bibendum pulvinar venenatis urna faucibus proin interdum. Urna semper nibh lorem blandit viverra fames pharetra. Venenatis nisl leo massa nullam nunc eros. ',
        output:
          'Non elementum sed velit suspendisse arcu. Id sed venenatis sed tempus viverra tristique feugiat eu. Suspendisse bibendum pulvinar venenatis urna faucibus proin interdum. Urna semper nibh lorem blandit viverra fames pharetra. Venenatis nisl leo massa nullam nunc eros. Netus libero id faucibus turpis platea donec tincidunt lacus. Tincidunt eu faucibus vitae in at eleifend. Nulla amet auctor platea id sit sagittis et.',
      },
    },
    {
      id: '3',
      agent: {
        name: 'dapplets-fake-analysis',
        domain: 'Near AI',
      },
      datetime: '1745994650529',
      payment: {
        amount: 0.06,
        direction: 'outcome',
        isFree: false,
      },
      data: {
        input:
          'Non elementum sed velit suspendisse arcu. Id sed venenatis sed tempus viverra tristique feugiat eu. Suspendisse bibendum pulvinar venenatis urna faucibus proin interdum. Urna semper nibh lorem blandit viverra fames pharetra. Venenatis nisl leo massa nullam nunc eros. ',
        output:
          'Non elementum sed velit suspendisse arcu. Id sed venenatis sed tempus viverra tristique feugiat eu. Suspendisse bibendum pulvinar venenatis urna faucibus proin interdum. Urna semper nibh lorem blandit viverra fames pharetra. Venenatis nisl leo massa nullam nunc eros. Netus libero id faucibus turpis platea donec tincidunt lacus. Tincidunt eu faucibus vitae in at eleifend. Nulla amet auctor platea id sit sagittis et.',
      },
    },
    {
      id: '4',
      agent: {
        name: 'dapplets-fake-analysis',
        domain: 'Near AI',
      },
      datetime: '1745994540529',
      payment: {
        amount: 0.06,
        direction: 'outcome',
        isFree: false,
      },
      data: {
        input:
          'Non elementum sed velit suspendisse arcu. Id sed venenatis sed tempus viverra tristique feugiat eu. Suspendisse bibendum pulvinar venenatis urna faucibus proin interdum. Urna semper nibh lorem blandit viverra fames pharetra. Venenatis nisl leo massa nullam nunc eros. ',
        output:
          'Non elementum sed velit suspendisse arcu. Id sed venenatis sed tempus viverra tristique feugiat eu. Suspendisse bibendum pulvinar venenatis urna faucibus proin interdum. Urna semper nibh lorem blandit viverra fames pharetra. Venenatis nisl leo massa nullam nunc eros. Netus libero id faucibus turpis platea donec tincidunt lacus. Tincidunt eu faucibus vitae in at eleifend. Nulla amet auctor platea id sit sagittis et.',
      },
    },
    {
      id: '5',
      agent: {
        name: 'dapplets-fake-analysis',
        domain: 'Near AI',
      },
      datetime: '1745994430529',
      payment: {
        amount: 0.06,
        direction: 'income',
        isFree: false,
      },
      data: {
        input:
          'Non elementum sed velit suspendisse arcu. Id sed venenatis sed tempus viverra tristique feugiat eu. Suspendisse bibendum pulvinar venenatis urna faucibus proin interdum. Urna semper nibh lorem blandit viverra fames pharetra. Venenatis nisl leo massa nullam nunc eros. ',
        output:
          'Non elementum sed velit suspendisse arcu. Id sed venenatis sed tempus viverra tristique feugiat eu. Suspendisse bibendum pulvinar venenatis urna faucibus proin interdum. Urna semper nibh lorem blandit viverra fames pharetra. Venenatis nisl leo massa nullam nunc eros. Netus libero id faucibus turpis platea donec tincidunt lacus. Tincidunt eu faucibus vitae in at eleifend. Nulla amet auctor platea id sit sagittis et.',
      },
    },
    {
      id: '6',
      agent: {
        name: 'dapplets-fake-analysis',
        domain: 'Near AI',
      },
      datetime: '1745994320529',
      payment: {
        amount: 0.06,
        direction: 'income',
        isFree: false,
      },
      data: {
        input:
          'Non elementum sed velit suspendisse arcu. Id sed venenatis sed tempus viverra tristique feugiat eu. Suspendisse bibendum pulvinar venenatis urna faucibus proin interdum. Urna semper nibh lorem blandit viverra fames pharetra. Venenatis nisl leo massa nullam nunc eros. ',
        output:
          'Non elementum sed velit suspendisse arcu. Id sed venenatis sed tempus viverra tristique feugiat eu. Suspendisse bibendum pulvinar venenatis urna faucibus proin interdum. Urna semper nibh lorem blandit viverra fames pharetra. Venenatis nisl leo massa nullam nunc eros. Netus libero id faucibus turpis platea donec tincidunt lacus. Tincidunt eu faucibus vitae in at eleifend. Nulla amet auctor platea id sit sagittis et.',
      },
    },
  ],
}

const History = () => {
  return (
    <Layout>
      <Header />
      <div className="z-1 flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] p-2.5 backdrop-blur-3xl backdrop-opacity-80">
        <div className="my-1.5 flex w-full items-center justify-between">
          <h1 className="text-center text-2xl font-bold">Payment & Usage</h1>
        </div>
        {MOCKED_DATA?.items.map((note) => <HistoryNote key={note.id} note={note} />)}
      </div>
    </Layout>
  )
}

export default History
