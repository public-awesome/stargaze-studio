/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { BadgeHubInstance } from 'contracts/badgeHub'

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_TYPES = ['config', 'getBadge', 'getBadges', 'getKey', 'getKeys'] as const

export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const BY_KEY_QUERY_LIST: QueryListItem[] = [
  { id: 'config', name: 'Config', description: 'View current config' },
  { id: 'getBadge', name: 'Query Badge', description: 'Query a badge by ID' },
  { id: 'getBadges', name: 'Query Badges', description: 'Query a list of badges' },
]
export const BY_KEYS_QUERY_LIST: QueryListItem[] = [
  { id: 'config', name: 'Config', description: 'View current config' },
  { id: 'getBadge', name: 'Query Badge', description: 'Query a badge by ID' },
  { id: 'getBadges', name: 'Query Badges', description: 'Query a list of badges' },
  { id: 'getKey', name: 'Query Key', description: "Query a key by ID to see if it's whitelisted" },
  { id: 'getKeys', name: 'Query Keys', description: 'Query the list of whitelisted keys' },
]
export const BY_MINTER_QUERY_LIST: QueryListItem[] = [
  { id: 'config', name: 'Config', description: 'View current config' },
  { id: 'getBadge', name: 'Query Badge', description: 'Query a badge by ID' },
  { id: 'getBadges', name: 'Query Badges', description: 'Query a list of badges' },
]

export interface DispatchExecuteProps {
  type: QueryType
  [k: string]: unknown
}

type Select<T extends QueryType> = T

export type DispatchQueryArgs = {
  badgeHubMessages?: BadgeHubInstance
} & (
  | { type: undefined }
  | { type: Select<'config'> }
  | { type: Select<'getBadge'>; id: number }
  | { type: Select<'getBadges'>; startAfterNumber: number; limit: number }
  | { type: Select<'getKey'>; id: number; pubkey: string }
  | { type: Select<'getKeys'>; id: number; startAfterString: string; limit: number }
)

export const dispatchQuery = async (args: DispatchQueryArgs) => {
  const { badgeHubMessages } = args
  if (!badgeHubMessages) {
    throw new Error('Cannot perform a query. Please connect your wallet first.')
  }
  switch (args.type) {
    case 'config': {
      return badgeHubMessages?.getConfig()
    }
    case 'getBadge': {
      return badgeHubMessages?.getBadge(args.id)
    }
    case 'getBadges': {
      return badgeHubMessages?.getBadges(args.startAfterNumber, args.limit)
    }
    case 'getKey': {
      return badgeHubMessages?.getKey(args.id, args.pubkey)
    }
    case 'getKeys': {
      return badgeHubMessages?.getKeys(args.id, args.startAfterString, args.limit)
    }
    default: {
      throw new Error('Unknown action')
    }
  }
}
