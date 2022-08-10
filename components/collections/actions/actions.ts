import type { MinterInstance } from 'contracts/minter'
import { useMinterContract } from 'contracts/minter'
import type { SG721Instance } from 'contracts/sg721'
import { useSG721Contract } from 'contracts/sg721'

export type ActionType = typeof ACTION_TYPES[number]

export const ACTION_TYPES = [
  'mint_to',
  'mint_for',
  'batch_mint',
  'set_whitelist',
  'update_start_time',
  'update_per_address_limit',
  'withdraw',
  'transfer',
  'shuffle',
] as const

export interface ActionListItem {
  id: ActionType
  name: string
  description?: string
}

export const ACTION_LIST: ActionListItem[] = [
  {
    id: 'mint_to',
    name: 'Mint To',
    description: `Mint a token to a user`,
  },
  {
    id: 'mint_for',
    name: 'Mint For',
    description: `Mint a token for a user with given token ID`,
  },
  {
    id: 'batch_mint',
    name: 'Batch Mint',
    description: `Mint multiple tokens to a user with given token amount`,
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
    name: 'Update Tokens Per Address Limit',
    description: `Update token per address limit`,
  },
  {
    id: 'withdraw',
    name: 'Withdraw Tokens',
    description: `Withdraw tokens from the contract`,
  },
  {
    id: 'transfer',
    name: 'Transfer Tokens',
    description: `Transfer tokens from one address to another`,
  },
  {
    id: 'shuffle',
    name: 'Shuffle Tokens',
    description: 'Shuffle the token IDs',
  },
]

export interface DispatchExecuteProps {
  type: ActionType
  [k: string]: unknown
}

type Select<T extends ActionType> = T

/** @see {@link MinterInstance} */
export type DispatchExecuteArgs = {
  minterContract: string
  sg721Contract: string
  minterMessages?: MinterInstance
  sg721Messages?: SG721Instance
  txSigner: string
} & (
  | { type: undefined }
  | { type: Select<'mint_to'>; recipient: string }
  | { type: Select<'mint_for'>; recipient: string; tokenId: number }
  | { type: Select<'batch_mint'>; recipient: string; batchNumber: number }
  | { type: Select<'set_whitelist'>; whitelist: string }
  | { type: Select<'update_start_time'>; startTime: string }
  | { type: Select<'update_per_address_limit'>; limit: number }
  | { type: Select<'shuffle'> }
  | { type: Select<'withdraw'> }
  | { type: Select<'transfer'>; recipient: string; tokenId: number }
)

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { minterMessages, sg721Messages, txSigner } = args
  if (!minterMessages || !sg721Messages) {
    throw new Error('Cannot execute actions')
  }
  switch (args.type) {
    case 'mint_to': {
      return minterMessages.mintTo(txSigner, args.recipient)
    }
    case 'mint_for': {
      return minterMessages.mintFor(txSigner, args.recipient, args.tokenId)
    }
    case 'batch_mint': {
      return minterMessages.batchMint(txSigner, args.recipient, args.batchNumber)
    }
    case 'set_whitelist': {
      return minterMessages.setWhitelist(txSigner, args.whitelist)
    }
    case 'update_start_time': {
      return minterMessages.updateStartTime(txSigner, args.startTime)
    }
    case 'update_per_address_limit': {
      return minterMessages.updatePerAddressLimit(txSigner, args.limit)
    }
    case 'shuffle': {
      return minterMessages.shuffle(txSigner)
    }
    case 'withdraw': {
      return minterMessages.withdraw(txSigner)
    }
    case 'transfer': {
      return sg721Messages.transferNft(args.recipient, args.tokenId.toString())
    }
    default: {
      throw new Error('Unknown action')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages: minterMessages } = useMinterContract()
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages: sg721Messages } = useSG721Contract()
  const { minterContract, sg721Contract } = args
  switch (args.type) {
    case 'mint_to': {
      return minterMessages()?.mintTo(minterContract, args.recipient)
    }
    case 'mint_for': {
      return minterMessages()?.mintFor(minterContract, args.recipient, args.tokenId)
    }
    case 'batch_mint': {
      return minterMessages()?.batchMint(minterContract, args.recipient, args.batchNumber)
    }
    case 'set_whitelist': {
      return minterMessages()?.setWhitelist(minterContract, args.whitelist)
    }
    case 'update_start_time': {
      return minterMessages()?.updateStartTime(minterContract, args.startTime)
    }
    case 'update_per_address_limit': {
      return minterMessages()?.updatePerAddressLimit(minterContract, args.limit)
    }
    case 'shuffle': {
      return minterMessages()?.shuffle(minterContract)
    }
    case 'withdraw': {
      return minterMessages()?.withdraw(minterContract)
    }
    case 'transfer': {
      return sg721Messages(sg721Contract)?.transferNft(args.recipient, args.tokenId.toString())
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ActionType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
