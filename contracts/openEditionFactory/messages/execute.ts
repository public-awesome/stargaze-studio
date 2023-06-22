/* eslint-disable eslint-comments/disable-enable-pair */

import type { Coin } from '@cosmjs/proto-signing'

import type { OpenEditionFactoryInstance } from '../index'
import { useOpenEditionFactoryContract } from '../index'

/** @see {@link OpenEditionFactoryInstance} */
export interface DispatchExecuteArgs {
  contract: string
  messages?: OpenEditionFactoryInstance
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
  return messages.createOpenEditionMinter(txSigner, args.msg, args.funds, args.updatable)
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useOpenEditionFactoryContract()
  const { contract } = args
  return messages(contract)?.createOpenEditionMinter(args.msg, args.funds, args.updatable)
}
