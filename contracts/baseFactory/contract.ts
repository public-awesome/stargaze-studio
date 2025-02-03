import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { Coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'
import { BASE_FACTORY_ADDRESS } from 'utils/constants'

import { BASE_FACTORY_UPDATABLE_ADDRESS } from '../../utils/constants'

export interface CreateBaseMinterResponse {
  readonly baseMinterAddress: string
  readonly sg721Address: string
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface BaseFactoryInstance {
  readonly contractAddress: string

  //Query
  getParams: () => Promise<any>
  //Execute
  createBaseMinter: (
    senderAddress: string,
    msg: Record<string, unknown>,
    funds: Coin[],
    updatable?: boolean,
  ) => Promise<CreateBaseMinterResponse>
}

export interface BaseFactoryMessages {
  createBaseMinter: (msg: Record<string, unknown>, funds: Coin[], updatable?: boolean) => CreateBaseMinterMessage
}

export interface CreateBaseMinterMessage {
  sender: string
  contract: string
  msg: Record<string, unknown>
  funds: Coin[]
}

export interface BaseFactoryContract {
  use: (contractAddress: string) => BaseFactoryInstance

  messages: (contractAddress: string) => BaseFactoryMessages
}

export const baseFactory = (client: SigningCosmWasmClient, txSigner: string): BaseFactoryContract => {
  const use = (contractAddress: string): BaseFactoryInstance => {
    //Query
    const getParams = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        params: {},
      })
      return res
    }

    //Execute
    const createBaseMinter = async (
      senderAddress: string,
      msg: Record<string, unknown>,
      funds: Coin[],
      updatable?: boolean,
    ): Promise<CreateBaseMinterResponse> => {
      const result = await client.execute(
        senderAddress,
        updatable ? BASE_FACTORY_UPDATABLE_ADDRESS : BASE_FACTORY_ADDRESS,
        msg,
        'auto',
        '',
        funds,
      )

      return {
        baseMinterAddress: result.events.filter((e) => e.type === 'instantiate')[0].attributes[0].value,
        sg721Address: result.events
          .filter((e) => e.type === 'wasm')
          .filter((e) => e.attributes[2]?.key === 'sg721_address')[0].attributes[2].value,
        transactionHash: result.transactionHash,
        logs: result.logs,
      }
    }

    return {
      contractAddress,
      getParams,
      createBaseMinter,
    }
  }

  const messages = (contractAddress: string) => {
    const createBaseMinter = (
      msg: Record<string, unknown>,
      funds: Coin[],
      updatable?: boolean,
    ): CreateBaseMinterMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg,
        funds,
      }
    }

    return {
      createBaseMinter,
    }
  }

  return { use, messages }
}
