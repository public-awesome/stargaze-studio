import type { SplitsInstance } from '../index'
import { useSplitsContract } from '../index'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = ['update_admin', 'distribute'] as const

export interface ExecuteListItem {
  id: ExecuteType
  name: string
  description?: string
}

export const EXECUTE_LIST: ExecuteListItem[] = [
  {
    id: 'update_admin',
    name: 'Update Admin',
    description: `Update the splits contract admin`,
  },
  {
    id: 'distribute',
    name: 'Distribute',
    description: `Distribute the revenue to the group members`,
  },
]

export interface DispatchExecuteProps {
  type: ExecuteType
  [k: string]: unknown
}

type Select<T extends ExecuteType> = T

/** @see {@link SplitsInstance} */
export type DispatchExecuteArgs = {
  contract: string
  messages?: SplitsInstance
} & ({ type: Select<'update_admin'>; admin: string } | { type: Select<'distribute'> })

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages } = args
  if (!messages) {
    throw new Error('Cannot dispatch execute, messages are not defined')
  }
  switch (args.type) {
    case 'update_admin': {
      return messages.updateAdmin(args.admin)
    }
    case 'distribute': {
      return messages.distribute()
    }
    default: {
      throw new Error('Unknown execution type')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useSplitsContract()
  const { contract } = args
  switch (args.type) {
    case 'update_admin': {
      return messages(contract)?.updateAdmin(args.admin)
    }
    case 'distribute': {
      return messages(contract)?.distribute()
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
