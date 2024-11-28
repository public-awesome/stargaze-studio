/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-misused-promises */

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { toUtf8 } from '@cosmjs/encoding'
import type { Coin } from '@cosmjs/proto-signing'
import clsx from 'clsx'
import { Button } from 'components/Button'
import type { MinterType } from 'components/collections/actions/Combobox'
import { Conditional } from 'components/Conditional'
import { ConfirmationModal } from 'components/ConfirmationModal'
import { LoadingModal } from 'components/LoadingModal'
import { tokensList } from 'config/token'
import { useContracts } from 'contexts/contracts'
import { addLogItem } from 'contexts/log'
import type { DispatchExecuteArgs as TokenMergeFactoryDispatchExecuteArgs } from 'contracts/tokenMergeFactory/messages/execute'
import { dispatchExecute as tokenMergeFactoryDispatchExecute } from 'contracts/tokenMergeFactory/messages/execute'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { upload } from 'services/upload'
import { compareFileArrays } from 'utils/compareFileArrays'
import { STRDST_SG721_CODE_ID } from 'utils/constants'
import { getAssetType } from 'utils/getAssetType'
import { isValidAddress } from 'utils/isValidAddress'
import { checkTokenUri } from 'utils/isValidTokenUri'
import { uid } from 'utils/random'
import { useWallet } from 'utils/wallet'

import { type CollectionDetailsDataProps, CollectionDetails } from './CollectionDetails'
import type { MintingDetailsDataProps } from './MintingDetails'
import { MintingDetails } from './MintingDetails'
import { type RoyaltyDetailsDataProps, RoyaltyDetails } from './RoyaltyDetails'
import type { UploadDetailsDataProps, UploadMethod } from './UploadDetails'
import { UploadDetails } from './UploadDetails'

export interface TokenMergeMinterDetailsDataProps {
  uploadDetails?: UploadDetailsDataProps
  collectionDetails?: CollectionDetailsDataProps
  royaltyDetails?: RoyaltyDetailsDataProps
  mintingDetails?: MintingDetailsDataProps
  tokenMergeMinterContractAddress?: string | null
  coverImageUrl?: string | null
  baseTokenUri?: string | null
  isRefreshed?: boolean
}

interface TokenMergeMinterCreatorProps {
  onChange: (data: TokenMergeMinterCreatorDataProps) => void
  onDetailsChange: (data: TokenMergeMinterDetailsDataProps) => void
  tokenMergeMinterCreationFee?: Coin
  minterType?: MinterType
  importedTokenMergeMinterDetails?: TokenMergeMinterDetailsDataProps
  isMatchingFactoryPresent?: boolean
  tokenMergeFactoryAddress?: string
}

export interface TokenMergeMinterCreatorDataProps {
  tokenMergeMinterContractAddress: string | null
  sg721ContractAddress: string | null
  transactionHash: string | null
}

