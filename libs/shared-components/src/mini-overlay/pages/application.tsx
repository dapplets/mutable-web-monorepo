import {
  JobsProvider,
  useGetMutationVersion,
  useGetSelectedMutation,
  useJobs,
  useMutation,
  useMutationApps,
  usePreferredSource,
} from '@mweb/react-engine'
import { Empty, Typography } from 'antd'
import React, { FC, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import styled from 'styled-components'
import { Image } from '../../common/image'
import { useEngine } from '../../contexts/engine-context'
import PageLayout from '../components/page-layout'
import { LinkOut } from '../assets/icons'
import base58 from 'bs58'
import { ethers } from 'ethers'

const OMEN_SUBGRAPH_URL = '9fUVQpFwzpdWS9bq5WkAnmKbNNcoBwatMR4yZq81pbbz'

/**
 * Convert 32 bytes hex string to ipfscidv0.
 * @param hexstr - 32 Bytes long string
 * @returns IPFS CID Version 0
 */
function byte32ToIPFSCIDV0(hexstr: string): string {
  const binaryStr = Buffer.from(hexstr, 'hex')
  const completedBinaryStr = Buffer.concat([Buffer.from([0x12, 0x20]), binaryStr])
  return base58.encode(completedBinaryStr)
}

const Main = styled.main`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - 129px);
  overflow: auto;
  gap: 10px;
  background-color: var(--pure-white);
  border-radius: 10px;
  box-shadow:
    0px 4px 10px 0px #0b576f26,
    0px 4px 8px 1px #2d343c1a;
`

const AigencyContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  border-radius: 10px;
  background: rgba(255, 255, 255, 1);

  align-items: flex-start;
  width: 100%;
  padding: 10px;
  gap: 10px;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  overflow-x: hidden;

  font-family: system-ui, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;

  /* width */
  &::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px grey;
    border-radius: 10px;
  }

  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: #1879ce70;
    border-radius: 10px;
  }

  /* Handle on hover */
  &::-webkit-scrollbar-thumb:hover {
    background: #1879ced8;
  }
`

const Title = styled.div`
  color: rgba(2, 25, 58, 1);
  font-family: system-ui, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  font-weight: 600;
  font-size: 18px;
  line-height: 149%;
`

const AgentCard = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  background: rgba(248, 249, 255, 1);
  border-radius: 10px;
  border-bottom-width: 1px;
  padding: 6px;
  gap: 6px;
`

const MutationIconWrapper = styled.button<{ $isStopped?: boolean; $isButton: boolean }>`
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  width: 46px;
  height: 46px;
  outline: none;
  border: none;
  background: #fff;
  padding: 0;
  border-radius: 50%;
  transition: all 0.15s ease-in-out;
  position: relative;
  box-shadow: 0 4px 5px 0 rgba(45, 52, 60, 0.2);
  cursor: ${(props) => (props.$isButton ? 'pointer' : 'default !important')};

  .labelAppCenter {
    opacity: 0;
  }

  img {
    box-sizing: border-box;
    object-fit: cover;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    filter: ${(props) => (props.$isStopped ? 'grayscale(1)' : 'grayscale(0)')};
    transition: all 0.15s ease-in-out;
  }

  &:hover {
    box-shadow: ${(props) =>
      props.$isButton ? '0px 4px 20px 0px #0b576f26, 0px 4px 5px 0px #2d343c1a' : 'initial'};

    img {
      filter: ${(props) => (props.$isButton ? 'brightness(115%)' : 'none')};
    }
  }

  &:active {
    box-shadow: ${(props) =>
      props.$isButton ? '0px 4px 20px 0px #0b576f26, 0px 4px 5px 0px #2d343c1a' : 'initial'};

    img {
      filter: ${(props) => (props.$isButton ? 'brightness(125%)' : 'none')};
    }
  }

  &:hover .labelAppTop {
    opacity: ${(props) => (props.$isStopped ? '0' : '1')};
  }

  &:hover .labelAppCenter {
    opacity: 1;
  }
`

const CardContent = styled.div`
  flex: 1 0;
`

const nearIcon = (
  <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.51183 1.25893L5.771 3.84226C5.65183 4.02059 5.88391 4.22893 6.05058 4.08309L7.5685 2.59518C7.61308 2.55643 7.6785 2.58309 7.6785 2.64851V7.30643C7.6785 7.36893 7.59516 7.39559 7.55975 7.35101L2.571 1.14851C2.48962 1.04836 2.38661 0.967955 2.2697 0.913326C2.15279 0.858697 2.02503 0.831266 1.896 0.833093C1.36016 0.833093 0.833496 1.10393 0.833496 1.72309V8.27351C0.834735 8.46645 0.898643 8.65377 1.01559 8.80724C1.13254 8.9607 1.29619 9.07201 1.4819 9.12438C1.6676 9.17676 1.8653 9.16736 2.0452 9.09761C2.2251 9.02786 2.37746 8.90154 2.47933 8.73768L4.21725 6.15434C4.33641 5.97601 4.10725 5.76768 3.94058 5.91351L2.43183 7.43143C2.38725 7.47018 2.32141 7.44309 2.32141 7.37768V2.73184C2.32141 2.66643 2.40475 2.64268 2.44058 2.68726L7.41975 8.85101C7.58641 9.05643 7.83641 9.16643 8.09516 9.16643C8.63391 9.16643 9.16683 8.89851 9.16683 8.27643V1.72643C9.16667 1.53181 9.10293 1.34257 8.9853 1.18752C8.86768 1.03246 8.70262 0.920083 8.51524 0.867483C8.32786 0.814884 8.12843 0.824944 7.9473 0.896132C7.76617 0.967321 7.61325 1.09574 7.51183 1.26184V1.25893Z"
      fill="#19CEAE"
    />
  </svg>
)

