import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { Coin } from '@cosmjs/stargate'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export type Expiration =
  | { at_height: number }
  | { at_time: string }
  | { never: {} }

export interface SG721Instance {
  readonly contractAddress: string

  // queries
  getOwnerOf: (
    token_id: string,
    include_expired: boolean | null
  ) => Promise<any>

  getApproval: (
    token_id: string,
    spender: string,
    include_expired: boolean | null
  ) => Promise<any>

  getApprovals: (
    token_id: string,
    include_expired: boolean | null
  ) => Promise<any>

  getAllOperators: (
    owner: string,
    include_expired: boolean | null,
    start_after: string | null,
    limit: number | null
  ) => Promise<any>

  getNumTokens: () => Promise<any>

  getContractInfo: () => Promise<any>

  getNftInfo: (token_id: string) => Promise<any>

  getAllNftInfo: (
    token_id: string,
    include_expired: boolean | null
  ) => Promise<any>

  getTokens: (
    owner: string,
    start_after: string | null,
    limit: number | null
  ) => Promise<any>

  getAllTokens: (
    start_after: string | null,
    limit: number | null
  ) => Promise<any>

  getMinter: () => Promise<any>

  getCollectionInfo: () => Promise<any>

  //Execute
  transferNft: (
    senderAddress: string,
    recipient: string,
    token_id: string
  ) => Promise<string>
  /// Send is a base message to transfer a token to a contract and trigger an action
  /// on the receiving contract.
  sendNft: (
    senderAddress: string,
    contract: string,
    token_id: string,
    msg: string //Binary
  ) => Promise<string>
  /// Allows operator to transfer / send the token from the owner's account.
  /// If expiration is set, then this allowance has a time/height limit
  approve: (
    senderAddress: string,
    spender: string,
    token_id: string,
    expires: Expiration | null
  ) => Promise<string>
  /// Remove previously granted Approval
  revoke: (
    senderAddress: string,
    spender: string,
    token_id: string
  ) => Promise<string>
  /// Allows operator to transfer / send any token from the owner's account.
  /// If expiration is set, then this allowance has a time/height limit
  approveAll: (
    senderAddress: string,
    operator: string,
    expires: Expiration | null
  ) => Promise<string>
  /// Remove previously granted ApproveAll permission
  revokeAll: (senderAddress: string, operator: string) => Promise<string>
  /// Mint a new NFT, can only be called by the contract minter
  mint: (senderAddress: string, msg: string) => Promise<string> //MintMsg<T>

  /// Burn an NFT the sender has access to
  burn: (senderAddress: string, token_id: string) => Promise<string>
}

export interface SG721Contract {
  instantiate: (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    funds: Coin[],
    admin?: string
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => SG721Instance
}

export const SG721 = (client: SigningCosmWasmClient): SG721Contract => {
  const use = (contractAddress: string): SG721Instance => {
    const encode = (str: string): string =>
      Buffer.from(str, 'binary').toString('base64')

    const getOwnerOf = async (
      token_id: string,
      include_expired: boolean | null
    ): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        owner_of: { token_id, include_expired },
      })
      return res
    }

    const getApproval = async (
      token_id: string,
      spender: string,
      include_expired: boolean | null
    ): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        approval: { token_id, spender, include_expired },
      })
      return res
    }

    const getApprovals = async (
      token_id: string,
      include_expired: boolean | null
    ): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        approvals: { token_id, include_expired },
      })
      return res
    }

    const getAllOperators = async (
      owner: string,
      include_expired: boolean | null,
      start_after: string | null,
      limit: number | null
    ): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        all_operators: { owner, include_expired, start_after, limit },
      })
      return res
    }

    const getNumTokens = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        num_tokens: {},
      })
      return res
    }

    const getContractInfo = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        contract_info: {},
      })
      return res
    }

    const getNftInfo = async (token_id: string): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        nft_info: { token_id },
      })
      return res
    }

    const getAllNftInfo = async (
      token_id: string,
      include_expired: boolean | null
    ): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        all_nft_info: { token_id, include_expired },
      })
      return res
    }

    const getTokens = async (
      owner: string,
      start_after: string | null,
      limit: number | null
    ): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        tokens: { owner, start_after, limit },
      })
      return res
    }

    const getAllTokens = async (
      start_after: string | null,
      limit: number | null
    ): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        all_tokens: { start_after, limit },
      })
      return res
    }

    const getMinter = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        minter: {},
      })
      return res
    }

    const getCollectionInfo = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        collection_info: {},
      })
      return res
    }

    //Execute
    const transferNft = async (
      senderAddress: string,
      recipient: string,
      token_id: string
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          transfer_nft: { recipient, token_id },
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    const sendNft = async (
      senderAddress: string,
      contract: string,
      token_id: string,
      msg: string //Binary
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          send_nft: { contract, token_id, msg: encode(msg) },
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    const approve = async (
      senderAddress: string,
      spender: string,
      token_id: string,
      expires: Expiration | null
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          approve: { spender, token_id, expires },
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    const revoke = async (
      senderAddress: string,
      spender: string,
      token_id: string
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          revoke: { spender, token_id },
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    const approveAll = async (
      senderAddress: string,
      operator: string,
      expires: Expiration | null
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          approve_all: { operator, expires },
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    const revokeAll = async (
      senderAddress: string,
      operator: string
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          revoke_all: { operator },
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    const mint = async (
      senderAddress: string,
      msg: string
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          mint: { msg },
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    const burn = async (
      senderAddress: string,
      token_id: string
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          burn: { token_id },
        },
        'auto',
        ''
      )

      return res.transactionHash
    }

    return {
      contractAddress,
      getOwnerOf,
      getApproval,
      getApprovals,
      getAllOperators,
      getNumTokens,
      getContractInfo,
      getNftInfo,
      getAllNftInfo,
      getTokens,
      getAllTokens,
      getMinter,
      getCollectionInfo,
      transferNft,
      sendNft,
      approve,
      revoke,
      approveAll,
      revokeAll,
      mint,
      burn,
    }
  }

  const instantiate = async (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    funds: Coin[],
    admin?: string
  ): Promise<InstantiateResponse> => {
    const result = await client.instantiate(
      senderAddress,
      codeId,
      initMsg,
      label,
      'auto',
      {
        funds,
        memo: '',
        admin,
      }
    )
    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
    }
  }

  return { use, instantiate }
}
