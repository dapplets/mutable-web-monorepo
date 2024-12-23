import React, { useEffect, useState } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { GraphPage } from './pages/graph'
import { Wallet, NearContext } from './near'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { OrdersPage } from './pages/orders'
import { CreateOrderPage } from './pages/orders-create'

const { Header, Content, Footer } = Layout

const wallet = new Wallet({ networkId: 'mainnet', createAccessKeyFor: 'app.crwl.near' })

const queryClient = new QueryClient()

function App() {
  const [signedAccountId, setSignedAccountId] = useState('')

  useEffect(() => {
    wallet.startUp(setSignedAccountId)
  }, [])

  return (
    <NearContext.Provider value={{ wallet, signedAccountId }}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center' }}>
              <Link to="/" style={{ color: 'white', fontSize: '20px' }}>
                Mutable Web Crawler
              </Link>
              <Menu
                theme="dark"
                mode="horizontal"
                style={{ lineHeight: '64px' }}
                items={[
                  {
                    key: '1',
                    label: <Link to="/orders">Orders</Link>,
                  },
                  {
                    key: '2',
                    label: <Link to="/orders/create">Create Order</Link>,
                  },
                  {
                    key: '3',
                    label: <Link to="/graph">Graph</Link>,
                  },
                ]}
              />
            </Header>
            <Content style={{ padding: '0 48px' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/orders" />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/create" element={<CreateOrderPage />} />
                <Route path="/graph" element={<GraphPage />} />
              </Routes>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
              Mutable Web Crawler {new Date().getFullYear()} Created by Dapplets Team
            </Footer>
          </Layout>
        </Router>
      </QueryClientProvider>
    </NearContext.Provider>
  )
}

export default App
