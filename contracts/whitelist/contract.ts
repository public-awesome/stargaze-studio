import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { Coin } from '@cosmjs/proto-signing'
import { coin } from '@cosmjs/proto-signing'
import type { WhitelistFlexMember } from 'components/WhitelistFlexUpload'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface ConfigResponse {
  readonly num_members: number
  readonly per_address_limit: number
  readonly member_limit: number
  readonly start_time: string
  readonly end_time: string
  readonly mint_price: Coin
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
  adminList: () => Promise<string[]>
  config: () => Promise<ConfigResponse>

  //Execute
  updateStartTime: (startTime: string) => Promise<string>
  updateEndTime: (endTime: string) => Promise<string>
  addMembers: (memberList: string[] | WhitelistFlexMember[]) => Promise<string>
  removeMembers: (memberList: string[]) => Promise<string>
  updatePerAddressLimit: (limit: number) => Promise<string>
  increaseMemberLimit: (limit: number) => Promise<string>
  updateAdmins: (admins: string[]) => Promise<string>
  freeze: () => Promise<string>
}

export interface WhitelistMessages {
  updateStartTime: (startTime: string) => UpdateStartTimeMessage
  updateEndTime: (endTime: string) => UpdateEndTimeMessage
  addMembers: (memberList: string[] | WhitelistFlexMember[]) => AddMembersMessage
  removeMembers: (memberList: string[]) => RemoveMembersMessage
  updatePerAddressLimit: (limit: number) => UpdatePerAddressLimitMessage
  increaseMemberLimit: (limit: number) => IncreaseMemberLimitMessage
  updateAdmins: (admins: string[]) => UpdateAdminsMessage
  freeze: () => FreezeMessage
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

export interface UpdateAdminsMessage {
  sender: string
  contract: string
  msg: {
    update_admins: { admins: string[] }
  }
  funds: Coin[]
}

export interface FreezeMessage {
  sender: string
  contract: string
  msg: { freeze: Record<string, never> }
  funds: Coin[]
}
export interface AddMembersMessage {
  sender: string
  contract: string
  msg: {
    add_members: { to_add: string[] | WhitelistFlexMember[] }
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

    const adminList = async (): Promise<string[]> => {
      return client.queryContractSmart(contractAddress, {
        admin_list: {},
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

    const addMembers = async (memberList: string[] | WhitelistFlexMember[]): Promise<string> => {
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

    const updateAdmins = async (admins: string[]): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          update_admins: {
            admins,
          },
        },
        'auto',
      )
      return res.transactionHash
    }

    const freeze = async (): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          freeze: {},
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
      const whitelistConfig = await config()
      const currentLimit = Number(whitelistConfig.member_limit)
      const upgradeFee = (Math.ceil(limit / 1000) - Math.ceil(currentLimit / 1000)) * 100000000
      const res = await client.execute(
        txSigner,
        contractAddress,
        { increase_member_limit: limit },
        'auto',
        'Increase Member Limit',
        upgradeFee === 0 ? undefined : [coin(upgradeFee.toString(), 'ustars')],
      )
      return res.transactionHash
    }
    /// EXECUTE END

    return {
      contractAddress,
      updateStartTime,
      updateEndTime,
      updateAdmins,
      freeze,
      addMembers,
      removeMembers,
      updatePerAddressLimit,
      increaseMemberLimit,
      hasStarted,
      hasEnded,
      isActive,
      members,
      hasMember,
      adminList,
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
      funds: [coin((Math.ceil(Number(initMsg.member_limit) / 1000) * 100000000).toString(), 'ustars')],
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

    const addMembers = (memberList: string[] | WhitelistFlexMember[]) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          add_members: { to_add: memberList },
        },
        funds: [],
      }
    }

    const updateAdmins = (admins: string[]) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_admins: { admins },
        },
        funds: [],
      }
    }

    const freeze = () => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          freeze: {},
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
      updateAdmins,
      addMembers,
      removeMembers,
      updatePerAddressLimit,
      increaseMemberLimit,
      freeze,
    }
  }

  return { use, instantiate, messages }
}
