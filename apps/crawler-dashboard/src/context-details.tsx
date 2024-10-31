import { useQuery } from '@tanstack/react-query'
import { Button, Descriptions } from 'antd'
import { FC, useContext, useState } from 'react'
import { getContext } from './api'
import { NearContext } from './near'

export const ContextDetails: FC<{ selectedNode: any }> = ({ selectedNode }) => {
  const { signedAccountId, wallet } = useContext(NearContext)
  const [isBuyingDataItem, setIsBuyingDataItem] = useState(false)

  const { data } = useQuery({
    queryFn: () => getContext(selectedNode.id),
    queryKey: ['getContext', selectedNode.id],
  })

  if (!data) {
    return null
  }

  const handleBuyClick = async () => {
    try {
      setIsBuyingDataItem(true)
      await wallet.callMethod({
        contractId: 'app.crwl.near',
        method: 'pay_for_data',
        args: { data_hash: selectedNode.id },
        deposit: '1000000000000000000000',
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsBuyingDataItem(false)
    }
  }

  return (
    <>
      {data.status === 'unpaid' ? (
        <>
          <Descriptions size="small" layout="vertical" column={1}>
            <Descriptions.Item style={{ padding: 0 }} label="Hash ID">
              {selectedNode.id}
            </Descriptions.Item>
          </Descriptions>
          {signedAccountId ? (
            <Button type="primary" onClick={handleBuyClick} loading={isBuyingDataItem}>
              Buy Item
            </Button>
          ) : null}
        </>
      ) : data.context ? (
        <Descriptions size="small" layout="vertical" column={1}>
          <Descriptions.Item style={{ padding: 0 }} label="Hash ID">
            {selectedNode.id}
          </Descriptions.Item>
          <Descriptions.Item style={{ padding: 0 }} label="Namespace">
            {data.context.namespace}
          </Descriptions.Item>
          <Descriptions.Item style={{ padding: 0 }} label="Context Type">
            {data.context.contextType}
          </Descriptions.Item>
          <Descriptions.Item style={{ padding: 0 }} label="ID">
            {data.context.id}
          </Descriptions.Item>
          {Object.entries(data.context.parsedContext).map(([key, value]: [string, any]) => (
            <Descriptions.Item style={{ padding: 0 }} key={key} label={key}>
              {value}
            </Descriptions.Item>
          ))}
        </Descriptions>
      ) : null}
    </>
  )
}
