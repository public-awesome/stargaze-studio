import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { Coin } from '@cosmjs/proto-signing'
import { coin } from '@cosmjs/proto-signing'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface ConfigResponse {
  readonly num_members: number
  readonly per_address: number
  readonly member_limit: number
  readonly start_time: string
  readonly end_time: string
  readonly unit_price: Coin
  readonly is_active: boolean
}
export interface WhiteListInstance {
  readonly contractAddress: string
  //Query
  hasStarted: () => Promise<boolean>
  hasEnded: () => Promise<boolean>
  isActive: () => Promise<boolean>
  members: (startAfter?: string, limit?: number) => Promise<string[]>
  hasMember: (member: string) => Promise<boolean>
  config: () => Promise<ConfigResponse>

  //Execute
  updateStartTime: (startTime: string) => Promise<string>
  updateEndTime: (endTime: string) => Promise<string>
  addMembers: (memberList: string[]) => Promise<string>
  removeMembers: (memberList: string[]) => Promise<string>
  updatePerAddressLimit: (limit: number) => Promise<string>
  increaseMemberLimit: (limit: number) => Promise<string>
}

export interface WhitelistMessages {
  updateStartTime: (startTime: string) => UpdateStartTimeMessage
  updateEndTime: (endTime: string) => UpdateEndTimeMessage
  addMembers: (memberList: string[]) => AddMembersMessage
  removeMembers: (memberList: string[]) => RemoveMembersMessage
  updatePerAddressLimit: (limit: number) => UpdatePerAddressLimitMessage
  increaseMemberLimit: (limit: number) => IncreaseMemberLimitMessage
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

export interface AddMembersMessage {
  sender: string
  contract: string
  msg: {
    add_members: { to_add: string[] }
  }
  funds: Coin[]
}

export interface RemoveMembersMessage {
  sender: string
  contract: string
  msg: {
    remove_members: { to_remove: string[] }
  }
  funds: Coin[]
}

export interface UpdatePerAddressLimitMessage {
  sender: string

  contract: string
  msg: {
    update_per_address_limit: number
  }
  funds: Coin[]
}

export interface IncreaseMemberLimitMessage {
  sender: string
  contract: string
  msg: {
    increase_member_limit: number
  }
  funds: Coin[]
}

export interface WhiteListContract {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => WhiteListInstance

  messages: (contractAddress: string) => WhitelistMessages
}

export const WhiteList = (client: SigningCosmWasmClient, txSigner: string): WhiteListContract => {
  const use = (contractAddress: string): WhiteListInstance => {
    ///QUERY START
    const hasStarted = async (): Promise<boolean> => {
      return client.queryContractSmart(contractAddress, { has_started: {} })
    }

    const hasEnded = async (): Promise<boolean> => {
      return client.queryContractSmart(contractAddress, { has_ended: {} })
    }

    const isActive = async (): Promise<boolean> => {
      return client.queryContractSmart(contractAddress, { is_active: {} })
    }

    const members = async (startAfter?: string, limit?: number): Promise<string[]> => {
      return client.queryContractSmart(contractAddress, {
        members: { limit, start_after: startAfter },
      })
    }

    const hasMember = async (member: string): Promise<boolean> => {
      return client.queryContractSmart(contractAddress, {
        has_member: { member },
      })
    }

    const config = async (): Promise<ConfigResponse> => {
      return client.queryContractSmart(contractAddress, {
        config: {},
      })
    }
    /// QUERY END
    /// EXECUTE START
    const updateStartTime = async (startTime: string): Promise<string> => {
      const res = await client.execute(txSigner, contractAddress, { update_start_time: startTime }, 'auto')
      return res.transactionHash
    }

    const updateEndTime = async (endTime: string): Promise<string> => {
      const res = await client.execute(txSigner, contractAddress, { update_end_time: endTime }, 'auto')
      return res.transactionHash
    }

    const addMembers = async (memberList: string[]): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          add_members: {
            to_add: memberList,
          },
        },
        'auto',
      )
      return res.transactionHash
    }

    const removeMembers = async (memberList: string[]): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          remove_members: {
            to_remove: memberList,
          },
        },
        'auto',
      )
      return res.transactionHash
    }

    const updatePerAddressLimit = async (limit: number): Promise<string> => {
      const res = await client.execute(txSigner, contractAddress, { update_per_address_limit: limit }, 'auto')
      return res.transactionHash
    }

    const increaseMemberLimit = async (limit: number): Promise<string> => {
      const res = await client.execute(txSigner, contractAddress, { increase_member_limit: limit }, 'auto')
      return res.transactionHash
    }
    /// EXECUTE END

    return {
      contractAddress,
      updateStartTime,
      updateEndTime,
      addMembers,
      removeMembers,
      updatePerAddressLimit,
      increaseMemberLimit,
      hasStarted,
      hasEnded,
      isActive,
      members,
      hasMember,
      config,
    }
  }

  const instantiate = async (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ): Promise<InstantiateResponse> => {
    const result = await client.instantiate(txSigner, codeId, initMsg, label, 'auto', {
      funds: [coin('100000000', 'ustars')],
      admin,
    })

    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
    }
  }

  const messages = (contractAddress: string) => {
    const updateStartTime = (startTime: string) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_start_time: startTime,
        },
        funds: [],
      }
    }

    const updateEndTime = (endTime: string) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_end_time: endTime,
        },
        funds: [],
      }
    }

    const addMembers = (memberList: string[]) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          add_members: { to_add: memberList },
        },
        funds: [],
      }
    }

    const removeMembers = (memberList: string[]) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          remove_members: { to_remove: memberList },
        },
        funds: [],
      }
    }

    const updatePerAddressLimit = (limit: number) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_per_address_limit: limit,
        },
        funds: [],
      }
    }

    const increaseMemberLimit = (limit: number) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          increase_member_limit: limit,
        },
        funds: [],
      }
    }

    return {
      updateStartTime,
      updateEndTime,
      addMembers,
      removeMembers,
      updatePerAddressLimit,
      increaseMemberLimit,
    }
  }

  return { use, instantiate, messages }
}
