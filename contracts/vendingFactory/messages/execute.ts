import type { Coin } from '@cosmjs/proto-signing'

import type { VendingFactoryInstance } from '../index'
import { useVendingFactoryContract } from '../index'

/** @see {@link VendingFactoryInstance} */
export interface DispatchExecuteArgs {
  contract: string
  messages?: VendingFactoryInstance
  txSigner: string
  msg: Record<string, unknown>
  funds: Coin[]
}

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages, txSigner } = args
  if (!messages) {
    throw new Error('cannot dispatch execute, messages is not defined')
  }
  return messages.createMinter(txSigner, args.msg, args.funds)
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useVendingFactoryContract()
  const { contract } = args
  return messages(contract)?.createMinter(args.msg)
}
