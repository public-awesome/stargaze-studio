import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { Coin } from '@cosmjs/proto-signing'
import { coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'
import type { Timestamp } from '@stargazezone/types/contracts/minter/shared-types'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface RoyalityInfo {
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
  mint: (senderAddress: string, price: string) => Promise<string>
  setWhitelist: (senderAddress: string, whitelist: string) => Promise<string>
  updateStartTime: (senderAddress: string, time: Timestamp) => Promise<string>
  updatePerAddressLimit: (senderAddress: string, perAddressLimit: number) => Promise<string>
  mintTo: (senderAddress: string, recipient: string) => Promise<string>
  mintFor: (senderAddress: string, recipient: string, tokenId: number) => Promise<string>
  shuffle: (senderAddress: string) => Promise<string>
  withdraw: (senderAddress: string) => Promise<string>
}

export interface MinterMessages {
  mint: (contractAddress: string, price: string) => MintMessage
  setWhitelist: (contractAddress: string, whitelist: string) => SetWhitelistMessage
  updateStartTime: (contractAddress: string, time: Timestamp) => UpdateStarTimeMessage
  updatePerAddressLimit: (contractAddress: string, perAddressLimit: number) => UpdatePerAddressLimitMessage
  mintTo: (contractAddress: string, recipient: string) => MintToMessage
  mintFor: (contractAddress: string, recipient: string, tokenId: number) => MintForMessage
  shuffle: (contractAddress: string) => ShuffleMessage
  withdraw: (contractAddress: string) => WithdrawMessage
}

export interface MintMessage {
  sender: string
  contract: string
  msg: {
    mint: Record<string, never>
  }
  funds: Coin[]
}

export interface SetWhitelistMessage {
  sender: string
  contract: string
  msg: {
    set_whitelist: {
      whitelist: string
    }
  }
  funds: Coin[]
}

export interface UpdateStarTimeMessage {
  sender: string
  contract: string
  msg: {
    update_start_time: string
  }
  funds: Coin[]
}

export interface UpdatePerAddressLimitMessage {
  sender: string
  contract: string
  msg: {
    update_per_address_limit: {
      per_address_limit: number
    }
  }
  funds: Coin[]
}

export interface MintToMessage {
  sender: string
  contract: string
  msg: {
    mint_to: {
      recipient: string
    }
  }
  funds: Coin[]
}

export interface MintForMessage {
  sender: string
  contract: string
  msg: {
    mint_for: {
      recipient: string
      token_id: number
    }
  }
  funds: Coin[]
}

export interface ShuffleMessage {
  sender: string
  contract: string
  msg: {
    shuffle: Record<string, never>
  }
  funds: Coin[]
}

export interface WithdrawMessage {
  sender: string
  contract: string
  msg: {
    withdraw: Record<string, never>
  }
  funds: Coin[]
}

export interface MinterContract {
  instantiate: (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
    funds?: Coin[],
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => MinterInstance

  messages: () => MinterMessages
}

export const minter = (client: SigningCosmWasmClient, txSigner: string): MinterContract => {
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
    const mint = async (senderAddress: string, price: string): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          mint: {},
        },
        'auto',
        '',
        [coin(price, 'ustars')],
      )

      return res.transactionHash
    }

    const setWhitelist = async (senderAddress: string, whitelist: string): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          set_whitelist: { whitelist },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const updateStartTime = async (senderAddress: string, time: Timestamp): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          update_start_time: { time },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const updatePerAddressLimit = async (senderAddress: string, perAddressLimit: number): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          update_per_address_limit: { per_address_limit: perAddressLimit },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const mintTo = async (senderAddress: string, recipient: string): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          mint_to: { recipient },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const mintFor = async (senderAddress: string, recipient: string, tokenId: number): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          mint_for: { token_id: tokenId, recipient },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const shuffle = async (senderAddress: string): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          shuffle: {},
        },
        'auto',
        '',
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
        '',
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
      shuffle,
      withdraw,
    }
  }

  const instantiate = async (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
  ): Promise<InstantiateResponse> => {
    const result = await client.instantiate(senderAddress, codeId, initMsg, label, 'auto', {
      funds: [coin('1000000000', 'ustars')],
    })

    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
      logs: result.logs,
    }
  }

  const messages = () => {
    const mint = (contractAddress: string, price: string): MintMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          mint: {},
        },
        funds: [coin(price, 'ustars')],
      }
    }

    const setWhitelist = (contractAddress: string, whitelist: string): SetWhitelistMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          set_whitelist: {
            whitelist,
          },
        },
        funds: [],
      }
    }

    const updateStartTime = (contractAddress: string, startTime: string): UpdateStarTimeMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_start_time: startTime,
        },
        funds: [],
      }
    }

    const updatePerAddressLimit = (contractAddress: string, limit: number): UpdatePerAddressLimitMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_per_address_limit: {
            per_address_limit: limit,
          },
        },
        funds: [],
      }
    }

    const mintTo = (contractAddress: string, recipient: string): MintToMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          mint_to: {
            recipient,
          },
        },
        funds: [],
      }
    }

    const mintFor = (contractAddress: string, recipient: string, tokenId: number): MintForMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          mint_for: {
            recipient,
            token_id: tokenId,
          },
        },
        funds: [],
      }
    }

    const shuffle = (contractAddress: string): ShuffleMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          shuffle: {},
        },
        funds: [],
      }
    }

    const withdraw = (contractAddress: string): WithdrawMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          withdraw: {},
        },
        funds: [],
      }
    }

    return {
      mint,
      setWhitelist,
      updateStartTime,
      updatePerAddressLimit,
      mintTo,
      mintFor,
      shuffle,
      withdraw,
    }
  }

  return { use, instantiate, messages }
}
