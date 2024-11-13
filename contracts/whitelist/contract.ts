/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-shadow */
import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { Coin } from '@cosmjs/proto-signing'
import { coin } from '@cosmjs/proto-signing'
import type { WhitelistFlexMember } from 'components/WhitelistFlexUpload'

import type { Stage } from './messages/execute'

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

export interface StageResponse {
  readonly stage: Stage
}

export interface StagesResponse {
  readonly stages: Stage[]
}

export interface StageMemberInfoResponse {
  readonly stage_id: number
  readonly is_member: boolean
  readonly per_address_limit: number
}

export interface AllStageMemberInfoResponse {
  readonly all_stage_member_info: StageMemberInfoResponse[]
}

export interface WhiteListInstance {
  readonly contractAddress: string
  //Query
  hasStarted: () => Promise<boolean>
  hasEnded: () => Promise<boolean>
  isActive: () => Promise<boolean>
  members: (stageId: number, startAfter?: string, limit?: number) => Promise<string[]>
  hasMember: (member: string) => Promise<boolean>
  adminList: () => Promise<string[]>
  activeStage: () => Promise<StageResponse>
  stages: () => Promise<StagesResponse>
  stage: (stageId: number) => Promise<StageResponse>
  config: () => Promise<ConfigResponse>
  stageMemberInfo: (stageId: number, member: string) => Promise<StageMemberInfoResponse>
  allStageMemberInfo: (member: string) => Promise<AllStageMemberInfoResponse>

  //Execute
  updateStageConfig: (
    stageId: number,
    name?: string,
    startTime?: string,
    endTime?: string,
    perAddressLimit?: number,
    mintPrice?: Coin,
  ) => Promise<string>
  addMembers: (stageId: number, memberList: string[] | WhitelistFlexMember[]) => Promise<string>
  removeMembers: (stageId: number, memberList: string[]) => Promise<string>
  increaseMemberLimit: (limit: number) => Promise<string>
  updateAdmins: (admins: string[]) => Promise<string>
  freeze: () => Promise<string>
  addStage: (
    name: string,
    startTime: string,
    endTime: string,
    perAddressLimit: number,
    mintPrice: Coin,
    members: string[],
  ) => Promise<string>
  removeStage: (stageId: number) => Promise<string>
}

export interface WhitelistMessages {
  updateStageConfig: (
    stageId: number,
    name?: string,
    startTime?: string,
    endTime?: string,
    perAddressLimit?: number,
    mintPrice?: Coin,
  ) => UpdateStageConfigMessage
  addMembers: (stageId: number, memberList: string[] | WhitelistFlexMember[]) => AddMembersMessage
  removeMembers: (stageId: number, memberList: string[]) => RemoveMembersMessage
  increaseMemberLimit: (limit: number) => IncreaseMemberLimitMessage
  updateAdmins: (admins: string[]) => UpdateAdminsMessage
  freeze: () => FreezeMessage
  addStage: (
    name: string,
    startTime: string,
    endTime: string,
    perAddressLimit: number,
    mintPrice: Coin,
    members: string[],
  ) => AddStageMessage
  removeStage: (stageId: number) => RemoveStageMessage
}

export interface UpdateStageConfigMessage {
  sender: string
  contract: string
  msg: {
    update_stage_config: {
      stage_id: number
      name?: string
      start_time?: string
      end_time?: string
      per_address_limit?: number
      mint_price?: Coin
    }
  }
  funds: Coin[]
}

export interface AddStageMessage {
  sender: string
  contract: string
  msg: {
    add_stage: {
      stage: {
        name: string
        start_time: string
        end_time: string
        per_address_limit: number
        mint_price: Coin
      }
      members: string[]
    }
  }
  funds: Coin[]
}

export interface RemoveStageMessage {
  sender: string
  contract: string
  msg: {
    remove_stage: { stage_id: number }
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
    add_members: {
      stage_id: number
      to_add: string[] | WhitelistFlexMember[]
    }
  }
  funds: Coin[]
}

