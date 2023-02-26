/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-nested-ternary */

/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { coin } from '@cosmjs/proto-signing'
import clsx from 'clsx'
import { Alert } from 'components/Alert'
import { Anchor } from 'components/Anchor'
import { Button } from 'components/Button'
import {
  CollectionDetails,
  MintingDetails,
  RoyaltyDetails,
  UploadDetails,
  WhitelistDetails,
} from 'components/collections/creation'
import type { BaseMinterDetailsDataProps } from 'components/collections/creation/BaseMinterDetails'
import { BaseMinterDetails } from 'components/collections/creation/BaseMinterDetails'
import type { CollectionDetailsDataProps } from 'components/collections/creation/CollectionDetails'
import type { MintingDetailsDataProps } from 'components/collections/creation/MintingDetails'
import type { RoyaltyDetailsDataProps } from 'components/collections/creation/RoyaltyDetails'
import type { UploadDetailsDataProps } from 'components/collections/creation/UploadDetails'
import type { WhitelistDetailsDataProps } from 'components/collections/creation/WhitelistDetails'
import { Conditional } from 'components/Conditional'
import { LoadingModal } from 'components/LoadingModal'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { DispatchExecuteArgs as BaseFactoryDispatchExecuteArgs } from 'contracts/baseFactory/messages/execute'
import { dispatchExecute as baseFactoryDispatchExecute } from 'contracts/baseFactory/messages/execute'
import type { DispatchExecuteArgs as VendingFactoryDispatchExecuteArgs } from 'contracts/vendingFactory/messages/execute'
import { dispatchExecute as vendingFactoryDispatchExecute } from 'contracts/vendingFactory/messages/execute'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { upload } from 'services/upload'
import { compareFileArrays } from 'utils/compareFileArrays'
import {
  BASE_FACTORY_ADDRESS,
  BASE_FACTORY_UPDATABLE_ADDRESS,
  BLOCK_EXPLORER_URL,
  NETWORK,
  SG721_CODE_ID,
  SG721_UPDATABLE_CODE_ID,
  STARGAZE_URL,
  VENDING_FACTORY_ADDRESS,
  VENDING_FACTORY_UPDATABLE_ADDRESS,
  WHITELIST_CODE_ID,
} from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

import type { MinterType } from '../../components/collections/actions/Combobox'
import type { UploadMethod } from '../../components/collections/creation/UploadDetails'
import { ConfirmationModal } from '../../components/ConfirmationModal'
import { getAssetType } from '../../utils/getAssetType'
import { isValidAddress } from '../../utils/isValidAddress'

