/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-nested-ternary */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { toUtf8 } from '@cosmjs/encoding'
import type { Coin } from '@cosmjs/proto-signing'
import axios from 'axios'
import clsx from 'clsx'
import { Button } from 'components/Button'
import type { MinterType } from 'components/collections/actions/Combobox'
import { Conditional } from 'components/Conditional'
import { ConfirmationModal } from 'components/ConfirmationModal'
import { LoadingModal } from 'components/LoadingModal'
import type { WhitelistFlexMember } from 'components/WhitelistFlexUpload'
import { type TokenInfo, tokensList } from 'config/token'
import { useContracts } from 'contexts/contracts'
import { addLogItem } from 'contexts/log'
import type { DispatchExecuteArgs as OpenEditionFactoryDispatchExecuteArgs } from 'contracts/openEditionFactory/messages/execute'
import { dispatchExecute as openEditionFactoryDispatchExecute } from 'contracts/openEditionFactory/messages/execute'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { upload } from 'services/upload'
import {
  SG721_OPEN_EDITION_CODE_ID,
  SG721_OPEN_EDITION_UPDATABLE_CODE_ID,
  STRDST_SG721_CODE_ID,
  WHITELIST_CODE_ID,
  WHITELIST_FLEX_CODE_ID,
  WHITELIST_MERKLE_TREE_API_URL,
  WHITELIST_MERKLE_TREE_CODE_ID,
} from 'utils/constants'
import { useDebounce } from 'utils/debounce'
import type { AssetType } from 'utils/getAssetType'
import { isValidAddress } from 'utils/isValidAddress'
import { checkTokenUri } from 'utils/isValidTokenUri'
import { uid } from 'utils/random'
import { useWallet } from 'utils/wallet'

import { type CollectionDetailsDataProps, CollectionDetails } from './CollectionDetails'
import type { ImageUploadDetailsDataProps } from './ImageUploadDetails'
import { ImageUploadDetails } from './ImageUploadDetails'
import type { LimitType, MintingDetailsDataProps } from './MintingDetails'
import { MintingDetails } from './MintingDetails'
import type { UploadMethod } from './OffChainMetadataUploadDetails'
import {
  type OffChainMetadataUploadDetailsDataProps,
  OffChainMetadataUploadDetails,
} from './OffChainMetadataUploadDetails'
import type { OnChainMetadataInputDetailsDataProps } from './OnChainMetadataInputDetails'
import { OnChainMetadataInputDetails } from './OnChainMetadataInputDetails'
import { type RoyaltyDetailsDataProps, RoyaltyDetails } from './RoyaltyDetails'
import { type WhitelistDetailsDataProps, WhitelistDetails } from './WhitelistDetails'

export type MetadataStorageMethod = 'off-chain' | 'on-chain'

export interface OpenEditionMinterDetailsDataProps {
  imageUploadDetails?: ImageUploadDetailsDataProps
  collectionDetails?: CollectionDetailsDataProps
  whitelistDetails?: WhitelistDetailsDataProps
  royaltyDetails?: RoyaltyDetailsDataProps
  onChainMetadataInputDetails?: OnChainMetadataInputDetailsDataProps
  offChainMetadataUploadDetails?: OffChainMetadataUploadDetailsDataProps
  mintingDetails?: MintingDetailsDataProps
  metadataStorageMethod?: MetadataStorageMethod
  openEditionMinterContractAddress?: string | null
  coverImageUrl?: string | null
  tokenUri?: string | null
  tokenImageUri?: string | null
  isRefreshed?: boolean
}

interface OpenEditionMinterCreatorProps {
  onChange: (data: OpenEditionMinterCreatorDataProps) => void
  onDetailsChange: (data: OpenEditionMinterDetailsDataProps) => void
  openEditionMinterCreationFee?: Coin
  minimumMintPrice?: string
  minterType?: MinterType
  mintTokenFromFactory?: TokenInfo | undefined
  importedOpenEditionMinterDetails?: OpenEditionMinterDetailsDataProps
  isMatchingFactoryPresent?: boolean
  openEditionFactoryAddress?: string
}

export interface OpenEditionMinterCreatorDataProps {
  metadataStorageMethod: MetadataStorageMethod
  openEditionMinterContractAddress: string | null
  sg721ContractAddress: string | null
  whitelistContractAddress: string | null
  transactionHash: string | null
}

