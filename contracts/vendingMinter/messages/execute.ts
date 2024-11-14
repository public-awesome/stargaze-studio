import type { Coin } from '@cosmjs/proto-signing'

import type { VendingMinterInstance } from '../index'
import { useVendingMinterContract } from '../index'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = [
  'mint',
  'purge',
  'update_mint_price',
  'update_discount_price',
  'remove_discount_price',
  'set_whitelist',
  'update_start_time',
  'update_start_trading_time',
  'update_per_address_limit',
  'mint_to',
  'mint_for',
  'shuffle',
  'burn_remaining',
] as const

export interface ExecuteListItem {
  id: ExecuteType
  name: string
  description?: string
}

export const EXECUTE_LIST: ExecuteListItem[] = [
  {
    id: 'mint',
    name: 'Mint',
    description: `Mint a new token`,
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
    id: 'set_whitelist',
    name: 'Set Whitelist',
    description: `Set whitelist contract address`,
  },
  {
    id: 'update_start_time',
    name: 'Update Start Time',
    description: `Update start time for minting`,
  },
  {
    id: 'update_start_trading_time',
    name: 'Update Start Trading Time',
    description: `Update start trading time for minting`,
  },
  {
    id: 'update_per_address_limit',
    name: 'Update Per Address Limit',
    description: `Update token per address limit`,
  },
  {
    id: 'mint_to',
    name: 'Mint To',
    description: `Mint tokens to a given address`,
  },
  {
    id: 'mint_for',
    name: 'Mint For',
    description: `Mint tokens for a given address with a given token ID`,
  },
  {
    id: 'shuffle',
    name: 'Shuffle',
    description: `Shuffle the token IDs`,
  },
  {
    id: 'burn_remaining',
    name: 'Burn Remaining',
    description: `Burn remaining tokens`,
  },
]

export interface DispatchExecuteProps {
  type: ExecuteType
  [k: string]: unknown
}

type Select<T extends ExecuteType> = T

/** @see {@link VendingMinterInstance} */
export type DispatchExecuteArgs = {
  contract: string
  messages?: VendingMinterInstance
  txSigner: string
} & (
  | { type: undefined }
  | { type: Select<'mint'>; funds: Coin[] }
  | { type: Select<'purge'> }
  | { type: Select<'update_mint_price'>; price: string }
  | { type: Select<'update_discount_price'>; price: string }
  | { type: Select<'remove_discount_price'> }
  | { type: Select<'set_whitelist'>; whitelist: string }
  | { type: Select<'update_start_time'>; startTime: string }
  | { type: Select<'update_start_trading_time'>; startTime?: string }
  | { type: Select<'update_per_address_limit'>; limit: number }
  | { type: Select<'mint_to'>; recipient: string }
  | { type: Select<'mint_for'>; recipient: string; tokenId: number }
  | { type: Select<'shuffle'> }
  | { type: Select<'burn_remaining'> }
)

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages, txSigner } = args
  if (!messages) {
    throw new Error('cannot dispatch execute, messages is not defined')
  }
  switch (args.type) {
    case 'mint': {
      return messages.mint(txSigner, args.funds)
    }
    case 'purge': {
      return messages.purge(txSigner)
    }
    case 'update_mint_price': {
      return messages.updateMintPrice(txSigner, args.price)
    }
    case 'update_discount_price': {
      return messages.updateDiscountPrice(txSigner, args.price)
    }
    case 'remove_discount_price': {
      return messages.removeDiscountPrice(txSigner)
    }
    case 'set_whitelist': {
      return messages.setWhitelist(txSigner, args.whitelist)
    }
    case 'update_start_time': {
      return messages.updateStartTime(txSigner, args.startTime)
    }
    case 'update_start_trading_time': {
      return messages.updateStartTradingTime(txSigner, args.startTime)
    }
    case 'update_per_address_limit': {
      return messages.updatePerAddressLimit(txSigner, args.limit)
    }
    case 'mint_to': {
      return messages.mintTo(txSigner, args.recipient)
    }
    case 'mint_for': {
      return messages.mintFor(txSigner, args.recipient, args.tokenId)
    }
    case 'shuffle': {
      return messages.shuffle(txSigner)
    }
    case 'burn_remaining': {
      return messages.burnRemaining(txSigner)
    }
    default: {
      throw new Error('unknown execute type')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useVendingMinterContract()
  const { contract } = args
  switch (args.type) {
    case 'mint': {
      return messages(contract)?.mint(args.funds)
    }
    case 'purge': {
      return messages(contract)?.purge()
    }
    case 'update_mint_price': {
      return messages(contract)?.updateMintPrice(args.price)
    }
    case 'update_discount_price': {
      return messages(contract)?.updateDiscountPrice(args.price)
    }
    case 'remove_discount_price': {
      return messages(contract)?.removeDiscountPrice()
    }
    case 'set_whitelist': {
      return messages(contract)?.setWhitelist(args.whitelist)
    }
    case 'update_start_time': {
      return messages(contract)?.updateStartTime(args.startTime)
    }
    case 'update_start_trading_time': {
      return messages(contract)?.updateStartTradingTime(args.startTime as string)
    }
    case 'update_per_address_limit': {
      return messages(contract)?.updatePerAddressLimit(args.limit)
    }
    case 'mint_to': {
      return messages(contract)?.mintTo(args.recipient)
    }
    case 'mint_for': {
      return messages(contract)?.mintFor(args.recipient, args.tokenId)
    }
    case 'shuffle': {
      return messages(contract)?.shuffle()
    }
    case 'burn_remaining': {
      return messages(contract)?.burnRemaining()
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
