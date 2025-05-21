'use client'
import { useCallback, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  CssBaseline,
  Grid,
  Toolbar,
  Typography,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import GavelIcon from '@mui/icons-material/Gavel'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { connect, Contract, keyStores, WalletConnection, utils } from 'near-api-js'

/* =========================================================================
 * Config
 * ========================================================================= */

const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID || 'mainnet'
const NODE_URL = process.env.NEXT_PUBLIC_NODE_URL || 'https://rpc.mainnet.near.org'
const WALLET_URL = process.env.NEXT_PUBLIC_WALLET_URL || 'https://app.mynearwallet.com'
const HELPER_URL = process.env.NEXT_PUBLIC_HELPER_URL || 'https://helper.mainnet.near.org'
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'market.aigency.near'

/** Collection to explore */
const NFT_CONTRACT_ID = 'my-new-nft-contract.near'

/** Deposit needed for storage on the marketplace (from contract constant) */

const GAS_BN = BigInt('150000000000000') // 150 Tgas
const STORAGE_FOR_SALE = BigInt('8590000000000000000000') // 0.00859 Ⓝ
const PAD = BigInt('100000000000000000000') // 0.0001 Ⓝ safety

const yoctoToNear = (y: string | number | bigint) => utils.format.formatNearAmount(y.toString(), 2)
const nearToYocto = (n: string) => utils.format.parseNearAmount(n) || '0'

/* =========================================================================
 * Types
 * ========================================================================= */

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
}

/* =========================================================================
 * NEAR hook
 * ========================================================================= */

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
      setWallet(walletConn)
      if (walletConn.getAccountId()) setAccount(walletConn.getAccountId())

      const ctr = new Contract(walletConn.account(), CONTRACT_NAME, {
        viewMethods: ['get_market_data'],
        changeMethods: ['buy', 'add_bid'],
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

/* =========================================================================
 * UI helpers
 * ========================================================================= */

const ConnectWalletButton = ({
  accountId,
  onSignIn,
  onSignOut,
}: {
  accountId: string | null
  onSignIn: () => void
  onSignOut: () => void
}) => (
  <Button
    color="inherit"
    startIcon={<AccountBalanceWalletIcon />}
    onClick={accountId ? onSignOut : onSignIn}
  >
    {accountId ? `Sign out (${accountId})` : 'Connect Wallet'}
  </Button>
)

interface TokenWithListing {
  token: any // includes metadata
  listing: MarketDataJson | null
}

const ListingCard = ({
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
  const imgSrc = meta.media ?? meta.reference ?? 'https://placehold.co/400x400?text=No+Image'

  /* ---------------------------------- NOT LISTED ---------------------------------- */
  if (!listing) {
    const isOwner = accountId === token.owner_id

    const handleList = async () => {
      if (!wallet) return
      const priceNear = prompt('Sale price (NEAR):')
      if (!priceNear) return

      const priceYocto = nearToYocto(priceNear)

      /** Fixed-price sale payload (no auction fields) */
      const msg = {
        market_type: 'sale',
        price: priceYocto,
        ft_token_id: 'near',
      }

      try {
        await wallet.account().functionCall({
          contractId: NFT_CONTRACT_ID,
          methodName: 'nft_approve',
          args: {
            token_id: token.token_id,
            account_id: CONTRACT_NAME,
            msg: JSON.stringify(msg),
          },
          gas: GAS_BN,
          attachedDeposit: STORAGE_FOR_SALE + PAD,
        })
        alert('Listing submitted — awaiting wallet finalization.')
        refresh()
      } catch (e) {
        console.error(e)
        alert('Listing failed or was rejected.')
      }
    }

    return (
      <Card
        variant="outlined"
        sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <CardMedia component="img" height="180" image={imgSrc} alt={meta.title || token.token_id} />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {meta.title ?? token.token_id}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Owner: {token.owner_id}
          </Typography>
          {meta.description && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {meta.description}
            </Typography>
          )}
        </CardContent>
        {isOwner && (
          <CardActions>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddShoppingCartIcon />}
              onClick={handleList}
            >
              List&nbsp;for&nbsp;sale
            </Button>
          </CardActions>
        )}
      </Card>
    )
  }

  /* ---------------------------------- LISTED ---------------------------------- */
  const isOwner = accountId === listing.owner_id
  const isAuction = !!listing.is_auction
  const latestBid = listing.bids && listing.bids[listing.bids.length - 1]

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
    const near = prompt('Your bid in NEAR')
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

  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardMedia component="img" height="180" image={imgSrc} alt={meta.title || listing.token_id} />

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {meta.title ?? listing.token_id}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Seller: {listing.owner_id}
        </Typography>
        {meta.description && (
          <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
            {meta.description}
          </Typography>
        )}

        {isAuction ? (
          <>
            <Typography variant="body2">
              Starting&nbsp;price: {yoctoToNear(listing.price)} NEAR
            </Typography>
            <Typography variant="body2">
              Highest bid:{' '}
              {latestBid ? `${yoctoToNear(latestBid.price)} NEAR by ${latestBid.bidder_id}` : '—'}
            </Typography>
            {listing.ended_at && (
              <Typography variant="body2">
                Ends: {new Date(Number(listing.ended_at) / 1e6).toLocaleString()}
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="h6" sx={{ mt: 0.5 }}>
            {yoctoToNear(listing.price)} NEAR
          </Typography>
        )}
      </CardContent>

      <CardActions>
        {isAuction ? (
          <Button size="small" startIcon={<GavelIcon />} disabled={!accountId} onClick={handleBid}>
            Bid
          </Button>
        ) : (
          <Button
            size="small"
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            disabled={!accountId || isOwner}
            onClick={handleBuy}
          >
            Buy
          </Button>
        )}
      </CardActions>
    </Card>
  )
}

/* =========================================================================
 * Page
 * ========================================================================= */

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
      alert('Failed to fetch NFTs – check the contract address.')
    } finally {
      setLoading(false)
    }
  }

  /* Auto-fetch once ready */
  useEffect(() => {
    if (wallet && contract && !initialized) {
      fetchAllNFTs()
      setInitialized(true)
    }
  }, [wallet, contract, initialized])

  /* ------------------------------------------------------------------- */

  return (
    <>
      <Head>
        <title>NEAR Marketplace — NFT Explorer</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
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
          ) : null}

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {tokens.map(({ token, listing }) => (
              <Grid key={token.token_id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ListingCard
                  token={token}
                  listing={listing}
                  accountId={accountId}
                  wallet={wallet}
                  contract={contract}
                  refresh={fetchAllNFTs}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  )
}

export default Home
