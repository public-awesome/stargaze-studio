import type { CreateMinterMsg } from '../contract'
import type { VendingFactoryInstance } from '../index'
import { useVendingFactoryContract } from '../index'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = ['create_minter'] as const

export interface ExecuteListItem {
  id: ExecuteType
  name: string
  description?: string
}

export const EXECUTE_LIST: ExecuteListItem[] = [
  {
    id: 'create_minter',
    name: 'Create Minter',
    description: `Create a new minter contract`,
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
  messages?: VendingFactoryInstance
  txSigner: string
} & ({ type: undefined } | { type: Select<'create_minter'>; msg: CreateMinterMsg })

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages, txSigner } = args
  if (!messages) {
    throw new Error('cannot dispatch execute, messages is not defined')
  }
  switch (args.type) {
    case 'create_minter': {
      return messages.createMinter(txSigner, args.msg)
    }
    default: {
      throw new Error('unknown execute type')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useVendingFactoryContract()
  const { contract } = args
  switch (args.type) {
    case 'create_minter': {
      return messages(contract)?.createMinter(args.msg)
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
