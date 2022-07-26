import type { MinterInstance } from 'contracts/minter'
import type { SG721Instance } from 'contracts/sg721'

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_TYPES = [
  'collection_info',
  'mint_price',
  'num_tokens',
  'tokens_minted_to_user',
  // 'token_owners',
  'token_info',
] as const

export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const QUERY_LIST: QueryListItem[] = [
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
]

export interface DispatchExecuteProps {
  type: QueryType
  [k: string]: unknown
}

type Select<T extends QueryType> = T

export type DispatchQueryArgs = {
  minterMessages?: MinterInstance
  sg721Messages?: SG721Instance
} & (
  | { type: undefined }
  | { type: Select<'collection_info'> }
  | { type: Select<'mint_price'> }
  | { type: Select<'num_tokens'> }
  | { type: Select<'tokens_minted_to_user'>; address: string }
  // | { type: Select<'token_owners'> }
  | { type: Select<'token_info'>; tokenId: string }
)

export const dispatchQuery = async (args: DispatchQueryArgs) => {
  const { minterMessages, sg721Messages } = args
  if (!minterMessages || !sg721Messages) {
    throw new Error('Cannot execute actions')
  }
  switch (args.type) {
    case 'collection_info': {
      return sg721Messages.collectionInfo()
    }
    case 'mint_price': {
      return minterMessages.getMintPrice()
    }
    case 'num_tokens': {
      return minterMessages.getMintableNumTokens()
    }
    case 'tokens_minted_to_user': {
      return minterMessages.getMintCount(args.address)
    }
    // case 'token_owners': {
    //   return minterMessages.updateStartTime(txSigner, args.startTime)
    // }
    case 'token_info': {
      if (!args.tokenId) return
      return sg721Messages.allNftInfo(args.tokenId)
    }
    default: {
      throw new Error('Unknown action')
    }
  }
}
