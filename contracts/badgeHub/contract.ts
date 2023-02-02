/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable camelcase */
import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { Coin } from '@cosmjs/proto-signing'
import { coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'
import type { Timestamp } from '@stargazezone/types/contracts/minter/shared-types'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface MigrateResponse {
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface Rule {
  by_key?: string
  by_minter?: string
  by_keys?: string[]
}

export interface Trait {
  display_type?: string
  trait_type: string
  value: string
}

export interface Metadata {
  name?: string
  image?: string
  image_date?: string
  external_url?: string
  description?: string
  attributes?: Trait[]
  background_color?: string
  animation_url?: string
  youtube_url?: string
}

export interface Badge {
  manager: string
  metadata: Metadata
  transferrable: boolean
  rule: Rule
  expiry?: Timestamp
  max_supply?: number
}

export interface BadgeHubInstance {
  readonly contractAddress: string

  //Query
  getConfig: () => Promise<any>
  getBadge: (id: number) => Promise<any>
  getBadges: (start_after?: number, limit?: number) => Promise<any>
  getKey: (id: number, pubkey: string) => Promise<any>
  getKeys: (id: number, start_after?: number, limit?: number) => Promise<any>

  //Execute
  createBadge: (senderAddress: string, badge: Badge) => Promise<string>
  editBadge: (senderAddress: string, id: number, metadata: Metadata) => Promise<string>
  addKeys: (senderAddress: string, id: number, keys: string[]) => Promise<string>
  purgeKeys: (senderAddress: string, id: number, limit?: number) => Promise<string>
  purgeOwners: (senderAddress: string, id: number, limit?: number) => Promise<string>
  mintByMinter: (senderAddress: string, id: number, owners: string[]) => Promise<string>
  mintByKey: (senderAddress: string, id: number, owner: string, signature: string) => Promise<string>
  mintByKeys: (senderAddress: string, id: number, owner: string, pubkey: string, signature: string) => Promise<string>
  setNft: (senderAddress: string, nft: string) => Promise<string>
}

export interface BadgeHubMessages {
  createBadge: (badge: Badge) => CreateBadgeMessage
  editBadge: (id: number, metadata: Metadata) => EditBadgeMessage
  addKeys: (id: number, keys: string[]) => AddKeysMessage
  purgeKeys: (id: number, limit?: number) => PurgeKeysMessage
  purgeOwners: (id: number, limit?: number) => PurgeOwnersMessage
  mintByMinter: (id: number, owners: string[]) => MintByMinterMessage
  mintByKey: (id: number, owner: string, signature: string) => MintByKeyMessage
  mintByKeys: (id: number, owner: string, pubkey: string, signature: string) => MintByKeysMessage
  setNft: (nft: string) => SetNftMessage
}

export interface CreateBadgeMessage {
  sender: string
  contract: string
  msg: {
    create_badge: {
      manager: string
      metadata: Metadata
      transferrable: boolean
      rule: Rule
      expiry?: Timestamp
      max_supply?: number
    }
  }
  funds: Coin[]
}

export interface EditBadgeMessage {
  sender: string
  contract: string
  msg: {
    edit_badge: {
      id: number
      metadata: Metadata
    }
  }
  funds: Coin[]
}

export interface AddKeysMessage {
  sender: string
  contract: string
  msg: {
    add_keys: {
      id: number
      keys: string[]
    }
  }
  funds: Coin[]
}

export interface PurgeKeysMessage {
  sender: string
  contract: string
  msg: {
    purge_keys: {
      id: number
      limit?: number
    }
  }
  funds: Coin[]
}

export interface PurgeOwnersMessage {
  sender: string
  contract: string
  msg: {
    purge_owners: {
      id: number
      limit?: number
    }
  }
  funds: Coin[]
}

export interface MintByMinterMessage {
  sender: string
  contract: string
  msg: {
    mint_by_minter: {
      id: number
      owners: string[]
    }
  }
  funds: Coin[]
}

export interface MintByKeyMessage {
  sender: string
  contract: string
  msg: {
    mint_by_key: {
      id: number
      owner: string
      signature: string
    }
  }
  funds: Coin[]
}

export interface MintByKeysMessage {
  sender: string
  contract: string
  msg: {
    mint_by_keys: {
      id: number
      owner: string
      pubkey: string
      signature: string
    }
  }
  funds: Coin[]
}

export interface SetNftMessage {
  sender: string
  contract: string
  msg: {
    set_nft: {
      nft: string
    }
  }
  funds: Coin[]
}

export interface BadgeHubContract {
  instantiate: (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
    funds?: Coin[],
  ) => Promise<InstantiateResponse>

  migrate: (
    senderAddress: string,
    contractAddress: string,
    codeId: number,
    migrateMsg: Record<string, unknown>,
  ) => Promise<MigrateResponse>

  use: (contractAddress: string) => BadgeHubInstance

  messages: (contractAddress: string) => BadgeHubMessages
}

export const badgeHub = (client: SigningCosmWasmClient, txSigner: string): BadgeHubContract => {
  const use = (contractAddress: string): BadgeHubInstance => {
    //Query
    const getConfig = async (): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        config: {},
      })
      return res
    }

    const getBadge = async (id: number): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        badge: { id },
      })
      return res
    }

    const getBadges = async (start_after?: number, limit?: number): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        badges: { start_after, limit },
      })
      return res
    }

    const getKey = async (id: number, key: string): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        key: { id, key },
      })
      return res
    }

    const getKeys = async (id: number, start_after?: number, limit?: number): Promise<any> => {
      const res = await client.queryContractSmart(contractAddress, {
        keys: { id, start_after, limit },
      })
      return res
    }

    //Execute
    const createBadge = async (senderAddress: string, badge: Badge): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          create_badge: {
            manager: badge.manager,
            metadata: badge.metadata,
            transferrable: badge.transferrable,
            rule: badge.rule,
            expiry: badge.expiry,
            max_supply: badge.max_supply,
          },
        },
        'auto',
        '',
        [coin(315, 'ustars')],
      )

      return res.transactionHash
    }

    const editBadge = async (senderAddress: string, id: number, metadata: Metadata): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          edit_badge: {
            id,
            metadata,
          },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const addKeys = async (senderAddress: string, id: number, keys: string[]): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          add_keys: {
            id,
            keys,
          },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const purgeKeys = async (senderAddress: string, id: number, limit?: number): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          purge_keys: {
            id,
            limit,
          },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const purgeOwners = async (senderAddress: string, id: number, limit?: number): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          purge_owners: {
            id,
            limit,
          },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const mintByMinter = async (senderAddress: string, id: number, owners: string[]): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          mint_by_minter: {
            id,
            owners,
          },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const mintByKey = async (senderAddress: string, id: number, owner: string, signature: string): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          mint_by_key: {
            id,
            owner,
            signature,
          },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const mintByKeys = async (
      senderAddress: string,
      id: number,
      owner: string,
      pubkey: string,
      signature: string,
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          mint_by_keys: {
            id,
            owner,
            pubkey,
            signature,
          },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    const setNft = async (senderAddress: string, nft: string): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        {
          set_nft: {
            nft,
          },
        },
        'auto',
        '',
      )

      return res.transactionHash
    }

    return {
      contractAddress,
      getConfig,
      getBadge,
      getBadges,
      getKey,
      getKeys,
      createBadge,
      editBadge,
      addKeys,
      purgeKeys,
      purgeOwners,
      mintByMinter,
      mintByKey,
      mintByKeys,
      setNft,
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

  const instantiate = async (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
  ): Promise<InstantiateResponse> => {
    const result = await client.instantiate(senderAddress, codeId, initMsg, label, 'auto')

    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
      logs: result.logs,
    }
  }

  const messages = (contractAddress: string) => {
    const createBadge = (badge: Badge): CreateBadgeMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          create_badge: {
            manager: badge.manager,
            metadata: badge.metadata,
            transferrable: badge.transferrable,
            rule: badge.rule,
            expiry: badge.expiry,
            max_supply: badge.max_supply,
          },
        },
        funds: [],
      }
    }

    const editBadge = (id: number, metadata: Metadata): EditBadgeMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          edit_badge: {
            id,
            metadata,
          },
        },
        funds: [],
      }
    }

    const addKeys = (id: number, keys: string[]): AddKeysMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          add_keys: {
            id,
            keys,
          },
        },
        funds: [],
      }
    }

    const purgeKeys = (id: number, limit?: number): PurgeKeysMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          purge_keys: {
            id,
            limit,
          },
        },
        funds: [],
      }
    }

    const purgeOwners = (id: number, limit?: number): PurgeOwnersMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          purge_owners: {
            id,
            limit,
          },
        },
        funds: [],
      }
    }

    const mintByMinter = (id: number, owners: string[]): MintByMinterMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          mint_by_minter: {
            id,
            owners,
          },
        },
        funds: [],
      }
    }

    const mintByKey = (id: number, owner: string, signature: string): MintByKeyMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          mint_by_key: {
            id,
            owner,
            signature,
          },
        },
        funds: [],
      }
    }

    const mintByKeys = (id: number, owner: string, pubkey: string, signature: string): MintByKeysMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          mint_by_keys: {
            id,
            owner,
            pubkey,
            signature,
          },
        },
        funds: [],
      }
    }

    const setNft = (nft: string): SetNftMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          set_nft: {
            nft,
          },
        },
        funds: [],
      }
    }

    return {
      createBadge,
      editBadge,
      addKeys,
      purgeKeys,
      purgeOwners,
      mintByMinter,
      mintByKey,
      mintByKeys,
      setNft,
    }
  }

  return { use, instantiate, migrate, messages }
}
