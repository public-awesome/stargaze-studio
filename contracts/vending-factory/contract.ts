/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { Coin } from '@cosmjs/proto-signing'
import type { Timestamp } from '@stargazezone/types/contracts/minter/shared-types'

export interface CreateMinterMsg {
  init_msg: VendingMinterInitMsg
  collection_params: CollectionParams
}

export interface VendingMinterInitMsg {
  base_token_uri: string
  start_time: Timestamp
  num_tokens: number
  unit_price: Coin
  per_address_limit: number
  whitelist?: string
}

export interface CollectionParams {
  code_id: number
  name: string
  symbol: string
  info: CollectionInfo
}

export interface CollectionInfo {
  creator: string
  description: string
  image: string
  external_link?: string
  royalty_info?: RoyaltyInfo
}

export interface RoyaltyInfo {
  payment_address: string
  share: string
}

export interface VendingFactoryInstance {
  readonly contractAddress: string

  //Query
  getParams: () => Promise<any>
  getMinterStatus: (minter: string) => Promise<any>

  //Execute
  createMinter: (senderAddress: string, msg: CreateMinterMsg) => Promise<string>
}

export interface VendingFactoryMessages {
  createMinter: (msg: CreateMinterMsg) => CreateMinterMessage
}

export interface CreateMinterMessage {
  sender: string
  contract: string
  msg: {
    create_minter: {
      init_msg: VendingMinterInitMsg
      collection_params: CollectionParams
    }
  }
  funds: Coin[]
}

export interface VendingFactoryContract {
  use: (contractAddress: string) => VendingFactoryInstance
  messages: (contractAddress: string) => VendingFactoryMessages
}

export const vendingFactory = (client: SigningCosmWasmClient, txSigner: string): VendingFactoryContract => {
  const use = (contractAddress: string): VendingFactoryInstance => {
    //Query
    const getParams = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        params: {},
      })
      return res
    }

    const getMinterStatus = async (minter: string): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        minter_status: { minter },
      })
      return res
    }

    //Execute
    const createMinter = async (senderAddress: string, msg: CreateMinterMsg): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          create_minter: { msg },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    return {
      contractAddress,
      getParams,
      getMinterStatus,
      createMinter,
    }
  }

  const messages = (contractAddress: string) => {
    const createMinter = (msg: CreateMinterMsg): CreateMinterMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          create_minter: {
            init_msg: msg.init_msg,
            collection_params: msg.collection_params,
          },
        },
        funds: [],
      }
    }

    return {
      createMinter,
    }
  }

  return { use, messages }
}
