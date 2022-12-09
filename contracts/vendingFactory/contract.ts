import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { Coin } from '@cosmjs/proto-signing'
import { coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'
import { VENDING_FACTORY_ADDRESS } from 'utils/constants'

export interface CreateVendingMinterResponse {
  readonly vendingMinterAddress: string
  readonly sg721Address: string
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface VendingFactoryInstance {
  readonly contractAddress: string

  //Query

  //Execute
  createVendingMinter: (
    senderAddress: string,
    msg: Record<string, unknown>,
    funds: Coin[],
  ) => Promise<CreateVendingMinterResponse>
}

export interface VendingFactoryMessages {
  createVendingMinter: (msg: Record<string, unknown>) => CreateVendingMinterMessage
}

export interface CreateVendingMinterMessage {
  sender: string
  contract: string
  msg: Record<string, unknown>
  funds: Coin[]
}

export interface VendingFactoryContract {
  use: (contractAddress: string) => VendingFactoryInstance

  messages: (contractAddress: string) => VendingFactoryMessages
}

export const vendingFactory = (client: SigningCosmWasmClient, txSigner: string): VendingFactoryContract => {
  const use = (contractAddress: string): VendingFactoryInstance => {
    //Query

    //Execute
    const createVendingMinter = async (
      senderAddress: string,
      msg: Record<string, unknown>,
      funds: Coin[],
    ): Promise<CreateVendingMinterResponse> => {
      const result = await client.execute(senderAddress, VENDING_FACTORY_ADDRESS, msg, 'auto', '', funds)

      return {
        vendingMinterAddress: result.logs[0].events[5].attributes[0].value,
        sg721Address: result.logs[0].events[5].attributes[2].value,
        transactionHash: result.transactionHash,
        logs: result.logs,
      }
    }

    return {
      contractAddress,
      createVendingMinter,
    }
  }

  const messages = (contractAddress: string) => {
    const createVendingMinter = (msg: Record<string, unknown>): CreateVendingMinterMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg,
        funds: [coin('1000000000', 'ustars')],
      }
    }

    return {
      createVendingMinter,
    }
  }

  return { use, messages }
}
