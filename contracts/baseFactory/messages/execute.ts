import type { Coin } from '@cosmjs/proto-signing'

import type { BaseFactoryInstance } from '../index'
import { useBaseFactoryContract } from '../index'

/** @see {@link VendingFactoryInstance} */
export interface DispatchExecuteArgs {
  contract: string
  messages?: BaseFactoryInstance
  txSigner: string
  msg: Record<string, unknown>
  funds: Coin[]
  updatable?: boolean
}

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages, txSigner } = args
  if (!messages) {
    throw new Error('cannot dispatch execute, messages is not defined')
  }
  return messages.createBaseMinter(txSigner, args.msg, args.funds, args.updatable)
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useBaseFactoryContract()
  const { contract } = args
  return messages(contract)?.createBaseMinter(args.msg, args.funds, args.updatable)
}
