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

export interface BaseMinterInstance {
  readonly contractAddress: string

  //Query
  getConfig: () => Promise<any>
  getStatus: () => Promise<any>

  //Execute
  mint: (senderAddress: string, tokenUri: string) => Promise<string>
  updateStartTradingTime: (senderAddress: string, time?: Timestamp) => Promise<string>
  batchMint: (senderAddress: string, recipient: string, batchCount: number, startFrom: number) => Promise<string>
}

export interface BaseMinterMessages {
  mint: (tokenUri: string) => MintMessage
  updateStartTradingTime: (time: Timestamp) => UpdateStartTradingTimeMessage
  batchMint: (recipient: string, batchNumber: number, startFrom: number) => CustomMessage
}

export interface MintMessage {
  sender: string
  contract: string
  msg: {
    mint: {
      token_uri: string
    }
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
  whitelist_price?: {
    denom: string
    amount: string
  }
  current_price: {
    denom: string
    amount: string
  }
}

export interface BaseMinterContract {
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

  use: (contractAddress: string) => BaseMinterInstance

  messages: (contractAddress: string) => BaseMinterMessages
}

export const baseMinter = (client: SigningCosmWasmClient, txSigner: string): BaseMinterContract => {
  const use = (contractAddress: string): BaseMinterInstance => {
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

    const getStatus = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        status: {},
      })
      return res
    }

    //Execute
    const mint = async (senderAddress: string, tokenUri: string): Promise<string> => {
      const txHash = await getConfig().then(async (response) => {
        const factoryParameters = await toast.promise(getFactoryParameters(response.config?.factory), {
          loading: 'Querying Factory Parameters...',
          error: 'Querying Factory Parameters failed!',
          success: 'Query successful! Minting...',
        })
        console.log(factoryParameters.params.mint_fee_bps)

        const price = response.config?.mint_price.amount
        if (!price) {
          throw new Error(
            'Unable to retrieve a valid mint price. It may be that the given contract address does not belong to a Base Minter contract.',
          )
        }
        console.log((Number(price) * Number(factoryParameters.params.mint_fee_bps)) / 100)
        const res = await client.execute(
          senderAddress,
          contractAddress,
          {
            mint: { token_uri: tokenUri },
          },
          'auto',
          '',
          [coin((Number(price) * Number(factoryParameters.params.mint_fee_bps)) / 100 / 100, 'ugaze')],
        )
        return res.transactionHash
      })
      return txHash
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

    const batchMint = async (
      senderAddress: string,
      baseUri: string,
      batchCount: number,
      startFrom: number,
    ): Promise<string> => {
      const txHash = await getConfig().then(async (response) => {
        const factoryParameters = await toast.promise(getFactoryParameters(response?.config?.factory), {
          loading: 'Querying Factory Parameters...',
          error: 'Querying Factory Parameters failed!',
          success: 'Query successful! Minting...',
        })
        console.log(factoryParameters.params.mint_fee_bps)

        const price = response.config?.mint_price.amount
        if (!price) {
          throw new Error(
            'Unable to retrieve a valid mint price. It may be that the given contract address does not belong to a Base Minter contract.',
          )
        }
        console.log((Number(price) * Number(factoryParameters.params.mint_fee_bps)) / 100)

        const executeContractMsgs: MsgExecuteContractEncodeObject[] = []
        for (let i = 0; i < batchCount; i++) {
          const msg = {
            mint: { token_uri: `${baseUri}/${i + startFrom}` },
          }
          const executeContractMsg: MsgExecuteContractEncodeObject = {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: MsgExecuteContract.fromPartial({
              sender: senderAddress,
              contract: contractAddress,
              msg: toUtf8(JSON.stringify(msg)),
              funds: [coin((Number(price) * Number(factoryParameters.params.mint_fee_bps)) / 100 / 100, 'ugaze')],
            }),
          }

          executeContractMsgs.push(executeContractMsg)
        }

        const res = await client.signAndBroadcast(senderAddress, executeContractMsgs, 'auto', 'batch mint')

        return res.transactionHash
      })
      return txHash
    }

    return {
      contractAddress,
      getConfig,
      getStatus,
      mint,
      updateStartTradingTime,
      batchMint,
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
      funds: [coin('250000000', 'ugaze')],
    })
    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
      logs: result.logs,
    }
  }

  const messages = (contractAddress: string) => {
    const mint = (tokenUri: string): MintMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          mint: { token_uri: tokenUri },
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

    const batchMint = (baseUri: string, batchCount: number, startFrom: number): CustomMessage => {
      const msg: Record<string, unknown>[] = []
      for (let i = 0; i < batchCount; i++) {
        msg.push({ mint: { token_uri: `${baseUri}/${i + startFrom}` } })
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
      updateStartTradingTime,
      batchMint,
    }
  }

  return { use, instantiate, migrate, messages }
}
