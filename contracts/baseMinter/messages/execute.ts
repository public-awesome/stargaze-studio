import type { BaseMinterInstance } from '../index'
import { useBaseMinterContract } from '../index'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = ['mint', 'update_start_trading_time'] as const

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
    id: 'update_start_trading_time',
    name: 'Update Start Trading Time',
    description: `Update start trading time for minting`,
  },
]

export interface DispatchExecuteProps {
  type: ExecuteType
  [k: string]: unknown
}

type Select<T extends ExecuteType> = T

/** @see {@link BaseMinterInstance} */
export type DispatchExecuteArgs = {
  contract: string
  messages?: BaseMinterInstance
  txSigner: string
} & (
  | { type: undefined }
  | { type: Select<'mint'>; tokenUri: string }
  | { type: Select<'update_start_trading_time'>; startTime?: string }
)

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages, txSigner } = args
  if (!messages) {
    throw new Error('cannot dispatch execute, messages is not defined')
  }
  switch (args.type) {
    case 'mint': {
      return messages.mint(txSigner, args.tokenUri)
    }
    case 'update_start_trading_time': {
      return messages.updateStartTradingTime(txSigner, args.startTime)
    }
    default: {
      throw new Error('unknown execute type')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useBaseMinterContract()
  const { contract } = args
  switch (args.type) {
    case 'mint': {
      return messages(contract)?.mint(args.tokenUri)
    }
    case 'update_start_trading_time': {
      return messages(contract)?.updateStartTradingTime(args.startTime as string)
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
