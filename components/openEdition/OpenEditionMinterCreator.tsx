/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-nested-ternary */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { toUtf8 } from '@cosmjs/encoding'
import { coin } from '@cosmjs/proto-signing'
import clsx from 'clsx'
import { Button } from 'components/Button'
import type { MinterType } from 'components/collections/actions/Combobox'
import { Conditional } from 'components/Conditional'
import { ConfirmationModal } from 'components/ConfirmationModal'
import { LoadingModal } from 'components/LoadingModal'
import { openEditionMinterList } from 'config/minter'
import type { TokenInfo } from 'config/token'
import { useContracts } from 'contexts/contracts'
import { addLogItem } from 'contexts/log'
import { useWallet } from 'contexts/wallet'
import type { DispatchExecuteArgs as OpenEditionFactoryDispatchExecuteArgs } from 'contracts/openEditionFactory/messages/execute'
import { dispatchExecute as openEditionFactoryDispatchExecute } from 'contracts/openEditionFactory/messages/execute'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { upload } from 'services/upload'
import {
  OPEN_EDITION_FACTORY_ADDRESS,
  OPEN_EDITION_UPDATABLE_FACTORY_ADDRESS,
  SG721_OPEN_EDITION_CODE_ID,
  SG721_OPEN_EDITION_UPDATABLE_CODE_ID,
} from 'utils/constants'
import { getAssetType } from 'utils/getAssetType'
import { isValidAddress } from 'utils/isValidAddress'
import { checkTokenUri } from 'utils/isValidTokenUri'
import { uid } from 'utils/random'

import { type CollectionDetailsDataProps, CollectionDetails } from './CollectionDetails'
import type { ImageUploadDetailsDataProps } from './ImageUploadDetails'
import { ImageUploadDetails } from './ImageUploadDetails'
import type { MintingDetailsDataProps } from './MintingDetails'
import { MintingDetails } from './MintingDetails'
import type { UploadMethod } from './OffChainMetadataUploadDetails'
import {
  type OffChainMetadataUploadDetailsDataProps,
  OffChainMetadataUploadDetails,
} from './OffChainMetadataUploadDetails'
import type { OnChainMetadataInputDetailsDataProps } from './OnChainMetadataInputDetails'
import { OnChainMetadataInputDetails } from './OnChainMetadataInputDetails'
import { type RoyaltyDetailsDataProps, RoyaltyDetails } from './RoyaltyDetails'

export type MetadataStorageMethod = 'off-chain' | 'on-chain'

export interface OpenEditionMinterDetailsDataProps {
  imageUploadDetails?: ImageUploadDetailsDataProps
  collectionDetails?: CollectionDetailsDataProps
  royaltyDetails?: RoyaltyDetailsDataProps
  onChainMetadataInputDetails?: OnChainMetadataInputDetailsDataProps
  offChainMetadataUploadDetails?: OffChainMetadataUploadDetailsDataProps
  mintingDetails?: MintingDetailsDataProps
  metadataStorageMethod?: MetadataStorageMethod
}

interface OpenEditionMinterCreatorProps {
  onChange: (data: OpenEditionMinterCreatorDataProps) => void
  onDetailsChange: (data: OpenEditionMinterDetailsDataProps) => void
  openEditionMinterUpdatableCreationFee?: string
  openEditionMinterCreationFee?: string
  minimumMintPrice?: string
  minimumUpdatableMintPrice?: string
  minterType?: MinterType
  mintTokenFromFactory?: TokenInfo | undefined
}

export interface OpenEditionMinterCreatorDataProps {
  metadataStorageMethod: MetadataStorageMethod
  openEditionMinterContractAddress: string | null
  sg721ContractAddress: string | null
  transactionHash: string | null
}

