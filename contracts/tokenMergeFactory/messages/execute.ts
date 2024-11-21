import type { Coin } from '@cosmjs/proto-signing'

import type { TokenMergeFactoryInstance } from '../index'
import { useTokenMergeFactoryContract } from '../index'

/** @see {@link TokenMergeFactoryInstance} */
export interface DispatchExecuteArgs {
  contract: string
  messages?: TokenMergeFactoryInstance
  txSigner: string
  msg: Record<string, unknown>
  funds: Coin[]
  updatable?: boolean
  flex?: boolean
}

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages, txSigner } = args
  if (!messages) {
    throw new Error('cannot dispatch execute, messages is not defined')
  }
  return messages.createTokenMergeMinter(txSigner, args.msg, args.funds, args.updatable, args.flex)
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useTokenMergeFactoryContract()
  const { contract } = args
  return messages(contract)?.createTokenMergeMinter(args.msg, args.funds, args.updatable, args.flex)
}
