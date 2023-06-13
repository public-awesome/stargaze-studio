import type { OpenEditionMinterInstance } from '../contract'

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_TYPES = ['config', 'start_time', 'mint_price', 'mint_count', 'status'] as const

export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const QUERY_LIST: QueryListItem[] = [
  { id: 'config', name: 'Config', description: 'View current config' },
  { id: 'start_time', name: 'Start Time', description: 'View the start time for minting' },
  { id: 'mint_price', name: 'Mint Price', description: 'View the mint price' },
  {
    id: 'mint_count',
    name: 'Total Minted Count',
    description: 'View the total amount of minted tokens for an address',
  },
  { id: 'status', name: 'Status', description: 'View contract status' },
]

export interface DispatchQueryProps {
  address: string
  messages: OpenEditionMinterInstance | undefined
  type: QueryType
}

export const dispatchQuery = (props: DispatchQueryProps) => {
  const { address, messages, type } = props
  switch (type) {
    case 'config': {
      return messages?.getConfig()
    }
    case 'status': {
      return messages?.getStatus()
    }
    case 'start_time': {
      return messages?.getStartTime()
    }
    case 'mint_price': {
      return messages?.getMintPrice()
    }
    case 'mint_count': {
      return messages?.getMintCount(address)
    }
    default: {
      throw new Error('unknown query type')
    }
  }
}
