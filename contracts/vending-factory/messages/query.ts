import type { VendingFactoryInstance } from '../contract'

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_TYPES = ['get_params', 'get_minter_status'] as const

export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const QUERY_LIST: QueryListItem[] = [
  { id: 'get_params', name: 'Parameters', description: 'View current vending factory parameters.' },
  { id: 'get_minter_status', name: 'Minter Status', description: 'View the status for a specified minter.' },
]

export interface DispatchQueryProps {
  minter: string
  messages: VendingFactoryInstance | undefined
  type: QueryType
}

export const dispatchQuery = (props: DispatchQueryProps) => {
  const { minter, messages, type } = props
  switch (type) {
    case 'get_params': {
      return messages?.getParams()
    }
    case 'get_minter_status': {
      return messages?.getMinterStatus(minter)
    }
    default: {
      throw new Error('unknown query type')
    }
  }
}
