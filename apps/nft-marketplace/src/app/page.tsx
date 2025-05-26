'use client'

/* ─────────────────── imports ─────────────────── */
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import GavelIcon from '@mui/icons-material/Gavel'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import {
  AppBar,
  Box,
  Button,
  CardMedia,
  CircularProgress,
  Container,
  CssBaseline,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { connect, Contract, keyStores, transactions, utils, WalletConnection } from 'near-api-js'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useCallback, useEffect, useState } from 'react'

/* ─────────────────── config ─────────────────── */
const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID || 'mainnet'
const NODE_URL = process.env.NEXT_PUBLIC_NODE_URL || 'https://rpc.mainnet.near.org'
const WALLET_URL = process.env.NEXT_PUBLIC_WALLET_URL || 'https://app.mynearwallet.com'
const HELPER_URL = process.env.NEXT_PUBLIC_HELPER_URL || 'https://helper.mainnet.near.org'
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'market.aigency.near'
const NFT_CONTRACT_ID = process.env.NEXT_PUBLIC_NFT_CONTRACT_NAME || 'my-new-nft-contract.near'

// 150 Tgas
const GAS_BN = BigInt('150000000000000')
// 0.00859 Ⓝ
const STORAGE_FOR_SALE = BigInt('8590000000000000000000')

const yoctoToNear = (y: string | number | bigint) => utils.format.formatNearAmount(y.toString(), 2)
const nearToYocto = (n: string) => utils.format.parseNearAmount(n) || '0'
const nowNs = () => BigInt(Date.now()) * 1_000_000n // ms → ns

const formatLeft = (endNs: bigint): string => {
  const msLeft = Number(endNs - BigInt(Date.now()) * 1_000_000n) / 1e6
  if (msLeft <= 0) return 'Ended'

  const sec = Math.floor(msLeft / 1_000)
  const d   = Math.floor(sec / 86_400)
  const h   = Math.floor((sec % 86_400) / 3_600)
  const m   = Math.floor((sec % 3_600) / 60)
  const s   =  sec % 60

  if (d) return `${d}d ${h}h`
  if (h) return `${h}h ${m}m`
  if (m) return `${m}m ${s}s`
  return `${s}s`
}

/* ─────────────────── types ─────────────────── */
interface Bid {
  bidder_id: string
  price: string
}

interface MarketDataJson {
  owner_id: string
  approval_id: string
  nft_contract_id: string
  token_id: string
  ft_token_id: string
  price: string
  bids: Bid[] | null
  started_at: string | null
  ended_at: string | null
  end_price: string | null
  is_auction: boolean | null
  transaction_fee: string
}

interface MarketContract extends Contract {
  get_market_data: (
    p: { nft_contract_id: string; token_id: string },
    gas?: BigInt,
    amount?: BigInt
  ) => Promise<MarketDataJson>
  buy: (
    p: {
      nft_contract_id: string
      token_id: string
      ft_token_id?: string | null
      price?: string | null
    },
    gas?: BigInt,
    amount?: BigInt
  ) => Promise<void>
  add_bid: (
    p: { nft_contract_id: string; ft_token_id: string; token_id: string; amount: string },
    gas?: BigInt,
    amount?: BigInt
  ) => Promise<void>
  cancel_bid: (
    p: { nft_contract_id: string; token_id: string; account_id: string },
    gas?: BigInt,
    amount?: BigInt
  ) => Promise<void>
  accept_bid: (
    p: { nft_contract_id: string; token_id: string },
    gas?: BigInt,
    amount?: BigInt
  ) => Promise<void>
  end_auction: (
    p: { nft_contract_id: string; token_id: string },
    gas?: BigInt,
    amount?: BigInt
  ) => Promise<void>
}

interface TokenWithListing {
  token: any
  listing: MarketDataJson | null
}

