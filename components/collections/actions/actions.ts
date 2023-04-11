import type { MinterInstance } from 'contracts/minter'
import { useMinterContract } from 'contracts/minter'
import type { RoyaltyInfo, SG721Instance } from 'contracts/sg721'
import { useSG721Contract } from 'contracts/sg721'

export type ActionType = typeof ACTION_TYPES[number]

export const ACTION_TYPES = [
  'mint_to',
  'mint_for',
  'batch_mint',
  'set_whitelist',
  'update_start_time',
  'update_royalty_info',
  'update_per_address_limit',
  'withdraw',
  'transfer',
  'batch_transfer',
  'burn',
  'batch_burn',
  'shuffle',
  'airdrop',
] as const

export interface ActionListItem {
  id: ActionType
  name: string
  description?: string
}

export const ACTION_LIST: ActionListItem[] = [
  {
    id: 'mint_to',
    name: 'Mint To',
    description: `Mint a token to a user`,
  },
  {
    id: 'mint_for',
    name: 'Mint For',
    description: `Mint a token for a user with given token ID`,
  },
  {
    id: 'batch_mint',
    name: 'Batch Mint',
    description: `Mint multiple tokens to a user with given token amount`,
  },
  {
    id: 'set_whitelist',
    name: 'Set Whitelist',
    description: `Set whitelist contract address`,
  },
  {
    id: 'update_royalty_info',
    name: 'Update Royalty Info',
    description: `Update royalty payment details`,
  },
  {
    id: 'update_start_time',
    name: 'Update Start Time',
    description: `Update start time for minting`,
  },
  {
    id: 'update_per_address_limit',
    name: 'Update Tokens Per Address Limit',
    description: `Update token per address limit`,
  },
  {
    id: 'withdraw',
    name: 'Withdraw Tokens',
    description: `Withdraw tokens from the contract`,
  },
  {
    id: 'transfer',
    name: 'Transfer Tokens',
    description: `Transfer tokens from one address to another`,
  },
  {
    id: 'batch_transfer',
    name: 'Batch Transfer Tokens',
    description: `Transfer a list of tokens to a recipient`,
  },
  {
    id: 'burn',
    name: 'Burn Token',
    description: `Burn a specified token from the collection`,
  },
  {
    id: 'batch_burn',
    name: 'Batch Burn Tokens',
    description: `Burn a list of tokens from the collection`,
  },
  {
    id: 'shuffle',
    name: 'Shuffle Tokens',
    description: 'Shuffle the token IDs',
  },
  {
    id: 'airdrop',
    name: 'Airdrop Tokens',
    description: 'Airdrop tokens to given addresses',
  },
]

export interface DispatchExecuteProps {
  type: ActionType
  [k: string]: unknown
}

type Select<T extends ActionType> = T

/** @see {@link MinterInstance} */
export type DispatchExecuteArgs = {
  minterContract: string
  sg721Contract: string
  minterMessages?: MinterInstance
  sg721Messages?: SG721Instance
  txSigner: string
} & (
  | { type: undefined }
  | { type: Select<'mint_to'>; recipient: string }
  | { type: Select<'mint_for'>; recipient: string; tokenId: number }
  | { type: Select<'batch_mint'>; recipient: string; batchNumber: number }
  | { type: Select<'set_whitelist'>; whitelist: string }
  | { type: Select<'update_start_time'>; startTime: string }
  | { type: Select<'update_per_address_limit'>; limit: number }
  | { type: Select<'shuffle'> }
  | { type: Select<'withdraw'> }
  | { type: Select<'transfer'>; recipient: string; tokenId: number }
  | { type: Select<'batch_transfer'>; recipient: string; tokenIds: string }
  | { type: Select<'burn'>; tokenId: number }
  | { type: Select<'batch_burn'>; tokenIds: string }
  | { type: Select<'update_royalty_info'>; royaltyInfo: RoyaltyInfo }
  | { type: Select<'airdrop'>; recipients: string[] }
)

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { minterMessages, sg721Messages, txSigner } = args
  if (!minterMessages || !sg721Messages) {
    throw new Error('Cannot execute actions')
  }
  switch (args.type) {
    case 'mint_to': {
      return minterMessages.mintTo(txSigner, args.recipient)
    }
    case 'mint_for': {
      return minterMessages.mintFor(txSigner, args.recipient, args.tokenId)
    }
    case 'batch_mint': {
      return minterMessages.batchMint(txSigner, args.recipient, args.batchNumber)
    }
    case 'set_whitelist': {
      return minterMessages.setWhitelist(txSigner, args.whitelist)
    }
    case 'update_start_time': {
      return minterMessages.updateStartTime(txSigner, args.startTime)
    }
    case 'update_per_address_limit': {
      return minterMessages.updatePerAddressLimit(txSigner, args.limit)
    }
    case 'shuffle': {
      return minterMessages.shuffle(txSigner)
    }
    case 'withdraw': {
      return minterMessages.withdraw(txSigner)
    }
    case 'transfer': {
      return sg721Messages.transferNft(args.recipient, args.tokenId.toString())
    }
    case 'batch_transfer': {
      return sg721Messages.batchTransfer(args.recipient, args.tokenIds)
    }
    case 'burn': {
      return sg721Messages.burn(args.tokenId.toString())
    }
    case 'update_royalty_info': {
      return sg721Messages.updateRoyaltyInfo(args.royaltyInfo)
    }
    case 'batch_burn': {
      return sg721Messages.batchBurn(args.tokenIds)
    }
    case 'airdrop': {
      return minterMessages.airdrop(txSigner, args.recipients)
    }
    default: {
      throw new Error('Unknown action')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages: minterMessages } = useMinterContract()
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages: sg721Messages } = useSG721Contract()
  const { minterContract, sg721Contract } = args
  switch (args.type) {
    case 'mint_to': {
      return minterMessages(minterContract)?.mintTo(args.recipient)
    }
    case 'mint_for': {
      return minterMessages(minterContract)?.mintFor(args.recipient, args.tokenId)
    }
    case 'batch_mint': {
      return minterMessages(minterContract)?.batchMint(args.recipient, args.batchNumber)
    }
    case 'set_whitelist': {
      return minterMessages(minterContract)?.setWhitelist(args.whitelist)
    }
    case 'update_start_time': {
      return minterMessages(minterContract)?.updateStartTime(args.startTime)
    }
    case 'update_per_address_limit': {
      return minterMessages(minterContract)?.updatePerAddressLimit(args.limit)
    }
    case 'shuffle': {
      return minterMessages(minterContract)?.shuffle()
    }
    case 'withdraw': {
      return minterMessages(minterContract)?.withdraw()
    }
    case 'transfer': {
      return sg721Messages(sg721Contract)?.transferNft(args.recipient, args.tokenId.toString())
    }
    case 'batch_transfer': {
      return sg721Messages(sg721Contract)?.batchTransfer(args.recipient, args.tokenIds)
    }
    case 'burn': {
      return sg721Messages(sg721Contract)?.burn(args.tokenId.toString())
    }
    case 'update_royalty_info': {
      return sg721Messages(sg721Contract)?.updateRoyaltyInfo(args.royaltyInfo)
    }
    case 'batch_burn': {
      return sg721Messages(sg721Contract)?.batchBurn(args.tokenIds)
    }
    case 'airdrop': {
      return minterMessages(minterContract)?.airdrop(args.recipients)
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ActionType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
