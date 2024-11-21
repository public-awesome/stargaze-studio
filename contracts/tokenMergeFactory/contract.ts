/* eslint-disable eslint-comments/disable-enable-pair */

import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { Coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'

export interface CreateTokenMergeMinterResponse {
  readonly tokenMergeMinterAddress: string
  readonly sg721Address: string
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface TokenMergeFactoryInstance {
  readonly contractAddress: string

  //Query

  //Execute
  createTokenMergeMinter: (
    senderAddress: string,
    msg: Record<string, unknown>,
    funds: Coin[],
    updatable?: boolean,
    flex?: boolean,
  ) => Promise<CreateTokenMergeMinterResponse>
}

export interface TokenMergeFactoryMessages {
  createTokenMergeMinter: (
    msg: Record<string, unknown>,
    funds: Coin[],
    updatable?: boolean,
    flex?: boolean,
  ) => CreateTokenMergeMinterMessage
}

export interface CreateTokenMergeMinterMessage {
  sender: string
  contract: string
  msg: Record<string, unknown>
  funds: Coin[]
}

export interface TokenMergeFactoryContract {
  use: (contractAddress: string) => TokenMergeFactoryInstance

  messages: (contractAddress: string) => TokenMergeFactoryMessages
}

export const tokenMergeFactory = (client: SigningCosmWasmClient, txSigner: string): TokenMergeFactoryContract => {
  const use = (contractAddress: string): TokenMergeFactoryInstance => {
    //Query

    //Execute
    const createTokenMergeMinter = async (
      senderAddress: string,
      msg: Record<string, unknown>,
      funds: Coin[],
      updatable?: boolean,
      flex?: boolean,
    ): Promise<CreateTokenMergeMinterResponse> => {
      const result = await client.execute(senderAddress, contractAddress, msg, 'auto', '', funds)

      return {
        tokenMergeMinterAddress: result.logs[0].events.filter((e) => e.type === 'instantiate')[0].attributes[0].value,
        sg721Address: result.logs[0].events
          .filter((e) => e.type === 'wasm')
          .filter((e) => e.attributes[2]?.key === 'sg721_address')[0].attributes[2].value,
        transactionHash: result.transactionHash,
        logs: result.logs,
      }
    }

    return {
      contractAddress,
      createTokenMergeMinter,
    }
  }

  const messages = (contractAddress: string) => {
    const createTokenMergeMinter = (
      msg: Record<string, unknown>,
      funds: Coin[],
      updatable?: boolean,
      flex?: boolean,
    ): CreateTokenMergeMinterMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg,
        funds,
      }
    }

    return {
      createTokenMergeMinter,
    }
  }

  return { use, messages }
}
