import { useBaseMinterContract } from 'contracts/baseMinter'
import type { CollectionInfo, SG721Instance } from 'contracts/sg721'
import { useSG721Contract } from 'contracts/sg721'
import type { VendingMinterInstance } from 'contracts/vendingMinter'
import { useVendingMinterContract } from 'contracts/vendingMinter'

import type { BaseMinterInstance } from '../../../contracts/baseMinter/contract'

export type ActionType = typeof ACTION_TYPES[number]

export const ACTION_TYPES = [
  'mint',
  'mint_token_uri',
  'purge',
  'update_mint_price',
  'mint_to',
  'mint_for',
  'batch_mint',
  'set_whitelist',
  'update_start_time',
  'update_start_trading_time',
  'update_per_address_limit',
  'update_collection_info',
  'freeze_collection_info',
  'transfer',
  'batch_transfer',
  'burn',
  'batch_burn',
  'batch_mint_for',
  'shuffle',
  'airdrop',
  'burn_remaining',
] as const

export interface ActionListItem {
  id: ActionType
  name: string
  description?: string
}

export const BASE_ACTION_LIST: ActionListItem[] = [
  {
    id: 'mint_token_uri',
    name: 'Append New Token',
    description: `Mint a new token and append it to the collection`,
  },
  {
    id: 'update_start_trading_time',
    name: 'Update Trading Start Time',
    description: `Update start time for trading`,
  },
  {
    id: 'update_collection_info',
    name: 'Update Collection Info',
    description: `Update Collection Info`,
  },
  {
    id: 'freeze_collection_info',
    name: 'Freeze Collection Info',
    description: `Freeze collection info to prevent further updates`,
  },
  {
    id: 'transfer',
    name: 'Transfer Tokens',
    description: `Transfer tokens from one address to another`,
  },
  {
    id: 'batch_transfer',
    name: 'Batch Transfer Tokens',
    description: `Transfer a list of tokens to a recipient`,
  },
  {
    id: 'burn',
    name: 'Burn Token',
    description: `Burn a specified token from the collection`,
  },
  {
    id: 'batch_burn',
    name: 'Batch Burn Tokens',
    description: `Burn a list of tokens from the collection`,
  },
]

export const VENDING_ACTION_LIST: ActionListItem[] = [
  {
    id: 'mint',
    name: 'Mint',
    description: `Mint a token`,
  },
  {
    id: 'purge',
    name: 'Purge',
    description: `Purge`,
  },
  {
    id: 'update_mint_price',
    name: 'Update Mint Price',
    description: `Update mint price`,
  },
  {
    id: 'mint_to',
    name: 'Mint To',
    description: `Mint a token to a user`,
  },
  {
    id: 'batch_mint',
    name: 'Batch Mint',
    description: `Mint multiple tokens to a user`,
  },
  {
    id: 'mint_for',
    name: 'Mint For',
    description: `Mint a token for a user with the given token ID`,
  },
  {
    id: 'batch_mint_for',
    name: 'Batch Mint For',
    description: `Mint a specific range of tokens from the collection to a specific address`,
  },
  {
    id: 'set_whitelist',
    name: 'Set Whitelist',
    description: `Set whitelist contract address`,
  },
  {
    id: 'update_start_time',
    name: 'Update Minting Start Time',
    description: `Update start time for minting`,
  },
  {
    id: 'update_start_trading_time',
    name: 'Update Trading Start Time',
    description: `Update start time for trading`,
  },
  {
    id: 'update_per_address_limit',
    name: 'Update Tokens Per Address Limit',
    description: `Update token per address limit`,
  },
  {
    id: 'update_collection_info',
    name: 'Update Collection Info',
    description: `Update Collection Info`,
  },
  {
    id: 'freeze_collection_info',
    name: 'Freeze Collection Info',
    description: `Freeze collection info to prevent further updates`,
  },
  {
    id: 'transfer',
    name: 'Transfer Tokens',
    description: `Transfer tokens from one address to another`,
  },
  {
    id: 'batch_transfer',
    name: 'Batch Transfer Tokens',
    description: `Transfer a list of tokens to a recipient`,
  },
  {
    id: 'burn',
    name: 'Burn Token',
    description: `Burn a specified token from the collection`,
  },
  {
    id: 'batch_burn',
    name: 'Batch Burn Tokens',
    description: `Burn a list of tokens from the collection`,
  },
  {
    id: 'shuffle',
    name: 'Shuffle Tokens',
    description: 'Shuffle the token IDs',
  },
  {
    id: 'airdrop',
    name: 'Airdrop Tokens',
    description: 'Airdrop tokens to given addresses',
  },
  {
    id: 'burn_remaining',
    name: 'Burn Remaining Tokens',
    description: 'Burn remaining tokens',
  },
]

