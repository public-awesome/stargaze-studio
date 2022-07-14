import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { Coin } from '@cosmjs/proto-signing'
import { logs } from '@cosmjs/stargate'
import { Timestamp } from '@stargazezone/types/contracts/minter/shared-types'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export type RoyalityInfo = {
  payment_address: string
  share: string
}

export interface MinterInstance {
  readonly contractAddress: string

  //Query
  getConfig: () => Promise<any>
  getMintableNumTokens: () => Promise<any>
  getStartTime: () => Promise<any>
  getMintPrice: () => Promise<any>
  getMintCount: (address: string) => Promise<any>

  //Execute
  mint: (senderAddress: string) => Promise<string>
  setWhitelist: (senderAddress: string, whitelist: string) => Promise<string>
  updateStartTime: (senderAddress: string, time: Timestamp) => Promise<string>
  updatePerAddressLimit: (
    senderAddress: string,
    per_address_limit: number
  ) => Promise<string>
  mintTo: (senderAddress: string, recipient: string) => Promise<string>
  mintFor: (
    senderAddress: string,
    token_id: number,
    recipient: string
  ) => Promise<string>
  withdraw: (senderAddress: string) => Promise<string>
}

export interface MinterContract {
  instantiate: (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
    funds?: Coin[]
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => MinterInstance
}

export const minter = (client: SigningCosmWasmClient): MinterContract => {
  const use = (contractAddress: string): MinterInstance => {
    //Query
    const getConfig = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        config: {},
      })
      return res
    }

    const getMintableNumTokens = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        mintable_num_tokens: {},
      })
      return res
    }

    const getStartTime = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        start_time: {},
      })
      return res
    }

    const getMintPrice = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        mint_price: {},
      })
      return res
    }

    const getMintCount = async (address: string): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        mint_count: { address },
      })
      return res
    }

    //Execute
    const mint = async (senderAddress: string): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          mint: {},
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    const setWhitelist = async (
      senderAddress: string,
      whitelist: string
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          set_whitelist: { whitelist },
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    const updateStartTime = async (
      senderAddress: string,
      time: Timestamp
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          update_start_time: { time },
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    const updatePerAddressLimit = async (
      senderAddress: string,
      per_address_limit: number
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          update_per_address_limit: { per_address_limit },
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    const mintTo = async (
      senderAddress: string,
      recipient: string
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          mint_to: { recipient },
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    const mintFor = async (
      senderAddress: string,
      token_id: number,
      recipient: string
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          mint_for: { token_id, recipient },
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    const withdraw = async (senderAddress: string): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          withdraw: {},
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    return {
      contractAddress,
      getConfig,
      getMintableNumTokens,
      getStartTime,
      getMintPrice,
      getMintCount,
      mint,
      setWhitelist,
      updateStartTime,
      updatePerAddressLimit,
      mintTo,
      mintFor,
      withdraw,
    }
  }

  const instantiate = async (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
    funds?: Coin[]
  ): Promise<InstantiateResponse> => {
    console.log(funds)
    const result = await client.instantiate(
      senderAddress,
      codeId,
      initMsg,
      label,
      'auto',
      {
        funds,
        admin,
      }
    )

    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
      logs: result.logs,
    }
  }

  return { use, instantiate }
}
