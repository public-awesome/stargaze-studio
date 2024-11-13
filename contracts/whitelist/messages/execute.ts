import type { Coin } from '@cosmjs/proto-signing'

import type { WhitelistFlexMember } from '../../../components/WhitelistFlexUpload'
import type { WhiteListInstance } from '../index'
import { useWhiteListContract } from '../index'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = [
  'update_admins',
  'add_members',
  'remove_members',
  'increase_member_limit',
  'update_stage_config',
  'add_stage',
  'remove_stage',
  'freeze',
] as const

export interface ExecuteListItem {
  id: ExecuteType
  name: string
  description?: string
}

export interface Stage {
  name?: string
  startTime?: string
  endTime?: string
  perAddressLimit?: number
  mintPrice?: Coin
}

export const EXECUTE_LIST: ExecuteListItem[] = [
  {
    id: 'update_admins',
    name: 'Update Admins',
    description: `Update the list of administrators for the whitelist`,
  },
  {
    id: 'add_members',
    name: 'Add Members',
    description: `Add members to the whitelist`,
  },
  {
    id: 'remove_members',
    name: 'Remove Members',
    description: `Remove members from the whitelist`,
  },
  {
    id: 'increase_member_limit',
    name: 'Increase Member Limit',
    description: `Increase the member limit of the whitelist`,
  },
  {
    id: 'update_stage_config',
    name: 'Update Stage Config',
    description: `Update the stage configuration of the whitelist`,
  },
  {
    id: 'add_stage',
    name: 'Add Stage',
    description: `Add a new stage to the whitelist`,
  },
  {
    id: 'remove_stage',
    name: 'Remove Stage',
    description: `Remove a stage from the whitelist`,
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

/** @see {@link WhiteListInstance} */
export interface DispatchExecuteArgs {
  contract: string
  messages?: WhiteListInstance
  type: string | undefined
  startTime?: string
  endTime?: string
  members: string[] | WhitelistFlexMember[]
  memberLimit: number
  perAddressLimit?: number
  admins: string[]
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
    case 'update_admins': {
      return messages.updateAdmins(args.admins)
    }
    case 'add_members': {
      return messages.addMembers(args.stageId, args.members)
    }
    case 'remove_members': {
      return messages.removeMembers(args.stageId, args.members as string[])
    }
    case 'increase_member_limit': {
      return messages.increaseMemberLimit(args.memberLimit)
    }
    case 'freeze': {
      return messages.freeze()
    }
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
    case 'add_stage': {
      return messages.addStage(
        args.stageName as string,
        args.startTime as string,
        args.endTime as string,
        args.perAddressLimit as number,
        args.mintPrice as Coin,
        args.members as string[],
      )
    }
    case 'remove_stage': {
      return messages.removeStage(args.stageId)
    }
    default: {
      throw new Error('unknown execute type')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useWhiteListContract()
  const { contract } = args
  switch (args.type) {
    case 'update_admins': {
      return messages(contract)?.updateAdmins(args.admins)
    }
    case 'add_members': {
      return messages(contract)?.addMembers(args.stageId, args.members)
    }
    case 'remove_members': {
      return messages(contract)?.removeMembers(args.stageId, args.members as string[])
    }
    case 'increase_member_limit': {
      return messages(contract)?.increaseMemberLimit(args.memberLimit)
    }
    case 'freeze': {
      return messages(contract)?.freeze()
    }
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
    case 'add_stage': {
      return messages(contract)?.addStage(
        args.stageName as string,
        args.startTime as string,
        args.endTime as string,
        args.perAddressLimit as number,
        args.mintPrice as Coin,
        args.members as string[],
      )
    }
    case 'remove_stage': {
      return messages(contract)?.removeStage(args.stageId)
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