type TTextLink = {
  bold?: boolean
  small?: boolean
  ellipsis?: boolean
  $color?: string
}

const TextLink = styled.div<TTextLink>`
  display: flex;
  gap: 3px;
  align-items: center;
  margin: 0;
  font-size: 14px;
  line-height: 18px;
  color: ${(p) =>
    p.$color
      ? `${p.$color} !important`
      : p.bold
        ? '#11181C !important'
        : 'rgb(146 154 160) !important'};
  font-weight: 600;
  font-size: ${(p) => (p.small ? '12px' : '14px')};
  overflow: ${(p) => (p.ellipsis ? 'hidden' : 'visible')};
  text-overflow: ${(p) => (p.ellipsis ? 'ellipsis' : 'unset')};
  white-space: nowrap;
  outline: none;

  span {
    color: rgba(25, 206, 174, 1);
  }
`

type Agent = {
  id: string
  metadata: {
    image: {
      ipfs_cid: string
    }
    name: string
  }
  total: number
  jobsCount: number
  maxRunAt: string
  minRunAt: string
  maxCreatedAt: string
  minCreatedAt: string
  maxLockedAt: string
  minLockedAt: string
}

// Utility function to format job count
const formatJobCount = (jobCount: number): string => {
  return `${jobCount} job${jobCount !== 1 ? 's' : ''}`
}

