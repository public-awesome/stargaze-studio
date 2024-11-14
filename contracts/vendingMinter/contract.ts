import type { MsgExecuteContractEncodeObject, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { toUtf8 } from '@cosmjs/encoding'
import type { Coin } from '@cosmjs/proto-signing'
import { coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'
import type { Timestamp } from '@stargazezone/types/contracts/minter/shared-types'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import type { AirdropAllocation } from 'utils/isValidAccountsFile'

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

export interface VendingMinterInstance {
  readonly contractAddress: string

  //Query
  getConfig: () => Promise<any>
  getMintableNumTokens: () => Promise<any>
  getStartTime: () => Promise<any>
  getMintPrice: () => Promise<any>
  getMintCount: (address: string) => Promise<any>

  //Execute
  mint: (senderAddress: string, funds: Coin[]) => Promise<string>
  purge: (senderAddress: string) => Promise<string>
  updateMintPrice: (senderAddress: string, price: string) => Promise<string>
  setWhitelist: (senderAddress: string, whitelist: string) => Promise<string>
  updateStartTime: (senderAddress: string, time: Timestamp) => Promise<string>
  updateStartTradingTime: (senderAddress: string, time?: Timestamp) => Promise<string>
  updatePerAddressLimit: (senderAddress: string, perAddressLimit: number) => Promise<string>
  mintTo: (senderAddress: string, recipient: string) => Promise<string>
  mintFor: (senderAddress: string, recipient: string, tokenId: number) => Promise<string>
  batchMintFor: (senderAddress: string, recipient: string, tokenIds: string) => Promise<string>
  batchMint: (senderAddress: string, recipient: string, batchNumber: number) => Promise<string>
  shuffle: (senderAddress: string) => Promise<string>
  withdraw: (senderAddress: string) => Promise<string>
  airdrop: (senderAddress: string, recipients: string[]) => Promise<string>
  airdropSpecificTokens: (senderAddress: string, tokenRecipients: AirdropAllocation[]) => Promise<string>
  burnRemaining: (senderAddress: string) => Promise<string>
  updateDiscountPrice: (senderAddress: string, price: string) => Promise<string>
  removeDiscountPrice: (senderAddress: string) => Promise<string>
}

export interface VendingMinterMessages {
  mint: (funds: Coin[]) => MintMessage
  purge: () => PurgeMessage
  updateMintPrice: (price: string) => UpdateMintPriceMessage
  setWhitelist: (whitelist: string) => SetWhitelistMessage
  updateStartTime: (time: Timestamp) => UpdateStartTimeMessage
  updateStartTradingTime: (time: Timestamp) => UpdateStartTradingTimeMessage
  updatePerAddressLimit: (perAddressLimit: number) => UpdatePerAddressLimitMessage
  mintTo: (recipient: string) => MintToMessage
  mintFor: (recipient: string, tokenId: number) => MintForMessage
  batchMintFor: (recipient: string, tokenIds: string) => BatchMintForMessage
  batchMint: (recipient: string, batchNumber: number) => CustomMessage
  shuffle: () => ShuffleMessage
  withdraw: () => WithdrawMessage
  airdrop: (recipients: string[]) => CustomMessage
  airdropSpecificTokens: (recipients: AirdropAllocation[]) => CustomMessage
  burnRemaining: () => BurnRemainingMessage
  updateDiscountPrice: (price: string) => UpdateDiscountPriceMessage
  removeDiscountPrice: () => RemoveDiscountPriceMessage
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

export interface UpdateDiscountPriceMessage {
  sender: string
  contract: string
  msg: {
    update_discount_price: {
      price: string
    }
  }
  funds: Coin[]
}

export interface RemoveDiscountPriceMessage {
  sender: string
  contract: string
  msg: {
    remove_discount_price: Record<string, never>
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

export interface UpdateStartTimeMessage {
  sender: string
  contract: string
  msg: {
    update_start_time: string
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
export interface BatchMintForMessage {
  sender: string
  contract: string
  msg: Record<string, unknown>[]
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

export interface BurnRemainingMessage {
  sender: string
  contract: string
  msg: {
    burn_remaining: Record<string, never>
  }
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

export interface VendingMinterContract {
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

  use: (contractAddress: string) => VendingMinterInstance

  messages: (contractAddress: string) => VendingMinterMessages
}

export const vendingMinter = (client: SigningCosmWasmClient, txSigner: string): VendingMinterContract => {
  const use = (contractAddress: string): VendingMinterInstance => {
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

    const updateDiscountPrice = async (senderAddress: string, price: string): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          update_discount_price: {
            price: (Number(price) * 1000000).toString(),
          },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const removeDiscountPrice = async (senderAddress: string): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          remove_discount_price: {},
        },
        'auto',
        '',
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
          update_start_time: time,
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

    const batchMintFor = async (senderAddress: string, recipient: string, tokenIds: string): Promise<string> => {
      const executeContractMsgs: MsgExecuteContractEncodeObject[] = []
      if (tokenIds.includes(':')) {
        const [start, end] = tokenIds.split(':').map(Number)
        for (let i = start; i <= end; i++) {
          const msg = {
            mint_for: { token_id: i, recipient },
          }
          const executeContractMsg: MsgExecuteContractEncodeObject = {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: MsgExecuteContract.fromPartial({
              sender: txSigner,
              contract: contractAddress,
              msg: toUtf8(JSON.stringify(msg)),
            }),
          }

          executeContractMsgs.push(executeContractMsg)
        }
      } else {
        const tokenNumbers = tokenIds.split(',').map(Number)
        for (let i = 0; i < tokenNumbers.length; i++) {
          const msg = {
            mint_for: { token_id: tokenNumbers[i], recipient },
          }
          const executeContractMsg: MsgExecuteContractEncodeObject = {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: MsgExecuteContract.fromPartial({
              sender: txSigner,
              contract: contractAddress,
              msg: toUtf8(JSON.stringify(msg)),
            }),
          }

          executeContractMsgs.push(executeContractMsg)
        }
      }

      const res = await client.signAndBroadcast(txSigner, executeContractMsgs, 'auto', 'batch mint for')

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

    const airdropSpecificTokens = async (senderAddress: string, recipients: AirdropAllocation[]): Promise<string> => {
      const executeContractMsgs: MsgExecuteContractEncodeObject[] = []
      for (let i = 0; i < recipients.length; i++) {
        const msg = {
          mint_for: { recipient: recipients[i].address, token_id: Number(recipients[i].tokenId) },
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

      const res = await client.signAndBroadcast(senderAddress, executeContractMsgs, 'auto', 'airdrop_specific_tokens')

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
        [coin(500000000, 'ustars')],
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

    const burnRemaining = async (senderAddress: string): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          burn_remaining: {},
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
      purge,
      updateMintPrice,
      updateDiscountPrice,
      removeDiscountPrice,
      setWhitelist,
      updateStartTime,
      updateStartTradingTime,
      updatePerAddressLimit,
      mintTo,
      mintFor,
      batchMintFor,
      batchMint,
      airdrop,
      airdropSpecificTokens,
      shuffle,
      withdraw,
      burnRemaining,
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
      funds: [coin('3000000000', 'ustars')],
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

    const updateDiscountPrice = (price: string): UpdateDiscountPriceMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_discount_price: {
            price: (Number(price) * 1000000).toString(),
          },
        },
        funds: [],
      }
    }

    const removeDiscountPrice = (): RemoveDiscountPriceMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          remove_discount_price: {},
        },
        funds: [],
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

    const batchMintFor = (recipient: string, tokenIds: string): BatchMintForMessage => {
      const msg: Record<string, unknown>[] = []
      if (tokenIds.includes(':')) {
        const [start, end] = tokenIds.split(':').map(Number)
        for (let i = start; i <= end; i++) {
          msg.push({
            mint_for: { token_id: i.toString(), recipient },
          })
        }
      } else {
        const tokenNumbers = tokenIds.split(',').map(Number)
        for (let i = 0; i < tokenNumbers.length; i++) {
          msg.push({ mint_for: { token_id: tokenNumbers[i].toString(), recipient } })
        }
      }

      return {
        sender: txSigner,
        contract: contractAddress,
        msg,
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

    const airdropSpecificTokens = (recipients: AirdropAllocation[]): CustomMessage => {
      const msg: Record<string, unknown>[] = []
      for (let i = 0; i < recipients.length; i++) {
        msg.push({ mint_for: { recipient: recipients[i].address, token_id: recipients[i].tokenId } })
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

    const burnRemaining = (): BurnRemainingMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          burn_remaining: {},
        },
        funds: [],
      }
    }

    return {
      mint,
      purge,
      updateMintPrice,
      updateDiscountPrice,
      removeDiscountPrice,
      setWhitelist,
      updateStartTime,
      updateStartTradingTime,
      updatePerAddressLimit,
      mintTo,
      mintFor,
      batchMintFor,
      batchMint,
      airdrop,
      airdropSpecificTokens,
      shuffle,
      withdraw,
      burnRemaining,
    }
  }

  return { use, instantiate, migrate, messages }
}
