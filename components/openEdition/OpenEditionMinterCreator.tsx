/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { coin } from '@cosmjs/proto-signing'
import clsx from 'clsx'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ConfirmationModal } from 'components/ConfirmationModal'
import { LoadingModal } from 'components/LoadingModal'
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
  SG721_CODE_ID,
  SG721_UPDATABLE_CODE_ID,
} from 'utils/constants'
import { getAssetType } from 'utils/getAssetType'
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

export interface OpenEditionMinterInfo {
  name: string
  minter: string
  contractAddress: string
}

interface OpenEditionMinterCreatorProps {
  onChange: (data: OpenEditionMinterCreatorDataProps) => void
  openEditionMinterUpdatableCreationFee?: string
  openEditionMinterCreationFee?: string
  minimumMintPrice?: string
  minimumUpdatableMintPrice?: string
}

export interface OpenEditionMinterCreatorDataProps {
  metadataStorageMethod: MetadataStorageMethod
}

export const OpenEditionMinterCreator = ({
  onChange,
  openEditionMinterCreationFee,
  openEditionMinterUpdatableCreationFee,
  minimumMintPrice,
  minimumUpdatableMintPrice,
}: OpenEditionMinterCreatorProps) => {
  const wallet = useWallet()
  const { openEditionMinter: openEditionMinterContract, openEditionFactory: openEditionFactoryContract } =
    useContracts()

  const openEditionFactoryMessages = useMemo(
    () => openEditionFactoryContract?.use(OPEN_EDITION_FACTORY_ADDRESS),
    [openEditionFactoryContract, wallet.address],
  )
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

  const performOpenEditionMinterChecks = () => {
    try {
      //setReadyToCreate(false)
      // checkUploadDetails()
      // checkCollectionDetails()
      // checkMintingDetails()
      // void checkRoyaltyDetails()
      //   .then(() => {
      //     checkWhitelistDetails()
      //       .then(() => {
      //         checkwalletBalance()
      //         setReadyToCreateVm(true)
      //       })
      //       .catch((error) => {
      //         if (String(error.message).includes('Insufficient wallet balance')) {
      //           toast.error(`${error.message}`, { style: { maxWidth: 'none' } })
      //           addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
      //         } else {
      //           toast.error(`Error in Whitelist Configuration: ${error.message}`, { style: { maxWidth: 'none' } })
      //           addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
      //         }
      //         setReadyToCreateVm(false)
      //       })
      //   })
      //   .catch((error) => {
      //     toast.error(`Error in Royalty Details: ${error.message}`, { style: { maxWidth: 'none' } })
      //     addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
      //     setReadyToCreateVm(false)
      //   })
      setReadyToCreate(true)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
      setUploading(false)
      setReadyToCreate(false)
    }
  }

  useEffect(() => {
    console.log(readyToCreate)
  }, [readyToCreate])

  // TODO: Reset Ready Flag, reset contract address

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
          console.log('Token URI:', metadataUri)
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

          console.log('Image URI:', imageUriWithBase)
          console.log('Cover Image URI:', coverImageUriWithBase)
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
              getAssetType(offChainMetadataUploadDetails.assetFiles[0].name) === 'video'
            ) {
              data.animation_url = `ipfs://${assetUri}/${offChainMetadataUploadDetails.assetFiles[0].name}`
            }

            data.image = `ipfs://${assetUri}/${offChainMetadataUploadDetails.assetFiles[0].name}`

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
                    description: onChainMetadataInputDetails?.description,
                    attributes: onChainMetadataInputDetails?.attributes,
                    external_url: onChainMetadataInputDetails?.external_url,
                    animation_url: onChainMetadataInputDetails?.animation_url,
                    youtube_url: onChainMetadataInputDetails?.youtube_url,
                  }
                : null,
          },
          start_time: mintingDetails?.startTime,
          end_time: mintingDetails?.endTime,
          mint_price: {
            amount: (Number(mintingDetails?.unitPrice) * 1000000).toString(),
            denom: 'ustars',
          },
          per_address_limit: mintingDetails?.perAddressLimit,
          payment_address: mintingDetails?.paymentAddress || null,
        },
        collection_params: {
          code_id: collectionDetails?.updatable ? SG721_UPDATABLE_CODE_ID : SG721_CODE_ID,
          name: collectionDetails?.name,
          symbol: collectionDetails?.symbol,
          info: {
            creator: wallet.address,
            description: collectionDetails?.description,
            image: coverImageUri,
            explicit_content: collectionDetails?.explicit || false,
            royalty_info: royaltyInfo,
            start_trading_time: collectionDetails?.startTradingTime || null,
          },
        },
      },
    }

    console.log('msg: ', msg)

    const payload: OpenEditionFactoryDispatchExecuteArgs = {
      contract: collectionDetails?.updatable ? OPEN_EDITION_UPDATABLE_FACTORY_ADDRESS : OPEN_EDITION_FACTORY_ADDRESS,
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
    const data: OpenEditionMinterCreatorDataProps = {
      metadataStorageMethod,
    }
    onChange(data)
    toast.success('Metadata storage method updated')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataStorageMethod])

  return (
    <div>
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
      <div className={clsx('my-4 mx-10')}>
        <Conditional test={metadataStorageMethod === 'off-chain'}>
          <div>
            <OffChainMetadataUploadDetails onChange={setOffChainMetadataUploadDetails} />
          </div>
        </Conditional>
        <Conditional test={metadataStorageMethod === 'on-chain'}>
          <div>
            <ImageUploadDetails onChange={setImageUploadDetails} />
            <OnChainMetadataInputDetails onChange={setOnChainMetadataInputDetails} uploadMethod={undefined} />
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
