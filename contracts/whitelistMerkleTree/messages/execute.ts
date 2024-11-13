import type { Coin } from '@cosmjs/proto-signing'

import type { WhitelistFlexMember } from '../../../components/WhitelistFlexUpload'
import type { WhiteListMerkleTreeInstance } from '../index'
import { useWhiteListMerkleTreeContract } from '../index'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = ['update_stage_config', 'update_admins', 'freeze'] as const

export interface ExecuteListItem {
  id: ExecuteType
  name: string
  description?: string
}

export const EXECUTE_LIST: ExecuteListItem[] = [
  {
    id: 'update_stage_config',
    name: 'Update Stage Config',
    description: `Update the stage configuration of the whitelist`,
  },
  {
    id: 'update_admins',
    name: 'Update Admins',
    description: `Update the list of administrators for the whitelist`,
  },
  {
    id: 'freeze',
    name: 'Freeze',
    description: `Freeze the current state of the contract admin list`,
  },
]

export interface DispatchExecuteProps {
  type: ExecuteType
  [k: string]: unknown
}

/** @see {@link WhiteListMerkleTreeInstance} */
export interface DispatchExecuteArgs {
  contract: string
  messages?: WhiteListMerkleTreeInstance
  type: string | undefined
  timestamp: string
  members: string[] | WhitelistFlexMember[]
  limit: number
  admins: string[]
  startTime?: string
  endTime?: string
  perAddressLimit?: number
  stageId: number
  stageName?: string
  mintPrice?: Coin
}

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages } = args
  if (!messages) {
    throw new Error('cannot dispatch execute, messages is not defined')
  }
  switch (args.type) {
    case 'update_stage_config': {
      return messages.updateStageConfig(
        args.stageId,
        args.stageName,
        args.startTime,
        args.endTime,
        args.perAddressLimit,
        args.mintPrice,
      )
    }
    case 'update_admins': {
      return messages.updateAdmins(args.admins)
    }
    case 'freeze': {
      return messages.freeze()
    }
    default: {
      throw new Error('unknown execute type')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useWhiteListMerkleTreeContract()
  const { contract } = args
  switch (args.type) {
    case 'update_stage_config': {
      return messages(contract)?.updateStageConfig(
        args.stageId,
        args.stageName,
        args.startTime,
        args.endTime,
        args.perAddressLimit,
        args.mintPrice,
      )
    }
    case 'update_admins': {
      return messages(contract)?.updateAdmins(args.admins)
    }
    case 'freeze': {
      return messages(contract)?.freeze()
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