// Utility function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const now = new Date()
  const past = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  const hours = Math.floor(diffInSeconds / 3600)
  const minutes = Math.floor((diffInSeconds % 3600) / 60)
  const seconds = diffInSeconds % 60

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`)

  return parts.join(' ')
}

// ToDo: hardcoded AigencyPage !!!
const AigencyPage: FC = () => {
  const {
    data: agents,
    error,
    isPending,
  }: { data: Agent[]; error: Error | null; isPending: boolean } = useJobs(
    'https://api.aigency.augm.link/scheduler/runners',
    'agents'
  )

  if (isPending) return 'Loading...'
  if (error) return 'An error has occurred: ' + error?.message
  if (!agents?.length)
    return (
      <AigencyContainer>
        <Title>No active agents</Title>
      </AigencyContainer>
    )

  return (
    <Main>
      <AigencyContainer>
        <Title>Active agents</Title>
        {agents.map((agent) => (
          <AgentCard key={agent.id}>
            <MutationIconWrapper $isButton={false}>
              <Image
                image={agent.metadata.image}
                fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                alt={agent.metadata.name}
              />
            </MutationIconWrapper>
            <CardContent>
              <TextLink bold ellipsis>
                {agent.metadata.name}
              </TextLink>
              <TextLink small ellipsis>
                {Math.round(agent.total * 100) ? (
                  <>
                    {nearIcon}
                    <span>+{Math.round(agent.total * 100) / 100}</span> •{' '}
                  </>
                ) : null}
                Running since {formatTimeAgo(agent.minRunAt)} • {formatJobCount(agent.jobsCount)}
              </TextLink>
            </CardContent>
          </AgentCard>
        ))}
      </AigencyContainer>
    </Main>
  )
}

const MOCKED_DATA = {
  '1825873485937156473': {
    markets: [
      {
        id: '7658767547543',
        question:
          'Will the Trump administration announce a new tariff policy targeting European car imports by March 22, 2025?',
        image: 'bafkreifc7ov3gg64snbk4tfilcyeth37ala6k2tvcxctbjnnw34jtqdxqi',
        outcomes: [
          {
            index: '897585',
            name: 'yes',
            marketId: '89kljafgjefkhjg76585',
            percentage: 0.2902,
          },
          {
            index: '89765',
            name: 'no',
            marketId: '89kljafgjlhjg76585',
            percentage: 0.7098,
          },
        ],
        usdVolume: 1000,
        runningDailyVolume: '962426773980799',
        openingTimestamp: '1746511140',
        scaledCollateralVolume: '223.216344542446512972',
        collateralToken: '0xaf204776c7245bf4147c2612bf6e5972ee483701',
        prsagioUrl:
          'https://presagio.pages.dev/markets?id=0x1b93917d75f80d14e15213cd41068089cb7492b9',
      },
      {
        id: '76hsdrthdh7543',
        question:
          'Will the Trump administration announce a new tariff policy targeting European car imports by March 22, 2025?',
        image: 'bafkreifc7ov3gg64snbk4tfilcyeth37ala6k2tvcxctbjnnw34jtqdxqi',
        outcomes: [
          {
            index: '897uoioyu6585',
            name: 'yes',
            marketId: '89kljafgjwrwrlaefkhjg76585',
            percentage: 0.5,
          },
          {
            index: '897uytru6585',
            name: 'no',
            marketId: '89kljafgjlaefkhtertejg76585',
            percentage: 0.5,
          },
        ],
        usdVolume: 1524.92,
        runningDailyVolume: '222426773980799',
        openingTimestamp: '1746511140',
        scaledCollateralVolume: '223.216344542446512972',
        collateralToken: '0xaf204776c7245bf4147c2612bf6e5972ee483701',
        prsagioUrl:
          'https://presagio.pages.dev/markets?id=0x1b93917d75f80d14e15213cd41068089cb7492b9',
      },
      {
        id: '765jhlhkjlhkl43',
        question:
          'Will the Trump administration announce a new tariff policy targeting European car imports by March 22, 2025?',
        image: 'bafkreifc7ov3gg64snbk4tfilcyeth37ala6k2tvcxctbjnnw34jtqdxqi',
        outcomes: [
          {
            index: '8976234234585',
            name: 'yes',
            marketId: '89kljafgjlaefkhjg76585',
            percentage: 0,
          },
          {
            index: '89hgjjhg76585',
            name: 'no',
            marketId: '89kljafgsdfafadsjlaefkhjg76585',
            percentage: 1,
          },
        ],
        usdVolume: 1654.23,
        runningDailyVolume: '832426773980799',
        openingTimestamp: '1746511140',
        scaledCollateralVolume: '223.216344542446512972',
        collateralToken: '0xaf204776c7245bf4147c2612bf6e5972ee483701',
        prsagioUrl:
          'https://presagio.pages.dev/markets?id=0x1b93917d75f80d14e15213cd41068089cb7492b9',
      },
      {
        id: '762342134kjlhkl43',
        question:
          'Will the Trump administration announce a new tariff policy targeting European car imports by March 22, 2025?',
        image: 'bafkreifc7ov3gg64snbk4tfilcyeth37ala6k2tvcxctbjnnw34jtqdxqi',
        outcomes: [
          {
            index: '8976;lkjl;k585',
            name: 'yes',
            marketId: '89kljafgjlafghjfgjhefkhjg76585',
            percentage: 1,
          },
          {
            index: '8976adfda585',
            name: 'no',
            marketId: '89kljafgjlaefadfadsfkhjg76585',
            percentage: 0,
          },
        ],
        usdVolume: 765.98,
        runningDailyVolume: '442426773980799',
        openingTimestamp: '1746511140',
        scaledCollateralVolume: '223.216344542446512972',
        collateralToken: '0xaf204776c7245bf4147c2612bf6e5972ee483701',
        prsagioUrl:
          'https://presagio.pages.dev/markets?id=0x1b93917d75f80d14e15213cd41068089cb7492b9',
      },
    ],
  },
}

const MarketCard = styled.div`
  min-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  background: white;
  border-radius: 12px;
  padding: 10px;

  p {
    margin: 0 !important;
    padding: 0 !important;
  }

  .left-column {
    display: flex;
    position: relative;
    gap: 6px;
    width: 100%;
  }

  .left-column {
    color: rgba(122, 129, 139, 1);

    a {
      color: inherit;
      text-decoration: none !important;
      background: transparent;
      padding: 2px !important;
      transition: all 0.2s ease;

      :hover {
        color: rgba(2, 25, 58, 1);
      }

      :active {
        color: rgb(1, 10, 22);
      }
    }

    img {
      width: 42px;
      height: 42px;
      border-radius: 6px;
      flex-shrink: 0;
    }

    .my-card-footer {
      font-weight: 400 !important;
      font-size: 12px !important;
      line-height: 100% !important;
      display: flex;
      justify-content: space-between;
      padding: 5px 0;

      img {
        width: 16px;
        height: 16px;
      }
    }
  }
`

const Chart = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
  gap: 6px;
`

const ChartLine = styled.div`
  display: flex;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  width: 100%;
  position: relative;
  gap: 1px;
`

const ChartOutcome = styled.div`
  display: flex;
  height: 4px;
  border-radius: 2px;
  align-items: center;
`

const ChartFirstOutcome = styled(ChartOutcome)`
  background: rgba(25, 206, 174, 1);
`

const ChartSecondOutcome = styled(ChartOutcome)`
  background: rgba(244, 36, 94, 1);
`

const ChartLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 14px;
  line-height: 110%;
`

const ChartLabel = styled.p`
  width: 100%;
  text-transform: capitalize;
`

const ChartFirstLabel = styled(ChartLabel)`
  color: rgba(25, 206, 174, 1);
  text-align: left;
`

const ChartSecondLabel = styled(ChartLabel)`
  color: rgba(244, 36, 94, 1);
  text-align: right;
`

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`

const CurrentAnswer = styled.div<{ $isFirst: boolean }>`
  display: flex;
  gap: 5px;
  border-radius: 4px;
  padding: 4px;
  background: rgba(248, 249, 255, 1);
  font-weight: 600;
  font-size: 10px;
  line-height: 149%;
  color: ${({ $isFirst }) => ($isFirst ? 'rgba(25, 206, 174, 1)' : 'rgba(244, 36, 94, 1)')};

  span {
    text-transform: uppercase;
  }
`

const toPercent = (value: number) => (value * 100).toFixed(2)

const differenceInSeconds = (laterDate: Date, earlierDate: Date) =>
  Math.floor((laterDate.getTime() - earlierDate.getTime()) / 1000)

