/* eslint-disable eslint-comments/disable-enable-pair */
import { useBaseMinterContract } from 'contracts/baseMinter'
import { useOpenEditionMinterContract } from 'contracts/openEditionMinter'
import type { CollectionInfo, SG721Instance } from 'contracts/sg721'
import { useSG721Contract } from 'contracts/sg721'
import type { VendingMinterInstance } from 'contracts/vendingMinter'
import { useVendingMinterContract } from 'contracts/vendingMinter'
import type { AirdropAllocation } from 'utils/isValidAccountsFile'

import type { BaseMinterInstance } from '../../../contracts/baseMinter/contract'
import type { OpenEditionMinterInstance } from '../../../contracts/openEditionMinter/contract'

export type ActionType = typeof ACTION_TYPES[number]

export const ACTION_TYPES = [
  'mint_token_uri',
  'update_mint_price',
  'update_discount_price',
  'remove_discount_price',
  'mint_to',
  'mint_to_open_edition',
  'mint_for',
  'batch_mint',
  'batch_mint_open_edition',
  'set_whitelist',
  'update_start_time',
  'update_end_time',
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
  'airdrop_open_edition',
  'airdrop_specific',
  'burn_remaining',
  'update_token_metadata',
  'batch_update_token_metadata',
  'freeze_token_metadata',
  'enable_updatable',
] as const

export interface ActionListItem {
  id: ActionType
  name: string
  description?: string
}

export const BASE_ACTION_LIST: ActionListItem[] = [
  {
    id: 'mint_token_uri',
    name: 'Add New Token',
    description: `Mint a new token and add it to the collection`,
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
    id: 'update_mint_price',
    name: 'Update Mint Price',
    description: `Update mint price`,
  },
  {
    id: 'update_discount_price',
    name: 'Update Discount Price',
    description: `Update discount price`,
  },
  {
    id: 'remove_discount_price',
    name: 'Remove Discount Price',
    description: `Remove discount price`,
  },
  {
    id: 'mint_to',
    name: 'Mint To',
    description: `Mint a token to a user`,
  },
  {
    id: 'batch_mint',
    name: 'Batch Mint To',
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
    id: 'airdrop_specific',
    name: 'Airdrop Specific Tokens',
    description: 'Airdrop specific tokens to given addresses',
  },
  {
    id: 'burn_remaining',
    name: 'Burn Remaining Tokens',
    description: 'Burn remaining tokens',
  },
]

export const OPEN_EDITION_ACTION_LIST: ActionListItem[] = [
  {
    id: 'update_mint_price',
    name: 'Update Mint Price',
    description: `Update mint price`,
  },
  {
    id: 'mint_to_open_edition',
    name: 'Mint To',
    description: `Mint a token to a user`,
  },
  {
    id: 'batch_mint_open_edition',
    name: 'Batch Mint To',
    description: `Mint multiple tokens to a user`,
  },
  {
    id: 'update_start_time',
    name: 'Update Minting Start Time',
    description: `Update the start time for minting`,
  },
  {
    id: 'update_end_time',
    name: 'Update Minting End Time',
    description: `Update the end time for minting`,
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
    id: 'airdrop_open_edition',
    name: 'Airdrop Tokens',
    description: 'Airdrop tokens to given addresses',
  },
]

export const SG721_UPDATABLE_ACTION_LIST: ActionListItem[] = [
  {
    id: 'update_token_metadata',
    name: 'Update Token Metadata',
    description: `Update the metadata URI for a token`,
  },
  {
    id: 'batch_update_token_metadata',
    name: 'Batch Update Token Metadata',
    description: `Update the metadata URI for a range of tokens`,
  },
  {
    id: 'freeze_token_metadata',
    name: 'Freeze Token Metadata',
    description: `Render the metadata for tokens no longer updatable`,
  },
  {
    id: 'enable_updatable',
    name: 'Enable Updatable',
    description: `Render a collection updatable following a migration`,
  },
]

export interface DispatchExecuteProps {
  type: ActionType
  [k: string]: unknown
}

