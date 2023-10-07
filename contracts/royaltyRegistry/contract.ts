import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { Coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface MigrateResponse {
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface RoyaltyRegistryInstance {
  readonly contractAddress: string
  //Query
  config: () => Promise<string>
  collectionRoyaltyDefault: (collection: string) => Promise<string>
  collectionRoyaltyProtocol: (collection: string, protocol: string) => Promise<string>
  // RoyaltyProtocolByCollection: (collection: string, queryOptions: QqueryOptions) => Promise<string>
  royaltyPayment: (collection: string, protocol?: string) => Promise<string>

  //Execute
  initializeCollectionRoyalty: (collection: string) => Promise<string>
  setCollectionRoyaltyDefault: (collection: string, recipient: string, share: number) => Promise<string>
  updateCollectionRoyaltyDefault: (
    collection: string,
    recipient?: string,
    shareDelta?: number,
    decrement?: boolean,
  ) => Promise<string>
  setCollectionRoyaltyProtocol: (
    collection: string,
    protocol: string,
    recipient: string,
    share: number,
  ) => Promise<string>
  updateCollectionRoyaltyProtocol: (
    collection: string,
    protocol?: string,
    recipient?: string,
    shareDelta?: number,
    decrement?: boolean,
  ) => Promise<string>
}

export interface RoyaltyRegistryMessages {
  initializeCollectionRoyalty: (collection: string) => InitializeCollectionRoyaltyMessage
  setCollectionRoyaltyDefault: (
    collection: string,
    recipient: string,
    share: number,
  ) => SetCollectionRoyaltyDefaultMessage
  updateCollectionRoyaltyDefault: (
    collection: string,
    recipient?: string,
    shareDelta?: number,
    decrement?: boolean,
  ) => UpdateCollectionRoyaltyDefaultMessage
  setCollectionRoyaltyProtocol: (
    collection: string,
    protocol: string,
    recipient: string,
    share: number,
  ) => SetCollectionRoyaltyProtocolMessage
  updateCollectionRoyaltyProtocol: (
    collection: string,
    protocol?: string,
    recipient?: string,
    shareDelta?: number,
    decrement?: boolean,
  ) => UpdateCollectionRoyaltyProtocolMessage
}

export interface InitializeCollectionRoyaltyMessage {
  sender: string
  contract: string
  msg: {
    initialize_collection_royalty: { collection: string }
  }
  funds: Coin[]
}

export interface SetCollectionRoyaltyDefaultMessage {
  sender: string
  contract: string
  msg: {
    set_collection_royalty_default: { collection: string; recipient: string; share: number }
  }
  funds: Coin[]
}

export interface UpdateCollectionRoyaltyDefaultMessage {
  sender: string
  contract: string
  msg: {
    update_collection_royalty_default: {
      collection: string
      recipient?: string
      share_delta?: number
      decrement?: boolean
    }
  }
  funds: Coin[]
}

export interface SetCollectionRoyaltyProtocolMessage {
  sender: string
  contract: string
  msg: {
    set_collection_royalty_protocol: {
      collection: string
      protocol: string
      recipient: string
      share: number
    }
  }
  funds: Coin[]
}

export interface UpdateCollectionRoyaltyProtocolMessage {
  sender: string
  contract: string
  msg: {
    update_collection_royalty_protocol: {
      collection: string
      protocol?: string
      recipient?: string
      share_delta?: number
      decrement?: boolean
    }
  }
  funds: Coin[]
}

export interface RoyaltyRegistryContract {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => RoyaltyRegistryInstance

  migrate: (
    senderAddress: string,
    contractAddress: string,
    codeId: number,
    migrateMsg: Record<string, unknown>,
  ) => Promise<MigrateResponse>

  messages: (contractAddress: string) => RoyaltyRegistryMessages
}

export const RoyaltyRegistry = (client: SigningCosmWasmClient, txSigner: string): RoyaltyRegistryContract => {
  const use = (contractAddress: string): RoyaltyRegistryInstance => {
    ///QUERY
    const config = async (): Promise<string> => {
      return client.queryContractSmart(contractAddress, {
        config: {},
      })
    }

    const collectionRoyaltyDefault = async (collection: string): Promise<string> => {
      return client.queryContractSmart(contractAddress, {
        collection_royalty_default: { collection },
      })
    }

    const collectionRoyaltyProtocol = async (collection: string, protocol: string): Promise<string> => {
      return client.queryContractSmart(contractAddress, {
        collection_royalty_protocol: { collection, protocol },
      })
    }

    const royaltyPayment = async (collection: string, protocol?: string): Promise<string> => {
      return client.queryContractSmart(contractAddress, {
        royalty_payment: { collection, protocol },
      })
    }

    /// EXECUTE
    const initializeCollectionRoyalty = async (collection: string): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          initialize_collection_royalty: { collection },
        },
        'auto',
      )
      return res.transactionHash
    }

    const setCollectionRoyaltyDefault = async (
      collection: string,
      recipient: string,
      share: number,
    ): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          set_collection_royalty_default: { collection, recipient, share },
        },
        'auto',
      )
      return res.transactionHash
    }

    const updateCollectionRoyaltyDefault = async (
      collection: string,
      recipient?: string,
      shareDelta?: number,
      decrement?: boolean,
    ): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          update_collection_royalty_default: { collection, recipient, share_delta: shareDelta, decrement },
        },
        'auto',
      )
      return res.transactionHash
    }

    const setCollectionRoyaltyProtocol = async (
      collection: string,
      protocol: string,
      recipient: string,
      share: number,
    ): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          set_collection_royalty_protocol: { collection, protocol, recipient, share },
        },
        'auto',
      )
      return res.transactionHash
    }

    const updateCollectionRoyaltyProtocol = async (
      collection: string,
      protocol?: string,
      recipient?: string,
      shareDelta?: number,
      decrement?: boolean,
    ): Promise<string> => {
      const res = await client.execute(
        txSigner,
        contractAddress,
        {
          update_collection_royalty_protocol: {
            collection,
            protocol,
            recipient,
            share_delta: shareDelta,
            decrement,
          },
        },
        'auto',
      )
      return res.transactionHash
    }

    return {
      contractAddress,
      config,
      collectionRoyaltyDefault,
      collectionRoyaltyProtocol,
      royaltyPayment,
      initializeCollectionRoyalty,
      setCollectionRoyaltyDefault,
      updateCollectionRoyaltyDefault,
      setCollectionRoyaltyProtocol,
      updateCollectionRoyaltyProtocol,
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
    })

    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
    }
  }

  const migrate = async (
    senderAddress: string,
    contractAddress: string,
    codeId: number,
    migrateMsg: Record<string, unknown>,
  ): Promise<MigrateResponse> => {
    const result = await client.migrate(senderAddress, contractAddress, codeId, migrateMsg, 'auto')
    return {
      transactionHash: result.transactionHash,
      logs: result.logs,
    }
  }

  const messages = (contractAddress: string) => {
    const initializeCollectionRoyalty = (collection: string) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          initialize_collection_royalty: { collection },
        },
        funds: [],
      }
    }

    const setCollectionRoyaltyDefault = (collection: string, recipient: string, share: number) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          set_collection_royalty_default: { collection, recipient, share },
        },
        funds: [],
      }
    }

    const updateCollectionRoyaltyDefault = (
      collection: string,
      recipient?: string,
      shareDelta?: number,
      decrement?: boolean,
    ) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_collection_royalty_default: { collection, recipient, share_delta: shareDelta, decrement },
        },
        funds: [],
      }
    }

    const setCollectionRoyaltyProtocol = (collection: string, protocol: string, recipient: string, share: number) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          set_collection_royalty_protocol: { collection, protocol, recipient, share },
        },
        funds: [],
      }
    }

    const updateCollectionRoyaltyProtocol = (
      collection: string,
      protocol?: string,
      recipient?: string,
      shareDelta?: number,
      decrement?: boolean,
    ) => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_collection_royalty_protocol: {
            collection,
            protocol,
            recipient,
            share_delta: shareDelta,
            decrement,
          },
        },
        funds: [],
      }
    }

    return {
      initializeCollectionRoyalty,
      setCollectionRoyaltyDefault,
      updateCollectionRoyaltyDefault,
      setCollectionRoyaltyProtocol,
      updateCollectionRoyaltyProtocol,
    }
  }

  return { use, instantiate, migrate, messages }
}
