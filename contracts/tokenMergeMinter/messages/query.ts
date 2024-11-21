import type { TokenMergeMinterInstance } from '../contract'

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_TYPES = ['config', 'mintable_num_tokens', 'start_time', 'mint_price', 'mint_count'] as const

export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const QUERY_LIST: QueryListItem[] = [
  { id: 'config', name: 'Config', description: 'View current config' },
  { id: 'mintable_num_tokens', name: 'Total Mintable Tokens', description: 'View the total amount of mintable tokens' },
  { id: 'start_time', name: 'Start Time', description: 'View the start time for minting' },
  { id: 'mint_price', name: 'Mint Price', description: 'View the mint price' },
  {
    id: 'mint_count',
    name: 'Total Minted Count',
    description: 'View the total amount of minted tokens for an address',
  },
]

export interface DispatchQueryProps {
  address: string
  messages: TokenMergeMinterInstance | undefined
  type: QueryType
}

export const dispatchQuery = (props: DispatchQueryProps) => {
  const { address, messages, type } = props
  switch (type) {
    case 'config': {
      return messages?.getConfig()
    }
    case 'mintable_num_tokens': {
      return messages?.getMintableNumTokens()
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