/** @see {@link VendingMinterInstance}{@link BaseMinterInstance} */
export interface DispatchExecuteArgs {
  minterContract: string
  sg721Contract: string
  vendingMinterMessages?: VendingMinterInstance
  baseMinterMessages?: BaseMinterInstance
  openEditionMinterMessages?: OpenEditionMinterInstance
  sg721Messages?: SG721Instance
  txSigner: string
  type: string | undefined
  tokenUri: string
  price: string
  recipient: string
  tokenId: number
  batchNumber: number
  whitelist: string
  startTime: string | undefined
  endTime: string | undefined
  limit: number
  tokenIds: string
  recipients: string[]
  tokenRecipients: AirdropAllocation[]
  collectionInfo: CollectionInfo | undefined
  baseUri: string
}

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { vendingMinterMessages, baseMinterMessages, openEditionMinterMessages, sg721Messages, txSigner } = args
  if (!vendingMinterMessages || !baseMinterMessages || !openEditionMinterMessages || !sg721Messages) {
    throw new Error('Cannot execute actions')
  }
  switch (args.type) {
    case 'mint_token_uri': {
      return baseMinterMessages.mint(txSigner, args.tokenUri)
    }
    case 'update_mint_price': {
      return vendingMinterMessages.updateMintPrice(txSigner, args.price)
    }
    case 'update_discount_price': {
      return vendingMinterMessages.updateDiscountPrice(txSigner, args.price)
    }
    case 'remove_discount_price': {
      return vendingMinterMessages.removeDiscountPrice(txSigner)
    }
    case 'mint_to': {
      return vendingMinterMessages.mintTo(txSigner, args.recipient)
    }
    case 'mint_to_open_edition': {
      return openEditionMinterMessages.mintTo(txSigner, args.recipient)
    }
    case 'mint_for': {
      return vendingMinterMessages.mintFor(txSigner, args.recipient, args.tokenId)
    }
    case 'batch_mint': {
      return vendingMinterMessages.batchMint(txSigner, args.recipient, args.batchNumber)
    }
    case 'batch_mint_open_edition': {
      return openEditionMinterMessages.batchMint(txSigner, args.recipient, args.batchNumber)
    }
    case 'set_whitelist': {
      return vendingMinterMessages.setWhitelist(txSigner, args.whitelist)
    }
    case 'update_start_time': {
      return vendingMinterMessages.updateStartTime(txSigner, args.startTime as string)
    }
    case 'update_end_time': {
      return openEditionMinterMessages.updateEndTime(txSigner, args.endTime as string)
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
    case 'update_token_metadata': {
      return sg721Messages.updateTokenMetadata(args.tokenId.toString(), args.tokenUri)
    }
    case 'batch_update_token_metadata': {
      return sg721Messages.batchUpdateTokenMetadata(args.tokenIds, args.baseUri)
    }
    case 'freeze_token_metadata': {
      return sg721Messages.freezeTokenMetadata()
    }
    case 'enable_updatable': {
      return sg721Messages.enableUpdatable()
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
    case 'airdrop_open_edition': {
      return openEditionMinterMessages.airdrop(txSigner, args.recipients)
    }
    case 'airdrop_specific': {
      return vendingMinterMessages.airdropSpecificTokens(txSigner, args.tokenRecipients)
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
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages: openEditionMinterMessages } = useOpenEditionMinterContract()
  const { minterContract, sg721Contract } = args
  switch (args.type) {
    case 'mint_token_uri': {
      return baseMinterMessages(minterContract)?.mint(args.tokenUri)
    }
    case 'update_mint_price': {
      return vendingMinterMessages(minterContract)?.updateMintPrice(args.price)
    }
    case 'update_discount_price': {
      return vendingMinterMessages(minterContract)?.updateDiscountPrice(args.price)
    }
    case 'remove_discount_price': {
      return vendingMinterMessages(minterContract)?.removeDiscountPrice()
    }
    case 'mint_to': {
      return vendingMinterMessages(minterContract)?.mintTo(args.recipient)
    }
    case 'mint_to_open_edition': {
      return openEditionMinterMessages(minterContract)?.mintTo(args.recipient)
    }
    case 'mint_for': {
      return vendingMinterMessages(minterContract)?.mintFor(args.recipient, args.tokenId)
    }
    case 'batch_mint': {
      return vendingMinterMessages(minterContract)?.batchMint(args.recipient, args.batchNumber)
    }
    case 'batch_mint_open_edition': {
      return openEditionMinterMessages(minterContract)?.batchMint(args.recipient, args.batchNumber)
    }
    case 'set_whitelist': {
      return vendingMinterMessages(minterContract)?.setWhitelist(args.whitelist)
    }
    case 'update_start_time': {
      return vendingMinterMessages(minterContract)?.updateStartTime(args.startTime as string)
    }
    case 'update_end_time': {
      return openEditionMinterMessages(minterContract)?.updateEndTime(args.endTime as string)
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
    case 'update_token_metadata': {
      return sg721Messages(sg721Contract)?.updateTokenMetadata(args.tokenId.toString(), args.tokenUri)
    }
    case 'batch_update_token_metadata': {
      return sg721Messages(sg721Contract)?.batchUpdateTokenMetadata(args.tokenIds, args.baseUri)
    }
    case 'freeze_token_metadata': {
      return sg721Messages(sg721Contract)?.freezeTokenMetadata()
    }
    case 'enable_updatable': {
      return sg721Messages(sg721Contract)?.enableUpdatable()
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
    case 'airdrop_open_edition': {
      return openEditionMinterMessages(minterContract)?.airdrop(args.recipients)
    }
    case 'airdrop_specific': {
      return vendingMinterMessages(minterContract)?.airdropSpecificTokens(args.tokenRecipients)
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