export const OpenEditionMinterCreator = ({
  onChange,
  onDetailsChange,
  openEditionMinterCreationFee,
  minimumMintPrice,
  minterType,
  mintTokenFromFactory,
  importedOpenEditionMinterDetails,
  isMatchingFactoryPresent,
  openEditionFactoryAddress,
}: OpenEditionMinterCreatorProps) => {
  const wallet = useWallet()
  const {
    openEditionMinter: openEditionMinterContract,
    openEditionFactory: openEditionFactoryContract,
    whitelist: whitelistContract,
    whitelistMerkleTree: whitelistMerkleTreeContract,
  } = useContracts()

  const [metadataStorageMethod, setMetadataStorageMethod] = useState<MetadataStorageMethod>('off-chain')
  const [imageUploadDetails, setImageUploadDetails] = useState<ImageUploadDetailsDataProps | null>(null)
  const [collectionDetails, setCollectionDetails] = useState<CollectionDetailsDataProps | null>(null)
  const [whitelistDetails, setWhitelistDetails] = useState<WhitelistDetailsDataProps | null>(null)
  const [royaltyDetails, setRoyaltyDetails] = useState<RoyaltyDetailsDataProps | null>(null)
  const [isRefreshed, setIsRefreshed] = useState(false)
  const [onChainMetadataInputDetails, setOnChainMetadataInputDetails] =
    useState<OnChainMetadataInputDetailsDataProps | null>(null)
  const [offChainMetadataUploadDetails, setOffChainMetadataUploadDetails] =
    useState<OffChainMetadataUploadDetailsDataProps | null>(null)
  const [mintingDetails, setMintingDetails] = useState<MintingDetailsDataProps | null>(null)

  const [creationInProgress, setCreationInProgress] = useState(false)
  const [readyToCreate, setReadyToCreate] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [tokenUri, setTokenUri] = useState<string | null>(null)
  const [tokenImageUri, setTokenImageUri] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [openEditionMinterContractAddress, setOpenEditionMinterContractAddress] = useState<string | null>(null)
  const [sg721ContractAddress, setSg721ContractAddress] = useState<string | null>(null)
  const [whitelistContractAddress, setWhitelistContractAddress] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [thumbnailImageUri, setThumbnailImageUri] = useState<string | undefined>(undefined)

  const thumbnailCompatibleAssetTypes: AssetType[] = ['video', 'audio', 'html']

  const openEditionFactoryMessages = useMemo(
    () => openEditionFactoryContract?.use(openEditionFactoryAddress as string),
    [
      openEditionFactoryContract,
      wallet.address,
      collectionDetails?.updatable,
      openEditionFactoryAddress,
      wallet.isWalletConnected,
    ],
  )

  const performOpenEditionMinterChecks = () => {
    try {
      setReadyToCreate(false)
      checkCollectionDetails()
      checkMintingDetails()
      void checkUploadDetails()
        .then(() => {
          void checkRoyaltyDetails()
            .then(() => {
              checkWhitelistDetails()
                .then(() => {
                  void checkwalletBalance()
                    .then(() => {
                      setReadyToCreate(true)
                    })
                    .catch((error: any) => {
                      toast.error(`Error in Wallet Balance: ${error.message}`, { style: { maxWidth: 'none' } })
                      addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
                      setReadyToCreate(false)
                    })
                })
                .catch((error) => {
                  if (String(error.message).includes('Insufficient wallet balance')) {
                    toast.error(`${error.message}`, { style: { maxWidth: 'none' } })
                    addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
                  } else {
                    toast.error(`Error in Whitelist Configuration: ${error.message}`, { style: { maxWidth: 'none' } })
                    addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
                  }
                  setReadyToCreate(false)
                })
            })
            .catch((error: any) => {
              toast.error(`Error in Royalty Details: ${error.message}`, { style: { maxWidth: 'none' } })
              addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
              setReadyToCreate(false)
            })
        })
        .catch((error: any) => {
          toast.error(`Error in Upload Details: ${error.message}`, { style: { maxWidth: 'none' } })
          addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
          setReadyToCreate(false)
        })
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
      setUploading(false)
      setReadyToCreate(false)
    }
  }

  const checkUploadDetails = async () => {
    if (!wallet.isWalletConnected) throw new Error('Wallet not connected.')
    if (
      (metadataStorageMethod === 'off-chain' && !offChainMetadataUploadDetails) ||
      (metadataStorageMethod === 'on-chain' && !imageUploadDetails)
    ) {
      throw new Error('Please select assets and metadata')
    }

    if (
      metadataStorageMethod === 'off-chain' &&
      offChainMetadataUploadDetails?.uploadMethod === 'new' &&
      offChainMetadataUploadDetails.assetFiles.length === 0
    ) {
      throw new Error('Please select the asset file')
    }
    if (
      metadataStorageMethod === 'on-chain' &&
      imageUploadDetails?.uploadMethod === 'new' &&
      imageUploadDetails.assetFile === undefined
    ) {
      throw new Error('Please select the asset file')
    }
    if (metadataStorageMethod === 'off-chain' && offChainMetadataUploadDetails?.uploadMethod === 'new') {
      if (
        offChainMetadataUploadDetails.uploadService === 'pinata' &&
        (offChainMetadataUploadDetails.pinataApiKey === '' || offChainMetadataUploadDetails.pinataSecretKey === '')
      ) {
        throw new Error('Please enter valid Pinata API and secret keys')
      }
      if (
        offChainMetadataUploadDetails.uploadService === 'web3-storage' &&
        offChainMetadataUploadDetails.web3StorageEmail === ''
      ) {
        throw new Error('Please enter a valid Web3.Storage email')
      }
      if (
        offChainMetadataUploadDetails.uploadService === 'web3-storage' &&
        !offChainMetadataUploadDetails.web3StorageLoginSuccessful
      ) {
        throw new Error('Please complete the login process for Web3.Storage')
      }
      if (
        offChainMetadataUploadDetails.uploadService === 'fleek' &&
        offChainMetadataUploadDetails.fleekClientId === ''
      ) {
        throw new Error('Please enter valid Fleek client ID')
      }
    }
    if (metadataStorageMethod === 'on-chain' && imageUploadDetails?.uploadMethod === 'new') {
      if (
        imageUploadDetails.uploadService === 'pinata' &&
        (imageUploadDetails.pinataApiKey === '' || imageUploadDetails.pinataSecretKey === '')
      ) {
        throw new Error('Please enter valid Pinata API and secret keys')
      }
      if (imageUploadDetails.uploadService === 'fleek' && imageUploadDetails.fleekClientId === '') {
        throw new Error('Please enter valid Fleek client ID')
      }
      if (imageUploadDetails.uploadService === 'web3-storage' && imageUploadDetails.web3StorageEmail === '') {
        throw new Error('Please enter a valid Web3.Storage email')
      }
      if (imageUploadDetails.uploadService === 'web3-storage' && !imageUploadDetails.web3StorageLoginSuccessful) {
        throw new Error('Please complete the login process for Web3.Storage')
      }
    }
    if (metadataStorageMethod === 'off-chain' && offChainMetadataUploadDetails?.uploadMethod === 'existing') {
      if (
        offChainMetadataUploadDetails.tokenURI === '' ||
        !(offChainMetadataUploadDetails.tokenURI as string).includes('ipfs://')
      ) {
        throw new Error('Please enter a valid token URI')
      }
      if (
        offChainMetadataUploadDetails.imageUrl === '' ||
        !(offChainMetadataUploadDetails.imageUrl as string).includes('ipfs://')
      ) {
        throw new Error('Please enter a valid image URI')
      }
    }
    if (metadataStorageMethod === 'on-chain' && imageUploadDetails?.uploadMethod === 'existing') {
      if (imageUploadDetails.imageUrl === '' || !(imageUploadDetails.imageUrl as string).includes('ipfs://')) {
        throw new Error('Please enter a valid asset URI')
      }
      if (
        imageUploadDetails.coverImageUrl === '' ||
        !(imageUploadDetails.coverImageUrl as string).includes('ipfs://')
      ) {
        throw new Error('Please enter a valid cover image URL')
      }
    }
    if (offChainMetadataUploadDetails?.uploadMethod === 'existing') {
      await checkTokenUri(offChainMetadataUploadDetails.tokenURI as string)
    }
  }

  const checkCollectionDetails = () => {
    if (!collectionDetails) throw new Error('Please fill out the collection details')
    if (collectionDetails.name === '') throw new Error('Collection name is required')
    if (collectionDetails.description === '') throw new Error('Collection description is required')
    if (collectionDetails.symbol === '') throw new Error('Collection symbol is required')
    if (collectionDetails.description.length > 512)
      throw new Error('Collection description cannot exceed 512 characters')
    if (
      metadataStorageMethod === 'off-chain' &&
      offChainMetadataUploadDetails?.uploadMethod === 'new' &&
      collectionDetails.imageFile.length === 0
    )
      throw new Error('Collection cover image is required')
    if (
      metadataStorageMethod === 'on-chain' &&
      imageUploadDetails?.uploadMethod === 'new' &&
      collectionDetails.imageFile.length === 0
    )
      throw new Error('Collection cover image is required')
    if (
      collectionDetails.startTradingTime &&
      Number(collectionDetails.startTradingTime) < new Date().getTime() * 1000000
    )
      throw new Error('Invalid trading start time')
    if (
      collectionDetails.startTradingTime &&
      Number(collectionDetails.startTradingTime) < Number(mintingDetails?.startTime)
    )
      throw new Error('Trading start time must be after minting start time')
    if (collectionDetails.externalLink) {
      try {
        const url = new URL(collectionDetails.externalLink)
      } catch (e: any) {
        throw new Error(`Invalid external link: Make sure to include the protocol (e.g. https://)`)
      }
    }
  }

  const checkMintingDetails = () => {
    if (!mintingDetails) throw new Error('Please fill out the minting details')
    if (mintingDetails.unitPrice === '') throw new Error('Mint price is required')
    if (collectionDetails?.updatable) {
      if (Number(mintingDetails.unitPrice) < Number(minimumMintPrice))
        throw new Error(
          `Invalid mint price: The minimum mint price is ${Number(minimumMintPrice) / 1000000} ${
            mintTokenFromFactory?.displayName
          }`,
        )
    } else if (Number(mintingDetails.unitPrice) < Number(minimumMintPrice))
      throw new Error(
        `Invalid mint price: The minimum mint price is ${Number(minimumMintPrice) / 1000000} ${
          mintTokenFromFactory?.displayName
        }`,
      )
    if (!mintingDetails.perAddressLimit || mintingDetails.perAddressLimit < 1 || mintingDetails.perAddressLimit > 50)
      throw new Error('Invalid limit for tokens per address')
    if (mintingDetails.startTime === '') throw new Error('Start time is required')
    if (mintingDetails.limitType === 'time_limited' && mintingDetails.endTime === '')
      throw new Error('End time is required')
    if (mintingDetails.limitType === 'count_limited' && mintingDetails.tokenCountLimit === undefined)
      throw new Error('Token count limit is required')
    if (
      mintingDetails.limitType === 'count_limited' &&
      mintingDetails.perAddressLimit > (mintingDetails.tokenCountLimit as number)
    )
      throw new Error('Per address limit cannot exceed maximum token count limit')
    if (mintingDetails.limitType === 'count_limited' && (mintingDetails.tokenCountLimit as number) > 10000)
      throw new Error('Maximum token count cannot exceed 10000')
    if (Number(mintingDetails.startTime) < new Date().getTime() * 1000000) throw new Error('Invalid start time')
    if (
      mintingDetails.limitType === 'time_limited' &&
      Number(mintingDetails.endTime) < Number(mintingDetails.startTime)
    )
      throw new Error('End time cannot be earlier than start time')
    if (
      mintingDetails.limitType === 'time_limited' &&
      Number(mintingDetails.endTime) === Number(mintingDetails.startTime)
    )
      throw new Error('End time cannot be equal to the start time')

    if (
      mintingDetails.paymentAddress &&
      (!isValidAddress(mintingDetails.paymentAddress) || !mintingDetails.paymentAddress.startsWith('stars1'))
    )
      throw new Error('Invalid payment address')

    if (!isMatchingFactoryPresent)
      throw new Error(
        `No matching open edition factory contract found for the selected parameters (Mint Price Denom: ${mintingDetails.selectedMintToken?.displayName}, Whitelist Type: ${whitelistDetails?.whitelistType})`,
      )
  }

  const checkWhitelistDetails = async () => {
    if (!whitelistDetails) throw new Error('Please fill out the whitelist details')
    if (whitelistDetails.whitelistState === 'existing') {
      if (whitelistDetails.contractAddress === '') throw new Error('Whitelist contract address is required')
      else {
        const contract = whitelistContract?.use(whitelistDetails.contractAddress)
        //check if the address belongs to a whitelist contract (see performChecks())
        const config = await contract?.config()
        if (JSON.stringify(config).includes('whale_cap')) whitelistDetails.whitelistType = 'flex'
        else if (!JSON.stringify(config).includes('member_limit') || config?.member_limit === 0) {
          // whitelistDetails.whitelistType = 'merkletree'
          throw new Error(
            'Whitelist Merkle Tree is not supported yet. Please use a standard or flexible whitelist contract.',
          )
        } else whitelistDetails.whitelistType = 'standard'
        if (Number(config?.start_time) !== Number(mintingDetails?.startTime)) {
          const whitelistStartDate = new Date(Number(config?.start_time) / 1000000)
          throw Error(`Whitelist start time (${whitelistStartDate.toLocaleString()}) does not match minting start time`)
        }

        if (mintingDetails?.tokenCountLimit && config?.per_address_limit) {
          if (mintingDetails.tokenCountLimit >= 100 && Number(config.per_address_limit) > 50) {
            throw Error(
              `Invalid limit for tokens per address (${config.per_address_limit} tokens). Tokens per address limit cannot exceed 50 regardless of the total number of tokens.`,
            )
          } else if (
            mintingDetails.tokenCountLimit >= 100 &&
            Number(config.per_address_limit) > Math.ceil((mintingDetails.tokenCountLimit / 100) * 3)
          ) {
            throw Error(
              `Invalid limit for tokens per address (${config.per_address_limit} tokens). Tokens per address limit cannot exceed 3% of the total number of tokens in the collection.`,
            )
          } else if (mintingDetails.tokenCountLimit < 100 && Number(config.per_address_limit) > 3) {
            throw Error(
              `Invalid limit for tokens per address (${config.per_address_limit} tokens). Tokens per address limit cannot exceed 3 for collections with a token count limit smaller than 100 tokens.`,
            )
          }
        }
      }
    } else if (whitelistDetails.whitelistState === 'new') {
      // if (whitelistDetails.members?.length === 0) throw new Error('Whitelist member list cannot be empty')
      // if (whitelistDetails.unitPrice === undefined) throw new Error('Whitelist unit price is required')
      // if (Number(whitelistDetails.unitPrice) < 0)
      //   throw new Error('Invalid unit price: The unit price cannot be negative')
      // if (whitelistDetails.startTime === '') throw new Error('Start time is required')
      // if (whitelistDetails.endTime === '') throw new Error('End time is required')
      // if (
      //   whitelistDetails.whitelistType === 'standard' &&
      //   (!whitelistDetails.perAddressLimit || whitelistDetails.perAddressLimit === 0)
      // )
      //   throw new Error('Per address limit is required')
      // if (
      //   whitelistDetails.whitelistType !== 'merkletree' &&
      //   whitelistDetails.whitelistType !== 'merkletree-flex' &&
      //   (!whitelistDetails.memberLimit || whitelistDetails.memberLimit === 0)
      // )
      //   throw new Error('Member limit is required')
      // if (Number(whitelistDetails.startTime) >= Number(whitelistDetails.endTime))
      //   throw new Error('Whitelist start time cannot be equal to or later than the whitelist end time')
      // if (Number(whitelistDetails.startTime) !== Number(mintingDetails?.startTime))
      //   throw new Error('Whitelist start time must be the same as the minting start time')
      // if (whitelistDetails.perAddressLimit && mintingDetails?.tokenCountLimit) {
      //   if (mintingDetails.tokenCountLimit >= 100 && whitelistDetails.perAddressLimit > 50) {
      //     throw Error(
      //       `Invalid limit for tokens per address. Tokens per address limit cannot exceed 50 regardless of the total number of tokens.`,
      //     )
      //   } else if (
      //     mintingDetails.tokenCountLimit >= 100 &&
      //     whitelistDetails.perAddressLimit > Math.ceil((mintingDetails.tokenCountLimit / 100) * 3)
      //   ) {
      //     throw Error(
      //       `Invalid limit for tokens per address. Tokens per address limit cannot exceed 3% of the total number of tokens in the collection.`,
      //     )
      //   } else if (mintingDetails.tokenCountLimit < 100 && whitelistDetails.perAddressLimit > 3) {
      //     throw Error(
      //       `Invalid limit for tokens per address. Tokens per address limit cannot exceed 3 for collections with a token count limit smaller than 100 tokens.`,
      //     )
      //   }
      // }
    }
  }

  const checkRoyaltyDetails = async () => {
    if (!royaltyDetails) throw new Error('Please fill out the royalty details')
    if (royaltyDetails.royaltyType === 'new') {
      if (royaltyDetails.share === 0) throw new Error('Royalty share percentage is required')
      if (royaltyDetails.share > 100 || royaltyDetails.share < 0) throw new Error('Invalid royalty share percentage')
      if (royaltyDetails.paymentAddress === '') throw new Error('Royalty payment address is required')
      if (!isValidAddress(royaltyDetails.paymentAddress.trim())) {
        if (royaltyDetails.paymentAddress.trim().endsWith('.stars')) {
          throw new Error('Royalty payment address could not be resolved')
        }
        throw new Error('Invalid royalty payment address')
      }
      const contractInfoResponse = await (await wallet.getCosmWasmClient())
        .queryContractRaw(
          royaltyDetails.paymentAddress.trim(),
          toUtf8(Buffer.from(Buffer.from('contract_info').toString('hex'), 'hex').toString()),
        )
        .catch((e) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          if (e.message.includes('bech32')) throw new Error('Invalid royalty payment address.')
          console.log(e.message)
        })
      if (contractInfoResponse !== undefined) {
        const contractInfo = JSON.parse(new TextDecoder().decode(contractInfoResponse as Uint8Array))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (contractInfo && (contractInfo.contract.includes('minter') || contractInfo.contract.includes('sg721')))
          throw new Error('The provided royalty payment address does not belong to a compatible contract.')
        else console.log(contractInfo)
      }
    }
  }

  const checkwalletBalance = async () => {
    if (!wallet.isWalletConnected) throw new Error('Wallet not connected.')
    const queryClient = await wallet.getCosmWasmClient()
    const creationFeeDenom = tokensList.find((token) => token.denom === openEditionMinterCreationFee?.denom)
    await queryClient.getBalance(wallet.address || '', 'ustars').then(async (starsBalance) => {
      await queryClient
        .getBalance(wallet.address || '', openEditionMinterCreationFee?.denom as string)
        .then((creationFeeDenomBalance) => {
          if (whitelistDetails?.whitelistState === 'new') {
            let whitelistCreationFee = 0
            if (
              (whitelistDetails.whitelistType === 'standard' || whitelistDetails.whitelistType === 'flex') &&
              whitelistDetails.memberLimit
            )
              whitelistCreationFee = Math.ceil(Number(whitelistDetails.memberLimit) / 1000) * 100000000
            else if (
              whitelistDetails.whitelistType === 'merkletree' ||
              whitelistDetails.whitelistType === 'merkletree-flex'
            )
              whitelistCreationFee = 100000000
            if (openEditionMinterCreationFee?.denom === 'ustars') {
              const amountNeeded = whitelistCreationFee + Number(openEditionMinterCreationFee.amount)
              if (amountNeeded >= Number(starsBalance.amount))
                throw new Error(
                  `Insufficient wallet balance to instantiate the required contracts. Needed amount: ${(
                    amountNeeded / 1000000
                  ).toString()} STARS`,
                )
            } else {
              if (whitelistCreationFee >= Number(starsBalance.amount))
                throw new Error(
                  `Insufficient wallet balance to instantiate the whitelist. Needed amount: ${(
                    whitelistCreationFee / 1000000
                  ).toString()} STARS`,
                )
              if (Number(openEditionMinterCreationFee?.amount) > Number(creationFeeDenomBalance.amount))
                throw new Error(
                  `Insufficient wallet balance to instantiate the required contracts. Needed amount: ${(
                    Number(openEditionMinterCreationFee?.amount) / 1000000
                  ).toString()} ${
                    creationFeeDenom ? creationFeeDenom.displayName : openEditionMinterCreationFee?.denom
                  }`,
                )
            }
          } else if (Number(openEditionMinterCreationFee?.amount) > Number(creationFeeDenomBalance.amount))
            throw new Error(
              `Insufficient wallet balance to instantiate the required contracts. Needed amount: ${(
                Number(openEditionMinterCreationFee?.amount) / 1000000
              ).toString()} ${creationFeeDenom ? creationFeeDenom.displayName : openEditionMinterCreationFee?.denom}`,
            )
        })
    })
  }

  const createOpenEditionMinter = async () => {
    try {
      setCreationInProgress(true)
      setTokenUri(null)
      setCoverImageUrl(null)
      setTokenImageUri(null)
      setOpenEditionMinterContractAddress(null)
      setSg721ContractAddress(null)
      setWhitelistContractAddress(null)
      setTransactionHash(null)
      if (metadataStorageMethod === 'off-chain') {
        if (offChainMetadataUploadDetails?.uploadMethod === 'new') {
          setUploading(true)
          const metadataUri = await uploadForOffChainStorage()
          const coverImageUri = await upload(
            collectionDetails?.imageFile as File[],
            offChainMetadataUploadDetails.uploadService,
            'cover',
            offChainMetadataUploadDetails.pinataApiKey as string,
            offChainMetadataUploadDetails.pinataSecretKey as string,
            offChainMetadataUploadDetails.web3StorageEmail as string,
            collectionDetails?.name as string,
            offChainMetadataUploadDetails.fleekClientId as string,
            collectionDetails?.name as string,
          )
          const metadataUriWithBase = `ipfs://${metadataUri}/${(
            offChainMetadataUploadDetails.openEditionMinterMetadataFile as File
          ).name.substring(
            0,
            (offChainMetadataUploadDetails.openEditionMinterMetadataFile as File).name.lastIndexOf('.'),
          )}`
          const coverImageUriWithBase = `ipfs://${coverImageUri}/${(collectionDetails?.imageFile as File[])[0].name}`

          setTokenUri(metadataUriWithBase)
          setCoverImageUrl(coverImageUriWithBase)
          setUploading(false)

          let whitelist: string | undefined
          if (whitelistDetails?.whitelistState === 'existing') whitelist = whitelistDetails.contractAddress
          else if (whitelistDetails?.whitelistState === 'new') whitelist = await instantiateWhitelist()
          setWhitelistContractAddress(whitelist as string)

          await instantiateOpenEditionMinter(metadataUriWithBase, coverImageUriWithBase, undefined, whitelist)
        } else {
          setTokenUri(offChainMetadataUploadDetails?.tokenURI as string)
          setCoverImageUrl(offChainMetadataUploadDetails?.imageUrl as string)

          let whitelist: string | undefined
          if (whitelistDetails?.whitelistState === 'existing') whitelist = whitelistDetails.contractAddress
          else if (whitelistDetails?.whitelistState === 'new') whitelist = await instantiateWhitelist()
          setWhitelistContractAddress(whitelist as string)

          await instantiateOpenEditionMinter(
            offChainMetadataUploadDetails?.tokenURI as string,
            offChainMetadataUploadDetails?.imageUrl as string,
            undefined,
            whitelist,
          )
        }
      } else if (metadataStorageMethod === 'on-chain') {
        if (imageUploadDetails?.uploadMethod === 'new') {
          setUploading(true)
          const imageUri = await upload(
            [imageUploadDetails.assetFile as File],
            imageUploadDetails.uploadService,
            'cover',
            imageUploadDetails.pinataApiKey as string,
            imageUploadDetails.pinataSecretKey as string,
            imageUploadDetails.web3StorageEmail as string,
            collectionDetails?.name as string,
            imageUploadDetails.fleekClientId as string,
            collectionDetails?.name as string,
          )
          const imageUriWithBase = `ipfs://${imageUri}/${(imageUploadDetails.assetFile as File).name}`
          setTokenImageUri(imageUriWithBase)

          const coverImageUri = await upload(
            collectionDetails?.imageFile as File[],
            imageUploadDetails.uploadService,
            'cover',
            imageUploadDetails.pinataApiKey as string,
            imageUploadDetails.pinataSecretKey as string,
            imageUploadDetails.web3StorageEmail as string,
            collectionDetails?.name as string,
            imageUploadDetails.fleekClientId as string,
            collectionDetails?.name as string,
          )
          const coverImageUriWithBase = `ipfs://${coverImageUri}/${(collectionDetails?.imageFile as File[])[0].name}`
          setCoverImageUrl(coverImageUriWithBase)

          let thumbnailUri: string | undefined
          if (imageUploadDetails.isThumbnailCompatible && imageUploadDetails.thumbnailFile)
            thumbnailUri = await upload(
              [imageUploadDetails.thumbnailFile] as File[],
              imageUploadDetails.uploadService,
              'thumbnail',
              imageUploadDetails.pinataApiKey as string,
              imageUploadDetails.pinataSecretKey as string,
              imageUploadDetails.web3StorageEmail as string,
              collectionDetails?.name as string,
              imageUploadDetails.fleekClientId as string,
              collectionDetails?.name as string,
            )
          const thumbnailUriWithBase = thumbnailUri
            ? `ipfs://${thumbnailUri}/${(imageUploadDetails.thumbnailFile as File).name}`
            : undefined
          setThumbnailImageUri(thumbnailUriWithBase)
          setUploading(false)

          let whitelist: string | undefined
          if (whitelistDetails?.whitelistState === 'existing') whitelist = whitelistDetails.contractAddress
          else if (whitelistDetails?.whitelistState === 'new') whitelist = await instantiateWhitelist()
          setWhitelistContractAddress(whitelist as string)

          await instantiateOpenEditionMinter(imageUriWithBase, coverImageUriWithBase, thumbnailUriWithBase, whitelist)
        } else if (imageUploadDetails?.uploadMethod === 'existing') {
          setTokenImageUri(imageUploadDetails.imageUrl as string)
          setCoverImageUrl(imageUploadDetails.coverImageUrl as string)

          let whitelist: string | undefined
          if (whitelistDetails?.whitelistState === 'existing') whitelist = whitelistDetails.contractAddress
          else if (whitelistDetails?.whitelistState === 'new') whitelist = await instantiateWhitelist()
          setWhitelistContractAddress(whitelist as string)

          await instantiateOpenEditionMinter(
            imageUploadDetails.imageUrl as string,
            imageUploadDetails.coverImageUrl as string,
            whitelist,
          )
        }
      }
      setCreationInProgress(false)
      setReadyToCreate(false)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' }, duration: 10000 })
      addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
      setReadyToCreate(false)
      setCreationInProgress(false)
      setUploading(false)
    }
  }

  const uploadForOffChainStorage = async (): Promise<string> => {
    if (!offChainMetadataUploadDetails) throw new Error('Please select the asset and fill in the metadata')
    return new Promise((resolve, reject) => {
      upload(
        offChainMetadataUploadDetails.assetFiles,
        offChainMetadataUploadDetails.uploadService,
        'assets',
        offChainMetadataUploadDetails.pinataApiKey as string,
        offChainMetadataUploadDetails.pinataSecretKey as string,
        offChainMetadataUploadDetails.web3StorageEmail as string,
        collectionDetails?.name as string,
        offChainMetadataUploadDetails.fleekClientId as string,
        collectionDetails?.name as string,
      )
        .then(async (assetUri: string) => {
          let thumbnailUri: string | undefined
          if (offChainMetadataUploadDetails.isThumbnailCompatible && offChainMetadataUploadDetails.thumbnailFile)
            thumbnailUri = await upload(
              [offChainMetadataUploadDetails.thumbnailFile] as File[],
              offChainMetadataUploadDetails.uploadService,
              'thumbnail',
              offChainMetadataUploadDetails.pinataApiKey as string,
              offChainMetadataUploadDetails.pinataSecretKey as string,
              offChainMetadataUploadDetails.web3StorageEmail as string,
              collectionDetails?.name as string,
              offChainMetadataUploadDetails.fleekClientId as string,
              collectionDetails?.name as string,
            )
          const thumbnailUriWithBase = thumbnailUri
            ? `ipfs://${thumbnailUri}/${(offChainMetadataUploadDetails.thumbnailFile as File).name}`
            : undefined

          const fileArray: File[] = []
          const reader: FileReader = new FileReader()

          reader.onload = (e) => {
            const data: any = JSON.parse(e.target?.result as string)

            if (offChainMetadataUploadDetails.isThumbnailCompatible) {
              data.animation_url = `ipfs://${assetUri}/${offChainMetadataUploadDetails.assetFiles[0].name}`
            }

            data.image =
              offChainMetadataUploadDetails.isThumbnailCompatible && offChainMetadataUploadDetails.thumbnailFile
                ? thumbnailUriWithBase
                : `ipfs://${assetUri}/${offChainMetadataUploadDetails.assetFiles[0].name}`

            if (data.description) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              data.description = data.description.replaceAll('\\n', '\n')
            }
            const metadataFileBlob = new Blob([JSON.stringify(data)], {
              type: 'application/json',
            })

            console.log('Name: ', (offChainMetadataUploadDetails.openEditionMinterMetadataFile as File).name)
            const updatedMetadataFile = new File(
              [metadataFileBlob],
              (offChainMetadataUploadDetails.openEditionMinterMetadataFile as File).name
                .substring(
                  0,
                  (offChainMetadataUploadDetails.openEditionMinterMetadataFile as File).name.lastIndexOf('.'),
                )
                .replaceAll('#', ''),
              {
                type: 'application/json',
              },
            )

            fileArray.push(updatedMetadataFile)
          }
          reader.onloadend = () => {
            upload(
              fileArray,
              offChainMetadataUploadDetails.uploadService,
              'metadata',
              offChainMetadataUploadDetails.pinataApiKey as string,
              offChainMetadataUploadDetails.pinataSecretKey as string,
              offChainMetadataUploadDetails.web3StorageEmail as string,
              collectionDetails?.name as string,
              offChainMetadataUploadDetails.fleekClientId as string,
              collectionDetails?.name as string,
            )
              .then(resolve)
              .catch(reject)
          }
          console.log('File: ', offChainMetadataUploadDetails.openEditionMinterMetadataFile)
          reader.readAsText(offChainMetadataUploadDetails.openEditionMinterMetadataFile as File, 'utf8')
        })
        .catch(reject)
    })
  }

  const instantiateWhitelist = async () => {
    if (!wallet.isWalletConnected) throw new Error('Wallet not connected')
    if (!whitelistContract) throw new Error('Contract not found')

    if (whitelistDetails?.whitelistType === 'standard' || whitelistDetails?.whitelistType === 'flex') {
      const standardMsg = {
        members: whitelistDetails.members?.slice(0, whitelistDetails.stageCount),
        stages: whitelistDetails.stages?.slice(0, whitelistDetails.stageCount).map((stage, index) => ({
          name: stage.name || `Stage ${index + 1}`,
          start_time: stage.startTime,
          end_time: stage.endTime,
          mint_price: stage.mintPrice,
          per_address_limit: stage.perAddressLimit,
        })),
        member_limit: whitelistDetails.memberLimit,
        admins: whitelistDetails.admins || [wallet.address],
        admins_mutable: whitelistDetails.adminsMutable,
      }

      const flexMsg = {
        members: whitelistDetails.members?.slice(0, whitelistDetails.stageCount),
        stages: whitelistDetails.stages?.slice(0, whitelistDetails.stageCount).map((stage, index) => ({
          name: stage.name || `Stage ${index + 1}`,
          start_time: stage.startTime,
          end_time: stage.endTime,
          mint_price: stage.mintPrice,
        })),
        member_limit: whitelistDetails.memberLimit,
        admins: whitelistDetails.admins || [wallet.address],
        admins_mutable: whitelistDetails.adminsMutable,
      }

      const data = await whitelistContract.instantiate(
        whitelistDetails.whitelistType === 'standard' ? WHITELIST_CODE_ID : WHITELIST_FLEX_CODE_ID,
        whitelistDetails.whitelistType === 'standard' ? standardMsg : flexMsg,
        'Stargaze Tiered Whitelist Contract',
        wallet.address,
      )

      return data.contractAddress
    } else if (whitelistDetails?.whitelistType === 'merkletree') {
      const rootHashes = await Promise.all(
        (whitelistDetails.members || []).map(async (memberList, index) => {
          const members = memberList as string[]
          const membersCsv = members.join('\n')
          const membersBlob = new Blob([membersCsv], { type: 'text/csv' })
          const membersFile = new File([membersBlob], `members_${index}.csv`, { type: 'text/csv' })

          const formData = new FormData()
          formData.append('whitelist', membersFile)
          formData.append('stage_id', index.toString())

          const response = await toast
            .promise(
              axios.post(`${WHITELIST_MERKLE_TREE_API_URL}/create_whitelist`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }),
              {
                loading: `Fetching merkle root hash for WL Stage ${index + 1}...`,
                success: `Merkle root hash for WL Stage ${index + 1} fetched successfully.`,
                error: `Error fetching root hash from Whitelist Merkle Tree API for Stage ${index + 1}.`,
              },
            )
            .catch((error) => {
              console.error('error', error)
              throw new Error('Whitelist instantiation failed.')
            })
          console.log(`Stage ${index + 1} root hash: `, response.data.root_hash)
          return response.data.root_hash
        }),
      )

      console.log('rootHashes: ', rootHashes)

      const merkleTreeMsg = {
        merkle_roots: rootHashes,
        merkle_tree_uris: null,
        stages: whitelistDetails.stages?.slice(0, whitelistDetails.stageCount).map((stage, index) => ({
          name: stage.name || `Stage ${index + 1}`,
          start_time: stage.startTime,
          end_time: stage.endTime,
          mint_price: stage.mintPrice,
          per_address_limit: stage.perAddressLimit,
        })),
        admins: whitelistDetails.admins || [wallet.address],
        admins_mutable: whitelistDetails.adminsMutable,
      }

      const data = await whitelistMerkleTreeContract?.instantiate(
        WHITELIST_MERKLE_TREE_CODE_ID,
        merkleTreeMsg,
        'Stargaze Whitelist Merkle Tree Contract',
        wallet.address,
      )
      return data?.contractAddress
    } else if (whitelistDetails?.whitelistType === 'merkletree-flex') {
      const rootHashes = await Promise.all(
        (whitelistDetails.members || []).map(async (memberList, index) => {
          const members = memberList as WhitelistFlexMember[]

          const membersCsv = members.map((member) => `${member.address},${member.mint_count}`).join('\n')

          const membersBlob = new Blob([`address,count\n${membersCsv}`], { type: 'text/csv' })
          const membersFile = new File([membersBlob], `members_${index}.csv`, { type: 'text/csv' })

          const formData = new FormData()
          formData.append('whitelist', membersFile)
          formData.append('stage_id', index.toString())

          const response = await toast
            .promise(
              axios.post(`${WHITELIST_MERKLE_TREE_API_URL}/create_whitelist`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }),
              {
                loading: `Fetching merkle root hash for WL Stage ${index + 1}...`,
                success: `Merkle root hash for WL Stage ${index + 1} fetched successfully.`,
                error: `Error fetching root hash from Whitelist Merkle Tree API for Stage ${index + 1}.`,
              },
            )
            .catch((error) => {
              console.error('error', error)
              throw new Error('Whitelist instantiation failed.')
            })
          console.log(`Stage ${index + 1} root hash: `, response.data.root_hash)
          return response.data.root_hash
        }),
      )

      console.log('Root hashes:', rootHashes)

      const merkleTreeFlexMsg = {
        merkle_roots: rootHashes,
        merkle_tree_uris: null,
        stages: whitelistDetails.stages?.slice(0, whitelistDetails.stageCount).map((stage, index) => ({
          name: stage.name || `Stage ${index + 1}`,
          start_time: stage.startTime,
          end_time: stage.endTime,
          mint_price: stage.mintPrice,
          per_address_limit: 1,
        })),
        admins: whitelistDetails.admins || [wallet.address],
        admins_mutable: whitelistDetails.adminsMutable,
      }

      const data = await whitelistMerkleTreeContract?.instantiate(
        WHITELIST_MERKLE_TREE_CODE_ID,
        merkleTreeFlexMsg,
        'Stargaze Whitelist Merkle Tree Flex Contract',
        wallet.address,
      )
      return data?.contractAddress
    }
  }

  const instantiateOpenEditionMinter = async (
    uri: string,
    coverImageUri: string,
    thumbnailUri?: string,
    whitelist?: string,
  ) => {
    if (!wallet.isWalletConnected) throw new Error('Wallet not connected')
    if (!openEditionFactoryContract) throw new Error('Contract not found')
    if (!openEditionMinterContract) throw new Error('Contract not found')

    let royaltyInfo = null
    if (royaltyDetails?.royaltyType === 'new') {
      royaltyInfo = {
        payment_address: royaltyDetails.paymentAddress.trim(),
        share: (Number(royaltyDetails.share) / 100).toString(),
      }
    }

    const msg = {
      create_minter: {
        init_msg: {
          nft_data: {
            nft_data_type: metadataStorageMethod === 'off-chain' ? 'off_chain_metadata' : 'on_chain_metadata',
            token_uri: metadataStorageMethod === 'off-chain' ? uri : null,
            extension:
              metadataStorageMethod === 'on-chain'
                ? {
                    image:
                      imageUploadDetails?.isThumbnailCompatible && imageUploadDetails.thumbnailFile
                        ? thumbnailUri
                        : uri,
                    name: onChainMetadataInputDetails?.name,
                    description: onChainMetadataInputDetails?.description?.replaceAll('\\n', '\n'),
                    attributes: onChainMetadataInputDetails?.attributes,
                    external_url: onChainMetadataInputDetails?.external_url,
                    animation_url:
                      imageUploadDetails?.uploadMethod === 'existing'
                        ? onChainMetadataInputDetails?.animation_url
                        : imageUploadDetails?.isThumbnailCompatible
                        ? uri
                        : undefined,
                    youtube_url: onChainMetadataInputDetails?.youtube_url,
                  }
                : null,
          },
          start_time: mintingDetails?.startTime,
          end_time:
            mintingDetails?.limitType === ('time_limited' as LimitType) ||
            mintingDetails?.limitType === ('time_and_count_limited' as LimitType)
              ? mintingDetails.endTime
              : null,
          mint_price: {
            amount: Number(mintingDetails?.unitPrice).toString(),
            denom: (mintTokenFromFactory?.denom as string) || 'ustars',
          },
          per_address_limit: mintingDetails?.perAddressLimit,
          num_tokens:
            mintingDetails?.limitType === ('count_limited' as LimitType) ||
            mintingDetails?.limitType === ('time_and_count_limited' as LimitType)
              ? mintingDetails.tokenCountLimit
              : null,
          payment_address: mintingDetails?.paymentAddress || null,
          whitelist,
        },
        collection_params: {
          code_id: collectionDetails?.updatable
            ? SG721_OPEN_EDITION_UPDATABLE_CODE_ID
            : mintingDetails?.selectedMintToken?.displayName === 'USK' ||
              mintingDetails?.selectedMintToken?.displayName === 'USDC' ||
              mintingDetails?.selectedMintToken?.displayName === 'TIA' ||
              mintingDetails?.selectedMintToken?.displayName === 'STRDST' ||
              mintingDetails?.selectedMintToken?.displayName === 'KUJI' ||
              mintingDetails?.selectedMintToken?.displayName === 'HUAHUA' ||
              mintingDetails?.selectedMintToken?.displayName === 'BRNCH' ||
              mintingDetails?.selectedMintToken?.displayName === 'CRBRUS' ||
              mintingDetails?.selectedMintToken?.displayName === 'OSMO' ||
              mintingDetails?.selectedMintToken?.displayName === 'ATOM'
            ? STRDST_SG721_CODE_ID
            : SG721_OPEN_EDITION_CODE_ID,
          name: collectionDetails?.name,
          symbol: collectionDetails?.symbol,
          info: {
            creator: wallet.address,
            description: collectionDetails?.description.replaceAll('\\n', '\n'),
            image: coverImageUri,
            explicit_content: collectionDetails?.explicit || false,
            royalty_info: royaltyInfo,
            start_trading_time: collectionDetails?.startTradingTime || null,
          },
        },
      },
    }

    const payload: OpenEditionFactoryDispatchExecuteArgs = {
      contract: openEditionFactoryAddress as string,
      messages: openEditionFactoryMessages,
      txSigner: wallet.address || '',
      msg,
      funds: [openEditionMinterCreationFee as Coin],
      updatable: collectionDetails?.updatable,
    }
    await openEditionFactoryDispatchExecute(payload)
      .then((data) => {
        setTransactionHash(data.transactionHash)
        setOpenEditionMinterContractAddress(data.openEditionMinterAddress)
        setSg721ContractAddress(data.sg721Address)
      })
      .catch((error) => {
        toast.error(error.message, { style: { maxWidth: 'none' } })
        addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
        setUploading(false)
        setCreationInProgress(false)
      })
  }
  useEffect(() => {
    if (minterType !== 'openEdition') {
      setTransactionHash(null)
      setOpenEditionMinterContractAddress(null)
      setSg721ContractAddress(null)
      setCreationInProgress(false)
      setUploading(false)
    }
  }, [minterType])

  useEffect(() => {
    const data: OpenEditionMinterCreatorDataProps = {
      metadataStorageMethod,
      openEditionMinterContractAddress,
      sg721ContractAddress,
      whitelistContractAddress,
      transactionHash,
    }
    onChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    metadataStorageMethod,
    openEditionMinterContractAddress,
    sg721ContractAddress,
    whitelistContractAddress,
    transactionHash,
  ])

  useEffect(() => {
    const data: OpenEditionMinterDetailsDataProps = {
      imageUploadDetails: imageUploadDetails ? imageUploadDetails : undefined,
      collectionDetails: collectionDetails ? collectionDetails : undefined,
      whitelistDetails: whitelistDetails ? whitelistDetails : undefined,
      royaltyDetails: royaltyDetails ? royaltyDetails : undefined,
      onChainMetadataInputDetails: onChainMetadataInputDetails ? onChainMetadataInputDetails : undefined,
      offChainMetadataUploadDetails: offChainMetadataUploadDetails ? offChainMetadataUploadDetails : undefined,
      mintingDetails: mintingDetails ? mintingDetails : undefined,
      metadataStorageMethod,
      openEditionMinterContractAddress,
      coverImageUrl,
      tokenUri,
      tokenImageUri,
      isRefreshed,
    }
    onDetailsChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    imageUploadDetails,
    collectionDetails,
    whitelistDetails,
    royaltyDetails,
    onChainMetadataInputDetails,
    offChainMetadataUploadDetails,
    mintingDetails,
    metadataStorageMethod,
    openEditionMinterContractAddress,
    coverImageUrl,
    tokenUri,
    tokenImageUri,
    isRefreshed,
  ])

  useEffect(() => {
    if (importedOpenEditionMinterDetails) {
      setMetadataStorageMethod(importedOpenEditionMinterDetails.metadataStorageMethod as MetadataStorageMethod)
    }
  }, [importedOpenEditionMinterDetails])

  const fetchWhitelistConfig = async (contractAddress: string | undefined) => {
    if (contractAddress === '' || !whitelistDetails) return
    const contract = whitelistContract?.use(contractAddress)

    await contract
      ?.config()
      .then((config) => {
        if (!config) {
          whitelistDetails.whitelistType = 'standard'
          return
        }

        if (JSON.stringify(config).includes('whale_cap')) whitelistDetails.whitelistType = 'flex'
        else if (!JSON.stringify(config).includes('member_limit') || config.member_limit === 0) {
          // whitelistDetails.whitelistType = 'merkletree'
          toast.error(
            'Whitelist Merkle Tree is not supported yet for open edition collections. Please use a standard or flexible whitelist contract.',
          )
        } else whitelistDetails.whitelistType = 'standard'
        setIsRefreshed(!isRefreshed)
      })
      .catch((error) => {
        console.log('error', error)
      })
  }

  const debouncedWhitelistContractAddress = useDebounce(whitelistDetails?.contractAddress, 300)

  useEffect(() => {
    if (whitelistDetails?.whitelistState === 'existing' && debouncedWhitelistContractAddress !== '') {
      void fetchWhitelistConfig(debouncedWhitelistContractAddress)
    }
  }, [whitelistDetails?.whitelistState, debouncedWhitelistContractAddress])

  return (
    <div>
      {/* TODO: Cancel once we're able to index on-chain metadata */}
      <Conditional test={false}>
        <div className="mx-10 mb-4 rounded border-2 border-white/20">
          <div className="flex justify-center mb-2">
            <div className="mt-3 ml-4 font-bold form-check form-check-inline">
              <input
                checked={metadataStorageMethod === 'off-chain'}
                className="peer sr-only"
                id="inlineRadio9"
                name="inlineRadioOptions9"
                onClick={() => {
                  setMetadataStorageMethod('off-chain')
                }}
                type="radio"
                value="Off Chain"
              />
              <label
                className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black peer-checked:border-b-2 hover:border-b-2  peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                htmlFor="inlineRadio9"
              >
                Off-Chain Metadata
              </label>
            </div>
            <div className="mt-3 ml-2 font-bold form-check form-check-inline">
              <input
                checked={metadataStorageMethod === 'on-chain'}
                className="peer sr-only"
                id="inlineRadio10"
                name="inlineRadioOptions10"
                onClick={() => {
                  setMetadataStorageMethod('on-chain')
                }}
                type="radio"
                value="On Chain"
              />
              <label
                className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black peer-checked:border-b-2 hover:border-b-2  peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                htmlFor="inlineRadio10"
              >
                On-Chain Metadata
              </label>
            </div>
          </div>
        </div>
      </Conditional>
      <div className={clsx('my-0 mx-10')}>
        <Conditional test={metadataStorageMethod === 'off-chain'}>
          <div>
            <OffChainMetadataUploadDetails
              importedOffChainMetadataUploadDetails={importedOpenEditionMinterDetails?.offChainMetadataUploadDetails}
              onChange={setOffChainMetadataUploadDetails}
            />
          </div>
        </Conditional>
        <Conditional test={metadataStorageMethod === 'on-chain'}>
          <div>
            <ImageUploadDetails
              importedImageUploadDetails={importedOpenEditionMinterDetails?.imageUploadDetails}
              onChange={setImageUploadDetails}
            />
            <OnChainMetadataInputDetails
              importedOnChainMetadataInputDetails={importedOpenEditionMinterDetails?.onChainMetadataInputDetails}
              onChange={setOnChainMetadataInputDetails}
              uploadMethod={imageUploadDetails?.uploadMethod}
            />
          </div>
        </Conditional>
      </div>
      <div className="flex justify-between py-3 px-8 mx-10 rounded border-2 border-white/20 grid-col-2">
        <CollectionDetails
          coverImageUrl={
            metadataStorageMethod === 'off-chain'
              ? (offChainMetadataUploadDetails?.imageUrl as string)
              : (imageUploadDetails?.coverImageUrl as string)
          }
          importedCollectionDetails={importedOpenEditionMinterDetails?.collectionDetails}
          metadataStorageMethod={metadataStorageMethod}
          onChange={setCollectionDetails}
          uploadMethod={
            metadataStorageMethod === 'off-chain'
              ? (offChainMetadataUploadDetails?.uploadMethod as UploadMethod)
              : (imageUploadDetails?.uploadMethod as UploadMethod)
          }
        />
        <MintingDetails
          importedMintingDetails={importedOpenEditionMinterDetails?.mintingDetails}
          isPresale={whitelistDetails?.whitelistState === 'new'}
          minimumMintPrice={Number(minimumMintPrice) / 1000000}
          mintTokenFromFactory={mintTokenFromFactory}
          onChange={setMintingDetails}
          uploadMethod={offChainMetadataUploadDetails?.uploadMethod as UploadMethod}
          whitelistStartDate={(whitelistDetails?.stages ? whitelistDetails.stages[0].startTime : '') as string}
        />
      </div>

      <div className="my-6 mx-10">
        <WhitelistDetails
          importedWhitelistDetails={importedOpenEditionMinterDetails?.whitelistDetails}
          mintingTokenFromFactory={mintTokenFromFactory}
          onChange={setWhitelistDetails}
        />
      </div>

      <div className="my-6">
        <RoyaltyDetails
          importedRoyaltyDetails={importedOpenEditionMinterDetails?.royaltyDetails}
          onChange={setRoyaltyDetails}
        />
      </div>
      <div className="flex justify-end w-full">
        <Button
          className="relative justify-center p-2 mr-12 mb-6 max-h-12 text-white bg-plumbus hover:bg-plumbus-light border-0"
          isLoading={creationInProgress}
          onClick={performOpenEditionMinterChecks}
          variant="solid"
        >
          Create Collection
        </Button>
      </div>
      <Conditional test={uploading}>
        <LoadingModal />
      </Conditional>
      <Conditional test={readyToCreate}>
        <ConfirmationModal confirm={createOpenEditionMinter} />
      </Conditional>
    </div>
  )
}
