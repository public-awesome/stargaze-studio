import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { type Coin, coin } from '@cosmjs/proto-signing'
import type { Stage } from 'contracts/whitelist/messages/execute'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface ConfigResponse {
  readonly per_address_limit: number
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

export interface WhiteListMerkleTreeInstance {
  readonly contractAddress: string
  //Query
  hasStarted: () => Promise<boolean>
  hasEnded: () => Promise<boolean>
  isActive: () => Promise<boolean>
  hasMember: (member: string, proof_hashes: string[]) => Promise<boolean>
  adminList: () => Promise<string[]>
  config: () => Promise<ConfigResponse>
  activeStage: () => Promise<StageResponse>
  stages: () => Promise<StagesResponse>
  stage: (stageId: number) => Promise<StageResponse>
  canExecute: (sender: string, msg: string) => Promise<boolean>
  merkleRoots: () => Promise<string[]>
  merkleTreeUris: () => Promise<string[]>

  //Execute
  updateStageConfig: (
    stageId: number,
    name?: string,
    startTime?: string,
    endTime?: string,
    perAddressLimit?: number,
    mintPrice?: Coin,
  ) => Promise<string>
  updateAdmins: (admins: string[]) => Promise<string>
  freeze: () => Promise<string>
}

export interface WhiteListMerkleTreeMessages {
  updateStageConfig: (
    stageId: number,
    name?: string,
    startTime?: string,
    endTime?: string,
    perAddressLimit?: number,
    mintPrice?: Coin,
  ) => UpdateStageConfigMessage
  updateAdmins: (admins: string[]) => UpdateAdminsMessage
  freeze: () => FreezeMessage
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

export interface WhiteListMerkleTreeContract {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => WhiteListMerkleTreeInstance

  messages: (contractAddress: string) => WhiteListMerkleTreeMessages
}

export const WhiteListMerkleTree = (client: SigningCosmWasmClient, txSigner: string): WhiteListMerkleTreeContract => {
  const use = (contractAddress: string): WhiteListMerkleTreeInstance => {
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

    const hasMember = async (member: string, proofHashes: string[]): Promise<boolean> => {
      return client.queryContractSmart(contractAddress, {
        has_member: { member, proof_hashes: proofHashes },
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

    const merkleRoots = async (): Promise<string[]> => {
      return client.queryContractSmart(contractAddress, {
        merkle_roots: {},
      })
    }

    const merkleTreeUris = async (): Promise<string[]> => {
      return client.queryContractSmart(contractAddress, {
        merkle_tree_u_r_is: {},
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

    const canExecute = async (sender: string, msg: string): Promise<boolean> => {
      return client.queryContractSmart(contractAddress, {
        can_execute: { sender, msg },
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

    /// EXECUTE END

    return {
      contractAddress,
      updateStageConfig,
      updateAdmins,
      freeze,
      hasStarted,
      hasEnded,
      isActive,
      hasMember,
      adminList,
      config,
      activeStage,
      stages,
      stage,
      merkleRoots,
      merkleTreeUris,
      canExecute,
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
      funds: [coin(1000000000, 'ustars')],
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

    return {
      updateStageConfig,
      updateAdmins,
      freeze,
    }
  }

  return { use, instantiate, messages }
}