/**
 * @name formatDistance
 *
 *   === Examples ===
 * console.log(formatDistance(new Date(), new Date(Date.now() - 3 * 60 * 60 * 1000)));
 * about 3 hours ago
 *
 * console.log(formatDistance(new Date(Date.now() + 60 * 60 * 1000), new Date(), { addSuffix: true }));
 * in about 1 hour
 *
 * console.log(formatDistance(new Date(Date.now() + 25 * 1000), new Date(), { addSuffix: true }));
 * in less than 30 seconds
 */

type Locale = {
  [name: string]: string
}

const locales: { en: Locale } = {
  en: {
    lessThanXSeconds: 'less than {{count}} seconds',
    xSeconds: '{{count}} seconds',
    halfAMinute: 'half a minute',
    lessThanXMinutes: 'less than {{count}} minutes',
    xMinutes: '{{count}} minutes',
    aboutXHours: 'about {{count}} hours',
    xHours: '{{count}} hours',
    xDays: '{{count}} days',
    aboutXMonths: 'about {{count}} months',
    xMonths: '{{count}} months',
    aboutXYears: 'about {{count}} years',
    xYears: '{{count}} years',
    overXYears: 'over {{count}} years',
    almostXYears: 'almost {{count}} years',
    suffixAgo: '{{distance}} ago',
    suffixIn: 'in {{distance}}',
  },
}

const formatDistance = (laterDate: Date, earlierDate: Date): string => {
  const locale = 'en'
  const addSuffix = false
  const dict = locales[locale] || locales['en']

  const seconds = Math.abs(differenceInSeconds(laterDate, earlierDate))

  let token: keyof Locale
  let count

  if (seconds < 30) {
    token = 'lessThanXSeconds'
    count = 30
  } else if (seconds < 60) {
    token = 'xSeconds'
    count = seconds
  } else if (seconds < 90) {
    token = 'halfAMinute'
  } else if (seconds < 60 * 60) {
    token = 'xMinutes'
    count = Math.round(seconds / 60)
  } else if (seconds < 60 * 60 * 24) {
    token = 'xHours'
    count = Math.round(seconds / 3600)
  } else if (seconds < 60 * 60 * 24 * 30) {
    token = 'xDays'
    count = Math.round(seconds / (3600 * 24))
  } else if (seconds < 60 * 60 * 24 * 365) {
    token = 'xMonths'
    count = Math.round(seconds / (3600 * 24 * 30))
  } else {
    token = 'xYears'
    count = Math.round(seconds / (3600 * 24 * 365))
  }

  let template = dict[token] || ''

  if (template.includes('{{count}}')) {
    template = template.replace('{{count}}', String(count))
  }

  if (addSuffix) {
    const isFuture = laterDate > earlierDate
    const suffixTemplate = isFuture ? dict.suffixIn : dict.suffixAgo
    template = suffixTemplate.replace('{{distance}}', template)
  }

  return template
}

const isPast = (date: Date): boolean => Number(date) < Date.now()

const remainingTime = (date: Date): string => {
  const now = new Date()
  if (isPast(date)) {
    return `Happened ${formatDistance(date, now)} ago`
  } else {
    return `${formatDistance(date, now)} remaining`
  }
}

const formatValueWithFixedDecimals = (value: number | string, fixedDecimals: number): string => {
  if (fixedDecimals === undefined) fixedDecimals = 5
  const isAnInteger = Number(value) % 1 === 0
  const smallestNumber = Math.pow(1 / 10, fixedDecimals)
  const smallNumberString = `<${smallestNumber.toFixed(fixedDecimals)}`
  const isVerySmallNumber = Number(value) < smallestNumber

  if (isAnInteger) return value.toString()
  if (isVerySmallNumber) return smallNumberString

  return Number(value).toFixed(fixedDecimals)
}

const formatEtherWithFixedDecimals = (wei: bigint, fixedDecimals: number = 5) => {
  const formattedEther = ethers.utils.formatEther(wei)
  return formatValueWithFixedDecimals(formattedEther, fixedDecimals)
}

type ValueByTrade = {
  Buy: (previousValue: number, newValue: number) => number
  Sell: (previousValue: number, newValue: number) => number
}

const valueByTrade = {
  Buy: (previousValue: number, newValue: number) => previousValue + newValue,
  Sell: (previousValue: number, newValue: number) => previousValue - newValue,
}

type ValueByTradeBigInt = {
  Buy: (previousValue: bigint, newValue: bigint) => bigint
  Sell: (previousValue: bigint, newValue: bigint) => bigint
}

const valueByTradeBigInt: ValueByTradeBigInt = {
  Buy: (previousValue: bigint, newValue: bigint) => previousValue + newValue,
  Sell: (previousValue: bigint, newValue: bigint) => previousValue - newValue,
}

const tradesCollateralAmountSpent = ({ fpmmTrades }: { fpmmTrades: any[] }) => {
  return (
    fpmmTrades?.reduce((acc, trade) => {
      const type: keyof ValueByTradeBigInt = trade.type
      return valueByTradeBigInt[type]?.(acc, BigInt(trade.collateralAmount))
    }, BigInt(0)) ?? BigInt(0)
  )
}