export const OpenEditionMinterCreator = ({
  onChange,
  onDetailsChange,
  openEditionMinterCreationFee,
  openEditionMinterUpdatableCreationFee,
  minimumMintPrice,
  minimumUpdatableMintPrice,
  minterType,
  mintTokenFromFactory,
}: OpenEditionMinterCreatorProps) => {
  const wallet = useWallet()
  const { openEditionMinter: openEditionMinterContract, openEditionFactory: openEditionFactoryContract } =
    useContracts()

  const [metadataStorageMethod, setMetadataStorageMethod] = useState<MetadataStorageMethod>('off-chain')
  const [imageUploadDetails, setImageUploadDetails] = useState<ImageUploadDetailsDataProps | null>(null)
  const [collectionDetails, setCollectionDetails] = useState<CollectionDetailsDataProps | null>(null)
  const [royaltyDetails, setRoyaltyDetails] = useState<RoyaltyDetailsDataProps | null>(null)
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
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  const factoryAddressForSelectedDenom =
    openEditionMinterList.find((minter) => minter.supportedToken === mintTokenFromFactory && minter.updatable === false)
      ?.factoryAddress || OPEN_EDITION_FACTORY_ADDRESS
  const updatableFactoryAddressForSelectedDenom =
    openEditionMinterList.find((minter) => minter.supportedToken === mintTokenFromFactory && minter.updatable === true)
      ?.factoryAddress || OPEN_EDITION_UPDATABLE_FACTORY_ADDRESS

  const openEditionFactoryMessages = useMemo(
    () =>
      openEditionFactoryContract?.use(
        collectionDetails?.updatable ? updatableFactoryAddressForSelectedDenom : factoryAddressForSelectedDenom,
      ),
    [
      openEditionFactoryContract,
      wallet.address,
      collectionDetails?.updatable,
      factoryAddressForSelectedDenom,
      updatableFactoryAddressForSelectedDenom,
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
    if (!wallet.initialized) throw new Error('Wallet not connected.')
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
        offChainMetadataUploadDetails.uploadService === 'nft-storage' &&
        offChainMetadataUploadDetails.nftStorageApiKey === ''
      ) {
        throw new Error('Please enter a valid NFT.Storage API key')
      } else if (
        offChainMetadataUploadDetails.uploadService === 'pinata' &&
        (offChainMetadataUploadDetails.pinataApiKey === '' || offChainMetadataUploadDetails.pinataSecretKey === '')
      ) {
        throw new Error('Please enter valid Pinata API and secret keys')
      }
    }
    if (metadataStorageMethod === 'on-chain' && imageUploadDetails?.uploadMethod === 'new') {
      if (imageUploadDetails.uploadService === 'nft-storage' && imageUploadDetails.nftStorageApiKey === '') {
        throw new Error('Please enter a valid NFT.Storage API key')
      } else if (
        imageUploadDetails.uploadService === 'pinata' &&
        (imageUploadDetails.pinataApiKey === '' || imageUploadDetails.pinataSecretKey === '')
      ) {
        throw new Error('Please enter valid Pinata API and secret keys')
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
      if (Number(mintingDetails.unitPrice) < Number(minimumUpdatableMintPrice))
        throw new Error(
          `Invalid mint price: The minimum mint price is ${Number(minimumUpdatableMintPrice) / 1000000} ${
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
    if (Number(mintingDetails.startTime) < new Date().getTime() * 1000000) throw new Error('Invalid start time')
    if (
      mintingDetails.paymentAddress &&
      (!isValidAddress(mintingDetails.paymentAddress) || !mintingDetails.paymentAddress.startsWith('stars1'))
    )
      throw new Error('Invalid payment address')
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
      const contractInfoResponse = await wallet.client
        ?.queryContractRaw(
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
        if (contractInfo && !contractInfo.contract.includes('splits'))
          throw new Error('The provided royalty payment address does not belong to a splits contract.')
        else console.log(contractInfo)
      }
    }
  }

  const checkwalletBalance = async () => {
    if (!wallet.initialized) throw new Error('Wallet not connected.')
    const amountNeeded = collectionDetails?.updatable
      ? Number(openEditionMinterUpdatableCreationFee)
      : Number(openEditionMinterCreationFee)
    await wallet.client?.getBalance(wallet.address, 'ustars').then((balance) => {
      if (amountNeeded >= Number(balance.amount))
        throw new Error(
          `Insufficient wallet balance to instantiate the required contracts. Needed amount: ${(
            amountNeeded / 1000000
          ).toString()} STARS`,
        )
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
      setTransactionHash(null)
      if (metadataStorageMethod === 'off-chain') {
        if (offChainMetadataUploadDetails?.uploadMethod === 'new') {
          setUploading(true)
          const metadataUri = await uploadForOffChainStorage()
          const coverImageUri = await upload(
            collectionDetails?.imageFile as File[],
            offChainMetadataUploadDetails.uploadService,
            'cover',
            offChainMetadataUploadDetails.nftStorageApiKey as string,
            offChainMetadataUploadDetails.pinataApiKey as string,
            offChainMetadataUploadDetails.pinataSecretKey as string,
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
          await instantiateOpenEditionMinter(metadataUriWithBase, coverImageUriWithBase)
        } else {
          setTokenUri(offChainMetadataUploadDetails?.tokenURI as string)
          setCoverImageUrl(offChainMetadataUploadDetails?.imageUrl as string)
          await instantiateOpenEditionMinter(
            offChainMetadataUploadDetails?.tokenURI as string,
            offChainMetadataUploadDetails?.imageUrl as string,
          )
        }
      } else if (metadataStorageMethod === 'on-chain') {
        if (imageUploadDetails?.uploadMethod === 'new') {
          setUploading(true)
          const imageUri = await upload(
            [imageUploadDetails.assetFile as File],
            imageUploadDetails.uploadService,
            'cover',
            imageUploadDetails.nftStorageApiKey as string,
            imageUploadDetails.pinataApiKey as string,
            imageUploadDetails.pinataSecretKey as string,
          )
          const imageUriWithBase = `ipfs://${imageUri}/${(imageUploadDetails.assetFile as File).name}`
          setTokenImageUri(imageUriWithBase)

          const coverImageUri = await upload(
            collectionDetails?.imageFile as File[],
            imageUploadDetails.uploadService,
            'cover',
            imageUploadDetails.nftStorageApiKey as string,
            imageUploadDetails.pinataApiKey as string,
            imageUploadDetails.pinataSecretKey as string,
          )
          const coverImageUriWithBase = `ipfs://${coverImageUri}/${(collectionDetails?.imageFile as File[])[0].name}`
          setCoverImageUrl(coverImageUriWithBase)

          setUploading(false)
          await instantiateOpenEditionMinter(imageUriWithBase, coverImageUriWithBase)
        } else if (imageUploadDetails?.uploadMethod === 'existing') {
          setTokenImageUri(imageUploadDetails.imageUrl as string)
          setCoverImageUrl(imageUploadDetails.coverImageUrl as string)
          await instantiateOpenEditionMinter(
            imageUploadDetails.imageUrl as string,
            imageUploadDetails.coverImageUrl as string,
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
        offChainMetadataUploadDetails.nftStorageApiKey as string,
        offChainMetadataUploadDetails.pinataApiKey as string,
        offChainMetadataUploadDetails.pinataSecretKey as string,
      )
        .then((assetUri: string) => {
          const fileArray: File[] = []
          const reader: FileReader = new FileReader()

          reader.onload = (e) => {
            const data: any = JSON.parse(e.target?.result as string)

            if (
              getAssetType(offChainMetadataUploadDetails.assetFiles[0].name) === 'audio' ||
              getAssetType(offChainMetadataUploadDetails.assetFiles[0].name) === 'video' ||
              getAssetType(offChainMetadataUploadDetails.assetFiles[0].name) === 'html'
            ) {
              data.animation_url = `ipfs://${assetUri}/${offChainMetadataUploadDetails.assetFiles[0].name}`
            }
            if (getAssetType(offChainMetadataUploadDetails.assetFiles[0].name) !== 'html')
              data.image = `ipfs://${assetUri}/${offChainMetadataUploadDetails.assetFiles[0].name}`

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
              (offChainMetadataUploadDetails.openEditionMinterMetadataFile as File).name.substring(
                0,
                (offChainMetadataUploadDetails.openEditionMinterMetadataFile as File).name.lastIndexOf('.'),
              ),
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
              offChainMetadataUploadDetails.nftStorageApiKey as string,
              offChainMetadataUploadDetails.pinataApiKey as string,
              offChainMetadataUploadDetails.pinataSecretKey as string,
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

  const instantiateOpenEditionMinter = async (uri: string, coverImageUri: string) => {
    if (!wallet.initialized) throw new Error('Wallet not connected')
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
                    image: uri,
                    name: onChainMetadataInputDetails?.name,
                    description: onChainMetadataInputDetails?.description?.replaceAll('\\n', '\n'),
                    attributes: onChainMetadataInputDetails?.attributes,
                    external_url: onChainMetadataInputDetails?.external_url,
                    animation_url:
                      imageUploadDetails?.uploadMethod === 'existing'
                        ? onChainMetadataInputDetails?.animation_url
                        : getAssetType(imageUploadDetails?.assetFile?.name as string) === 'video'
                        ? uri
                        : undefined,
                    youtube_url: onChainMetadataInputDetails?.youtube_url,
                  }
                : null,
          },
          start_time: mintingDetails?.startTime,
          end_time: mintingDetails?.endTime,
          mint_price: {
            amount: Number(mintingDetails?.unitPrice).toString(),
            denom: (mintTokenFromFactory?.denom as string) || 'ustars',
          },
          per_address_limit: mintingDetails?.perAddressLimit,
          payment_address: mintingDetails?.paymentAddress || null,
        },
        collection_params: {
          code_id: collectionDetails?.updatable ? SG721_OPEN_EDITION_UPDATABLE_CODE_ID : SG721_OPEN_EDITION_CODE_ID,
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

    console.log('msg: ', msg)
    console.log('Using factory address: ', factoryAddressForSelectedDenom)
    const payload: OpenEditionFactoryDispatchExecuteArgs = {
      contract: collectionDetails?.updatable ? updatableFactoryAddressForSelectedDenom : factoryAddressForSelectedDenom,
      messages: openEditionFactoryMessages,
      txSigner: wallet.address,
      msg,
      funds: [
        coin(
          collectionDetails?.updatable
            ? (openEditionMinterUpdatableCreationFee as string)
            : (openEditionMinterCreationFee as string),
          'ustars',
        ),
      ],
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
      transactionHash,
    }
    onChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataStorageMethod, openEditionMinterContractAddress, sg721ContractAddress, transactionHash])

  useEffect(() => {
    const data: OpenEditionMinterDetailsDataProps = {
      imageUploadDetails: imageUploadDetails ? imageUploadDetails : undefined,
      collectionDetails: collectionDetails ? collectionDetails : undefined,
      royaltyDetails: royaltyDetails ? royaltyDetails : undefined,
      onChainMetadataInputDetails: onChainMetadataInputDetails ? onChainMetadataInputDetails : undefined,
      offChainMetadataUploadDetails: offChainMetadataUploadDetails ? offChainMetadataUploadDetails : undefined,
      mintingDetails: mintingDetails ? mintingDetails : undefined,
      metadataStorageMethod,
    }
    onDetailsChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    imageUploadDetails,
    collectionDetails,
    royaltyDetails,
    onChainMetadataInputDetails,
    offChainMetadataUploadDetails,
    mintingDetails,
  ])

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
      <div className={clsx('my-4 mx-10')}>
        <Conditional test={metadataStorageMethod === 'off-chain'}>
          <div>
            <OffChainMetadataUploadDetails onChange={setOffChainMetadataUploadDetails} />
          </div>
        </Conditional>
        <Conditional test={metadataStorageMethod === 'on-chain'}>
          <div>
            <ImageUploadDetails onChange={setImageUploadDetails} />
            <OnChainMetadataInputDetails
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
          metadataStorageMethod={metadataStorageMethod}
          onChange={setCollectionDetails}
          uploadMethod={
            metadataStorageMethod === 'off-chain'
              ? (offChainMetadataUploadDetails?.uploadMethod as UploadMethod)
              : (imageUploadDetails?.uploadMethod as UploadMethod)
          }
        />
        <MintingDetails
          minimumMintPrice={
            collectionDetails?.updatable
              ? Number(minimumUpdatableMintPrice) / 1000000
              : Number(minimumMintPrice) / 1000000
          }
          mintTokenFromFactory={mintTokenFromFactory}
          onChange={setMintingDetails}
          uploadMethod={offChainMetadataUploadDetails?.uploadMethod as UploadMethod}
        />
      </div>
      <div className="my-6">
        <RoyaltyDetails onChange={setRoyaltyDetails} />
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
