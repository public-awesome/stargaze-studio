import type { WhitelistFlexMember } from '../../../components/WhitelistFlexUpload'
import type { WhiteListMerkleTreeInstance } from '../index'
import { useWhiteListMerkleTreeContract } from '../index'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = [
  'update_start_time',
  'update_end_time',
  'update_admins',
  'add_members',
  'remove_members',
  // 'update_per_address_limit',
  'freeze',
] as const

export interface ExecuteListItem {
  id: ExecuteType
  name: string
  description?: string
}

export const EXECUTE_LIST: ExecuteListItem[] = [
  {
    id: 'update_start_time',
    name: 'Update Start Time',
    description: `Update the start time of the whitelist`,
  },
  {
    id: 'update_end_time',
    name: 'Update End Time',
    description: `Update the end time of the whitelist`,
  },
  {
    id: 'update_admins',
    name: 'Update Admins',
    description: `Update the list of administrators for the whitelist`,
  },
  // {
  //   id: 'add_members',
  //   name: 'Add Members',
  //   description: `Add members to the whitelist`,
  // },
  // {
  //   id: 'remove_members',
  //   name: 'Remove Members',
  //   description: `Remove members from the whitelist`,
  // },
  // {
  //   id: 'update_per_address_limit',
  //   name: 'Update Per Address Limit',
  //   description: `Update tokens per address limit`,
  // },
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
}

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages } = args
  if (!messages) {
    throw new Error('cannot dispatch execute, messages is not defined')
  }
  switch (args.type) {
    case 'update_start_time': {
      return messages.updateStartTime(args.timestamp)
    }
    case 'update_end_time': {
      return messages.updateEndTime(args.timestamp)
    }
    case 'update_admins': {
      return messages.updateAdmins(args.admins)
    }
    case 'add_members': {
      return messages.addMembers(args.members)
    }
    case 'remove_members': {
      return messages.removeMembers(args.members as string[])
    }
    // case 'update_per_address_limit': {
    //   return messages.updatePerAddressLimit(args.limit)
    // }
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
    case 'update_start_time': {
      return messages(contract)?.updateStartTime(args.timestamp)
    }
    case 'update_end_time': {
      return messages(contract)?.updateEndTime(args.timestamp)
    }
    case 'update_admins': {
      return messages(contract)?.updateAdmins(args.admins)
    }
    case 'add_members': {
      return messages(contract)?.addMembers(args.members)
    }
    case 'remove_members': {
      return messages(contract)?.removeMembers(args.members as string[])
    }
    // case 'update_per_address_limit': {
    //   return messages(contract)?.updatePerAddressLimit(args.limit)
    // }
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
