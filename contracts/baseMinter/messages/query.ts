import type { BaseMinterInstance } from '../contract'

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_TYPES = ['config', 'status'] as const

export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const QUERY_LIST: QueryListItem[] = [
  { id: 'config', name: 'Config', description: 'Query current contract config' },
  { id: 'status', name: 'Status', description: 'Query current contract status' },
]

export interface DispatchQueryProps {
  address: string
  messages: BaseMinterInstance | undefined
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
    default: {
      throw new Error('unknown query type')
    }
  }
}