const getMarketUserTrades = async (address: string, market: any, outcomeIndex: number) => {
  const marketUserTradesRes = await fetch(
    `https://gateway.thegraph.com/api/subgraphs/id/${OMEN_SUBGRAPH_URL}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ccfb432b10a5f65cb1fc60031a77c67e',
      },
      body: JSON.stringify({
        query: `
          query GetMarketUserTrades($creator: ID!, $fpmm: ID!, $outcomeIndex_in: [BigInt!]) {
            fpmmTrades(
              where: { fpmm: $fpmm, creator: $creator, outcomeIndex_in: $outcomeIndex_in }
            ) {
              creator {
                id
              }
              title
              outcomeIndex
              id
              feeAmount
              collateralAmount
              collateralAmountUSD
              collateralToken
              outcomeTokenMarginalPrice
              outcomeTokensTraded
              oldOutcomeTokenMarginalPrice
              transactionHash
              creationTimestamp
              type
            }
          }
        `,
        operationName: 'Subgraphs',
        variables: {
          creator: address.toLowerCase(),
          fpmm: market.id,
          outcomeIndex_in: [outcomeIndex],
        },
      }),
    }
  )
  const trades = await marketUserTradesRes.json()
  // console.log('trades', trades)
  return trades?.data
}

const getMarketUserTrade = async (id: string): Promise<string[] | undefined> => {
  const lastMarketTradeRes = await fetch(
    `https://gateway.thegraph.com/api/subgraphs/id/${OMEN_SUBGRAPH_URL}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ccfb432b10a5f65cb1fc60031a77c67e',
      },
      body: JSON.stringify({
        query: `
          query GetMarketUserTrades(
            $first: Int!
            $fpmm: ID!
            $skip: Int
            $orderBy: String
            $orderDirection: String
          ) {
            fpmmTrades(
              where: { fpmm: $fpmm }
              first: $first
              skip: $skip
              orderBy: $orderBy
              orderDirection: $orderDirection
            ) {
              creationTimestamp
              id
              outcomeIndex
              outcomeTokensTraded
              transactionHash
              fpmm {
                outcomes
              }
              creator {
                id
              }
            }
          }
        `,
        operationName: 'Subgraphs',
        variables: {
          first: 1,
          fpmm: id,
          orderBy: 'creationTimestamp',
          orderDirection: 'desc',
        },
      }),
    }
  )
  const trade = await lastMarketTradeRes.json()
  return trade?.data
}

