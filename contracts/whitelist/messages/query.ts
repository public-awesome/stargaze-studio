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
  'stages',
  'stage',
  'active_stage',
  'stage_member_info',
  'all_stage_member_info',
] as const

export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const QUERY_LIST: QueryListItem[] = [
  { id: 'config', name: 'Config', description: 'View the whitelist configuration' },
  { id: 'stage', name: 'Stage', description: 'View details for a specific stage' },
  { id: 'stages', name: 'Stages', description: 'View all stages' },
  { id: 'stage_member_info', name: 'Stage Member Info', description: 'View the member info for a stage' },
  { id: 'all_stage_member_info', name: 'All Stage Member Info', description: 'View the member info for all stages' },
  { id: 'members', name: 'Members', description: 'View the whitelist members' },
  { id: 'active_stage', name: 'Active Stage', description: 'View the active stage' },
  { id: 'has_started', name: 'Has Started', description: 'Check if the whitelist minting has started' },
  { id: 'has_ended', name: 'Has Ended', description: 'Check if the whitelist minting has ended' },
  { id: 'has_member', name: 'Has Member', description: 'Check if a member is in the whitelist' },
  { id: 'is_active', name: 'Is Active', description: 'Check if the whitelist minting is active' },
  { id: 'admin_list', name: 'Admin List', description: 'View the whitelist admin list' },
]

export interface DispatchQueryProps {
  messages: WhiteListInstance | undefined
  type: QueryType
  address: string
  startAfter?: string
  limit?: number
  stageId?: number
}

export const dispatchQuery = (props: DispatchQueryProps) => {
  const { messages, type, address, startAfter, limit, stageId } = props
  switch (type) {
    case 'has_started':
      return messages?.hasStarted()
    case 'has_ended':
      return messages?.hasEnded()
    case 'is_active':
      return messages?.isActive()
    case 'members':
      return messages?.members(stageId as number, startAfter, limit)
    case 'admin_list':
      return messages?.adminList()
    case 'has_member':
      return messages?.hasMember(address)
    case 'config':
      return messages?.config()
    case 'stages':
      return messages?.stages()
    case 'stage':
      return messages?.stage(stageId as number)
    case 'active_stage':
      return messages?.activeStage()
    case 'stage_member_info':
      return messages?.stageMemberInfo(stageId as number, address)
    case 'all_stage_member_info':
      return messages?.allStageMemberInfo(address)
    default: {
      throw new Error('unknown query type')
    }
  }
}