const CollectionCreationPage: NextPage = () => {
  const wallet = useWallet()
  const {
    baseMinter: baseMinterContract,
    vendingMinter: vendingMinterContract,
    whitelist: whitelistContract,
    vendingFactory: vendingFactoryContract,
    baseFactory: baseFactoryContract,
  } = useContracts()
  const scrollRef = useRef<HTMLDivElement>(null)

  const vendingFactoryMessages = useMemo(
    () => vendingFactoryContract?.use(VENDING_FACTORY_ADDRESS),
    [vendingFactoryContract, wallet.address],
  )

  const baseFactoryMessages = useMemo(
    () => baseFactoryContract?.use(BASE_FACTORY_ADDRESS),
    [baseFactoryContract, wallet.address],
  )

  const [uploadDetails, setUploadDetails] = useState<UploadDetailsDataProps | null>(null)
  const [collectionDetails, setCollectionDetails] = useState<CollectionDetailsDataProps | null>(null)
  const [baseMinterDetails, setBaseMinterDetails] = useState<BaseMinterDetailsDataProps | null>(null)
  const [mintingDetails, setMintingDetails] = useState<MintingDetailsDataProps | null>(null)
  const [whitelistDetails, setWhitelistDetails] = useState<WhitelistDetailsDataProps | null>(null)
  const [royaltyDetails, setRoyaltyDetails] = useState<RoyaltyDetailsDataProps | null>(null)
  const [minterType, setMinterType] = useState<MinterType>('vending')

  const [uploading, setUploading] = useState(false)
  const [isMintingComplete, setIsMintingComplete] = useState(false)
  const [creatingCollection, setCreatingCollection] = useState(false)
  const [readyToCreateVm, setReadyToCreateVm] = useState(false)
  const [readyToCreateBm, setReadyToCreateBm] = useState(false)
  const [readyToUploadAndMint, setReadyToUploadAndMint] = useState(false)
  const [vendingMinterContractAddress, setVendingMinterContractAddress] = useState<string | null>(null)
  const [sg721ContractAddress, setSg721ContractAddress] = useState<string | null>(null)
  const [whitelistContractAddress, setWhitelistContractAddress] = useState<string | null | undefined>(null)
  const [baseTokenUri, setBaseTokenUri] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  const performVendingMinterChecks = () => {
    try {
      setReadyToCreateVm(false)
      checkUploadDetails()
      checkCollectionDetails()
      checkMintingDetails()
      checkRoyaltyDetails()
      checkWhitelistDetails()
        .then(() => {
          checkwalletBalance()
          setReadyToCreateVm(true)
        })
        .catch((err) => {
          if (String(err.message).includes('Insufficient wallet balance'))
            toast.error(`${err.message}`, { style: { maxWidth: 'none' } })
          else toast.error(`Error in Whitelist Configuration: ${err.message}`, { style: { maxWidth: 'none' } })
          setReadyToCreateVm(false)
        })
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      setUploading(false)
      setReadyToCreateVm(false)
    }
  }

  const performBaseMinterChecks = () => {
    try {
      setReadyToCreateBm(false)
      checkUploadDetails()
      checkRoyaltyDetails()
      checkCollectionDetails()
      checkWhitelistDetails()
        .then(() => {
          setReadyToCreateBm(true)
        })
        .catch((err) => {
          toast.error(`Error in Whitelist Configuration: ${err.message}`, { style: { maxWidth: 'none' } })
          setReadyToCreateBm(false)
        })
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      setUploading(false)
    }
  }

  const performUploadAndMintChecks = () => {
    try {
      setReadyToUploadAndMint(false)
      checkUploadDetails()
      checkWhitelistDetails()
        .then(() => {
          setReadyToUploadAndMint(true)
        })
        .catch((err) => {
          toast.error(`Error in Whitelist Configuration: ${err.message}`, { style: { maxWidth: 'none' } })
          setReadyToUploadAndMint(false)
        })
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      setUploading(false)
    }
  }

  const resetReadyFlags = () => {
    setReadyToCreateVm(false)
    setReadyToCreateBm(false)
    setReadyToUploadAndMint(false)
  }

  const createVendingMinterCollection = async () => {
    try {
      setCreatingCollection(true)
      setBaseTokenUri(null)
      setCoverImageUrl(null)
      setVendingMinterContractAddress(null)
      setSg721ContractAddress(null)
      setWhitelistContractAddress(null)
      setTransactionHash(null)
      if (uploadDetails?.uploadMethod === 'new') {
        setUploading(true)

        const baseUri = await uploadFiles()
        //upload coverImageUri and append the file name
        const coverImageUri = await upload(
          collectionDetails?.imageFile as File[],
          uploadDetails.uploadService,
          'cover',
          uploadDetails.nftStorageApiKey as string,
          uploadDetails.pinataApiKey as string,
          uploadDetails.pinataSecretKey as string,
        )

        setUploading(false)

        setBaseTokenUri(baseUri)
        setCoverImageUrl(coverImageUri)

        let whitelist: string | undefined
        if (whitelistDetails?.whitelistType === 'existing') whitelist = whitelistDetails.contractAddress
        else if (whitelistDetails?.whitelistType === 'new') whitelist = await instantiateWhitelist()
        setWhitelistContractAddress(whitelist as string)

        await instantiateVendingMinter(baseUri, coverImageUri, whitelist)
      } else {
        setBaseTokenUri(uploadDetails?.baseTokenURI as string)
        setCoverImageUrl(uploadDetails?.imageUrl as string)

        let whitelist: string | undefined
        if (whitelistDetails?.whitelistType === 'existing') whitelist = whitelistDetails.contractAddress
        else if (whitelistDetails?.whitelistType === 'new') whitelist = await instantiateWhitelist()
        setWhitelistContractAddress(whitelist as string)

        await instantiateVendingMinter(baseTokenUri as string, coverImageUrl as string, whitelist)
      }
      setCreatingCollection(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' }, duration: 10000 })
      setCreatingCollection(false)
      setUploading(false)
    }
  }

  const createBaseMinterCollection = async () => {
    try {
      setCreatingCollection(true)
      setBaseTokenUri(null)
      setCoverImageUrl(null)
      setVendingMinterContractAddress(null)
      setIsMintingComplete(false)
      setSg721ContractAddress(null)
      setWhitelistContractAddress(null)
      setTransactionHash(null)
      if (uploadDetails?.uploadMethod === 'new') {
        setUploading(true)

        const baseUri = await uploadFiles()
        //upload coverImageUri and append the file name
        const coverImageUri = await upload(
          collectionDetails?.imageFile as File[],
          uploadDetails.uploadService,
          'cover',
          uploadDetails.nftStorageApiKey as string,
          uploadDetails.pinataApiKey as string,
          uploadDetails.pinataSecretKey as string,
        )

        setUploading(false)
        if (uploadDetails.assetFiles.length === 1) {
          setBaseTokenUri(
            `${baseUri}/${(uploadDetails.baseMinterMetadataFile as File).name.substring(
              0,
              (uploadDetails.baseMinterMetadataFile as File).name.lastIndexOf('.'),
            )}`,
          )
        } else {
          setBaseTokenUri(baseUri)
        }
        setCoverImageUrl(coverImageUri)
        if (uploadDetails.assetFiles.length === 1) {
          await instantiateBaseMinter(
            `ipfs://${baseUri}/${(uploadDetails.baseMinterMetadataFile as File).name.substring(
              0,
              (uploadDetails.baseMinterMetadataFile as File).name.lastIndexOf('.'),
            )}`,
            coverImageUri,
          )
        } else {
          await instantiateBaseMinter(`ipfs://${baseUri}`, coverImageUri)
        }
      } else {
        setBaseTokenUri(uploadDetails?.baseTokenURI as string)
        setCoverImageUrl(uploadDetails?.imageUrl as string)

        await instantiateBaseMinter(uploadDetails?.baseTokenURI as string, uploadDetails?.imageUrl as string)
      }
      setCreatingCollection(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' }, duration: 10000 })
      setCreatingCollection(false)
      setUploading(false)
    }
  }

  const uploadAndMint = async () => {
    try {
      if (!wallet.initialized) throw new Error('Wallet not connected')
      if (!baseMinterContract) throw new Error('Contract not found')
      setCreatingCollection(true)
      setBaseTokenUri(null)
      setCoverImageUrl(null)
      setVendingMinterContractAddress(null)
      setSg721ContractAddress(null)
      setTransactionHash(null)

      if (uploadDetails?.uploadMethod === 'new') {
        console.log(JSON.stringify(uploadDetails.baseMinterMetadataFile?.text()))
        setUploading(true)
        await uploadFiles()
          .then(async (baseUri) => {
            setUploading(false)
            if (uploadDetails.assetFiles.length === 1) {
              setBaseTokenUri(
                `${baseUri}/${(uploadDetails.baseMinterMetadataFile as File).name.substring(
                  0,
                  (uploadDetails.baseMinterMetadataFile as File).name.lastIndexOf('.'),
                )}`,
              )
              const result = await baseMinterContract
                .use(baseMinterDetails?.existingBaseMinter as string)

                ?.mint(
                  wallet.address,
                  `ipfs://${baseUri}/${(uploadDetails.baseMinterMetadataFile as File).name.substring(
                    0,
                    (uploadDetails.baseMinterMetadataFile as File).name.lastIndexOf('.'),
                  )}`,
                )
              console.log(result)
              return result
            }
            setBaseTokenUri(baseUri)

            const result = await baseMinterContract
              .use(baseMinterDetails?.existingBaseMinter as string)
              ?.batchMint(wallet.address, `ipfs://${baseUri}`, uploadDetails.assetFiles.length)
            console.log(result)
            return result
          })
          .then((result) => {
            toast.success(`Token(s) minted & appended to the collection successfully! Tx Hash: ${result}`, {
              style: { maxWidth: 'none' },
              duration: 5000,
            })
            setIsMintingComplete(true)
          })
          .catch((error) => {
            toast.error(error.message, { style: { maxWidth: 'none' } })
            setUploading(false)
            setCreatingCollection(false)
            setIsMintingComplete(false)
          })
      } else {
        setBaseTokenUri(uploadDetails?.baseTokenURI as string)
        setUploading(false)
        await baseMinterContract
          .use(baseMinterDetails?.existingBaseMinter as string)
          ?.mint(wallet.address, `${uploadDetails?.baseTokenURI?.trim()}`)
          .then((result) => {
            toast.success(`Token minted & appended to the collection successfully! Tx Hash: ${result}`, {
              style: { maxWidth: 'none' },
              duration: 5000,
            })
          })
          .catch((error) => {
            toast.error(error.message, { style: { maxWidth: 'none' } })
            setUploading(false)
            setCreatingCollection(false)
          })
      }
      setCreatingCollection(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      setCreatingCollection(false)
      setUploading(false)
    }
  }

  const instantiateWhitelist = async () => {
    if (!wallet.initialized) throw new Error('Wallet not connected')
    if (!whitelistContract) throw new Error('Contract not found')

    const msg = {
      members: whitelistDetails?.members,
      start_time: whitelistDetails?.startTime,
      end_time: whitelistDetails?.endTime,
      mint_price: coin(String(Number(whitelistDetails?.unitPrice)), 'ustars'),
      per_address_limit: whitelistDetails?.perAddressLimit,
      member_limit: whitelistDetails?.memberLimit,
    }

    const data = await whitelistContract.instantiate(
      WHITELIST_CODE_ID,
      msg,
      'Stargaze Whitelist Contract',
      wallet.address,
    )

    return data.contractAddress
  }

  const instantiateVendingMinter = async (baseUri: string, coverImageUri: string, whitelist?: string) => {
    if (!wallet.initialized) throw new Error('Wallet not connected')
    if (!vendingFactoryContract) throw new Error('Contract not found')

    let royaltyInfo = null
    if (royaltyDetails?.royaltyType === 'new') {
      royaltyInfo = {
        payment_address: royaltyDetails.paymentAddress,
        share: (Number(royaltyDetails.share) / 100).toString(),
      }
    }

    const msg = {
      create_minter: {
        init_msg: {
          base_token_uri: `${uploadDetails?.uploadMethod === 'new' ? `ipfs://${baseUri}` : `${baseUri}`}`,
          start_time: mintingDetails?.startTime,
          num_tokens: mintingDetails?.numTokens,
          mint_price: {
            amount: mintingDetails?.unitPrice,
            denom: 'ustars',
          },
          per_address_limit: mintingDetails?.perAddressLimit,
          whitelist,
        },
        collection_params: {
          code_id: collectionDetails?.updatable ? SG721_UPDATABLE_CODE_ID : SG721_CODE_ID,
          name: collectionDetails?.name,
          symbol: collectionDetails?.symbol,
          info: {
            creator: wallet.address,
            description: collectionDetails?.description,
            image: `${
              uploadDetails?.uploadMethod === 'new'
                ? `ipfs://${coverImageUri}/${collectionDetails?.imageFile[0].name as string}`
                : `${coverImageUri}`
            }`,
            external_link: collectionDetails?.externalLink,
            explicit_content: collectionDetails?.explicit,
            royalty_info: royaltyInfo,
            start_trading_time: collectionDetails?.startTradingTime || null,
          },
        },
      },
    }

    const payload: VendingFactoryDispatchExecuteArgs = {
      contract: collectionDetails?.updatable ? VENDING_FACTORY_UPDATABLE_ADDRESS : VENDING_FACTORY_ADDRESS,
      messages: vendingFactoryMessages,
      txSigner: wallet.address,
      msg,
      funds: [coin(collectionDetails?.updatable ? '5000000000' : '3000000000', 'ustars')],
      updatable: collectionDetails?.updatable,
    }
    const data = await vendingFactoryDispatchExecute(payload)
    setTransactionHash(data.transactionHash)
    setVendingMinterContractAddress(data.vendingMinterAddress)
    setSg721ContractAddress(data.sg721Address)
  }

  const instantiateBaseMinter = async (baseUri: string, coverImageUri: string) => {
    if (!wallet.initialized) throw new Error('Wallet not connected')
    if (!baseFactoryContract) throw new Error('Contract not found')
    if (!baseMinterContract) throw new Error('Contract not found')

    let royaltyInfo = null
    if (royaltyDetails?.royaltyType === 'new') {
      royaltyInfo = {
        payment_address: royaltyDetails.paymentAddress,
        share: (Number(royaltyDetails.share) / 100).toString(),
      }
    }

    const msg = {
      create_minter: {
        init_msg: null,
        collection_params: {
          code_id: collectionDetails?.updatable ? SG721_UPDATABLE_CODE_ID : SG721_CODE_ID,
          name: collectionDetails?.name,
          symbol: collectionDetails?.symbol,
          info: {
            creator: wallet.address,
            description: collectionDetails?.description,
            image: `${
              uploadDetails?.uploadMethod === 'new'
                ? `ipfs://${coverImageUri}/${collectionDetails?.imageFile[0].name as string}`
                : `${coverImageUri}`
            }`,
            external_link: collectionDetails?.externalLink,
            explicit_content: collectionDetails?.explicit,
            royalty_info: royaltyInfo,
            start_trading_time: collectionDetails?.startTradingTime || null,
          },
        },
      },
    }

    const payload: BaseFactoryDispatchExecuteArgs = {
      contract: collectionDetails?.updatable ? BASE_FACTORY_UPDATABLE_ADDRESS : BASE_FACTORY_ADDRESS,
      messages: baseFactoryMessages,
      txSigner: wallet.address,
      msg,
      funds: [coin(collectionDetails?.updatable ? '3000000000' : '1000000000', 'ustars')],
      updatable: collectionDetails?.updatable,
    }
    await baseFactoryDispatchExecute(payload)
      .then(async (data) => {
        setTransactionHash(data.transactionHash)
        setVendingMinterContractAddress(data.baseMinterAddress)
        setSg721ContractAddress(data.sg721Address)
        if (uploadDetails?.assetFiles.length === 1 || uploadDetails?.uploadMethod === 'existing') {
          await toast
            .promise(
              baseMinterContract.use(data.baseMinterAddress)?.mint(wallet.address, baseUri) as Promise<string>,
              {
                loading: 'Minting token...',
                success: (result) => {
                  setIsMintingComplete(true)
                  return `Token minted successfully! Tx Hash: ${result}`
                },
                error: (error) => `Failed to mint token: ${error.message}`,
              },
              { style: { maxWidth: 'none' } },
            )
            .catch((error) => {
              toast.error(error.message, { style: { maxWidth: 'none' } })
              setUploading(false)
              setIsMintingComplete(false)
              setCreatingCollection(false)
            })
        } else {
          console.log('Here')
          console.log(data.baseMinterAddress)
          await toast
            .promise(
              baseMinterContract
                .use(data.baseMinterAddress)
                ?.batchMint(wallet.address, baseUri, uploadDetails?.assetFiles.length as number) as Promise<string>,
              {
                loading: 'Minting tokens...',
                success: (result) => {
                  setIsMintingComplete(true)
                  return `Tokens minted successfully! Tx Hash: ${result}`
                },
                error: (error) => `Failed to mint tokens: ${error.message}`,
              },
              { style: { maxWidth: 'none' } },
            )
            .catch((error) => {
              toast.error(error.message, { style: { maxWidth: 'none' } })
              setUploading(false)
              setIsMintingComplete(false)
              setCreatingCollection(false)
            })
        }
        setUploading(false)
        setCreatingCollection(false)
      })
      .catch((error) => {
        toast.error(error.message, { style: { maxWidth: 'none' } })
        setUploading(false)
        setCreatingCollection(false)
      })
  }

  const uploadFiles = async (): Promise<string> => {
    if (!uploadDetails) throw new Error('Please upload asset and metadata')
    return new Promise((resolve, reject) => {
      upload(
        uploadDetails.assetFiles,
        uploadDetails.uploadService,
        'assets',
        uploadDetails.nftStorageApiKey as string,
        uploadDetails.pinataApiKey as string,
        uploadDetails.pinataSecretKey as string,
      )
        .then((assetUri: string) => {
          if (minterType === 'vending' || (minterType === 'base' && uploadDetails.assetFiles.length > 1)) {
            const fileArray: File[] = []
            let reader: FileReader

            for (let i = 0; i < uploadDetails.metadataFiles.length; i++) {
              reader = new FileReader()
              reader.onload = (e) => {
                const data: any = JSON.parse(e.target?.result as string)

                if (
                  getAssetType(uploadDetails.assetFiles[i].name) === 'audio' ||
                  getAssetType(uploadDetails.assetFiles[i].name) === 'video' ||
                  getAssetType(uploadDetails.assetFiles[i].name) === 'html'
                ) {
                  data.animation_url = `ipfs://${assetUri}/${uploadDetails.assetFiles[i].name}`
                }
                if (getAssetType(uploadDetails.assetFiles[i].name) !== 'html')
                  data.image = `ipfs://${assetUri}/${uploadDetails.assetFiles[i].name}`

                const metadataFileBlob = new Blob([JSON.stringify(data)], {
                  type: 'application/json',
                })

                const updatedMetadataFile = new File(
                  [metadataFileBlob],
                  uploadDetails.metadataFiles[i].name.substring(
                    0,
                    uploadDetails.metadataFiles[i].name.lastIndexOf('.'),
                  ),
                  {
                    type: 'application/json',
                  },
                )

                fileArray.push(updatedMetadataFile)
              }
              reader.onloadend = () => {
                if (i === uploadDetails.metadataFiles.length - 1) {
                  upload(
                    fileArray,
                    uploadDetails.uploadService,
                    'metadata',
                    uploadDetails.nftStorageApiKey as string,
                    uploadDetails.pinataApiKey as string,
                    uploadDetails.pinataSecretKey as string,
                  )
                    .then(resolve)
                    .catch(reject)
                }
              }
              reader.readAsText(uploadDetails.metadataFiles[i], 'utf8')
            }
          } else if (minterType === 'base' && uploadDetails.assetFiles.length === 1) {
            const fileArray: File[] = []
            const reader: FileReader = new FileReader()

            reader.onload = (e) => {
              const data: any = JSON.parse(e.target?.result as string)

              if (
                getAssetType(uploadDetails.assetFiles[0].name) === 'audio' ||
                getAssetType(uploadDetails.assetFiles[0].name) === 'video'
              ) {
                data.animation_url = `ipfs://${assetUri}/${uploadDetails.assetFiles[0].name}`
              }

              data.image = `ipfs://${assetUri}/${uploadDetails.assetFiles[0].name}`

              const metadataFileBlob = new Blob([JSON.stringify(data)], {
                type: 'application/json',
              })

              console.log('Name: ', (uploadDetails.baseMinterMetadataFile as File).name)
              const updatedMetadataFile = new File(
                [metadataFileBlob],
                (uploadDetails.baseMinterMetadataFile as File).name.substring(
                  0,
                  (uploadDetails.baseMinterMetadataFile as File).name.lastIndexOf('.'),
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
                uploadDetails.uploadService,
                'metadata',
                uploadDetails.nftStorageApiKey as string,
                uploadDetails.pinataApiKey as string,
                uploadDetails.pinataSecretKey as string,
              )
                .then(resolve)
                .catch(reject)
            }
            console.log('File: ', uploadDetails.baseMinterMetadataFile)
            reader.readAsText(uploadDetails.baseMinterMetadataFile as File, 'utf8')
          }
        })
        .catch(reject)
    })
  }

  const checkUploadDetails = () => {
    if (!wallet.initialized) throw new Error('Wallet not connected.')
    if (!uploadDetails) {
      throw new Error('Please select assets and metadata')
    }
    if (
      minterType === 'base' &&
      uploadDetails.uploadMethod === 'new' &&
      uploadDetails.assetFiles.length > 1 &&
      uploadDetails.metadataFiles.length === 0
    ) {
      throw new Error('Please select metadata files')
    }
    if (uploadDetails.uploadMethod === 'new' && uploadDetails.assetFiles.length === 0) {
      throw new Error('Please select the assets')
    }
    if (minterType === 'vending' && uploadDetails.uploadMethod === 'new' && uploadDetails.metadataFiles.length === 0) {
      throw new Error('Please select the metadata files')
    }
    if (uploadDetails.uploadMethod === 'new' && minterType === 'vending')
      compareFileArrays(uploadDetails.assetFiles, uploadDetails.metadataFiles)
    if (uploadDetails.uploadMethod === 'new') {
      if (uploadDetails.uploadService === 'nft-storage') {
        if (uploadDetails.nftStorageApiKey === '') {
          throw new Error('Please enter a valid NFT.Storage API key')
        }
      } else if (uploadDetails.pinataApiKey === '' || uploadDetails.pinataSecretKey === '') {
        throw new Error('Please enter Pinata API and secret keys')
      }
    }
    if (uploadDetails.uploadMethod === 'existing' && !uploadDetails.baseTokenURI?.includes('ipfs://')) {
      throw new Error('Please specify a valid base token URI')
    }
    if (baseMinterDetails?.baseMinterAcquisitionMethod === 'existing' && !baseMinterDetails.existingBaseMinter) {
      throw new Error('Please specify a valid Base Minter contract address')
    }
  }

  const checkCollectionDetails = () => {
    if (!collectionDetails) throw new Error('Please fill out the collection details')
    if (collectionDetails.name === '') throw new Error('Collection name is required')
    if (collectionDetails.description === '') throw new Error('Collection description is required')
    if (collectionDetails.description.length > 512)
      throw new Error('Collection description cannot exceed 512 characters')
    if (uploadDetails?.uploadMethod === 'new' && collectionDetails.imageFile.length === 0)
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
    if (mintingDetails.numTokens < 1 || mintingDetails.numTokens > 10000) throw new Error('Invalid number of tokens')
    if (Number(mintingDetails.unitPrice) < 50000000)
      throw new Error('Invalid unit price: The minimum unit price is 50 STARS')
    if (
      !mintingDetails.perAddressLimit ||
      mintingDetails.perAddressLimit < 1 ||
      mintingDetails.perAddressLimit > 50 ||
      mintingDetails.perAddressLimit > mintingDetails.numTokens
    )
      throw new Error('Invalid limit for tokens per address')
    if (
      mintingDetails.numTokens > 100 &&
      mintingDetails.numTokens < 100 * mintingDetails.perAddressLimit &&
      mintingDetails.perAddressLimit > mintingDetails.numTokens / 100
    )
      throw new Error('Invalid limit for tokens per address. The limit cannot exceed 1% of the total number of tokens.')
    if (mintingDetails.startTime === '') throw new Error('Start time is required')
    if (Number(mintingDetails.startTime) < new Date().getTime() * 1000000) throw new Error('Invalid start time')
  }

  const checkWhitelistDetails = async () => {
    if (!whitelistDetails) throw new Error('Please fill out the whitelist details')
    if (whitelistDetails.whitelistType === 'existing') {
      if (whitelistDetails.contractAddress === '') throw new Error('Whitelist contract address is required')
      else {
        const contract = whitelistContract?.use(whitelistDetails.contractAddress)
        //check if the address belongs to a whitelist contract (see performChecks())
        const config = await contract?.config()
        if (Number(config?.start_time) !== Number(mintingDetails?.startTime)) {
          const whitelistStartDate = new Date(Number(config?.start_time) / 1000000)
          throw Error(`Whitelist start time (${whitelistStartDate.toLocaleString()}) does not match minting start time`)
        }
        if (
          mintingDetails?.numTokens &&
          config?.per_address_limit &&
          mintingDetails.numTokens > 100 &&
          Number(config.per_address_limit) > mintingDetails.numTokens / 100
        )
          throw Error(
            `Invalid limit for tokens per address (${config.per_address_limit} tokens). The limit cannot exceed 1% of the total number of tokens.`,
          )
      }
    } else if (whitelistDetails.whitelistType === 'new') {
      if (whitelistDetails.members?.length === 0) throw new Error('Whitelist member list cannot be empty')
      if (whitelistDetails.unitPrice === '') throw new Error('Whitelist unit price is required')
      if (Number(whitelistDetails.unitPrice) < 25000000)
        throw new Error('Invalid unit price: The minimum unit price for whitelisted addresses is 25 STARS')
      if (whitelistDetails.startTime === '') throw new Error('Start time is required')
      if (whitelistDetails.endTime === '') throw new Error('End time is required')
      if (!whitelistDetails.perAddressLimit || whitelistDetails.perAddressLimit === 0)
        throw new Error('Per address limit is required')
      if (!whitelistDetails.memberLimit || whitelistDetails.memberLimit === 0)
        throw new Error('Member limit is required')
      if (Number(whitelistDetails.startTime) > Number(whitelistDetails.endTime))
        throw new Error('Whitelist start time cannot be later than whitelist end time')
      if (Number(whitelistDetails.startTime) !== Number(mintingDetails?.startTime))
        throw new Error('Whitelist start time must be the same as the minting start time')
      if (
        mintingDetails?.numTokens &&
        whitelistDetails.perAddressLimit &&
        mintingDetails.numTokens > 100 &&
        whitelistDetails.perAddressLimit > mintingDetails.numTokens / 100
      )
        throw Error(
          `Invalid limit for tokens per address (${whitelistDetails.perAddressLimit} tokens). The limit cannot exceed 1% of the total number of tokens.`,
        )
    }
  }

  const checkRoyaltyDetails = () => {
    if (!royaltyDetails) throw new Error('Please fill out the royalty details')
    if (royaltyDetails.royaltyType === 'new') {
      if (royaltyDetails.share === 0) throw new Error('Royalty share percentage is required')
      if (royaltyDetails.share > 100 || royaltyDetails.share < 0) throw new Error('Invalid royalty share percentage')
      if (royaltyDetails.paymentAddress === '') throw new Error('Royalty payment address is required')
      if (!isValidAddress(royaltyDetails.paymentAddress)) {
        if (royaltyDetails.paymentAddress.trim().endsWith('.stars')) {
          throw new Error('Royalty payment address could not be resolved')
        }
        throw new Error('Invalid royalty payment address')
      }
    }
  }

  const checkwalletBalance = () => {
    if (!wallet.initialized) throw new Error('Wallet not connected.')
    if (minterType === 'vending' && whitelistDetails?.whitelistType === 'new' && whitelistDetails.memberLimit) {
      const amountNeeded =
        Math.ceil(Number(whitelistDetails.memberLimit) / 1000) * 100000000 +
        (collectionDetails?.updatable ? 5000000000 : 3000000000)
      if (amountNeeded >= Number(wallet.balance[0].amount))
        throw new Error('Insufficient wallet balance to instantiate the required contracts.')
    } else {
      const amountNeeded =
        minterType === 'vending'
          ? collectionDetails?.updatable
            ? 5000000000
            : 3000000000
          : collectionDetails?.updatable
          ? 3000000000
          : 1000000000
      if (amountNeeded >= Number(wallet.balance[0].amount))
        throw new Error('Insufficient wallet balance to instantiate the required contracts.')
    }
  }
  useEffect(() => {
    if (vendingMinterContractAddress !== null) scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [vendingMinterContractAddress])

  useEffect(() => {
    setBaseTokenUri(uploadDetails?.baseTokenURI as string)
    setCoverImageUrl(uploadDetails?.imageUrl as string)
  }, [uploadDetails?.baseTokenURI, uploadDetails?.imageUrl])

  useEffect(() => {
    resetReadyFlags()
    setVendingMinterContractAddress(null)
    setIsMintingComplete(false)
  }, [minterType, baseMinterDetails?.baseMinterAcquisitionMethod, uploadDetails?.uploadMethod])

  return (
    <div>
      <NextSeo
        title={
          minterType === 'base' && baseMinterDetails?.baseMinterAcquisitionMethod === 'existing'
            ? 'Append Token'
            : 'Create Collection'
        }
      />

      <div className="mt-5 space-y-5 text-center">
        <h1 className="font-heading text-4xl font-bold">
          {minterType === 'base' && baseMinterDetails?.baseMinterAcquisitionMethod === 'existing'
            ? 'Append Token'
            : 'Create Collection'}
        </h1>

        <Conditional test={uploading}>
          <LoadingModal />
        </Conditional>

        <p>
          Make sure you check our{' '}
          <Anchor className="font-bold text-plumbus hover:underline" external href={links['Docs']}>
            documentation
          </Anchor>{' '}
          on how to create your collection
        </p>
      </div>
      <div className="mx-10" ref={scrollRef}>
        <Conditional test={vendingMinterContractAddress !== null}>
          <Alert className="mt-5" type="info">
            <div>
              <Conditional test={minterType === 'vending' || isMintingComplete}>
                {minterType === 'vending' ? 'Base Token URI: ' : 'Token URI: '}{' '}
                {uploadDetails?.uploadMethod === 'new' && (
                  <Anchor
                    className="text-stargaze hover:underline"
                    external
                    href={`https://ipfs.stargaze.zone/ipfs/${baseTokenUri as string}`}
                  >
                    ipfs://{baseTokenUri as string}
                  </Anchor>
                )}
                {uploadDetails?.uploadMethod === 'existing' && (
                  <Anchor
                    className="text-stargaze hover:underline"
                    external
                    href={`https://ipfs.stargaze.zone/ipfs/${baseTokenUri?.substring(
                      baseTokenUri.lastIndexOf('ipfs://') + 7,
                    )}/`}
                  >
                    ipfs://{baseTokenUri?.substring(baseTokenUri.lastIndexOf('ipfs://') + 7)}
                  </Anchor>
                )}
                <br />
              </Conditional>
              Minter Contract Address:{'  '}
              <Anchor
                className="text-stargaze hover:underline"
                external
                href={
                  minterType === 'vending'
                    ? `/contracts/vendingMinter/query/?contractAddress=${vendingMinterContractAddress as string}`
                    : `/contracts/baseMinter/query/?contractAddress=${vendingMinterContractAddress as string}`
                }
              >
                {vendingMinterContractAddress}
              </Anchor>
              <br />
              SG721 Contract Address:{'  '}
              <Anchor
                className="text-stargaze hover:underline"
                external
                href={`/contracts/sg721/query/?contractAddress=${sg721ContractAddress as string}`}
              >
                {sg721ContractAddress}
              </Anchor>
              <br />
              <Conditional test={whitelistContractAddress !== null && whitelistContractAddress !== undefined}>
                Whitelist Contract Address:{'  '}
                <Anchor
                  className="text-stargaze hover:underline"
                  external
                  href={`/contracts/whitelist/query/?contractAddress=${whitelistContractAddress as string}`}
                >
                  {whitelistContractAddress}
                </Anchor>
                <br />
              </Conditional>
              Transaction Hash: {'  '}
              <Conditional test={NETWORK === 'testnet'}>
                <Anchor
                  className="text-stargaze hover:underline"
                  external
                  href={`${BLOCK_EXPLORER_URL}/tx/${transactionHash as string}`}
                >
                  {transactionHash}
                </Anchor>
              </Conditional>
              <Conditional test={NETWORK === 'mainnet'}>
                <Anchor
                  className="text-stargaze hover:underline"
                  external
                  href={`${BLOCK_EXPLORER_URL}/txs/${transactionHash as string}`}
                >
                  {transactionHash}
                </Anchor>
              </Conditional>
              <Button className="mt-2">
                <Anchor
                  className="text-white"
                  external
                  href={`${STARGAZE_URL}/launchpad/${vendingMinterContractAddress as string}`}
                >
                  View on Launchpad
                </Anchor>
              </Button>
            </div>
          </Alert>
        </Conditional>
      </div>

      {/* To be removed */}
      <Conditional test={BASE_FACTORY_ADDRESS === undefined}>
        <div className="mx-10 mt-5" />
      </Conditional>
      <Conditional test={BASE_FACTORY_ADDRESS !== undefined}>
        {/* /To be removed */}
        <div>
          <div
            className={clsx(
              'mx-10 mt-5',
              'grid before:absolute relative grid-cols-2 grid-flow-col items-stretch rounded',
              'before:inset-x-0 before:bottom-0 before:border-white/25',
            )}
          >
            <div
              className={clsx(
                'isolate space-y-1 border-2',
                'first-of-type:rounded-tl-md last-of-type:rounded-tr-md',
                minterType === 'vending' ? 'border-stargaze' : 'border-transparent',
                minterType !== 'vending' ? 'bg-stargaze/5 hover:bg-stargaze/80' : 'hover:bg-white/5',
              )}
            >
              <button
                className="p-4 w-full h-full text-left bg-transparent"
                onClick={() => {
                  setMinterType('vending')
                  resetReadyFlags()
                }}
                type="button"
              >
                <h4 className="font-bold">Standard Collection</h4>
                <span className="text-sm text-white/80 line-clamp-2">
                  A non-appendable collection that facilitates primary market vending machine style minting
                </span>
              </button>
            </div>
            <div
              className={clsx(
                'isolate space-y-1 border-2',
                'first-of-type:rounded-tl-md last-of-type:rounded-tr-md',
                minterType === 'base' ? 'border-stargaze' : 'border-transparent',
                minterType !== 'base' ? 'bg-stargaze/5 hover:bg-stargaze/80' : 'hover:bg-white/5',
              )}
            >
              <button
                className="p-4 w-full h-full text-left bg-transparent"
                onClick={() => {
                  setMinterType('base')
                  resetReadyFlags()
                }}
                type="button"
              >
                <h4 className="font-bold">1/1 Collection</h4>
                <span className="text-sm text-white/80 line-clamp-2">
                  An appendable collection that only allows for direct secondary market listing of tokens
                </span>
              </button>
            </div>
          </div>
        </div>
      </Conditional>

      {minterType === 'base' && (
        <div>
          <BaseMinterDetails minterType={minterType} onChange={setBaseMinterDetails} />
        </div>
      )}

      <div className="mx-10">
        <UploadDetails
          baseMinterAcquisitionMethod={baseMinterDetails?.baseMinterAcquisitionMethod}
          minterType={minterType}
          onChange={setUploadDetails}
        />

        <Conditional
          test={
            minterType === 'vending' ||
            (minterType === 'base' && baseMinterDetails?.baseMinterAcquisitionMethod === 'new')
          }
        >
          <div className="flex justify-between py-3 px-8 rounded border-2 border-white/20 grid-col-2">
            <Conditional
              test={
                minterType === 'vending' ||
                (minterType === 'base' && baseMinterDetails?.baseMinterAcquisitionMethod === 'new')
              }
            >
              <CollectionDetails
                coverImageUrl={coverImageUrl as string}
                minterType={minterType}
                onChange={setCollectionDetails}
                uploadMethod={uploadDetails?.uploadMethod as UploadMethod}
              />
            </Conditional>
            <Conditional test={minterType === 'vending'}>
              <MintingDetails
                numberOfTokens={uploadDetails?.assetFiles.length}
                onChange={setMintingDetails}
                uploadMethod={uploadDetails?.uploadMethod as UploadMethod}
              />
            </Conditional>
          </div>
        </Conditional>

        <Conditional
          test={
            minterType === 'vending' ||
            (minterType === 'base' && baseMinterDetails?.baseMinterAcquisitionMethod === 'new')
          }
        >
          <div className="my-6">
            <Conditional test={minterType === 'vending'}>
              <WhitelistDetails onChange={setWhitelistDetails} />
              <div className="my-6" />
            </Conditional>
            <RoyaltyDetails onChange={setRoyaltyDetails} />
          </div>
        </Conditional>
        <Conditional test={readyToCreateVm && minterType === 'vending'}>
          <ConfirmationModal confirm={createVendingMinterCollection} />
        </Conditional>
        <Conditional
          test={readyToCreateBm && minterType === 'base' && baseMinterDetails?.baseMinterAcquisitionMethod === 'new'}
        >
          <ConfirmationModal confirm={createBaseMinterCollection} />
        </Conditional>
        <Conditional
          test={
            readyToUploadAndMint &&
            minterType === 'base' &&
            baseMinterDetails?.baseMinterAcquisitionMethod === 'existing'
          }
        >
          <ConfirmationModal confirm={uploadAndMint} />
        </Conditional>
        <div className="flex justify-end w-full">
          <Conditional test={minterType === 'vending'}>
            <Button
              className="relative justify-center p-2 mb-6 max-h-12 text-white bg-plumbus hover:bg-plumbus-light border-0"
              isLoading={creatingCollection}
              onClick={performVendingMinterChecks}
              variant="solid"
            >
              Create Collection
            </Button>
          </Conditional>
          <Conditional test={minterType === 'base' && baseMinterDetails?.baseMinterAcquisitionMethod === 'new'}>
            <Button
              className="relative justify-center p-2 mb-6 max-h-12 text-white bg-plumbus hover:bg-plumbus-light border-0"
              isLoading={creatingCollection}
              onClick={performBaseMinterChecks}
              variant="solid"
            >
              Create Collection
            </Button>
          </Conditional>
          <Conditional test={minterType === 'base' && baseMinterDetails?.baseMinterAcquisitionMethod === 'existing'}>
            <Button
              className="relative justify-center p-2 mb-6 max-h-12 text-white bg-plumbus hover:bg-plumbus-light border-0"
              isLoading={creatingCollection}
              onClick={performUploadAndMintChecks}
              variant="solid"
            >
              Mint & Append Token(s)
            </Button>
          </Conditional>
        </div>
      </div>
    </div>
  )
}

export default withMetadata(CollectionCreationPage, { center: false })
