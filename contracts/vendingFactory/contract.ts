/* eslint-disable eslint-comments/disable-enable-pair */

import type { StdFee } from '@cosmjs/amino'
import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { type Coin, coins } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'

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
    updatable?: boolean,
    flex?: boolean,
  ) => Promise<CreateVendingMinterResponse>
}

export interface VendingFactoryMessages {
  createVendingMinter: (
    msg: Record<string, unknown>,
    funds: Coin[],
    updatable?: boolean,
    flex?: boolean,
  ) => CreateVendingMinterMessage
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

    const defaultFee: StdFee = {
      amount: coins('100000', 'ustars'),
      gas: '100000',
    }

    //Execute
    const createVendingMinter = async (
      senderAddress: string,
      msg: Record<string, unknown>,
      funds: Coin[],
      updatable?: boolean,
      flex?: boolean,
    ): Promise<CreateVendingMinterResponse> => {
      const result = await client.execute(senderAddress, contractAddress, msg, 'auto', '', funds)

      return {
        vendingMinterAddress: result.logs[0].events[16].attributes[0].value,
        sg721Address: result.logs[0].events[18].attributes[0].value,
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
    const createVendingMinter = (
      msg: Record<string, unknown>,
      funds: Coin[],
      updatable?: boolean,
      flex?: boolean,
    ): CreateVendingMinterMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg,
        funds,
      }
    }

    return {
      createVendingMinter,
    }
  }

  return { use, messages }
}
