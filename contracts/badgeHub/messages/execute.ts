import type { Badge, BadgeHubInstance, Metadata } from '../index'
import { useBadgeHubContract } from '../index'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = [
  'create_badge',
  'edit_badge',
  'add_keys',
  'purge_keys',
  'purge_owners',
  'mint_by_minter',
  'mint_by_key',
  'mint_by_keys',
  'set_nft',
] as const

export interface ExecuteListItem {
  id: ExecuteType
  name: string
  description?: string
}

export const EXECUTE_LIST: ExecuteListItem[] = [
  {
    id: 'create_badge',
    name: 'Create Badge',
    description: `Create a new badge with the specified mint rule and metadata`,
  },
  {
    id: 'edit_badge',
    name: 'Edit Badge',
    description: ` Edit badge metadata for the badge with the specified ID`,
  },
  {
    id: 'add_keys',
    name: 'Add Keys',
    description: `Add keys to the badge with the specified ID`,
  },
  {
    id: 'purge_keys',
    name: 'Purge Keys',
    description: `Purge keys from the badge with the specified ID`,
  },
  {
    id: 'purge_owners',
    name: 'Purge Owners',
    description: `Purge owners from the badge with the specified ID`,
  },
  {
    id: 'mint_by_minter',
    name: 'Mint by Minter',
    description: `Mint a new token by the minter with the specified ID`,
  },
  {
    id: 'mint_by_key',
    name: 'Mint by Key',
    description: `Mint a new token by the key with the specified ID`,
  },
  {
    id: 'mint_by_keys',
    name: 'Mint by Keys',
    description: `Mint a new token by the keys with the specified ID`,
  },
  {
    id: 'set_nft',
    name: 'Set NFT',
    description: `Set the Badge NFT contract address for the Badge Hub contract`,
  },
]

export interface DispatchExecuteProps {
  type: ExecuteType
  [k: string]: unknown
}

type Select<T extends ExecuteType> = T

/** @see {@link BadgeHubInstance} */
export type DispatchExecuteArgs = {
  contract: string
  messages?: BadgeHubInstance
  txSigner: string
} & (
  | { type: undefined }
  | { type: Select<'create_badge'>; badge: Badge }
  | { type: Select<'edit_badge'>; id: number; metadata: Metadata; editFee?: number }
  | { type: Select<'add_keys'>; id: number; keys: string[] }
  | { type: Select<'purge_keys'>; id: number; limit?: number }
  | { type: Select<'purge_owners'>; id: number; limit?: number }
  | { type: Select<'mint_by_minter'>; id: number; owners: string[] }
  | { type: Select<'mint_by_key'>; id: number; owner: string; signature: string }
  | { type: Select<'mint_by_keys'>; id: number; owner: string; pubkey: string; signature: string }
  | { type: Select<'set_nft'>; nft: string }
)

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages, txSigner } = args
  if (!messages) {
    throw new Error('cannot dispatch execute, messages is not defined')
  }
  switch (args.type) {
    case 'create_badge': {
      return messages.createBadge(txSigner, args.badge)
    }
    case 'edit_badge': {
      return messages.editBadge(txSigner, args.id, args.metadata, args.editFee)
    }
    case 'add_keys': {
      return messages.addKeys(txSigner, args.id, args.keys)
    }
    case 'purge_keys': {
      return messages.purgeKeys(txSigner, args.id, args.limit)
    }
    case 'purge_owners': {
      return messages.purgeOwners(txSigner, args.id, args.limit)
    }
    case 'mint_by_minter': {
      return messages.mintByMinter(txSigner, args.id, args.owners)
    }
    case 'mint_by_key': {
      return messages.mintByKey(txSigner, args.id, args.owner, args.signature)
    }
    case 'mint_by_keys': {
      return messages.mintByKeys(txSigner, args.id, args.owner, args.pubkey, args.signature)
    }
    case 'set_nft': {
      return messages.setNft(txSigner, args.nft)
    }
    default: {
      throw new Error('unknown execute type')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useBadgeHubContract()
  const { contract } = args
  switch (args.type) {
    case 'create_badge': {
      return messages(contract)?.createBadge(args.badge)
    }
    case 'edit_badge': {
      return messages(contract)?.editBadge(args.id, args.metadata)
    }
    case 'add_keys': {
      return messages(contract)?.addKeys(args.id, args.keys)
    }
    case 'purge_keys': {
      return messages(contract)?.purgeKeys(args.id, args.limit)
    }
    case 'purge_owners': {
      return messages(contract)?.purgeOwners(args.id, args.limit)
    }
    case 'mint_by_minter': {
      return messages(contract)?.mintByMinter(args.id, args.owners)
    }
    case 'mint_by_key': {
      return messages(contract)?.mintByKey(args.id, args.owner, args.signature)
    }
    case 'mint_by_keys': {
      return messages(contract)?.mintByKeys(args.id, args.owner, args.pubkey, args.signature)
    }
    case 'set_nft': {
      return messages(contract)?.setNft(args.nft)
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
