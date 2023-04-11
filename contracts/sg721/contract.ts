import type { MsgExecuteContractEncodeObject, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { toBase64, toUtf8 } from '@cosmjs/encoding'
import type { Coin, logs } from '@cosmjs/stargate'
import { coin } from '@cosmjs/stargate'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface MigrateResponse {
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface RoyaltyInfo {
  payment_address: string
  share_bps: number
}

export type Expiration = { at_height: number } | { at_time: string } | { never: Record<string, never> }

export interface SG721Instance {
  readonly contractAddress: string

  // queries
  ownerOf: (tokenId: string, includeExpired?: boolean | null) => Promise<any>

  approval: (tokenId: string, spender: string, includeExpired?: boolean | null) => Promise<any>

  approvals: (tokenId: string, includeExpired?: boolean | null) => Promise<any>

  allOperators: (
    owner: string,
    includeExpired?: boolean | null,
    startAfter?: string | null,
    limit?: number | null,
  ) => Promise<any>

  numTokens: () => Promise<any>

  contractInfo: () => Promise<any>

  nftInfo: (tokenId: string) => Promise<any>

  allNftInfo: (tokenId: string, includeExpired?: boolean | null) => Promise<any>

  tokens: (owner: string, startAfter?: string | null, limit?: number | null) => Promise<any>

  allTokens: (startAfter?: string | null, limit?: number | null) => Promise<any>

  minter: () => Promise<any>

  collectionInfo: () => Promise<any>

  //Execute
  transferNft: (recipient: string, tokenId: string) => Promise<string>
  /// Send is a base message to transfer a token to a contract and trigger an action
  /// on the receiving contract.
  sendNft: (
    contract: string,
    tokenId: string,
    msg: Record<string, unknown>, //Binary
  ) => Promise<string>
  /// Allows operator to transfer / send the token from the owner's account.
  /// If expiration is set, then this allowance has a time/height limit
  approve: (spender: string, tokenId: string, expires?: Expiration) => Promise<string>
  /// Remove previously granted Approval
  revoke: (spender: string, tokenId: string) => Promise<string>
  /// Allows operator to transfer / send any token from the owner's account.
  /// If expiration is set, then this allowance has a time/height limit
  approveAll: (operator: string, expires?: Expiration) => Promise<string>
  /// Remove previously granted ApproveAll permission
  revokeAll: (operator: string) => Promise<string>
  /// Mint a new NFT, can only be called by the contract minter
  mint: (tokenId: string, owner: string, tokenURI?: string) => Promise<string> //MintMsg<T>
  updateRoyaltyInfo: (royaltyInfo: RoyaltyInfo) => Promise<string>

  /// Burn an NFT the sender has access to
  burn: (tokenId: string) => Promise<string>
  batchBurn: (tokenIds: string) => Promise<string>
  batchTransfer: (recipient: string, tokenIds: string) => Promise<string>
  updateTokenMetadata: (tokenId: string, tokenURI?: string) => Promise<string>
  batchUpdateTokenMetadata: (tokenIds: string, tokenURI?: string) => Promise<string>
  freezeTokenMetadata: () => Promise<string>
}

export interface Sg721Messages {
  transferNft: (recipient: string, tokenId: string) => TransferNFTMessage
  sendNft: (contract: string, tokenId: string, msg: Record<string, unknown>) => SendNFTMessage
  approve: (recipient: string, tokenId: string, expires?: Expiration) => ApproveMessage
  revoke: (recipient: string, tokenId: string) => RevokeMessage
  approveAll: (operator: string, expires?: Expiration) => ApproveAllMessage
  revokeAll: (operator: string) => RevokeAllMessage
  mint: (tokenId: string, owner: string, tokenURI?: string) => MintMessage
  updateRoyaltyInfo: (royaltyInfo: RoyaltyInfo) => UpdateRoyaltyInfoMessage
  burn: (tokenId: string) => BurnMessage
  batchBurn: (tokenIds: string) => BatchBurnMessage
  batchTransfer: (recipient: string, tokenIds: string) => BatchTransferMessage
  updateTokenMetadata: (tokenId: string, tokenURI?: string) => UpdateTokenMetadataMessage
  batchUpdateTokenMetadata: (tokenIds: string, tokenURI?: string) => BatchUpdateTokenMetadataMessage
  freezeTokenMetadata: () => FreezeTokenMetadataMessage
}

export interface UpdateRoyaltyInfoMessage {
  sender: string
  contract: string
  msg: {
    update_royalty_info: {
      payment_address: string
      share_bps: number
    }
  }
  funds: Coin[]
}

export interface UpdateTokenMetadataMessage {
  sender: string
  contract: string
  msg: {
    update_token_metadata: {
      token_id: string
      token_uri: string
    }
  }
  funds: Coin[]
}

export interface BatchUpdateTokenMetadataMessage {
  sender: string
  contract: string
  msg: Record<string, unknown>[]
  funds: Coin[]
}

export interface FreezeTokenMetadataMessage {
  sender: string
  contract: string
  msg: { freeze_token_metadata: Record<string, never> }
  funds: Coin[]
}

export interface TransferNFTMessage {
  sender: string
  contract: string
  msg: {
    transfer_nft: {
      recipient: string
      token_id: string
    }
  }
  funds: Coin[]
}

export interface SendNFTMessage {
  sender: string
  contract: string
  msg: {
    send_nft: {
      contract: string
      token_id: string
      msg: Record<string, unknown>
    }
  }
  funds: Coin[]
}

export interface ApproveMessage {
  sender: string
  contract: string
  msg: {
    approve: {
      spender: string
      token_id: string
      expires?: Expiration
    }
  }
  funds: Coin[]
}

export interface RevokeMessage {
  sender: string
  contract: string

  msg: {
    revoke: {
      spender: string
      token_id: string
    }
  }
  funds: Coin[]
}

export interface ApproveAllMessage {
  sender: string
  contract: string
  msg: {
    approve_all: {
      operator: string
      expires?: Expiration
    }
  }
  funds: Coin[]
}

export interface RevokeAllMessage {
  sender: string
  contract: string
  msg: {
    revoke_all: {
      operator: string
    }
  }
  funds: Coin[]
}

export interface MintMessage {
  sender: string
  contract: string
  msg: {
    mint: {
      token_id: string
      owner: string
      token_uri?: string
    }
  }
  funds: Coin[]
}

export interface BurnMessage {
  sender: string
  contract: string
  msg: {
    burn: {
      token_id: string
    }
  }
  funds: Coin[]
}

export interface BatchBurnMessage {
  sender: string
  contract: string
  msg: Record<string, unknown>[]
  funds: Coin[]
}

export interface BatchTransferMessage {
  sender: string
  contract: string
  msg: Record<string, unknown>[]
  funds: Coin[]
}

export interface SG721Contract {
  instantiate: (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>

  migrate: (
    senderAddress: string,
    contractAddress: string,
    codeId: number,
    migrateMsg: Record<string, unknown>,
  ) => Promise<MigrateResponse>

  use: (contractAddress: string) => SG721Instance

  messages: (contractAddress: string) => Sg721Messages
}

export const SG721 = (client: SigningCosmWasmClient, txSigner: string): SG721Contract => {
  const use = (contractAddress: string): SG721Instance => {
    const jsonToBinary = (json: Record<string, unknown>): string => {
      return toBase64(toUtf8(JSON.stringify(json)))
    }

    const ownerOf = async (tokenId: string, includeExpired?: boolean | null): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        owner_of: { token_id: tokenId, include_expired: includeExpired },
      })
      return res
    }

    const approval = async (tokenId: string, spender: string, includeExpired?: boolean | null): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        approval: { token_id: tokenId, spender, include_expired: includeExpired },
      })
      return res
    }

    const approvals = async (tokenId: string, includeExpired?: boolean | null): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        approvals: { token_id: tokenId, include_expired: includeExpired },
      })
      return res
    }

    const allOperators = async (
      owner: string,
      includeExpired?: boolean | null,
      startAfter?: string | null,
      limit?: number | null,
    ): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        all_operators: { owner, include_expired: includeExpired, start_after: startAfter, limit },
      })
      return res
    }

    const numTokens = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        num_tokens: {},
      })
      return res
    }

    const contractInfo = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        contract_info: {},
      })
      return res
    }

    const nftInfo = async (tokenId: string): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        nft_info: { token_id: tokenId },
      })
      return res
    }

    const allNftInfo = async (tokenId: string, includeExpired?: boolean | null): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        all_nft_info: { token_id: tokenId, include_expired: includeExpired },
      })
      return res
    }

    const tokens = async (owner: string, startAfter?: string | null, limit?: number | null): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        tokens: { owner, start_after: startAfter, limit },
      })
      return res
    }

    const allTokens = async (startAfter?: string | null, limit?: number | null): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        all_tokens: { start_after: startAfter, limit },
      })
      return res
    }

    const minter = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        minter: {},
      })
      return res
    }

    const collectionInfo = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        collection_info: {},
      })
      return res
    }

    //Execute
    const transferNft = async (recipient: string, tokenId: string): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          transfer_nft: { recipient, token_id: tokenId },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const sendNft = async (
      contract: string,
      tokenId: string,
      msg: Record<string, unknown>, //Binary
    ): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          send_nft: { contract, token_id: tokenId, msg: jsonToBinary(msg) },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const approve = async (spender: string, tokenId: string, expires?: Expiration): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          approve: { spender, token_id: tokenId, expires },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const revoke = async (spender: string, tokenId: string): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          revoke: { spender, token_id: tokenId },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const approveAll = async (operator: string, expires?: Expiration): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          approve_all: { operator, expires },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const revokeAll = async (operator: string): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          revoke_all: { operator },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const mint = async (tokenId: string, owner: string, tokenURI?: string): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          mint: {
            token_id: tokenId,
            owner,
            token_uri: tokenURI,
          },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const updateRoyaltyInfo = async (royaltyInfo: RoyaltyInfo): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          update_royalty_info: {
            payment_address: royaltyInfo.payment_address,
            share_bps: royaltyInfo.share_bps,
          },
        },
        'auto',
        '',
      )
      return res.transactionHash
    }

    const burn = async (tokenId: string): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          burn: { token_id: tokenId },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const batchBurn = async (tokenIds: string): Promise<string> => {
      const executeContractMsgs: MsgExecuteContractEncodeObject[] = []
      if (tokenIds.includes(':')) {
        const [start, end] = tokenIds.split(':').map(Number)
        for (let i = start; i <= end; i++) {
          const msg = {
            burn: { token_id: i.toString() },
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
            burn: { token_id: tokenNumbers[i].toString() },
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

      const res = await client.signAndBroadcast(txSigner, executeContractMsgs, 'auto', 'batch burn')

      return res.transactionHash
    }

    const batchTransfer = async (recipient: string, tokenIds: string): Promise<string> => {
      const executeContractMsgs: MsgExecuteContractEncodeObject[] = []
      if (tokenIds.includes(':')) {
        const [start, end] = tokenIds.split(':').map(Number)
        for (let i = start; i <= end; i++) {
          const msg = {
            transfer_nft: { recipient, token_id: i.toString() },
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
            transfer_nft: { recipient, token_id: tokenNumbers[i].toString() },
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

      const res = await client.signAndBroadcast(txSigner, executeContractMsgs, 'auto', 'batch transfer')

      return res.transactionHash
    }

    const batchUpdateTokenMetadata = async (tokenIds: string, baseURI?: string): Promise<string> => {
      const executeContractMsgs: MsgExecuteContractEncodeObject[] = []
      if (tokenIds.includes(':')) {
        const [start, end] = tokenIds.split(':').map(Number)
        for (let i = start; i <= end; i++) {
          const msg = {
            update_token_metadata: { token_id: i.toString(), token_uri: baseURI ? `${baseURI}/${i}` : undefined },
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
            update_token_metadata: {
              token_id: tokenNumbers[i].toString(),
              token_uri: baseURI ? `${baseURI}/${tokenNumbers[i]}` : undefined,
            },
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

      const res = await client.signAndBroadcast(txSigner, executeContractMsgs, 'auto', 'batch update metadata')

      return res.transactionHash
    }

    const updateTokenMetadata = async (tokenId: string, tokenURI?: string): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          update_token_metadata: {
            token_id: tokenId,
            token_uri: tokenURI ? tokenURI : undefined,
          },
        },
        'auto',
        '',
      )
      return res.transactionHash
    }

    const freezeTokenMetadata = async (): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          freeze_token_metadata: {},
        },
        'auto',
        '',
      )
      return res.transactionHash
    }

    return {
      contractAddress,
      ownerOf,
      approval,
      approvals,
      allOperators,
      numTokens,
      contractInfo,
      updateTokenMetadata,
      freezeTokenMetadata,
      batchUpdateTokenMetadata,
      nftInfo,
      allNftInfo,
      tokens,
      allTokens,
      minter,
      collectionInfo,
      transferNft,
      sendNft,
      approve,
      revoke,
      approveAll,
      revokeAll,
      mint,
      updateRoyaltyInfo,
      burn,
      batchBurn,
      batchTransfer,
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
    admin?: string,
  ): Promise<InstantiateResponse> => {
    const result = await client.instantiate(senderAddress, codeId, initMsg, label, 'auto', {
      funds: [coin('1000000000', 'ustars')],
      memo: '',
      admin,
    })
    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
    }
  }

  const messages = (contractAddress: string) => {
    const transferNft = (recipient: string, tokenId: string) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          transfer_nft: {
            recipient,
            token_id: tokenId,
          },
        },
        funds: [],
      }
    }

    const sendNft = (contract: string, tokenId: string, msg: Record<string, unknown>) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          send_nft: {
            contract,
            token_id: tokenId,
            msg,
          },
        },
        funds: [],
      }
    }

    const approve = (spender: string, tokenId: string, expires?: Expiration) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          approve: {
            spender,
            token_id: tokenId,
            expires,
          },
        },
        funds: [],
      }
    }

    const revoke = (spender: string, tokenId: string) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          revoke: {
            spender,
            token_id: tokenId,
          },
        },
        funds: [],
      }
    }

    const approveAll = (operator: string, expires?: Expiration) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          approve_all: {
            operator,
            expires,
          },
        },
        funds: [],
      }
    }

    const revokeAll = (operator: string) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          revoke_all: {
            operator,
          },
        },
        funds: [],
      }
    }

    const mint = (tokenId: string, owner: string, tokenURI?: string) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          mint: {
            token_id: tokenId,
            owner,
            token_uri: tokenURI,
          },
        },
        funds: [],
      }
    }

    const updateRoyaltyInfo = (royaltyInfo: RoyaltyInfo) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_royalty_info: {
            payment_address: royaltyInfo.payment_address,
            share_bps: royaltyInfo.share_bps,
          },
        },
        funds: [],
      }
    }

    const burn = (tokenId: string) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          burn: {
            token_id: tokenId,
          },
        },
        funds: [],
      }
    }

    const batchBurn = (tokenIds: string): BatchBurnMessage => {
      const msg: Record<string, unknown>[] = []
      if (tokenIds.includes(':')) {
        const [start, end] = tokenIds.split(':').map(Number)
        for (let i = start; i <= end; i++) {
          msg.push({
            burn: { token_id: i.toString() },
          })
        }
      } else {
        const tokenNumbers = tokenIds.split(',').map(Number)
        for (let i = 0; i < tokenNumbers.length; i++) {
          msg.push({ burn: { token_id: tokenNumbers[i].toString() } })
        }
      }

      return {
        sender: txSigner,
        contract: contractAddress,
        msg,
        funds: [],
      }
    }

    const batchTransfer = (recipient: string, tokenIds: string): BatchTransferMessage => {
      const msg: Record<string, unknown>[] = []
      if (tokenIds.includes(':')) {
        const [start, end] = tokenIds.split(':').map(Number)
        for (let i = start; i <= end; i++) {
          msg.push({
            trasnfer_nft: { recipient, token_id: i.toString() },
          })
        }
      } else {
        const tokenNumbers = tokenIds.split(',').map(Number)
        for (let i = 0; i < tokenNumbers.length; i++) {
          msg.push({ trasnfer_nft: { recipient, token_id: tokenNumbers[i].toString() } })
        }
      }

      return {
        sender: txSigner,
        contract: contractAddress,
        msg,
        funds: [],
      }
    }

    const batchUpdateTokenMetadata = (tokenIds: string, baseURI?: string): BatchUpdateTokenMetadataMessage => {
      const msg: Record<string, unknown>[] = []
      if (tokenIds.includes(':')) {
        const [start, end] = tokenIds.split(':').map(Number)
        for (let i = start; i <= end; i++) {
          msg.push({
            update_token_metadata: { token_id: i.toString(), token_uri: baseURI ? `${baseURI}/${i}` : '' },
          })
        }
      } else {
        const tokenNumbers = tokenIds.split(',').map(Number)
        for (let i = 0; i < tokenNumbers.length; i++) {
          msg.push({
            update_token_metadata: {
              token_id: tokenNumbers[i].toString(),
              token_uri: baseURI ? `${baseURI}/${tokenNumbers[i]}` : '',
            },
          })
        }
      }

      return {
        sender: txSigner,
        contract: contractAddress,
        msg,
        funds: [],
      }
    }

    const updateTokenMetadata = (tokenId: string, tokenURI?: string) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_token_metadata: {
            token_id: tokenId,
            token_uri: tokenURI ? tokenURI : '',
          },
        },
        funds: [],
      }
    }

    const freezeTokenMetadata = () => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          freeze_token_metadata: {},
        },
        funds: [],
      }
    }

    return {
      transferNft,
      sendNft,
      approve,
      revoke,
      approveAll,
      revokeAll,
      mint,
      updateRoyaltyInfo,
      burn,
      batchBurn,
      batchTransfer,
      batchUpdateTokenMetadata,
      updateTokenMetadata,
      freezeTokenMetadata,
    }
  }

  return { use, instantiate, migrate, messages }
}