/* ─────────────────── hook ─────────────────── */
const useNear = () => {
  const [wallet, setWallet] = useState<WalletConnection | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [contract, setContract] = useState<MarketContract | null>(null)

  useEffect(() => {
    ;(async () => {
      if (typeof window === 'undefined') return
      const keyStore = new keyStores.BrowserLocalStorageKeyStore()
      const near = await connect({
        networkId: NETWORK_ID,
        nodeUrl: NODE_URL,
        walletUrl: WALLET_URL,
        helperUrl: HELPER_URL,
        deps: { keyStore },
      })
      const walletConn = new WalletConnection(near, CONTRACT_NAME)
      await walletConn.isSignedInAsync()
      setWallet(walletConn)
      if (walletConn.getAccountId()) setAccount(walletConn.getAccountId())

      const ctr = new Contract(walletConn.account(), CONTRACT_NAME, {
        viewMethods: ['get_market_data', 'storage_balance_of', 'get_supply_by_owner_id'],
        changeMethods: [
          'buy',
          'add_bid',
          'cancel_bid',
          'accept_bid',
          'end_auction',
          'storage_deposit',
        ],
        useLocalViewExecution: true,
      }) as unknown as MarketContract
      setContract(ctr)
    })()
  }, [])

  const signIn = useCallback(
    () => wallet?.requestSignIn({ contractId: CONTRACT_NAME, keyType: 'ed25519' }),
    [wallet]
  )
  const signOut = useCallback(() => {
    wallet?.signOut()
    setAccount(null)
  }, [wallet])

  return { accountId: account, wallet, contract, signIn, signOut }
}

/* ─────────────────── tx-builder ─────────────────── */
const buildListingTransactions = async (
  wallet: WalletConnection,
  tokenId: string,
  priceYocto: string,
  msgExtra: Record<string, unknown> = {}
) => {
  /* storage check */
  const storagePaid: string = (await wallet.account().viewFunction({
    contractId: CONTRACT_NAME,
    methodName: 'storage_balance_of',
    args: { account_id: wallet.getAccountId() },
  })) as string

  const currentListings: string = (await wallet.account().viewFunction({
    contractId: CONTRACT_NAME,
    methodName: 'get_supply_by_owner_id',
    args: { account_id: wallet.getAccountId() },
  })) as string

  const required = (BigInt(currentListings) + 1n) * STORAGE_FOR_SALE
  const paid = BigInt(storagePaid || 0)
  const shortfall = required > paid ? required - paid : 0n

  const actionsMarketplace = shortfall
    ? [transactions.functionCall('storage_deposit', {}, GAS_BN, shortfall)]
    : []

  const actionsApprove = [
    transactions.functionCall(
      'nft_approve',
      {
        token_id: tokenId,
        account_id: CONTRACT_NAME,
        msg: JSON.stringify({
          market_type: 'sale',
          price: priceYocto,
          ft_token_id: 'near',
          ...msgExtra,
        }),
      },
      GAS_BN,
      BigInt('310000000000000000000')
    ),
  ]

  const txs: Array<{ receiverId: string; actions: transactions.Action[] }> = []
  if (actionsMarketplace.length)
    txs.push({ receiverId: CONTRACT_NAME, actions: actionsMarketplace })
  txs.push({ receiverId: NFT_CONTRACT_ID, actions: actionsApprove })
  return txs
}

/* ─────────────────── UI helpers ─────────────────── */
const tooltip = (title: string, children: React.ReactElement) => (
  <Tooltip title={title} arrow placement="top">
    {children}
  </Tooltip>
)

const Countdown: React.FC<{ endedAtNs: string | null }> = ({ endedAtNs }) => {
  const [text, setText] = useState(() => (endedAtNs ? formatLeft(BigInt(endedAtNs)) : '—'))

  useEffect(() => {
    if (!endedAtNs) return
    const id = setInterval(() => setText(formatLeft(BigInt(endedAtNs))), 1_000)
    return () => clearInterval(id)
  }, [endedAtNs])

  return <>{text}</>
}

const ConnectWalletButton = ({
  accountId,
  onSignIn,
  onSignOut,
}: {
  accountId: string | null
  onSignIn: () => void
  onSignOut: () => void
}) =>
  tooltip(
    accountId ? 'Disconnect wallet' : 'Connect NEAR wallet',
    <Button
      color="inherit"
      startIcon={<AccountBalanceWalletIcon />}
      onClick={accountId ? onSignOut : onSignIn}
    >
      {accountId ? `Sign out (${accountId})` : 'Connect Wallet'}
    </Button>
  )

