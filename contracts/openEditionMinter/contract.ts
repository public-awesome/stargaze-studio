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

export interface RoyaltyInfo {
  payment_address: string
  share: string
}

export interface OpenEditionMinterInstance {
  readonly contractAddress: string

  //Query
  getConfig: () => Promise<any>
  getStartTime: () => Promise<any>
  getMintPrice: () => Promise<any>
  getMintCount: (address: string) => Promise<any>
  getStatus: () => Promise<any>

  //Execute
  mint: (senderAddress: string) => Promise<string>
  purge: (senderAddress: string) => Promise<string>
  updateStartTradingTime: (senderAddress: string, time?: Timestamp) => Promise<string>
  updatePerAddressLimit: (senderAddress: string, perAddressLimit: number) => Promise<string>
  mintTo: (senderAddress: string, recipient: string) => Promise<string>
  batchMint: (senderAddress: string, recipient: string, batchNumber: number) => Promise<string>
  airdrop: (senderAddress: string, recipients: string[]) => Promise<string>
}

export interface OpenEditionMinterMessages {
  mint: () => MintMessage
  purge: () => PurgeMessage
  updateStartTradingTime: (time: Timestamp) => UpdateStartTradingTimeMessage
  updatePerAddressLimit: (perAddressLimit: number) => UpdatePerAddressLimitMessage
  mintTo: (recipient: string) => MintToMessage
  batchMint: (recipient: string, batchNumber: number) => CustomMessage
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

export interface PurgeMessage {
  sender: string
  contract: string
  msg: {
    purge: Record<string, never>
  }
  funds: Coin[]
}

export interface UpdateStartTradingTimeMessage {
  sender: string
  contract: string
  msg: {
    update_start_trading_time: string
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

export interface CustomMessage {
  sender: string
  contract: string
  msg: Record<string, unknown>[]
  funds: Coin[]
}

export interface MintPriceMessage {
  public_price: {
    denom: string
    amount: string
  }
  airdrop_price: {
    denom: string
    amount: string
  }
  current_price: {
    denom: string
    amount: string
  }
}

export interface OpenEditionMinterContract {
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

  use: (contractAddress: string) => OpenEditionMinterInstance

  messages: (contractAddress: string) => OpenEditionMinterMessages
}

export const openEditionMinter = (client: SigningCosmWasmClient, txSigner: string): OpenEditionMinterContract => {
  const use = (contractAddress: string): OpenEditionMinterInstance => {
    //Query
    const getConfig = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        config: {},
      })
      return res
    }

    const getStartTime = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        start_time: {},
      })
      return res
    }

    const getMintPrice = async (): Promise<MintPriceMessage> => {
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

    const getStatus = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        status: {},
      })
      return res
    }

    //Execute
    const mint = async (senderAddress: string): Promise<string> => {
      const price = (await getMintPrice()).public_price.amount
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

    const purge = async (senderAddress: string): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          purge: {},
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const updateStartTradingTime = async (senderAddress: string, time?: Timestamp): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          update_start_trading_time: time || null,
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

    return {
      contractAddress,
      getConfig,
      getStartTime,
      getMintPrice,
      getMintCount,
      getStatus,
      mint,
      purge,
      updateStartTradingTime,
      updatePerAddressLimit,
      mintTo,
      batchMint,
      airdrop,
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
    const mint = (): MintMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          mint: {},
        },
        funds: [],
      }
    }

    const purge = (): PurgeMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          purge: {},
        },
        funds: [],
      }
    }

    const updateStartTradingTime = (startTime: string): UpdateStartTradingTimeMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_start_trading_time: startTime,
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

    return {
      mint,
      purge,
      updateStartTradingTime,
      updatePerAddressLimit,
      mintTo,
      batchMint,
      airdrop,
    }
  }

  return { use, instantiate, migrate, messages }
}
