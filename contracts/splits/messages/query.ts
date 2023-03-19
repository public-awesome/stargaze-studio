import type { SplitsInstance } from '../contract'

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_TYPES = ['admin', 'group', 'member', 'list_members'] as const

export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const QUERY_LIST: QueryListItem[] = [
  { id: 'list_members', name: 'Query Members', description: 'View the group members' },
  { id: 'member', name: 'Query Member Weight', description: 'Query the weight of a member in the group' },
  { id: 'admin', name: 'Query Admin', description: 'View the splits contract admin' },
  { id: 'group', name: 'Query Group Contract Address', description: 'View the group contract address' },
]

export interface DispatchQueryProps {
  messages: SplitsInstance | undefined
  type: QueryType
  address: string
  startAfter?: string
  limit?: number
}

export const dispatchQuery = (props: DispatchQueryProps) => {
  const { messages, type, address, startAfter, limit } = props
  switch (type) {
    case 'list_members':
      return messages?.listMembers(startAfter, limit)
    case 'admin':
      return messages?.getAdmin()
    case 'member':
      return messages?.getMemberWeight(address)
    case 'group':
      return messages?.getGroup()
    default: {
      throw new Error('unknown query type')
    }
  }
}