const getLastTradeMarginalPrices = async (
  id: string,
  trade: any
): Promise<string[] | undefined> => {
  const lastTradeTimestamp = trade.fpmmTrades[0]?.creationTimestamp

  const blockNumberRes = await fetch(
    'https://gateway.thegraph.com/api/subgraphs/id/D58aXwnRLfosFtRaVJAbAjjvKZ11bEsbdiDLkJJRdSC9',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ccfb432b10a5f65cb1fc60031a77c67e',
      },
      body: JSON.stringify({
        query: `
          query blockNumberByTimestamp($lastTradeTimestamp: String) {
            blocks(where: {timestamp: $lastTradeTimestamp}, first: 1) {
              number
            }
          }
        `,
        operationName: 'Subgraphs',
        variables: { lastTradeTimestamp },
      }),
    }
  )
  const blockNumber = (await blockNumberRes.json())?.data
  const tradeBlockNumber = blockNumber.blocks?.[0].number
  if (!tradeBlockNumber) return

  const marginalPricesResponse = await fetch(
    `https://gateway.thegraph.com/api/subgraphs/id/${OMEN_SUBGRAPH_URL}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ccfb432b10a5f65cb1fc60031a77c67e',
      },
      body: JSON.stringify({
        query: `
          query marginalPricesByBlockNumber($id: ID!, $number: Int) {
            fixedProductMarketMaker(id: $id, block: { number: $number }) {
              outcomeTokenMarginalPrices
            }
          }
        `,
        operationName: 'Subgraphs',
        variables: {
          id,
          number: parseInt(tradeBlockNumber),
        },
      }),
    }
  )
  const marginalPrices = (await marginalPricesResponse.json())?.data
  return marginalPrices.fixedProductMarketMaker.outcomeTokenMarginalPrices
}

const PredictionMarketCard: FC<{ market: any; addresses: string[] }> = ({ market, addresses }) => {
  const [outcomeTokenMarginalPrices, setOutcomeTokenMarginalPrices] = useState<any>(
    market.outcomeTokenMarginalPrices
  )
  const [marketUserTrades, setMarketUserTrades] = useState<any | null>(null)
  // console.log('marketUserTrades', marketUserTrades)

  const outcomeIndex = market.position.indexSets[0]
  // console.log('outcomeIndex', outcomeIndex)

  useEffect(() => {
    ;(async function () {
      if (!outcomeTokenMarginalPrices) {
        const trade = await getMarketUserTrade(market.id)
        if (!trade) return
        const lastTradeMarginalPrices = await getLastTradeMarginalPrices(market.id, trade)
        setOutcomeTokenMarginalPrices(lastTradeMarginalPrices)
      }
      if (!marketUserTrades) {
        const newMarketUserTrades = await getMarketUserTrades(
          addresses[0],
          market,
          outcomeIndex - 1
        )
        // console.log('newMarketUserTrades', newMarketUserTrades)
        setMarketUserTrades(newMarketUserTrades)
      }
    })()
  }, [market.id])

  const outcomes = market.outcomes.map((outcome: string, i: number) => ({
    index: i,
    name: outcome,
    marketId: market.id,
    percentage: outcomeTokenMarginalPrices?.[i],
  }))
  const usersOutcome = outcomes ? outcomes[outcomeIndex - 1] : ''
  // console.log('usersOutcome', usersOutcome)

  const collateralAmountSpent = tradesCollateralAmountSpent({
    fpmmTrades: marketUserTrades?.fpmmTrades || [],
  })
  // console.log('collateralAmountSpent', collateralAmountSpent)

  const closingDate = new Date(+market.openingTimestamp * 1000)
  const nowTimestamp = Math.floor(Date.now() / 1000)
  const isAnswerFinal =
    !!market.resolutionTimestamp || market.answerFinalizedTimestamp < nowTimestamp
  const INVALID_ANSWER_HEX = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  const currentAnswer = market.question?.currentAnswer
    ? market.question.currentAnswer === INVALID_ANSWER_HEX
      ? -1
      : ethers.utils.hexValue(market.question.currentAnswer)
    : null
  const answer =
    market.question && currentAnswer !== null && isAnswerFinal
      ? market.question.currentAnswer === INVALID_ANSWER_HEX
        ? -1
        : Number(BigInt(market.question.currentAnswer))
      : null

  const isWinner = answer === outcomeIndex - 1
  const isAnswerInvalid = answer === -1
  const isClosed = answer !== null || isPast(closingDate)

  const getResultAmountString = (): string => {
    if (!isClosed || !isAnswerFinal) return 'Potential win'
    if (isWinner) return 'Won'
    if (isAnswerInvalid) return 'Receive'

    return 'Lost'
  }

  const getRedeemableColleteralToken = (outcomeTokenTotalWei: bigint, index: number) => {
    const payout = +market.position.conditions[0].payouts?.[index]
    if (!payout) return null

    const outcomeTokenTotal = +ethers.utils.formatEther(outcomeTokenTotalWei)

    return outcomeTokenTotal * payout
  }

  const outcomeTokensTradedTotal = ({ fpmmTrades }: any) => {
    return (
      fpmmTrades?.reduce((acc: any, trade: any) => {
        const type: keyof ValueByTradeBigInt = trade.type
        return valueByTradeBigInt[type](acc, BigInt(trade.outcomeTokensTraded))
      }, BigInt(0)) ?? BigInt(0)
    )
  }

  const tradesOutcomeBalance = ({ fpmmTrades }: any) => {
    return (
      fpmmTrades?.reduce((acc: any, trade: any) => {
        const type: keyof ValueByTrade = trade.type
        const collateralAmount = parseFloat(
          ethers.utils.formatEther(trade.outcomeTokensTraded as bigint)
        )
        return valueByTrade[type](acc, collateralAmount)
      }, 0) ?? 0
    )
  }

  const getResultAmount = (): string => {
    const invalidMarketColleteralToRedeem = getRedeemableColleteralToken(
      outcomeTokensTradedTotal({
        fpmmTrades: marketUserTrades?.fpmmTrades || [],
      }),
      outcomeIndex
    )
    const outcomeBalance = tradesOutcomeBalance({
      fpmmTrades: marketUserTrades?.fpmmTrades || [],
    })
    if (!market.isClosed || isWinner || !market.isAnswerFinal)
      return formatValueWithFixedDecimals(outcomeBalance, 2)

    if (market.isAnswerInvalid)
      return formatValueWithFixedDecimals(invalidMarketColleteralToRedeem || 0, 2)

    return formatEtherWithFixedDecimals(collateralAmountSpent, 2)
  }

  const resultAmountString = getResultAmountString()
  const resultAmount = getResultAmount()
  // console.log('resultAmountString', resultAmountString)
  // console.log('resultAmount', resultAmount)

  return (
    <MarketCard key={market.id} className="slide">
      <div className="left-column">
        {market.image && (
          <img
            src={
              /^http(s)?:\/\//.test(market.image)
                ? market.image
                : `https://ipfs.io/ipfs/${market.image}`
            }
          />
        )}
        <div
          style={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}
        >
          <div className="my-card-footer">
            <div
              className="header-data"
              style={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}
            >
              {market.scaledCollateralVolume ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {market.collateralToken && (
                    <img
                      src={`https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/images/100/${market.collateralToken}/logo.png`}
                    />
                  )}
                  {formatValueWithFixedDecimals(market.scaledCollateralVolume, 2)}
                  <div title="volume"> Volume</div>
                </div>
              ) : null}
              {market.scaledCollateralVolume && market.openingTimestamp ? <span> • </span> : null}
              {market.openingTimestamp ? (
                <span
                  style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                  {remainingTime(new Date(Number(market.openingTimestamp) * 1000))}
                </span>
              ) : null}
            </div>
            {
              <a
                type="button"
                href={'https://presagio.pages.dev/markets?id=' + market.id}
                target="_blank"
              >
                <LinkOut />
              </a>
            }
          </div>
          {outcomes[0].percentage && outcomes[1].percentage ? (
            <div className="statistics">
              <Chart>
                <ChartLine>
                  <ChartFirstOutcome style={{ width: toPercent(outcomes[0].percentage) + '%' }} />
                  <ChartSecondOutcome style={{ width: toPercent(outcomes[1].percentage) + '%' }} />
                </ChartLine>
                <ChartLabels>
                  <ChartFirstLabel>
                    {outcomes[0].name} ({toPercent(outcomes[0].percentage) + '%'})
                  </ChartFirstLabel>
                  <ChartSecondLabel>
                    {outcomes[1].name} ({toPercent(outcomes[1].percentage) + '%'})
                  </ChartSecondLabel>
                </ChartLabels>
              </Chart>
            </div>
          ) : null}
        </div>
      </div>
      <p>{market.title}</p>
      {market.currentAnswer ? (
        <CurrentAnswer $isFirst={!Number(market.currentAnswer)}>
          Resolved as: <span>{market.outcomes.at(market.currentAnswer) || null}</span>
        </CurrentAnswer>
      ) : null}
      <CardFooter>
        {usersOutcome ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CurrentAnswer $isFirst={!outcomeIndex}>
              <span>{usersOutcome.name}</span>
            </CurrentAnswer>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <p>{formatEtherWithFixedDecimals(collateralAmountSpent, 2)}</p>
              <img
                style={{ widows: 16, height: 16 }}
                src={`https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/images/100/${market.collateralToken}/logo.png`}
              />
            </div>
          </div>
        ) : null}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p>{resultAmountString}:</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <p>{resultAmount}</p>
            <img
              style={{ widows: 16, height: 16 }}
              src={`https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/images/100/${market.collateralToken}/logo.png`}
            />
          </div>
        </div>
      </CardFooter>
    </MarketCard>
  )
}

const MarketsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const AppsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 5px 10px 10px;
  margin: 0;
  gap: 10px;
  max-height: calc(100vh - 130px);
  overflow-y: auto;
  overflow-x: hidden;

  /* width */
  &::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px grey;
    border-radius: 10px;
  }

  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: #1879ce70;
    border-radius: 10px;
  }

  /* Handle on hover */
  &::-webkit-scrollbar-thumb:hover {
    background: #1879ced8;
  }

  & button {
    direction: ltr;
  }
`

const Message = styled.div`
  display: flex;
  padding: 30px 10px;
  width: 100%;
  justify-content: center;
  font-size: 14px;
  color: darkslategray;
`

// ToDo: hardcoded PredictionMarketsPage !!!
const PredictionMarketsPage: FC = () => {
  const { addresses } = useEngine()
  const [unresolvedMarkets, setUnresolvedMarkets] = useState<any[]>([])
  const [resolvedMarkets, setResolvedMarkets] = useState<any[]>([])

  useEffect(() => {
    const fetchMarkets = async (addressesToFetch: string[]) => {
      const positionsResponse = await fetch(
        'https://gateway.thegraph.com/api/subgraphs/id/7s9rGBffUTL8kDZuxvvpuc46v44iuDarbrADBFw5uVp2',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ccfb432b10a5f65cb1fc60031a77c67e',
          },
          body: JSON.stringify({
            query: `
              query GetUserPositions($id: ID!) {
                userPositions(
                  where: { user_: { id: $id } }
                  orderBy: position__createTimestamp
                  orderDirection: desc
                  first: 500
                ) {
                  id
                  balance
                  totalBalance
                  wrappedBalance
                  user {
                    firstParticipation
                    lastActive
                  }
                  position {
                    id
                    activeValue
                    conditionIdsStr
                    indexSets
                    multiplicities
                    wrappedTokenAddress
                    collateralTokenAddress
                    createTimestamp
                    collateralToken {
                      activeAmount
                      mergedAmount
                      redeemedAmount
                      splitAmount
                    }
                    conditions {
                      id
                      oracle
                      outcomes
                      outcomeSlotCount
                      payouts
                      payoutNumerators
                      payoutDenominator
                      questionId
                      resolved
                      resolveTimestamp
                      resolveTransaction
                      createTimestamp
                    }
                  }
                }
              }
            `,
            operationName: 'Subgraphs',
            variables: { id: addressesToFetch[0] },
          }),
        }
      )
      const data = await positionsResponse.json()
      const positions = data?.data.userPositions.map((userPosition: any) => userPosition.position)
      // console.log('positions', positions)
      const newResolvedMarkets = []
      const newUnresolvedMarkets = []
      for (const position of positions) {
        const marketResponse = await fetch(
          'https://gateway.thegraph.com/api/subgraphs/id/9fUVQpFwzpdWS9bq5WkAnmKbNNcoBwatMR4yZq81pbbz',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ccfb432b10a5f65cb1fc60031a77c67e',
            },
            body: JSON.stringify({
              query: `
                query OmenConditionsQuery($id: ID!) {
                  conditions(where: { id: $id }) {
                    fixedProductMarketMakers {
                      id
                      collateralVolume
                      collateralToken
                      creationTimestamp
                      lastActiveDay
                      outcomeTokenAmounts
                      runningDailyVolumeByHour
                      title
                      outcomes
                      openingTimestamp
                      arbitrator
                      category
                      templateId
                      scaledLiquidityParameter
                      scaledLiquidityMeasure
                      scaledCollateralVolume
                      curatedByDxDao
                      klerosTCRregistered
                      outcomeTokenMarginalPrices
                      condition {
                        id
                        oracle
                        scalarLow
                        scalarHigh
                        __typename
                      }
                      question {
                        id
                        data
                        currentAnswer
                        outcomes
                        answers {
                          answer
                          bondAggregate
                          __typename
                        }
                        __typename
                      }
                      outcomes
                      outcomeTokenMarginalPrices
                      resolutionTimestamp
                      usdRunningDailyVolume
                      usdVolume
                      currentAnswer
                      currentAnswerTimestamp
                      fee
                      __typename
                    }
                  }
                }
              `,
              operationName: 'Subgraphs',
              variables: { id: position.conditionIdsStr },
            }),
          }
        )
        const market = (await marketResponse.json())?.data.conditions[0].fixedProductMarketMakers[0]
        // console.log('market', market)

        const imageResponse = await fetch(
          'https://gateway.thegraph.com/api/subgraphs/id/EWN14ciGK53PpUiKSm7kMWQ6G4iz3tDrRLyZ1iXMQEdu',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ccfb432b10a5f65cb1fc60031a77c67e',
            },
            body: JSON.stringify({
              query: `
                query GetOmenThumbnail($id: ID){
                  omenThumbnailMapping(id: $id) {
                    image_hash
                  }
                }
              `,
              operationName: 'Subgraphs',
              variables: { id: market.id },
            }),
          }
        )
        const image = await imageResponse.json()
        const ipfsHash = image?.data?.omenThumbnailMapping?.image_hash
          ? byte32ToIPFSCIDV0(image.data.omenThumbnailMapping.image_hash.slice(2))
          : null
        market.image = ipfsHash

        market.position = position

        if (position.conditions[0].resolved) {
          newResolvedMarkets.push(market)
        } else {
          newUnresolvedMarkets.push(market)
        }
      }
      setUnresolvedMarkets(newUnresolvedMarkets)
      setResolvedMarkets(newResolvedMarkets)
    }

    addresses?.length && fetchMarkets(addresses)
  }, [addresses])

  return (
    <AppsWrapper>
      {!addresses?.length ? <Message>Connect your betting account via MetaMask</Message> : null}
      {addresses?.length && !unresolvedMarkets.length && !resolvedMarkets.length ? (
        <Message>The connected account has no bets</Message>
      ) : null}
      {addresses?.length && unresolvedMarkets.length ? (
        <Main
          style={{
            maxHeight: 'unset',
            overflow: 'initial',
            backgroundColor: '#f7f9ff',
            padding: 10,
          }}
        >
          <Title>Active bets</Title>
          <MarketsContainer>
            {unresolvedMarkets.map((market) => (
              <PredictionMarketCard key={market.id} market={market} addresses={addresses} />
            ))}
          </MarketsContainer>
        </Main>
      ) : null}
      {addresses?.length && resolvedMarkets.length ? (
        <Main
          style={{
            maxHeight: 'unset',
            overflow: 'initial',
            backgroundColor: '#f7f9ff',
            padding: 10,
          }}
        >
          <Title>Closed bets</Title>
          <MarketsContainer>
            {resolvedMarkets.map((market) => (
              <PredictionMarketCard key={market.id} market={market} addresses={addresses} />
            ))}
          </MarketsContainer>
        </Main>
      ) : null}
    </AppsWrapper>
  )
}

const EmptyContainer = styled.div`
  display: flex;
  width: 100%;
  height: 50vh;
  justify-content: center;
  align-items: center;
