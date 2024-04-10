import type { WhiteListMerkleTreeInstance } from '../contract'

export type WhitelistMerkleTreeQueryType = typeof WHITELIST_MERKLE_TREE_QUERY_TYPES[number]

export const WHITELIST_MERKLE_TREE_QUERY_TYPES = [
  'has_started',
  'has_ended',
  'is_active',
  'admin_list',
  'has_member',
  'config',
  'merkle_root',
  'merkle_tree_uri',
] as const

export interface QueryListItem {
  id: WhitelistMerkleTreeQueryType
  name: string
  description?: string
}

export const WHITELIST_MERKLE_TREE_QUERY_LIST: QueryListItem[] = [
  { id: 'has_started', name: 'Has Started', description: 'Check if the whitelist minting has started' },
  { id: 'has_ended', name: 'Has Ended', description: 'Check if the whitelist minting has ended' },
  { id: 'is_active', name: 'Is Active', description: 'Check if the whitelist minting is active' },
  { id: 'admin_list', name: 'Admin List', description: 'View the whitelist admin list' },
  { id: 'has_member', name: 'Has Member', description: 'Check if a member is in the whitelist' },
  { id: 'config', name: 'Config', description: 'View the whitelist configuration' },
  { id: 'merkle_root', name: 'Merkle Root', description: 'View the whitelist merkle root' },
  { id: 'merkle_tree_uri', name: 'Merkle Tree URI', description: 'View the whitelist merkle tree URI' },
]

export interface DispatchQueryProps {
  messages: WhiteListMerkleTreeInstance | undefined
  type: WhitelistMerkleTreeQueryType
  address: string
  startAfter?: string
  limit?: number
  proofHashes?: string[]
}

export const dispatchQuery = (props: DispatchQueryProps) => {
  const { messages, type, address, proofHashes } = props
  switch (type) {
    case 'has_started':
      return messages?.hasStarted()
    case 'has_ended':
      return messages?.hasEnded()
    case 'is_active':
      return messages?.isActive()
    case 'admin_list':
      return messages?.adminList()
    case 'has_member':
      return messages?.hasMember(address, proofHashes || [])
    case 'config':
      return messages?.config()
    case 'merkle_root':
      return messages?.merkleRoot()
    case 'merkle_tree_uri':
      return messages?.merkleTreeUri()

    default: {
      throw new Error('unknown query type')
    }
  }
}
