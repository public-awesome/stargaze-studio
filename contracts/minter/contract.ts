import type { MsgExecuteContractEncodeObject, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { toUtf8 } from '@cosmjs/encoding'
import type { Coin } from '@cosmjs/proto-signing'
import { coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'
import type { Timestamp } from '@stargazezone/types/contracts/minter/shared-types'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface MigrateResponse {
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
  batchMint: (senderAddress: string, recipient: string, batchNumber: number) => Promise<string>
  shuffle: (senderAddress: string) => Promise<string>
  withdraw: (senderAddress: string) => Promise<string>
  airdrop: (senderAddress: string, recipients: string[]) => Promise<string>
}

export interface MinterMessages {
  mint: (price: string) => MintMessage
  setWhitelist: (whitelist: string) => SetWhitelistMessage
  updateStartTime: (time: Timestamp) => UpdateStarTimeMessage
  updatePerAddressLimit: (perAddressLimit: number) => UpdatePerAddressLimitMessage
  mintTo: (recipient: string) => MintToMessage
  mintFor: (recipient: string, tokenId: number) => MintForMessage
  batchMint: (recipient: string, batchNumber: number) => CustomMessage
  shuffle: () => ShuffleMessage
  withdraw: () => WithdrawMessage
  airdrop: (recipients: string[]) => CustomMessage
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

export interface CustomMessage {
  sender: string
  contract: string
  msg: Record<string, unknown>[]
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

  migrate: (
    senderAddress: string,
    contractAddress: string,
    codeId: number,
    migrateMsg: Record<string, unknown>,
  ) => Promise<MigrateResponse>

  use: (contractAddress: string) => MinterInstance

  messages: (contractAddress: string) => MinterMessages
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

    const batchMint = async (senderAddress: string, recipient: string, batchNumber: number): Promise<string> => {
      const executeContractMsgs: MsgExecuteContractEncodeObject[] = []
      for (let i = 0; i < batchNumber; i++) {
        const msg = {
          mint_to: { recipient },
        }
        const executeContractMsg: MsgExecuteContractEncodeObject = {
          typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
          value: MsgExecuteContract.fromPartial({
            sender: senderAddress,
            contract: contractAddress,
            msg: toUtf8(JSON.stringify(msg)),
          }),
        }

        executeContractMsgs.push(executeContractMsg)
      }

      const res = await client.signAndBroadcast(senderAddress, executeContractMsgs, 'auto', 'batch mint')

      return res.transactionHash
    }

    const airdrop = async (senderAddress: string, recipients: string[]): Promise<string> => {
      const executeContractMsgs: MsgExecuteContractEncodeObject[] = []
      for (let i = 0; i < recipients.length; i++) {
        const msg = {
          mint_to: { recipient: recipients[i] },
        }
        const executeContractMsg: MsgExecuteContractEncodeObject = {
          typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
          value: MsgExecuteContract.fromPartial({
            sender: senderAddress,
            contract: contractAddress,
            msg: toUtf8(JSON.stringify(msg)),
          }),
        }

        executeContractMsgs.push(executeContractMsg)
      }

      const res = await client.signAndBroadcast(senderAddress, executeContractMsgs, 'auto', 'airdrop')

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
      batchMint,
      airdrop,
      shuffle,
      withdraw,
    }
  }

  const migrate = async (
    senderAddress: string,
    contractAddress: string,
    codeId: number,
    migrateMsg: Record<string, unknown>,
  ): Promise<MigrateResponse> => {
    const result = await client.migrate(senderAddress, contractAddress, codeId, migrateMsg, 'auto')
    return {
      transactionHash: result.transactionHash,
      logs: result.logs,
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

  const messages = (contractAddress: string) => {
    const mint = (price: string): MintMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          mint: {},
        },
        funds: [coin(price, 'ustars')],
      }
    }

    const setWhitelist = (whitelist: string): SetWhitelistMessage => {
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

    const updateStartTime = (startTime: string): UpdateStarTimeMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_start_time: startTime,
        },
        funds: [],
      }
    }

    const updatePerAddressLimit = (limit: number): UpdatePerAddressLimitMessage => {
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

    const mintTo = (recipient: string): MintToMessage => {
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

    const mintFor = (recipient: string, tokenId: number): MintForMessage => {
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

    const batchMint = (recipient: string, batchNumber: number): CustomMessage => {
      const msg: Record<string, unknown>[] = []
      for (let i = 0; i < batchNumber; i++) {
        msg.push({ mint_to: { recipient } })
      }
      return {
        sender: txSigner,
        contract: contractAddress,
        msg,
        funds: [],
      }
    }

    const airdrop = (recipients: string[]): CustomMessage => {
      const msg: Record<string, unknown>[] = []
      for (let i = 0; i < recipients.length; i++) {
        msg.push({ mint_to: { recipient: recipients[i] } })
      }
      return {
        sender: txSigner,
        contract: contractAddress,
        msg,
        funds: [],
      }
    }

    const shuffle = (): ShuffleMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          shuffle: {},
        },
        funds: [],
      }
    }

    const withdraw = (): WithdrawMessage => {
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
      batchMint,
      airdrop,
      shuffle,
      withdraw,
    }
  }

  return { use, instantiate, messages, migrate }
}
