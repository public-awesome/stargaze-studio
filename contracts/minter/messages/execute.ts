import type { MinterInstance } from '../index'
import { useMinterContract } from '../index'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = [
  'mint',
  'set_whitelist',
  'update_start_time',
  'update_per_address_limit',
  'mint_to',
  'mint_for',
  'shuffle',
  'withdraw',
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
    description: `Mint new tokens for a given address`,
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
]

export interface DispatchExecuteProps {
  type: ExecuteType
  [k: string]: unknown
}

type Select<T extends ExecuteType> = T

/** @see {@link MinterInstance} */
export type DispatchExecuteArgs = {
  contract: string
  messages?: MinterInstance
  txSigner: string
} & (
  | { type: undefined }
  | { type: Select<'mint'>; price: string }
  | { type: Select<'set_whitelist'>; whitelist: string }
  | { type: Select<'update_start_time'>; startTime: string }
  | { type: Select<'update_per_address_limit'>; limit: number }
  | { type: Select<'mint_to'>; recipient: string }
  | { type: Select<'mint_for'>; recipient: string; tokenId: number }
  | { type: Select<'shuffle'> }
  | { type: Select<'withdraw'> }
)

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages, txSigner } = args
  if (!messages) {
    throw new Error('cannot dispatch execute, messages is not defined')
  }
  switch (args.type) {
    case 'mint': {
      return messages.mint(txSigner, args.price === '' ? '0' : args.price)
    }
    case 'set_whitelist': {
      return messages.setWhitelist(txSigner, args.whitelist)
    }
    case 'update_start_time': {
      return messages.updateStartTime(txSigner, args.startTime)
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
    case 'withdraw': {
      return messages.withdraw(txSigner)
    }
    default: {
      throw new Error('unknown execute type')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useMinterContract()
  const { contract } = args
  switch (args.type) {
    case 'mint': {
      return messages()?.mint(contract, args.price === '' ? '0' : args.price)
    }
    case 'set_whitelist': {
      return messages()?.setWhitelist(contract, args.whitelist)
    }
    case 'update_start_time': {
      return messages()?.updateStartTime(contract, args.startTime)
    }
    case 'update_per_address_limit': {
      return messages()?.updatePerAddressLimit(contract, args.limit)
    }
    case 'mint_to': {
      return messages()?.mintTo(contract, args.recipient)
    }
    case 'mint_for': {
      return messages()?.mintFor(contract, args.recipient, args.tokenId)
    }
    case 'shuffle': {
      return messages()?.shuffle(contract)
    }
    case 'withdraw': {
      return messages()?.withdraw(contract)
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
