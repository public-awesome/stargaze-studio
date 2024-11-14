import type { Coin } from '@cosmjs/proto-signing'

import type { OpenEditionMinterInstance } from '../index'
import { useOpenEditionMinterContract } from '../index'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = [
  'mint',
  'update_start_time',
  'update_end_time',
  'update_mint_price',
  'update_start_trading_time',
  'update_per_address_limit',
  'mint_to',
  'purge',
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
    id: 'update_mint_price',
    name: 'Update Mint Price',
    description: `Update the mint price per token`,
  },
  {
    id: 'update_start_time',
    name: 'Update Start Time',
    description: `Update the start time for minting`,
  },
  {
    id: 'update_end_time',
    name: 'Update End Time',
    description: `Update the end time for minting`,
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
    id: 'purge',
    name: 'Purge',
    description: `Purge`,
  },
]

export interface DispatchExecuteProps {
  type: ExecuteType
  [k: string]: unknown
}

type Select<T extends ExecuteType> = T

/** @see {@link OpenEditionMinterInstance} */
export type DispatchExecuteArgs = {
  contract: string
  messages?: OpenEditionMinterInstance
  txSigner: string
} & (
  | { type: undefined }
  | { type: Select<'mint'>; funds: Coin[] }
  | { type: Select<'purge'> }
  | { type: Select<'update_start_time'>; startTime: string }
  | { type: Select<'update_end_time'>; endTime: string }
  | { type: Select<'update_mint_price'>; price: string }
  | { type: Select<'update_start_trading_time'>; startTime?: string }
  | { type: Select<'update_per_address_limit'>; limit: number }
  | { type: Select<'mint_to'>; recipient: string }
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
    case 'update_start_time': {
      return messages.updateStartTime(txSigner, args.startTime)
    }
    case 'update_end_time': {
      return messages.updateEndTime(txSigner, args.endTime)
    }
    case 'update_mint_price': {
      return messages.updateMintPrice(txSigner, args.price)
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
    default: {
      throw new Error('unknown execute type')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useOpenEditionMinterContract()
  const { contract } = args
  switch (args.type) {
    case 'mint': {
      return messages(contract)?.mint(args.funds)
    }
    case 'purge': {
      return messages(contract)?.purge()
    }
    case 'update_start_time': {
      return messages(contract)?.updateStartTime(args.startTime)
    }
    case 'update_end_time': {
      return messages(contract)?.updateEndTime(args.endTime)
    }
    case 'update_mint_price': {
      return messages(contract)?.updateMintPrice(args.price)
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
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
