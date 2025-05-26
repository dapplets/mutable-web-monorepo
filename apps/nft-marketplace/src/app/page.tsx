'use client'

/* ─────────────────── imports ─────────────────── */
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import GavelIcon from '@mui/icons-material/Gavel'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  AppBar,
  Box,
  Button,
  CardMedia,
  CircularProgress,
  Collapse,
  Container,
  CssBaseline,
  IconButton,
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

const GAS_BN = 150_000_000_000_000n // 150 Tgas
const STORAGE_FOR_SALE = 8_590_000_000_000_000_000_000n // 0.00859 Ⓝ

const yoctoToNear = (y: string | number | bigint) => utils.format.formatNearAmount(y.toString(), 2)
const nearToYocto = (n: string) => utils.format.parseNearAmount(n) || '0'
const nowNs = () => BigInt(Date.now()) * 1_000_000n // ms→ns

const formatLeft = (endNs: bigint): string => {
  const msLeft = Number(endNs - nowNs()) / 1e6
  if (msLeft <= 0) return 'Ended'
  const sec = Math.floor(msLeft / 1_000)
  const d = Math.floor(sec / 86_400)
  const h = Math.floor((sec % 86_400) / 3_600)
  const m = Math.floor((sec % 3_600) / 60)
  const s = sec % 60
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
  get_market_data: (p: { nft_contract_id: string; token_id: string }) => Promise<MarketDataJson>
  buy: (
    p: { nft_contract_id: string; token_id: string },
    gas?: bigint,
    amount?: bigint
  ) => Promise<void>
  add_bid: (
    p: { nft_contract_id: string; ft_token_id: string; token_id: string; amount: string },
    gas?: bigint,
    amount?: bigint
  ) => Promise<void>
  cancel_bid: (
    p: { nft_contract_id: string; token_id: string; account_id: string },
    gas?: bigint,
    amount?: bigint
  ) => Promise<void>
  accept_bid: (
    p: { nft_contract_id: string; token_id: string },
    gas?: bigint,
    amount?: bigint
  ) => Promise<void>
  end_auction: (
    p: { nft_contract_id: string; token_id: string },
    gas?: bigint,
    amount?: bigint
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

/* ─────────────────── tx-builder (for listing) ─────────────────── */
const buildListingTransactions = async (
  wallet: WalletConnection,
  tokenId: string,
  priceYocto: string,
  msgExtra: Record<string, unknown> = {}
) => {
  const storagePaid: string = (await wallet.account().viewFunction({
    contractId: CONTRACT_NAME,
    methodName: 'storage_balance_of',
    args: { account_id: wallet.getAccountId() },
  })) as string

  const supply: string = (await wallet.account().viewFunction({
    contractId: CONTRACT_NAME,
    methodName: 'get_supply_by_owner_id',
    args: { account_id: wallet.getAccountId() },
  })) as string

  const required = (BigInt(supply) + 1n) * STORAGE_FOR_SALE
  const shortfall = required > BigInt(storagePaid || 0) ? required - BigInt(storagePaid || 0) : 0n

  const marketplaceActions = shortfall
    ? [transactions.functionCall('storage_deposit', {}, GAS_BN, shortfall)]
    : []

  const approveActions = [
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
      310_000_000_000_000_000_000n
    ),
  ]

  const txs: any[] = []
  if (marketplaceActions.length)
    txs.push({ receiverId: CONTRACT_NAME, actions: marketplaceActions })
  txs.push({ receiverId: NFT_CONTRACT_ID, actions: approveActions })
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
  const [open, setOpen] = useState(false)

  /* ─────────────────── UNLISTED ─────────────────── */
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
        {/* arrow column (disabled) */}
        <TableCell sx={{ width: 24 }}>
          <IconButton size="small" disabled>
            <KeyboardArrowDownIcon />
          </IconButton>
        </TableCell>

        {/* title */}
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CardMedia
              component="img"
              image={imgSrc}
              alt={meta.title || token.token_id}
              sx={{ width: 40, height: 40, borderRadius: 1 }}
            />
            {meta.title ?? token.token_id}
          </Box>
        </TableCell>

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

  /* ─────────────────── LISTED ─────────────────── */
  const isAuction = !!listing.is_auction
  const isOwner = accountId === listing.owner_id
  const latestBid = listing.bids?.[listing.bids.length - 1]
  const ended = isAuction && listing.ended_at && BigInt(listing.ended_at) <= nowNs()
  const userBid = listing.bids?.find((b) => b.bidder_id === accountId)
  const bidsSorted = listing.bids
    ? [...listing.bids].sort((a, b) => (BigInt(a.price) - BigInt(b.price) > 0 ? 1 : -1))
    : []

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

  /* unified price line */
  const priceDisplay = isAuction
    ? `${yoctoToNear(listing.price)} Ⓝ · ${latestBid ? yoctoToNear(latestBid.price) : '0'} Ⓝ`
    : `${yoctoToNear(listing.price)} Ⓝ`

  return (
    <>
      {/* main row */}
      <TableRow hover selected={isOwner}>
        {/* arrow column */}
        <TableCell sx={{ width: 24 }}>
          <IconButton
            size="small"
            disabled={!isAuction || !listing.bids?.length}
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        {/* title */}
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CardMedia
              component="img"
              image={imgSrc}
              alt={meta.title || listing.token_id}
              sx={{ width: 40, height: 40, borderRadius: 1 }}
            />
            <Box>
              {meta.title ?? listing.token_id}
              {isAuction && listing.started_at && (
                <>
                  <br />
                  <small>
                    ⏳ <Countdown endedAtNs={listing.ended_at} />
                  </small>
                </>
              )}
            </Box>
          </Box>
        </TableCell>

        {/* owner */}
        <TableCell>{listing.owner_id}</TableCell>

        {/* price */}
        <TableCell align="right">{priceDisplay}</TableCell>

        {/* action buttons */}
        <TableCell align="right">
          {isAuction ? (
            <>
              {!isOwner &&
                userBid &&
                tooltip(
                  'Withdraw your bid and get NEAR back',
                  <Button size="small" onClick={handleCancelBid}>
                    Cancel bid
                  </Button>
                )}

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
                      ? 'Settle auction (same as Accept bid)'
                      : 'Auction had no bids – remove listing',
                    <Button size="small" onClick={handleEndAuction}>
                      End auction
                    </Button>
                  )}
                </>
              )}
            </>
          ) : (
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

      {/* collapsible bids row */}
      {isAuction && listing.bids?.length && (
        <TableRow>
          <TableCell sx={{ p: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ m: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="70%">Bidder</TableCell>
                      <TableCell align="right">Bid (Ⓝ)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bidsSorted.map((bid, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {bid.bidder_id === accountId ? (
                            <strong>{bid.bidder_id}</strong>
                          ) : (
                            bid.bidder_id
                          )}
                        </TableCell>
                        <TableCell align="right">{yoctoToNear(bid.price)} Ⓝ</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

/* ─────────────────── page ─────────────────── */
const Home: NextPage = () => {
  const { accountId, wallet, contract, signIn, signOut } = useNear()
  const [tokens, setTokens] = useState<TokenWithListing[]>([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInit] = useState(false)

  const fetchAllNFTs = async () => {
    if (!wallet || !contract) return
    setLoading(true)
    try {
      const fetched: any[] = await wallet.account().viewFunction({
        contractId: NFT_CONTRACT_ID,
        methodName: 'nft_tokens',
        args: { from_index: '0', limit: 100 },
      })
      const mapped = await Promise.all(
        fetched.map(async (t) => {
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
      setInit(true)
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
                  <TableCell width={24} /> {/* arrow column */}
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