export interface DispatchExecuteProps {
  type: ActionType
  [k: string]: unknown
}

type Select<T extends ActionType> = T

/** @see {@link VendingMinterInstance}{@link BaseMinterInstance} */
export type DispatchExecuteArgs = {
  minterContract: string
  sg721Contract: string
  vendingMinterMessages?: VendingMinterInstance
  baseMinterMessages?: BaseMinterInstance
  sg721Messages?: SG721Instance
  txSigner: string
} & (
  | { type: undefined }
  | { type: Select<'mint'> }
  | { type: Select<'mint_token_uri'>; tokenUri: string }
  | { type: Select<'purge'> }
  | { type: Select<'update_mint_price'>; price: string }
  | { type: Select<'mint_to'>; recipient: string }
  | { type: Select<'mint_for'>; recipient: string; tokenId: number }
  | { type: Select<'batch_mint'>; recipient: string; batchNumber: number }
  | { type: Select<'set_whitelist'>; whitelist: string }
  | { type: Select<'update_start_time'>; startTime: string }
  | { type: Select<'update_start_trading_time'>; startTime?: string }
  | { type: Select<'update_per_address_limit'>; limit: number }
  | { type: Select<'shuffle'> }
  | { type: Select<'transfer'>; recipient: string; tokenId: number }
  | { type: Select<'batch_transfer'>; recipient: string; tokenIds: string }
  | { type: Select<'burn'>; tokenId: number }
  | { type: Select<'batch_burn'>; tokenIds: string }
  | { type: Select<'batch_mint_for'>; recipient: string; tokenIds: string }
  | { type: Select<'airdrop'>; recipients: string[] }
  | { type: Select<'burn_remaining'> }
  | { type: Select<'update_collection_info'>; collectionInfo: CollectionInfo | undefined }
  | { type: Select<'freeze_collection_info'> }
)

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { vendingMinterMessages, baseMinterMessages, sg721Messages, txSigner } = args
  if (!vendingMinterMessages || !baseMinterMessages || !sg721Messages) {
    throw new Error('Cannot execute actions')
  }
  switch (args.type) {
    case 'mint': {
      return vendingMinterMessages.mint(txSigner)
    }
    case 'mint_token_uri': {
      return baseMinterMessages.mint(txSigner, args.tokenUri)
    }
    case 'purge': {
      return vendingMinterMessages.purge(txSigner)
    }
    case 'update_mint_price': {
      return vendingMinterMessages.updateMintPrice(txSigner, args.price)
    }
    case 'mint_to': {
      return vendingMinterMessages.mintTo(txSigner, args.recipient)
    }
    case 'mint_for': {
      return vendingMinterMessages.mintFor(txSigner, args.recipient, args.tokenId)
    }
    case 'batch_mint': {
      return vendingMinterMessages.batchMint(txSigner, args.recipient, args.batchNumber)
    }
    case 'set_whitelist': {
      return vendingMinterMessages.setWhitelist(txSigner, args.whitelist)
    }
    case 'update_start_time': {
      return vendingMinterMessages.updateStartTime(txSigner, args.startTime)
    }
    case 'update_start_trading_time': {
      return vendingMinterMessages.updateStartTradingTime(txSigner, args.startTime)
    }
    case 'update_per_address_limit': {
      return vendingMinterMessages.updatePerAddressLimit(txSigner, args.limit)
    }
    case 'update_collection_info': {
      return sg721Messages.updateCollectionInfo(args.collectionInfo as CollectionInfo)
    }
    case 'freeze_collection_info': {
      return sg721Messages.freezeCollectionInfo()
    }
    case 'shuffle': {
      return vendingMinterMessages.shuffle(txSigner)
    }
    case 'transfer': {
      return sg721Messages.transferNft(args.recipient, args.tokenId.toString())
    }
    case 'batch_transfer': {
      return sg721Messages.batchTransfer(args.recipient, args.tokenIds)
    }
    case 'burn': {
      return sg721Messages.burn(args.tokenId.toString())
    }
    case 'batch_burn': {
      return sg721Messages.batchBurn(args.tokenIds)
    }
    case 'batch_mint_for': {
      return vendingMinterMessages.batchMintFor(txSigner, args.recipient, args.tokenIds)
    }
    case 'airdrop': {
      return vendingMinterMessages.airdrop(txSigner, args.recipients)
    }
    case 'burn_remaining': {
      return vendingMinterMessages.burnRemaining(txSigner)
    }
    default: {
      throw new Error('Unknown action')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages: vendingMinterMessages } = useVendingMinterContract()
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages: sg721Messages } = useSG721Contract()
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages: baseMinterMessages } = useBaseMinterContract()
  const { minterContract, sg721Contract } = args
  switch (args.type) {
    case 'mint': {
      return vendingMinterMessages(minterContract)?.mint()
    }
    case 'mint_token_uri': {
      return baseMinterMessages(minterContract)?.mint(args.tokenUri)
    }
    case 'purge': {
      return vendingMinterMessages(minterContract)?.purge()
    }
    case 'update_mint_price': {
      return vendingMinterMessages(minterContract)?.updateMintPrice(args.price)
    }
    case 'mint_to': {
      return vendingMinterMessages(minterContract)?.mintTo(args.recipient)
    }
    case 'mint_for': {
      return vendingMinterMessages(minterContract)?.mintFor(args.recipient, args.tokenId)
    }
    case 'batch_mint': {
      return vendingMinterMessages(minterContract)?.batchMint(args.recipient, args.batchNumber)
    }
    case 'set_whitelist': {
      return vendingMinterMessages(minterContract)?.setWhitelist(args.whitelist)
    }
    case 'update_start_time': {
      return vendingMinterMessages(minterContract)?.updateStartTime(args.startTime)
    }
    case 'update_start_trading_time': {
      return vendingMinterMessages(minterContract)?.updateStartTradingTime(args.startTime as string)
    }
    case 'update_per_address_limit': {
      return vendingMinterMessages(minterContract)?.updatePerAddressLimit(args.limit)
    }
    case 'update_collection_info': {
      return sg721Messages(sg721Contract)?.updateCollectionInfo(args.collectionInfo as CollectionInfo)
    }
    case 'freeze_collection_info': {
      return sg721Messages(sg721Contract)?.freezeCollectionInfo()
    }
    case 'shuffle': {
      return vendingMinterMessages(minterContract)?.shuffle()
    }
    case 'transfer': {
      return sg721Messages(sg721Contract)?.transferNft(args.recipient, args.tokenId.toString())
    }
    case 'batch_transfer': {
      return sg721Messages(sg721Contract)?.batchTransfer(args.recipient, args.tokenIds)
    }
    case 'burn': {
      return sg721Messages(sg721Contract)?.burn(args.tokenId.toString())
    }
    case 'batch_burn': {
      return sg721Messages(sg721Contract)?.batchBurn(args.tokenIds)
    }
    case 'batch_mint_for': {
      return vendingMinterMessages(minterContract)?.batchMintFor(args.recipient, args.tokenIds)
    }
    case 'airdrop': {
      return vendingMinterMessages(minterContract)?.airdrop(args.recipients)
    }
    case 'burn_remaining': {
      return vendingMinterMessages(minterContract)?.burnRemaining()
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ActionType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
