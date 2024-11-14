/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { MsgExecuteContractEncodeObject, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { toUtf8 } from '@cosmjs/encoding'
import type { Coin } from '@cosmjs/proto-signing'
import { coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'
import type { Timestamp } from '@stargazezone/types/contracts/minter/shared-types'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import toast from 'react-hot-toast'

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
  getEndTime: () => Promise<any>
  getMintPrice: () => Promise<any>
  getMintCount: (address: string) => Promise<any>
  getTotalMintCount: () => Promise<any>
  getStatus: () => Promise<any>

  //Execute
  mint: (senderAddress: string, funds: Coin[]) => Promise<string>
  purge: (senderAddress: string) => Promise<string>
  updateMintPrice: (senderAddress: string, price: string) => Promise<string>
  updateStartTime: (senderAddress: string, time: Timestamp) => Promise<string>
  updateEndTime: (senderAddress: string, time: Timestamp) => Promise<string>
  updateStartTradingTime: (senderAddress: string, time?: Timestamp) => Promise<string>
  updatePerAddressLimit: (senderAddress: string, perAddressLimit: number) => Promise<string>
  mintTo: (senderAddress: string, recipient: string) => Promise<string>
  batchMint: (senderAddress: string, recipient: string, batchNumber: number) => Promise<string>
  airdrop: (senderAddress: string, recipients: string[]) => Promise<string>
}

export interface OpenEditionMinterMessages {
  mint: (funds: Coin[]) => MintMessage
  purge: () => PurgeMessage
  updateMintPrice: (price: string) => UpdateMintPriceMessage
  updateStartTime: (time: Timestamp) => UpdateStartTimeMessage
  updateEndTime: (time: Timestamp) => UpdateEndTimeMessage
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

export interface UpdateStartTimeMessage {
  sender: string
  contract: string
  msg: {
    update_start_time: string
  }
  funds: Coin[]
}

export interface UpdateEndTimeMessage {
  sender: string
  contract: string
  msg: {
    update_end_time: string
  }
  funds: Coin[]
}

export interface UpdateMintPriceMessage {
  sender: string
  contract: string
  msg: {
    update_mint_price: {
      price: string
    }
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
    const getFactoryParameters = async (factoryAddress: string): Promise<any> => {
      const res = await client.queryContractSmart(factoryAddress, { params: {} })
      return res
    }

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

    const getEndTime = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        end_time: {},
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

    const getTotalMintCount = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        total_mint_count: {},
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
    const mint = async (senderAddress: string, funds: Coin[]): Promise<string> => {
      // const price = (await getMintPrice()).public_price.amount
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          mint: {},
        },
        'auto',
        '',
        funds,
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

    const updateStartTime = async (senderAddress: string, time: Timestamp): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          update_start_time: time,
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const updateEndTime = async (senderAddress: string, time: Timestamp): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          update_end_time: time,
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const updateMintPrice = async (senderAddress: string, price: string): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          update_mint_price: {
            price: (Number(price) * 1000000).toString(),
          },
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
      const txHash = await getConfig().then(async (response) => {
        const factoryParameters = await toast.promise(getFactoryParameters(response.factory), {
          loading: 'Querying Factory Parameters...',
          error: 'Querying Factory Parameters failed!',
          success: 'Query successful! Minting...',
        })
        console.log(factoryParameters?.params?.extension?.airdrop_mint_fee_bps)

        const price = factoryParameters?.params?.extension?.airdrop_mint_price.amount
        const denom = factoryParameters?.params?.extension?.airdrop_mint_price.denom || 'ustars'
        if (!price) {
          throw new Error(
            'Unable to retrieve a valid airdrop mint price. It may be that the given contract address does not belong to an Open Edition Factory.',
          )
        }
        const airdropFee = Number(price) * Number(factoryParameters.params.extension?.airdrop_mint_fee_bps)
        const res = await client.execute(
          senderAddress,
          contractAddress,
          {
            mint_to: { recipient },
          },
          'auto',
          '',
          airdropFee > 0 ? [coin(airdropFee / 100 / 100, denom as string)] : [],
        )
        return res.transactionHash
      })
      return txHash
    }

    const batchMint = async (senderAddress: string, recipient: string, batchNumber: number): Promise<string> => {
      const txHash = await getConfig().then(async (response) => {
        const factoryParameters = await toast.promise(getFactoryParameters(response?.factory), {
          loading: 'Querying Factory Parameters...',
          error: 'Querying Factory Parameters failed!',
          success: 'Query successful! Minting...',
        })

        const price = factoryParameters?.params?.extension?.airdrop_mint_price.amount
        const denom = factoryParameters?.params?.extension?.airdrop_mint_price.denom || 'ustars'
        if (!price) {
          throw new Error(
            'Unable to retrieve a valid airdrop mint price. It may be that the given contract address does not belong to a Open Edition Factory.',
          )
        }
        const airdropFee = Number(price) * Number(factoryParameters.params.extension?.airdrop_mint_fee_bps)
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
              funds: airdropFee > 0 ? [coin(airdropFee / 100 / 100, denom as string)] : [],
            }),
          }

          executeContractMsgs.push(executeContractMsg)
        }

        const res = await client.signAndBroadcast(senderAddress, executeContractMsgs, 'auto', 'batch mint')

        return res.transactionHash
      })
      return txHash
    }

    const airdrop = async (senderAddress: string, recipients: string[]): Promise<string> => {
      const txHash = await getConfig().then(async (response) => {
        const factoryParameters = await toast.promise(getFactoryParameters(response?.factory), {
          loading: 'Querying Factory Parameters...',
          error: 'Querying Factory Parameters failed!',
          success: 'Query successful! Minting...',
        })

        const price = factoryParameters?.params?.extension?.airdrop_mint_price.amount
        const denom = factoryParameters?.params?.extension?.airdrop_mint_price.denom || 'ustars'
        if (!price) {
          throw new Error(
            'Unable to retrieve a valid airdrop mint price. It may be that the given contract address does not belong to a Open Edition Factory.',
          )
        }
        const airdropFee = Number(price) * Number(factoryParameters.params.extension?.airdrop_mint_fee_bps)
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
              funds: airdropFee > 0 ? [coin(airdropFee / 100 / 100, denom as string)] : [],
            }),
          }

          executeContractMsgs.push(executeContractMsg)
        }

        const res = await client.signAndBroadcast(senderAddress, executeContractMsgs, 'auto', 'airdrop')

        return res.transactionHash
      })
      return txHash
    }

    return {
      contractAddress,
      getConfig,
      getStartTime,
      getEndTime,
      getMintPrice,
      getMintCount,
      getTotalMintCount,
      getStatus,
      mint,
      purge,
      updateStartTradingTime,
      updateStartTime,
      updateEndTime,
      updateMintPrice,
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
    const mint = (funds: Coin[]): MintMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          mint: {},
        },
        funds,
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

    const updateStartTime = (startTime: string): UpdateStartTimeMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_start_time: startTime,
        },
        funds: [],
      }
    }

    const updateEndTime = (endTime: string): UpdateEndTimeMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_end_time: endTime,
        },
        funds: [],
      }
    }

    const updateMintPrice = (price: string): UpdateMintPriceMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_mint_price: {
            price: (Number(price) * 1000000).toString(),
          },
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
      updateStartTime,
      updateEndTime,
      updateMintPrice,
      updatePerAddressLimit,
      mintTo,
      batchMint,
      airdrop,
    }
  }

  return { use, instantiate, migrate, messages }
}
