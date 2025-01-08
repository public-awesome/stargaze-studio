/* eslint-disable eslint-comments/disable-enable-pair */

import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { Coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'

export interface CreateOpenEditionMinterResponse {
  readonly openEditionMinterAddress: string
  readonly sg721Address: string
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface OpenEditionFactoryInstance {
  readonly contractAddress: string

  //Query

  //Execute
  createOpenEditionMinter: (
    senderAddress: string,
    msg: Record<string, unknown>,
    funds: Coin[],
    updatable?: boolean,
    selectedFactoryAddress?: string,
  ) => Promise<CreateOpenEditionMinterResponse>
}

export interface OpenEditionFactoryMessages {
  createOpenEditionMinter: (
    msg: Record<string, unknown>,
    funds: Coin[],
    updatable?: boolean,
  ) => CreateOpenEditionMinterMessage
}

export interface CreateOpenEditionMinterMessage {
  sender: string
  contract: string
  msg: Record<string, unknown>
  funds: Coin[]
}

export interface OpenEditionFactoryContract {
  use: (contractAddress: string) => OpenEditionFactoryInstance

  messages: (contractAddress: string) => OpenEditionFactoryMessages
}

export const openEditionFactory = (client: SigningCosmWasmClient, txSigner: string): OpenEditionFactoryContract => {
  const use = (contractAddress: string): OpenEditionFactoryInstance => {
    //Query

    //Execute
    const createOpenEditionMinter = async (
      senderAddress: string,
      msg: Record<string, unknown>,
      funds: Coin[],
    ): Promise<CreateOpenEditionMinterResponse> => {
      console.log('Contract Address: ', contractAddress)
      const result = await client.execute(senderAddress, contractAddress, msg, 'auto', '', funds)

      return {
        openEditionMinterAddress: result.events.filter((e) => e.type === 'instantiate')[0].attributes[0].value,
        sg721Address: result.events
          .filter((e) => e.type === 'wasm')
          .filter((e) => e.attributes[2]?.key === 'sg721_address')[0].attributes[2].value,
        transactionHash: result.transactionHash,
        logs: result.logs,
      }
    }

    return {
      contractAddress,
      createOpenEditionMinter,
    }
  }

  const messages = (contractAddress: string) => {
    const createOpenEditionMinter = (
      msg: Record<string, unknown>,
      funds: Coin[],
      updatable?: boolean,
    ): CreateOpenEditionMinterMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg,
        funds,
      }
    }

    return {
      createOpenEditionMinter,
    }
  }

  return { use, messages }
}