`

const Application: FC = () => {
  const { tree } = useEngine()
  const { selectedMutationId } = useGetSelectedMutation(tree?.id)
  const { preferredSource } = usePreferredSource(selectedMutationId, tree?.id)
  const { mutationVersion } = useGetMutationVersion(selectedMutationId)
  const { mutation } = useMutation(selectedMutationId, preferredSource, mutationVersion)
  const { mutationApps } = useMutationApps(mutation?.id, mutation?.apps ?? [])
  const { authorId, localId } = useParams() as { authorId: string; localId: string }
  const appId = authorId + '/app/' + localId
  const selectedApp = mutationApps.find((app) => app.id === appId)
  const appRef = useRef<HTMLDivElement>(null)

  if (!selectedApp) return null
  return (
    <PageLayout
      ref={appRef}
      title={selectedApp.metadata.name || ''}
      backPath={-1}
      icon={
        <Image
          image={selectedApp.metadata.image}
          fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
          alt={selectedApp.metadata.name}
        />
      }
    >
      {/* ToDo: hardcoded AiAgent !!! */}
      {selectedApp.id === 'bos.dapplets.testnet/app/AiAgent' ? (
        <JobsProvider>
          <AigencyPage />
        </JobsProvider>
      ) : selectedApp.id === 'bos.dapplets.testnet/app/PreMar' ? (
        <PredictionMarketsPage />
      ) : (
        <EmptyContainer>
          <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            style={{ height: 60 }}
            description={
              <Typography.Text style={{ color: 'rgb(115 122 133)' }}>
                No content provided for this application
              </Typography.Text>
            }
          ></Empty>
        </EmptyContainer>
      )}
    </PageLayout>
  )
}

export default Application
