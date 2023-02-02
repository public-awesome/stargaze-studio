import type { BadgeHubInstance } from '../contract'

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_TYPES = ['config', 'getBadge', 'getBadges', 'getKey', 'getKeys'] as const

export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const QUERY_LIST: QueryListItem[] = [
  { id: 'config', name: 'Config', description: 'View current config' },
  { id: 'getBadge', name: 'Query Badge', description: 'Query a badge by ID' },
  { id: 'getBadges', name: 'Query a list of Badges', description: 'Query the list of badges' },
  { id: 'getKey', name: 'Query Key', description: 'Query a key by ID' },
  { id: 'getKeys', name: 'Query a list of Keys', description: 'Query the list of keys' },
]

export interface DispatchQueryProps {
  id: number
  pubkey: string
  messages: BadgeHubInstance | undefined
  type: QueryType
}

export const dispatchQuery = (props: DispatchQueryProps) => {
  const { id, pubkey, messages, type } = props
  switch (type) {
    case 'config': {
      return messages?.getConfig()
    }
    case 'getBadge': {
      return messages?.getBadge(id)
    }
    case 'getBadges': {
      return messages?.getBadges()
    }
    case 'getKey': {
      return messages?.getKey(id, pubkey)
    }
    case 'getKeys': {
      return messages?.getKeys(id)
    }
    default: {
      throw new Error('unknown query type')
    }
  }
}
