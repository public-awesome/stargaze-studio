import type { WhiteListInstance } from '../contract'

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_TYPES = [
  'has_started',
  'has_ended',
  'is_active',
  'members',
  'admin_list',
  'has_member',
  'config',
] as const

export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const QUERY_LIST: QueryListItem[] = [
  { id: 'has_started', name: 'Has Started', description: 'Check if the whitelist minting has started' },
  { id: 'has_ended', name: 'Has Ended', description: 'Check if the whitelist minting has ended' },
  { id: 'is_active', name: 'Is Active', description: 'Check if the whitelist minting is active' },
  { id: 'members', name: 'Members', description: 'View the whitelist members' },
  { id: 'admin_list', name: 'Admin List', description: 'View the whitelist admin list' },
  { id: 'has_member', name: 'Has Member', description: 'Check if a member is in the whitelist' },
  { id: 'config', name: 'Config', description: 'View the whitelist configuration' },
]

export interface DispatchQueryProps {
  messages: WhiteListInstance | undefined
  type: QueryType
  address: string
  startAfter?: string
  limit?: number
}

export const dispatchQuery = (props: DispatchQueryProps) => {
  const { messages, type, address, startAfter, limit } = props
  switch (type) {
    case 'has_started':
      return messages?.hasStarted()
    case 'has_ended':
      return messages?.hasEnded()
    case 'is_active':
      return messages?.isActive()
    case 'members':
      return messages?.members(startAfter, limit)
    case 'admin_list':
      return messages?.adminList()
    case 'has_member':
      return messages?.hasMember(address)
    case 'config':
      return messages?.config()
    default: {
      throw new Error('unknown query type')
    }
  }
}