export const TokenMergeMinterCreator = ({
  onChange,
  onDetailsChange,
  tokenMergeMinterCreationFee,
  minterType,
  importedTokenMergeMinterDetails,
  isMatchingFactoryPresent,
  tokenMergeFactoryAddress,
}: TokenMergeMinterCreatorProps) => {
  const wallet = useWallet()
  const { tokenMergeMinter: tokenMergeMinterContract, tokenMergeFactory: tokenMergeFactoryContract } = useContracts()

  const [uploadDetails, setUploadDetails] = useState<UploadDetailsDataProps | null>(null)
  const [mintingDetails, setMintingDetails] = useState<MintingDetailsDataProps | null>(null)
  const [collectionDetails, setCollectionDetails] = useState<CollectionDetailsDataProps | null>(null)
  const [royaltyDetails, setRoyaltyDetails] = useState<RoyaltyDetailsDataProps | null>(null)
  const [isRefreshed, setIsRefreshed] = useState(false)

  const [creationInProgress, setCreationInProgress] = useState(false)
  const [readyToCreate, setReadyToCreate] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [baseTokenUri, setBaseTokenUri] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [tokenMergeMinterContractAddress, setTokenMergeMinterContractAddress] = useState<string | null>(null)
  const [sg721ContractAddress, setSg721ContractAddress] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  const tokenMergeFactoryMessages = useMemo(
    () => tokenMergeFactoryContract?.use(tokenMergeFactoryAddress as string),
    [
      tokenMergeFactoryContract,
      wallet.address,
      collectionDetails?.updatable,
      tokenMergeFactoryAddress,
      wallet.isWalletConnected,
    ],
  )

  const performTokenMergeMinterChecks = () => {
    try {
      setReadyToCreate(false)
      checkCollectionDetails()
      checkMintingDetails()
      checkUploadDetails()
      void checkBurnCollectionAddresses()
        .then(() => {
          void checkExistingTokenURI()
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
                  if (String(error.message).includes('Insufficient wallet balance')) {
                    toast.error(`${error.message}`, { style: { maxWidth: 'none' } })
                    addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
                  } else {
                    toast.error(`Error in Royalty Details: ${error.message}`, { style: { maxWidth: 'none' } })
                    addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
                    setReadyToCreate(false)
                  }
                })
            })
            .catch((error: any) => {
              toast.error(`Error in Base Token URI: ${error.message}`, { style: { maxWidth: 'none' } })
              addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
              setReadyToCreate(false)
            })
        })
        .catch((error: any) => {
          toast.error(`Error in Burn Collection Addresses: ${error.message}`, { style: { maxWidth: 'none' } })
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

  const checkExistingTokenURI = async () => {
    if (uploadDetails?.uploadMethod === 'existing') await checkTokenUri(uploadDetails.baseTokenURI as string, true)
  }

  const checkUploadDetails = () => {
    if (!wallet.isWalletConnected) throw new Error('Wallet not connected.')
    if (!uploadDetails) {
      throw new Error('Please select assets and metadata')
    }
    if (uploadDetails.uploadMethod === 'new' && uploadDetails.assetFiles.length === 0) {
      throw new Error('Please select the assets')
    }
    if (uploadDetails.uploadMethod === 'new' && uploadDetails.metadataFiles.length === 0) {
      throw new Error('Please select the metadata files')
    }
    if (uploadDetails.uploadMethod === 'new') compareFileArrays(uploadDetails.assetFiles, uploadDetails.metadataFiles)
    if (uploadDetails.uploadMethod === 'new') {
      if (
        uploadDetails.uploadService === 'pinata' &&
        (uploadDetails.pinataApiKey === '' || uploadDetails.pinataSecretKey === '')
      ) {
        throw new Error('Please enter Pinata API and secret keys')
      } else if (uploadDetails.uploadService === 'web3-storage' && uploadDetails.web3StorageEmail?.toString() === '') {
        throw new Error('Please enter a valid Web3.Storage email')
      } else if (uploadDetails.uploadService === 'fleek' && uploadDetails.fleekClientId === '') {
        throw new Error('Please enter a valid Fleek client ID')
      }
      if (uploadDetails.uploadService === 'web3-storage' && !uploadDetails.web3StorageLoginSuccessful)
        throw new Error('Please complete the login process for Web3.Storage')
    }
    if (uploadDetails.uploadMethod === 'existing' && !uploadDetails.baseTokenURI?.includes('ipfs://')) {
      throw new Error('Please specify a valid base token URI')
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

  const checkBurnCollectionAddresses = async () => {
    const burnCollections = mintingDetails?.selectedCollections
    if (burnCollections?.some((collection) => collection.amount === 0)) {
      throw new Error('Token amount to be burned cannot be zero.')
    }

    const collectionAddresses = burnCollections?.map((collection) => collection.address)
    if (new Set(collectionAddresses).size !== collectionAddresses?.length) {
      throw new Error('Duplicate burn collection addresses found.')
    }

    const queryClient = await wallet.getCosmWasmClient()

    for (const collectionAddress of collectionAddresses || []) {
      try {
        const contractInfoResponse = await queryClient.queryContractRaw(collectionAddress, toUtf8('contract_info'))

        if (contractInfoResponse) {
          const contractInfo = JSON.parse(new TextDecoder().decode(contractInfoResponse as Uint8Array))
          if (!contractInfo.contract.includes('sg721')) {
            throw new Error(
              `The provided burn collection address (${collectionAddress}) does not belong to a compatible sg721 contract.`,
            )
          } else {
            console.log(contractInfo)
          }
        }
      } catch (e: any) {
        if (e.message.includes('bech32')) {
          throw new Error(`Invalid burn collection address: ${collectionAddress}`)
        } else {
          throw new Error(`${e.message}`)
        }
      }
    }
  }
  const checkMintingDetails = () => {
    if (!mintingDetails) throw new Error('Please fill out the minting details')
    if (mintingDetails.numTokens < 1 || mintingDetails.numTokens > 10000) throw new Error('Invalid number of tokens')
    // if (mintingDetails.unitPrice === '') throw new Error('Public mint price is required')

    if (
      !mintingDetails.perAddressLimit ||
      mintingDetails.perAddressLimit < 1 ||
      mintingDetails.perAddressLimit > 50 ||
      mintingDetails.perAddressLimit > mintingDetails.numTokens
    )
      throw new Error('Invalid limit for tokens per address')
    if (mintingDetails.numTokens < 100 && mintingDetails.perAddressLimit > 3)
      throw new Error(
        'Invalid limit for tokens per address. Tokens per address limit cannot exceed 3 for collections with less than 100 tokens in total.',
      )
    if (
      mintingDetails.numTokens >= 100 &&
      mintingDetails.perAddressLimit > Math.ceil((mintingDetails.numTokens / 100) * 3)
    )
      throw new Error(
        'Invalid limit for tokens per address. Tokens per address limit cannot exceed 3% of the total number of tokens in the collection.',
      )
    if (mintingDetails.startTime === '') throw new Error('Start time is required')
    if (Number(mintingDetails.startTime) < new Date().getTime() * 1000000) throw new Error('Invalid start time')

    if (!isMatchingFactoryPresent) throw new Error(`No matching token merge factory contract found.`)
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
          if (e.message.includes('bech32')) throw new Error('Invalid royalty payment address.')
          console.log(e.message)
        })
      if (contractInfoResponse !== undefined) {
        const contractInfo = JSON.parse(new TextDecoder().decode(contractInfoResponse as Uint8Array))

        if (contractInfo && (contractInfo.contract.includes('minter') || contractInfo.contract.includes('sg721')))
          throw new Error('The provided royalty payment address does not belong to a compatible contract.')
        else console.log(contractInfo)
      }
    }
  }

  const checkwalletBalance = async () => {
    if (!wallet.isWalletConnected) throw new Error('Wallet not connected.')
    const queryClient = await wallet.getCosmWasmClient()
    const creationFeeDenom = tokensList.find((token) => token.denom === tokenMergeMinterCreationFee?.denom)

    await queryClient
      .getBalance(wallet.address || '', tokenMergeMinterCreationFee?.denom as string)
      .then((creationFeeDenomBalance) => {
        if (Number(tokenMergeMinterCreationFee?.amount) > Number(creationFeeDenomBalance.amount))
          throw new Error(
            `Insufficient wallet balance to instantiate the required contracts. Needed amount: ${(
              Number(tokenMergeMinterCreationFee?.amount) / 1000000
            ).toString()} ${creationFeeDenom ? creationFeeDenom.displayName : tokenMergeMinterCreationFee?.denom}`,
          )
      })
      .catch((error) => {
        throw new Error(`Error in wallet balance: ${error.message}`)
      })
  }

  const createTokenMergeMinterCollection = async () => {
    try {
      setCreationInProgress(true)
      setBaseTokenUri(null)
      setCoverImageUrl(null)
      setTokenMergeMinterContractAddress(null)
      setSg721ContractAddress(null)
      setTransactionHash(null)
      if (uploadDetails?.uploadMethod === 'new') {
        setUploading(true)

        const baseUri = await uploadFiles()
        //upload coverImageUri and append the file name
        const coverImageUri = await upload(
          collectionDetails?.imageFile as File[],
          uploadDetails.uploadService,
          'cover',
          uploadDetails.pinataApiKey as string,
          uploadDetails.pinataSecretKey as string,
          uploadDetails.web3StorageEmail as string,
          collectionDetails?.name as string,
          uploadDetails.fleekClientId as string,
          collectionDetails?.name as string,
        )

        setUploading(false)

        setBaseTokenUri(baseUri)
        setCoverImageUrl(coverImageUri)

        await instantiateTokenMergeMinter(baseUri, coverImageUri)
      } else {
        setBaseTokenUri(uploadDetails?.baseTokenURI as string)
        setCoverImageUrl(uploadDetails?.imageUrl as string)
        await instantiateTokenMergeMinter(uploadDetails?.baseTokenURI as string, uploadDetails?.imageUrl as string)
      }
      setCreationInProgress(false)
      setReadyToCreate(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' }, duration: 10000 })
      addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
      setCreationInProgress(false)
      setReadyToCreate(false)
      setUploading(false)
    }
  }

  const uploadFiles = async (): Promise<string> => {
    if (!uploadDetails) throw new Error('Please upload asset and metadata')
    return new Promise((resolve, reject) => {
      upload(
        uploadDetails.assetFiles,
        uploadDetails.uploadService,
        'assets',
        uploadDetails.pinataApiKey as string,
        uploadDetails.pinataSecretKey as string,
        uploadDetails.web3StorageEmail as string,
        collectionDetails?.name as string,
        uploadDetails.fleekClientId as string,
        collectionDetails?.name as string,
      )
        .then(async (assetUri: string) => {
          let thumbnailUri: string | undefined
          if (uploadDetails.thumbnailFiles && uploadDetails.thumbnailFiles.length > 0) {
            thumbnailUri = await upload(
              uploadDetails.thumbnailFiles,
              uploadDetails.uploadService,
              'thumbnail',
              uploadDetails.pinataApiKey as string,
              uploadDetails.pinataSecretKey as string,
              uploadDetails.web3StorageEmail as string,
              collectionDetails?.name as string,
              uploadDetails.fleekClientId as string,
              collectionDetails?.name as string,
            )
          }

          const fileArray: File[] = []
          let reader: FileReader

          for (let i = 0; i < uploadDetails.metadataFiles.length; i++) {
            reader = new FileReader()
            reader.onload = (e) => {
              const data: any = JSON.parse(e.target?.result as string)

              if (
                getAssetType(uploadDetails.assetFiles[i].name) === 'audio' ||
                getAssetType(uploadDetails.assetFiles[i].name) === 'video' ||
                getAssetType(uploadDetails.assetFiles[i].name) === 'html' ||
                getAssetType(uploadDetails.assetFiles[i].name) === 'document'
              ) {
                data.animation_url = `ipfs://${assetUri}/${uploadDetails.assetFiles[i].name}`
              }
              data.image = `ipfs://${
                thumbnailUri &&
                (uploadDetails.thumbnailCompatibleAssetFileNames as string[]).includes(
                  uploadDetails.assetFiles[i].name.split('.')[0],
                )
                  ? thumbnailUri
                  : assetUri
              }/${
                thumbnailUri &&
                (uploadDetails.thumbnailCompatibleAssetFileNames as string[]).includes(
                  uploadDetails.assetFiles[i].name.split('.')[0],
                )
                  ? uploadDetails.thumbnailFiles?.find(
                      (thumbnailFile) =>
                        thumbnailFile.name.split('.')[0] === uploadDetails.assetFiles[i].name.split('.')[0],
                    )?.name
                  : uploadDetails.assetFiles[i].name
              }`
              if (data.description) {
                data.description = data.description.replaceAll('\\n', '\n')
              }
              const metadataFileBlob = new Blob([JSON.stringify(data)], {
                type: 'application/json',
              })

              const updatedMetadataFile = new File(
                [metadataFileBlob],
                uploadDetails.metadataFiles[i].name
                  .substring(0, uploadDetails.metadataFiles[i].name.lastIndexOf('.'))
                  .replaceAll('#', ''),
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
                  uploadDetails.pinataApiKey as string,
                  uploadDetails.pinataSecretKey as string,
                  uploadDetails.web3StorageEmail as string,
                  collectionDetails?.name as string,
                  uploadDetails.fleekClientId as string,
                  collectionDetails?.name as string,
                )
                  .then(resolve)
                  .catch(reject)
              }
            }
            reader.readAsText(uploadDetails.metadataFiles[i], 'utf8')
          }
        })
        .catch(reject)
    })
  }

  const instantiateTokenMergeMinter = async (baseUri: string, coverImageUri: string) => {
    if (!wallet.isWalletConnected) throw new Error('Wallet not connected')
    if (!tokenMergeFactoryContract) throw new Error('Contract not found')
    if (!tokenMergeMinterContract) throw new Error('Contract not found')

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
          base_token_uri: `${uploadDetails?.uploadMethod === 'new' ? `ipfs://${baseUri}` : `${baseUri}`}`,
          start_time: mintingDetails?.startTime,
          num_tokens: mintingDetails?.numTokens,
          mint_tokens: mintingDetails?.selectedCollections?.map((collection) => ({
            collection: collection.address,
            amount: collection.amount,
          })),
          payment_address: mintingDetails?.paymentAddress ? mintingDetails.paymentAddress : undefined,
          per_address_limit: mintingDetails?.perAddressLimit,
        },
        collection_params: {
          code_id: STRDST_SG721_CODE_ID,

          name: collectionDetails?.name,
          symbol: collectionDetails?.symbol,
          info: {
            creator: wallet.address,
            description: collectionDetails?.description.replaceAll('\\n', '\n'),
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

    const payload: TokenMergeFactoryDispatchExecuteArgs = {
      contract: tokenMergeFactoryAddress as string,
      messages: tokenMergeFactoryMessages,
      txSigner: wallet.address || '',
      msg,
      funds: [tokenMergeMinterCreationFee as Coin],
      updatable: collectionDetails?.updatable,
    }
    await tokenMergeFactoryDispatchExecute(payload)
      .then((data) => {
        setTransactionHash(data.transactionHash)
        setTokenMergeMinterContractAddress(data.tokenMergeMinterAddress)
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
    if (minterType !== 'token-merge') {
      setTransactionHash(null)
      setTokenMergeMinterContractAddress(null)
      setSg721ContractAddress(null)
      setCreationInProgress(false)
      setUploading(false)
    }
  }, [minterType])

  useEffect(() => {
    const data: TokenMergeMinterCreatorDataProps = {
      tokenMergeMinterContractAddress,
      sg721ContractAddress,
      transactionHash,
    }
    onChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenMergeMinterContractAddress, sg721ContractAddress, transactionHash])

  useEffect(() => {
    const data: TokenMergeMinterDetailsDataProps = {
      uploadDetails: uploadDetails ? uploadDetails : undefined,
      collectionDetails: collectionDetails ? collectionDetails : undefined,
      royaltyDetails: royaltyDetails ? royaltyDetails : undefined,
      mintingDetails: mintingDetails ? mintingDetails : undefined,
      tokenMergeMinterContractAddress,
      coverImageUrl,
      baseTokenUri,
      isRefreshed,
    }
    onDetailsChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    uploadDetails,
    collectionDetails,
    royaltyDetails,
    mintingDetails,
    tokenMergeMinterContractAddress,
    coverImageUrl,
    baseTokenUri,
    isRefreshed,
  ])

  return (
    <div>
      <div className={clsx('my-0 mx-10')}>
        <UploadDetails
          importedUploadDetails={importedTokenMergeMinterDetails?.uploadDetails}
          onChange={setUploadDetails}
        />
      </div>
      <div className="flex justify-between py-3 px-8 mx-10 rounded border-2 border-white/20 grid-col-2">
        <CollectionDetails
          coverImageUrl={uploadDetails?.imageUrl as string}
          importedCollectionDetails={importedTokenMergeMinterDetails?.collectionDetails}
          onChange={setCollectionDetails}
          uploadMethod={uploadDetails?.uploadMethod as UploadMethod}
        />
        <MintingDetails
          importedMintingDetails={importedTokenMergeMinterDetails?.mintingDetails}
          numberOfTokens={uploadDetails?.assetFiles.length}
          onChange={setMintingDetails}
          uploadMethod={uploadDetails?.uploadMethod as UploadMethod}
        />
      </div>

      <div className="my-6">
        <RoyaltyDetails
          importedRoyaltyDetails={importedTokenMergeMinterDetails?.royaltyDetails}
          onChange={setRoyaltyDetails}
        />
      </div>
      <div className="flex justify-end w-full">
        <Button
          className="relative justify-center p-2 mr-12 mb-6 max-h-12 text-white bg-plumbus hover:bg-plumbus-light border-0"
          isLoading={creationInProgress}
          onClick={performTokenMergeMinterChecks}
          variant="solid"
        >
          Create Collection
        </Button>
      </div>
      <Conditional test={uploading}>
        <LoadingModal />
      </Conditional>
      <Conditional test={readyToCreate}>
        <ConfirmationModal confirm={createTokenMergeMinterCollection} />
      </Conditional>
    </div>
  )
}
