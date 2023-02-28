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
  { id: 'getBadges', name: 'Query Badges', description: 'Query a list of badges' },
  { id: 'getKey', name: 'Query Key', description: 'Query a key by ID to see if it&apos;s whitelisted' },
  { id: 'getKeys', name: 'Query Keys', description: 'Query the list of whitelisted keys' },
]

export interface DispatchQueryProps {
  id: number
  pubkey: string
  messages: BadgeHubInstance | undefined
  type: QueryType
  startAfterNumber: number
  startAfterString: string
  limit: number
}

export const dispatchQuery = (props: DispatchQueryProps) => {
  const { id, pubkey, messages, type, startAfterNumber, startAfterString, limit } = props
  switch (type) {
    case 'config': {
      return messages?.getConfig()
    }
    case 'getBadge': {
      return messages?.getBadge(id)
    }
    case 'getBadges': {
      return messages?.getBadges(startAfterNumber, limit)
    }
    case 'getKey': {
      return messages?.getKey(id, pubkey)
    }
    case 'getKeys': {
      return messages?.getKeys(id, startAfterString, limit)
    }
    default: {
      throw new Error('unknown query type')
    }
  }
}
