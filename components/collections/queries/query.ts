import type { BaseMinterInstance } from 'contracts/baseMinter'
import type { OpenEditionMinterInstance } from 'contracts/openEditionMinter/contract'
import type { RoyaltyRegistryInstance } from 'contracts/royaltyRegistry'
import type { SG721Instance } from 'contracts/sg721'
import type { VendingMinterInstance } from 'contracts/vendingMinter'
import { INFINITY_SWAP_PROTOCOL_ADDRESS } from 'utils/constants'

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_TYPES = [
  'collection_info',
  'mint_price',
  'num_tokens',
  'tokens_minted_to_user',
  'total_mint_count',
  'tokens',
  // 'token_owners',
  'infinity_swap_royalties',
  'token_info',
  'config',
  'status',
] as const

export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const VENDING_QUERY_LIST: QueryListItem[] = [
  {
    id: 'collection_info',
    name: 'Collection Info',
    description: `Get information about the collection.`,
  },
  {
    id: 'mint_price',
    name: 'Mint Price',
    description: `Get the price of minting a token.`,
  },
  {
    id: 'infinity_swap_royalties',
    name: 'Infinity Swap Royalty Details',
    description: `Get the collection's royalty details for Infinity Swap`,
  },
  {
    id: 'num_tokens',
    name: 'Mintable Number of Tokens',
    description: `Get the mintable number of tokens in the collection.`,
  },
  {
    id: 'tokens_minted_to_user',
    name: 'Tokens Minted to User',
    description: `Get the number of tokens minted in the collection to a user.`,
  },
  // {
  //   id: 'token_owners',
  //   name: 'Token Owners',
  //   description: `Get the list of users who own tokens in the collection.`,
  // },
  {
    id: 'token_info',
    name: 'Token Info',
    description: `Get information about a token in the collection.`,
  },
  {
    id: 'config',
    name: 'Minter Config',
    description: `Query Minter Config`,
  },
  {
    id: 'status',
    name: 'Minter Status',
    description: `Query Minter Status`,
  },
]
export const BASE_QUERY_LIST: QueryListItem[] = [
  {
    id: 'collection_info',
    name: 'Collection Info',
    description: `Get information about the collection.`,
  },
  {
    id: 'tokens',
    name: 'Tokens Minted to User',
    description: `Get the number of tokens minted in the collection to a user.`,
  },
  {
    id: 'infinity_swap_royalties',
    name: 'Infinity Swap Royalty Details',
    description: `Get the collection's royalty details for Infinity Swap`,
  },
  {
    id: 'token_info',
    name: 'Token Info',
    description: `Get information about a token in the collection.`,
  },
  {
    id: 'config',
    name: 'Minter Config',
    description: `Query Minter Config`,
  },
  {
    id: 'status',
    name: 'Minter Status',
    description: `Query Minter Status`,
  },
]
export const OPEN_EDITION_QUERY_LIST: QueryListItem[] = [
  {
    id: 'collection_info',
    name: 'Collection Info',
    description: `Get information about the collection.`,
  },
  {
    id: 'mint_price',
    name: 'Mint Price',
    description: `Get the price of minting a token.`,
  },
  {
    id: 'infinity_swap_royalties',
    name: 'Infinity Swap Royalty Details',
    description: `Get the collection's royalty details for Infinity Swap`,
  },
  {
    id: 'tokens_minted_to_user',
    name: 'Tokens Minted to User',
    description: `Get the number of tokens minted in the collection to a user.`,
  },
  {
    id: 'total_mint_count',
    name: 'Total Mint Count',
    description: `Get the total number of tokens minted for the collection.`,
  },
  // {
  //   id: 'token_owners',
  //   name: 'Token Owners',
  //   description: `Get the list of users who own tokens in the collection.`,
  // },
  {
    id: 'token_info',
    name: 'Token Info',
    description: `Get information about a token in the collection.`,
  },
  {
    id: 'config',
    name: 'Minter Config',
    description: `Query Minter Config`,
  },
  {
    id: 'status',
    name: 'Minter Status',
    description: `Query Minter Status`,
  },
]

export interface DispatchExecuteProps {
  type: QueryType
  [k: string]: unknown
}

type Select<T extends QueryType> = T

export type DispatchQueryArgs = {
  baseMinterMessages?: BaseMinterInstance
  vendingMinterMessages?: VendingMinterInstance
  openEditionMinterMessages?: OpenEditionMinterInstance
  sg721Messages?: SG721Instance
  royaltyRegistryMessages?: RoyaltyRegistryInstance
  sg721ContractAddress?: string
} & (
  | { type: undefined }
  | { type: Select<'collection_info'> }
  | { type: Select<'mint_price'> }
  | { type: Select<'num_tokens'> }
  | { type: Select<'tokens_minted_to_user'>; address: string }
  | { type: Select<'total_mint_count'> }
  | { type: Select<'tokens'>; address: string }
  | { type: Select<'infinity_swap_royalties'> }
  // | { type: Select<'token_owners'> }
  | { type: Select<'token_info'>; tokenId: string }
  | { type: Select<'config'> }
  | { type: Select<'status'> }
)

export const dispatchQuery = async (args: DispatchQueryArgs) => {
  const {
    baseMinterMessages,
    vendingMinterMessages,
    openEditionMinterMessages,
    sg721Messages,
    royaltyRegistryMessages,
  } = args
  if (!baseMinterMessages || !vendingMinterMessages || !openEditionMinterMessages || !sg721Messages) {
    throw new Error('Cannot execute actions')
  }
  switch (args.type) {
    case 'collection_info': {
      return sg721Messages.collectionInfo()
    }
    case 'mint_price': {
      return vendingMinterMessages.getMintPrice()
    }
    case 'num_tokens': {
      return vendingMinterMessages.getMintableNumTokens()
    }
    case 'tokens_minted_to_user': {
      return vendingMinterMessages.getMintCount(args.address)
    }
    case 'total_mint_count': {
      return openEditionMinterMessages.getTotalMintCount()
    }
    case 'tokens': {
      return sg721Messages.tokens(args.address)
    }
    // case 'token_owners': {
    //   return vendingMinterMessages.updateStartTime(txSigner, args.startTime)
    // }
    case 'infinity_swap_royalties': {
      return royaltyRegistryMessages?.collectionRoyaltyProtocol(
        args.sg721ContractAddress as string,
        INFINITY_SWAP_PROTOCOL_ADDRESS,
      )
    }
    case 'token_info': {
      if (!args.tokenId) return
      return sg721Messages.allNftInfo(args.tokenId)
    }
    case 'config': {
      return baseMinterMessages.getConfig()
    }
    case 'status': {
      return baseMinterMessages.getStatus()
    }
    default: {
      throw new Error('Unknown action')
    }
  }
}