/* ─────────────────── row component ─────────────────── */
const ListingRow = ({
  token,
  listing,
  accountId,
  wallet,
  contract,
  refresh,
}: {
  token: any
  listing: MarketDataJson | null
  accountId: string | null
  wallet: WalletConnection | null
  contract: MarketContract | null
  refresh: () => void
}) => {
  const meta = token.metadata || {}
  const imgSrc = meta.media ?? meta.reference ?? 'https://placehold.co/80x80?text=No+Image'

  /* ───── not listed ───── */
  if (!listing) {
    const isOwner = accountId === token.owner_id

    const handleListSale = async (isAuction: boolean) => {
      if (!wallet) return
      const priceNear = prompt(isAuction ? 'Starting price (NEAR):' : 'Sale price (NEAR):')
      if (!priceNear) return
      const priceYocto = nearToYocto(priceNear)

      let msgExtra: Record<string, unknown> = {}
      if (isAuction) {
        const hours = Math.max(1, parseInt(prompt('Auction length (hours):') || '24', 10))
        msgExtra = {
          is_auction: true,
          ended_at: (nowNs() + BigInt(hours) * 3_600_000_000_000n).toString(),
        }
      }

      try {
        const txs = await buildListingTransactions(wallet, token.token_id, priceYocto, msgExtra)
        for (const tx of txs) await wallet.account().signAndSendTransaction(tx)
        alert('Listing submitted – approve in wallet.')
        refresh()
      } catch (err) {
        console.error(err)
        alert('Listing failed or was rejected.')
      }
    }

    return (
      <TableRow hover>
        <TableCell>
          <CardMedia
            component="img"
            image={imgSrc}
            alt={meta.title || token.token_id}
            sx={{ width: 40, height: 40, borderRadius: 1 }}
          />
        </TableCell>
        <TableCell>{meta.title ?? token.token_id}</TableCell>
        <TableCell>{token.owner_id}</TableCell>
        <TableCell align="right">—</TableCell>
        <TableCell align="right">
          {isOwner && (
            <>
              {tooltip(
                'Create fixed-price sale',
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={() => handleListSale(false)}
                >
                  List for sale
                </Button>
              )}{' '}
              {tooltip(
                'Create timed auction',
                <Button size="small" startIcon={<GavelIcon />} onClick={() => handleListSale(true)}>
                  List auction
                </Button>
              )}
            </>
          )}
        </TableCell>
      </TableRow>
    )
  }

  /* ───── listed ───── */
  const isOwner = accountId === listing.owner_id
  const isAuction = !!listing.is_auction
  const latestBid = listing.bids?.[listing.bids.length - 1]
  const ended = isAuction && listing.ended_at && BigInt(listing.ended_at) <= nowNs()
  const userBid = listing.bids?.find((b) => b.bidder_id === accountId)

  /* actions */
  const handleBuy = async () => {
    if (!contract) return
    await contract.buy(
      { nft_contract_id: listing.nft_contract_id, token_id: listing.token_id },
      GAS_BN,
      BigInt(listing.price)
    )
    refresh()
  }

  const handleBid = async () => {
    if (!contract) return
    const near = prompt('Your bid in NEAR:')
    if (!near) return
    const yocto = nearToYocto(near)
    await contract.add_bid(
      {
        nft_contract_id: listing.nft_contract_id,
        ft_token_id: 'near',
        token_id: listing.token_id,
        amount: yocto,
      },
      GAS_BN,
      BigInt(yocto)
    )
    refresh()
  }

  const handleCancelBid = async () => {
    if (!contract || !accountId) return
    await contract.cancel_bid(
      {
        nft_contract_id: listing.nft_contract_id,
        token_id: listing.token_id,
        account_id: accountId,
      },
      GAS_BN,
      1n
    )
    refresh()
  }

  const handleAcceptBid = async () => {
    if (!contract) return
    await contract.accept_bid(
      { nft_contract_id: listing.nft_contract_id, token_id: listing.token_id },
      GAS_BN,
      1n
    )
    refresh()
  }

  const handleEndAuction = async () => {
    if (!contract) return
    await contract.end_auction(
      { nft_contract_id: listing.nft_contract_id, token_id: listing.token_id },
      GAS_BN,
      1n
    )
    refresh()
  }

  const priceDisplay = isAuction
    ? `${yoctoToNear(listing.price)} Ⓝ` +
      (latestBid ? ` / ${yoctoToNear(latestBid.price)} Ⓝ (highest bid)` : '')
    : `${yoctoToNear(listing.price)} Ⓝ`

  return (
    <TableRow hover selected={isOwner}>
      <TableCell>
        <CardMedia
          component="img"
          image={imgSrc}
          alt={meta.title || listing.token_id}
          sx={{ width: 40, height: 40, borderRadius: 1 }}
        />
      </TableCell>
      <TableCell>
        {meta.title ?? listing.token_id}
        {isAuction && listing.started_at && (
          <>
            <br />
            <small>
              ⏳ <Countdown endedAtNs={listing.ended_at} />
            </small>
          </>
        )}
      </TableCell>
      <TableCell>{listing.owner_id}</TableCell>
      <TableCell align="right">{priceDisplay}</TableCell>
      <TableCell align="right">
        {isAuction ? (
          <>
            {/* bidder controls */}
            {!isOwner &&
              userBid &&
              tooltip(
                'Withdraw your bid and get NEAR back',
                <Button size="small" onClick={handleCancelBid}>
                  Cancel bid
                </Button>
              )}

            {/* place bid */}
            {!isOwner &&
              tooltip(
                'Place a bid (+5 % minimum increment)',
                <Button
                  size="small"
                  startIcon={<GavelIcon />}
                  disabled={!accountId || !!ended}
                  onClick={handleBid}
                >
                  Bid
                </Button>
              )}

            {/* seller controls (only after auction end) */}
            {isOwner && (
              <>
                {tooltip(
                  'Transfer NFT to highest bidder and receive funds',
                  <Button
                    size="small"
                    startIcon={<GavelIcon />}
                    disabled={!latestBid}
                    onClick={handleAcceptBid}
                  >
                    Accept bid
                  </Button>
                )}{' '}
                {tooltip(
                  latestBid
                    ? 'Settle auction (same as Accept bid); if no bids, just cancel'
                    : 'Auction had no bids – remove listing',
                  <Button size="small" onClick={handleEndAuction}>
                    End auction
                  </Button>
                )}
              </>
            )}
          </>
        ) : (
          /* fixed-price sale */
          tooltip(
            isOwner ? 'You are the seller' : 'Instantly purchase for the listed price',
            <Button
              size="small"
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              disabled={!accountId || isOwner}
              onClick={handleBuy}
            >
              Buy
            </Button>
          )
        )}
      </TableCell>
    </TableRow>
  )
}