export interface RemoveMembersMessage {
  sender: string
  contract: string
  msg: {
    remove_members: {
      stage_id: number
      to_remove: string[]
    }
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

    const members = async (stageId: number, startAfter?: string, limit?: number): Promise<string[]> => {
      return client.queryContractSmart(contractAddress, {
        members: { stage_id: stageId, limit, start_after: startAfter },
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

    const activeStage = async (): Promise<StageResponse> => {
      return client.queryContractSmart(contractAddress, {
        active_stage: {},
      })
    }

    const stages = async (): Promise<StagesResponse> => {
      return client.queryContractSmart(contractAddress, {
        stages: {},
      })
    }

    const stage = async (stageId: number): Promise<StageResponse> => {
      return client.queryContractSmart(contractAddress, {
        stage: { stage_id: stageId },
      })
    }

    const stageMemberInfo = async (stageId: number, member: string): Promise<StageMemberInfoResponse> => {
      return client.queryContractSmart(contractAddress, {
        stage_member_info: { stage_id: stageId, member },
      })
    }

    const allStageMemberInfo = async (member: string): Promise<AllStageMemberInfoResponse> => {
      return client.queryContractSmart(contractAddress, {
        all_stage_member_info: { member },
      })
    }
    /// QUERY END
    /// EXECUTE START
    const updateStageConfig = async (
      stageId: number,
      name?: string,
      startTime?: string,
      endTime?: string,
      perAddressLimit?: number,
      mintPrice?: Coin,
    ): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          update_stage_config: {
            stage_id: stageId,
            name,
            start_time: startTime,
            end_time: endTime,
            per_address_limit: perAddressLimit,
            mint_price: mintPrice,
          },
        },
        'auto',
      )
      return res.transactionHash
    }

    const addMembers = async (stageId: number, memberList: string[] | WhitelistFlexMember[]): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          add_members: {
            stage_id: stageId,
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

    const removeMembers = async (stageId: number, memberList: string[]): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          remove_members: {
            stage_id: stageId,
            to_remove: memberList,
          },
        },
        'auto',
      )
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

    const addStage = async (
      name: string,
      startTime: string,
      endTime: string,
      perAddressLimit: number,
      mintPrice: Coin,
      members: string[],
    ): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          add_stage: {
            stage: {
              name,
              start_time: startTime,
              end_time: endTime,
              per_address_limit: perAddressLimit,
              mint_price: mintPrice,
            },
            members,
          },
        },
        'auto',
      )
      return res.transactionHash
    }

    const removeStage = async (stageId: number): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          remove_stage: {
            stage_id: stageId,
          },
        },
        'auto',
      )
      return res.transactionHash
    }
    /// EXECUTE END

    return {
      contractAddress,
      updateStageConfig,
      updateAdmins,
      freeze,
      addMembers,
      removeMembers,
      addStage,
      removeStage,
      increaseMemberLimit,
      hasStarted,
      hasEnded,
      isActive,
      members,
      hasMember,
      adminList,
      config,
      activeStage,
      stages,
      stage,
      stageMemberInfo,
      allStageMemberInfo,
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
    const updateStageConfig = (
      stageId: number,
      name?: string,
      startTime?: string,
      endTime?: string,
      perAddressLimit?: number,
      mintPrice?: Coin,
    ) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_stage_config: {
            stage_id: stageId,
            name,
            start_time: startTime,
            end_time: endTime,
            per_address_limit: perAddressLimit,
            mint_price: mintPrice,
          },
        },
        funds: [],
      }
    }

    const addMembers = (stageId: number, memberList: string[] | WhitelistFlexMember[]) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          add_members: { stage_id: stageId, to_add: memberList },
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

    const removeMembers = (stageId: number, memberList: string[]) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          remove_members: { stage_id: stageId, to_remove: memberList },
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

    const addStage = (
      name: string,
      startTime: string,
      endTime: string,
      perAddressLimit: number,
      mintPrice: Coin,
      members: string[],
    ) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          add_stage: {
            stage: {
              name,
              start_time: startTime,
              end_time: endTime,
              per_address_limit: perAddressLimit,
              mint_price: mintPrice,
            },
            members,
          },
        },
        funds: [],
      }
    }

    const removeStage = (stageId: number) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          remove_stage: { stage_id: stageId },
        },
        funds: [],
      }
    }

    return {
      updateStageConfig,
      updateAdmins,
      addMembers,
      removeMembers,
      increaseMemberLimit,
      freeze,
      addStage,
      removeStage,
    }
  }

  return { use, instantiate, messages }
}
