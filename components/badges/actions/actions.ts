import type { Badge, BadgeHubInstance, Metadata } from 'contracts/badgeHub'
import { useBadgeHubContract } from 'contracts/badgeHub'

export type ActionType = typeof ACTION_TYPES[number]

export const ACTION_TYPES = [
  'create_badge',
  'edit_badge',
  'add_keys',
  'purge_keys',
  'purge_owners',
  'mint_by_minter',
  'mint_by_key',
  'airdrop_by_key',
  'mint_by_keys',
  'set_nft',
] as const

export interface ActionListItem {
  id: ActionType
  name: string
  description?: string
}

export const BY_KEY_ACTION_LIST: ActionListItem[] = [
  {
    id: 'edit_badge',
    name: 'Edit Badge',
    description: `Edit badge metadata for the badge with the specified ID`,
  },
  {
    id: 'mint_by_key',
    name: 'Mint by Key',
    description: `Mint a badge to a specified address`,
  },
  {
    id: 'airdrop_by_key',
    name: 'Airdrop by Key',
    description: `Airdrop badges to a list of specified addresses`,
  },
  {
    id: 'purge_owners',
    name: 'Purge Owners',
    description: `Purge owners from the badge with the specified ID`,
  },
]

export const BY_KEYS_ACTION_LIST: ActionListItem[] = [
  {
    id: 'edit_badge',
    name: 'Edit Badge',
    description: `Edit badge metadata for the badge with the specified ID`,
  },
  {
    id: 'mint_by_keys',
    name: 'Mint by Keys',
    description: `Mint a new badge with a whitelisted private key`,
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
]

export const BY_MINTER_ACTION_LIST: ActionListItem[] = [
  {
    id: 'edit_badge',
    name: 'Edit Badge',
    description: `Edit badge metadata for the badge with the specified ID`,
  },
  {
    id: 'mint_by_minter',
    name: 'Mint by Minter',
    description: `Mint a new badge to specified owner addresses`,
  },
  {
    id: 'purge_owners',
    name: 'Purge Owners',
    description: `Purge owners from the badge with the specified ID`,
  },
]

export interface DispatchExecuteProps {
  type: ActionType
  [k: string]: unknown
}

type Select<T extends ActionType> = T

/** @see {@link BadgeHubInstance}*/
export type DispatchExecuteArgs = {
  badgeHubContract: string
  badgeHubMessages?: BadgeHubInstance
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
  | { type: Select<'airdrop_by_key'>; id: number; recipients: string[]; privateKey: string }
  | { type: Select<'mint_by_keys'>; id: number; owner: string; pubkey: string; signature: string }
  | { type: Select<'set_nft'>; nft: string }
)

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { badgeHubMessages, txSigner } = args
  if (!badgeHubMessages) {
    throw new Error('Cannot execute actions')
  }
  switch (args.type) {
    case 'create_badge': {
      return badgeHubMessages.createBadge(txSigner, args.badge)
    }
    case 'edit_badge': {
      return badgeHubMessages.editBadge(txSigner, args.id, args.metadata, args.editFee)
    }
    case 'add_keys': {
      return badgeHubMessages.addKeys(txSigner, args.id, args.keys)
    }
    case 'purge_keys': {
      return badgeHubMessages.purgeKeys(txSigner, args.id, args.limit)
    }
    case 'purge_owners': {
      return badgeHubMessages.purgeOwners(txSigner, args.id, args.limit)
    }
    case 'mint_by_minter': {
      return badgeHubMessages.mintByMinter(txSigner, args.id, args.owners)
    }
    case 'mint_by_key': {
      return badgeHubMessages.mintByKey(txSigner, args.id, args.owner, args.signature)
    }
    case 'airdrop_by_key': {
      return badgeHubMessages.airdropByKey(txSigner, args.id, args.recipients, args.privateKey)
    }
    case 'mint_by_keys': {
      return badgeHubMessages.mintByKeys(txSigner, args.id, args.owner, args.pubkey, args.signature)
    }
    case 'set_nft': {
      return badgeHubMessages.setNft(txSigner, args.nft)
    }
    default: {
      throw new Error('Unknown action')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages: badgeHubMessages } = useBadgeHubContract()

  const { badgeHubContract } = args
  switch (args.type) {
    case 'create_badge': {
      return badgeHubMessages(badgeHubContract)?.createBadge(args.badge)
    }
    case 'edit_badge': {
      return badgeHubMessages(badgeHubContract)?.editBadge(args.id, args.metadata)
    }
    case 'add_keys': {
      return badgeHubMessages(badgeHubContract)?.addKeys(args.id, args.keys)
    }
    case 'purge_keys': {
      return badgeHubMessages(badgeHubContract)?.purgeKeys(args.id, args.limit)
    }
    case 'purge_owners': {
      return badgeHubMessages(badgeHubContract)?.purgeOwners(args.id, args.limit)
    }
    case 'mint_by_minter': {
      return badgeHubMessages(badgeHubContract)?.mintByMinter(args.id, args.owners)
    }
    case 'mint_by_key': {
      return badgeHubMessages(badgeHubContract)?.mintByKey(args.id, args.owner, args.signature)
    }
    case 'airdrop_by_key': {
      return badgeHubMessages(badgeHubContract)?.airdropByKey(args.id, args.recipients, args.privateKey)
    }
    case 'mint_by_keys': {
      return badgeHubMessages(badgeHubContract)?.mintByKeys(args.id, args.owner, args.pubkey, args.signature)
    }
    case 'set_nft': {
      return badgeHubMessages(badgeHubContract)?.setNft(args.nft)
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ActionType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