/* ─────────────────── page ─────────────────── */
const Home: NextPage = () => {
  const { accountId, wallet, contract, signIn, signOut } = useNear()
  const [tokens, setTokens] = useState<TokenWithListing[]>([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const fetchAllNFTs = async () => {
    if (!wallet || !contract) return
    setLoading(true)
    try {
      const fetchedTokens = (await wallet.account().viewFunction({
        contractId: NFT_CONTRACT_ID,
        methodName: 'nft_tokens',
        args: { from_index: '0', limit: 100 },
      })) as any[]

      const mapped = await Promise.all(
        fetchedTokens.map(async (t) => {
          try {
            const listing = await contract.get_market_data({
              nft_contract_id: NFT_CONTRACT_ID,
              token_id: t.token_id,
            })
            return { token: t, listing }
          } catch {
            return { token: t, listing: null }
          }
        })
      )
      setTokens(mapped)
    } catch (err) {
      console.error(err)
      setTokens([])
      alert('Failed to fetch NFTs – check contract address.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (wallet && contract && !initialized) {
      fetchAllNFTs()
      setInitialized(true)
    }
  }, [wallet, contract, initialized])

  return (
    <>
      <Head>
        <title>NEAR Marketplace — NFT Explorer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Box suppressHydrationWarning sx={{ display: 'contents' }}>
        <CssBaseline />

        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Aigency NFT Marketplace
            </Typography>
            <ConnectWalletButton accountId={accountId} onSignIn={signIn} onSignOut={signOut} />
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : tokens.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
              No NFTs found on <strong>{NFT_CONTRACT_ID}</strong>.
            </Typography>
          ) : (
            <Table sx={{ mt: 2, minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={40}>Preview</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Seller / Owner</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tokens.map(({ token, listing }) => (
                  <ListingRow
                    key={token.token_id}
                    token={token}
                    listing={listing}
                    accountId={accountId}
                    wallet={wallet}
                    contract={contract}
                    refresh={fetchAllNFTs}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </Container>
      </Box>
    </>
  )
}

export default Home
