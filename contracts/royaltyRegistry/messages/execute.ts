import type { RoyaltyRegistryInstance } from '../index'
import { useRoyaltyRegistryContract } from '../index'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = [
  'initialize_collection_royalty',
  'set_collection_royalty_default',
  'update_collection_royalty_default',
  'set_collection_royalty_protocol',
  'update_collection_royalty_protocol',
] as const

export interface ExecuteListItem {
  id: ExecuteType
  name: string
  description?: string
}

export const EXECUTE_LIST: ExecuteListItem[] = [
  {
    id: 'initialize_collection_royalty',
    name: 'Initialize Collection Royalty',
    description: 'Initialize collection royalty',
  },
  {
    id: 'set_collection_royalty_default',
    name: 'Set Collection Royalty Default',
    description: 'Set collection royalty default',
  },
  {
    id: 'update_collection_royalty_default',
    name: 'Update Collection Royalty Default',
    description: 'Update collection royalty default',
  },
  {
    id: 'set_collection_royalty_protocol',
    name: 'Set Collection Royalty Protocol',
    description: 'Set collection royalty protocol',
  },
  {
    id: 'update_collection_royalty_protocol',
    name: 'Update Collection Royalty Protocol',
    description: 'Update collection royalty protocol',
  },
]

export interface DispatchExecuteProps {
  type: ExecuteType
  [k: string]: unknown
}

type Select<T extends ExecuteType> = T
/** @see {@link RoyaltyRegistryInstance} */
export type DispatchExecuteArgs = {
  contract: string
  messages?: RoyaltyRegistryInstance
} & (
  | { type: Select<'initialize_collection_royalty'>; collection: string }
  | { type: Select<'set_collection_royalty_default'>; collection: string; recipient: string; royalty: number }
  | {
      type: Select<'update_collection_royalty_default'>
      collection: string
      recipient: string
      shareDelta: number
      decrement: boolean
    }
  | {
      type: Select<'set_collection_royalty_protocol'>
      collection: string
      protocol: string
      recipient: string
      royalty: number
    }
  | {
      type: Select<'update_collection_royalty_protocol'>
      collection: string
      protocol: string
      recipient: string
      shareDelta: number
      decrement: boolean
    }
)

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages } = args
  if (!messages) {
    throw new Error('Cannot dispatch execute, messages are not defined')
  }
  switch (args.type) {
    case 'initialize_collection_royalty': {
      return messages.initializeCollectionRoyalty(args.collection)
    }
    case 'set_collection_royalty_default': {
      return messages.setCollectionRoyaltyDefault(args.collection, args.recipient, args.royalty)
    }
    case 'update_collection_royalty_default': {
      return messages.updateCollectionRoyaltyDefault(args.collection, args.recipient, args.shareDelta, args.decrement)
    }
    case 'set_collection_royalty_protocol': {
      return messages.setCollectionRoyaltyProtocol(args.collection, args.protocol, args.recipient, args.royalty)
    }
    case 'update_collection_royalty_protocol': {
      return messages.updateCollectionRoyaltyProtocol(
        args.collection,
        args.protocol,
        args.recipient,
        args.shareDelta,
        args.decrement,
      )
    }
    default: {
      throw new Error('Unknown execution type')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useRoyaltyRegistryContract()
  const { contract } = args
  switch (args.type) {
    case 'initialize_collection_royalty': {
      return messages(contract)?.initializeCollectionRoyalty(args.collection)
    }
    case 'set_collection_royalty_default': {
      return messages(contract)?.setCollectionRoyaltyDefault(args.collection, args.recipient, args.royalty)
    }
    case 'update_collection_royalty_default': {
      return messages(contract)?.updateCollectionRoyaltyDefault(
        args.collection,
        args.recipient,
        args.shareDelta,
        args.decrement,
      )
    }
    case 'set_collection_royalty_protocol': {
      return messages(contract)?.setCollectionRoyaltyProtocol(
        args.collection,
        args.protocol,
        args.recipient,
        args.royalty,
      )
    }
    case 'update_collection_royalty_protocol': {
      return messages(contract)?.updateCollectionRoyaltyProtocol(
        args.collection,
        args.protocol,
        args.recipient,
        args.shareDelta,
        args.decrement,
      )
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
