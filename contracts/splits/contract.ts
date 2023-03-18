import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { Coin } from '@cosmjs/proto-signing'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface SplitsInstance {
  readonly contractAddress: string
  //Query
  getAdmin: () => Promise<string>
  getMemberWeight: (member: string) => Promise<string>
  listMembers: (startAfter?: string, limit?: number) => Promise<string[]>
  getGroup: () => Promise<string>

  //Execute
  updateAdmin: (admin: string) => Promise<string>
  distribute: () => Promise<string>
}

export interface SplitsMessages {
  updateAdmin: (admin: string) => UpdateAdminMessage
  distribute: () => DistributeMessage
}

export interface UpdateAdminMessage {
  sender: string
  contract: string
  msg: {
    update_admin: { admin: string }
  }
  funds: Coin[]
}

export interface DistributeMessage {
  sender: string
  contract: string
  msg: { distribute: Record<string, never> }
  funds: Coin[]
}

export interface SplitsContract {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => SplitsInstance

  messages: (contractAddress: string) => SplitsMessages
}

export const Splits = (client: SigningCosmWasmClient, txSigner: string): SplitsContract => {
  const use = (contractAddress: string): SplitsInstance => {
    ///QUERY
    const listMembers = async (startAfter?: string, limit?: number): Promise<string[]> => {
      return client.queryContractSmart(contractAddress, {
        list_members: { limit, start_after: startAfter },
      })
    }

    const getMemberWeight = async (address: string): Promise<string> => {
      return client.queryContractSmart(contractAddress, {
        member: { address },
      })
    }

    const getAdmin = async (): Promise<string> => {
      return client.queryContractSmart(contractAddress, {
        admin: {},
      })
    }

    const getGroup = async (): Promise<string> => {
      return client.queryContractSmart(contractAddress, {
        group: {},
      })
    }
    /// EXECUTE
    const updateAdmin = async (admin: string): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          update_admin: {
            admin,
          },
        },
        'auto',
      )
      return res.transactionHash
    }

    const distribute = async (): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          distribute: {},
        },
        'auto',
      )
      return res.transactionHash
    }
    return {
      contractAddress,
      updateAdmin,
      distribute,
      getMemberWeight,
      getAdmin,
      listMembers,
      getGroup,
    }
  }

  const instantiate = async (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ): Promise<InstantiateResponse> => {
    const result = await client.instantiate(txSigner, codeId, initMsg, label, 'auto', {
      admin,
    })

    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
    }
  }

  const messages = (contractAddress: string) => {
    const updateAdmin = (admin: string) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_admin: { admin },
        },
        funds: [],
      }
    }

    const distribute = () => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          distribute: {},
        },
        funds: [],
      }
    }

    return {
      updateAdmin,
      distribute,
    }
  }

  return { use, instantiate, messages }
}
