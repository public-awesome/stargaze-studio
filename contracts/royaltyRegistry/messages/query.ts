import type { RoyaltyRegistryInstance } from '../contract'

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_TYPES = [
  'config',
  'collection_royalty_default',
  'collection_royalty_protocol',
  'royalty_payment',
] as const
export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const QUERY_LIST: QueryListItem[] = [
  { id: 'config', name: 'Query Config', description: 'View the contract config' },
  {
    id: 'collection_royalty_default',
    name: 'Query Default Collection Royalty Details',
    description: 'View the default collection royalty details',
  },
  {
    id: 'collection_royalty_protocol',
    name: 'Query Collection Royalty for a Protocol',
    description: 'View the collection royalty for a specific protocol',
  },
  {
    id: 'royalty_payment',
    name: 'Query Royalty Payment',
    description: 'View the royalty payment',
  },
]
/*
  //Query
  config: () => Promise<string>
  collectionRoyaltyDefault: (collection: string) => Promise<string>
  collectionRoyaltyProtocol: (collection: string, protocol: string) => Promise<string>
  // RoyaltyProtocolByCollection: (collection: string, queryOptions: QqueryOptions) => Promise<string>
  royaltyPayment: (collection: string, protocol?: string) => Promise<string>
  */

export interface DispatchQueryProps {
  messages: RoyaltyRegistryInstance | undefined
  type: QueryType
  collection: string
  protocol: string
}

export const dispatchQuery = (props: DispatchQueryProps) => {
  const { messages, type, collection, protocol } = props
  switch (type) {
    case 'config':
      return messages?.config()
    case 'collection_royalty_default':
      return messages?.collectionRoyaltyDefault(collection)
    case 'collection_royalty_protocol':
      return messages?.collectionRoyaltyProtocol(collection, protocol)
    default: {
      throw new Error('unknown query type')
    }
  }
}
