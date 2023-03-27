import type { WhiteListInstance } from '../index'
import { useWhiteListContract } from '../index'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = [
  'update_start_time',
  'update_end_time',
  'add_members',
  'remove_members',
  'update_per_address_limit',
  'increase_member_limit',
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
    id: 'update_per_address_limit',
    name: 'Update Per Address Limit',
    description: `Update tokens per address limit`,
  },
  {
    id: 'increase_member_limit',
    name: 'Increase Member Limit',
    description: `Increase the member limit of the whitelist`,
  },
]

export interface DispatchExecuteProps {
  type: ExecuteType
  [k: string]: unknown
}

type Select<T extends ExecuteType> = T

/** @see {@link WhiteListInstance} */
export type DispatchExecuteArgs = {
  contract: string
  messages?: WhiteListInstance
} & (
  | { type: undefined }
  | { type: Select<'update_start_time'>; timestamp: string }
  | { type: Select<'update_end_time'>; timestamp: string }
  | { type: Select<'add_members'>; members: string[] }
  | { type: Select<'remove_members'>; members: string[] }
  | { type: Select<'update_per_address_limit'>; limit: number }
  | { type: Select<'increase_member_limit'>; limit: number }
)

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
    case 'add_members': {
      return messages.addMembers(args.members)
    }
    case 'remove_members': {
      return messages.removeMembers(args.members)
    }
    case 'update_per_address_limit': {
      return messages.updatePerAddressLimit(args.limit)
    }
    case 'increase_member_limit': {
      return messages.increaseMemberLimit(args.limit)
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
    case 'update_start_time': {
      return messages(contract)?.updateStartTime(args.timestamp)
    }
    case 'update_end_time': {
      return messages(contract)?.updateEndTime(args.timestamp)
    }
    case 'add_members': {
      return messages(contract)?.addMembers(args.members)
    }
    case 'remove_members': {
      return messages(contract)?.removeMembers(args.members)
    }
    case 'update_per_address_limit': {
      return messages(contract)?.updatePerAddressLimit(args.limit)
    }
    case 'increase_member_limit': {
      return messages(contract)?.increaseMemberLimit(args.limit)
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
