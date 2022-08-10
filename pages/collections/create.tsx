/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { coin } from '@cosmjs/proto-signing'
import Anchor from 'components/Anchor'
import Button from 'components/Button'
import {
  CollectionDetails,
  MintingDetails,
  RoyaltyDetails,
  UploadDetails,
  WhitelistDetails,
} from 'components/collections/creation'
import type { CollectionDetailsDataProps } from 'components/collections/creation/CollectionDetails'
import type { MintingDetailsDataProps } from 'components/collections/creation/MintingDetails'
import type { RoyaltyDetailsDataProps } from 'components/collections/creation/RoyaltyDetails'
import type { UploadDetailsDataProps } from 'components/collections/creation/UploadDetails'
import type { WhitelistDetailsDataProps } from 'components/collections/creation/WhitelistDetails'
import { Conditional } from 'components/Conditional'
import { LoadingModal } from 'components/LoadingModal'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import useCollapse from 'react-collapsed'
import { toast } from 'react-hot-toast'
import type { UploadServiceType } from 'services/upload'
import { upload } from 'services/upload'
import { compareFileArrays } from 'utils/compareFileArrays'
import { MINTER_CODE_ID, SG721_CODE_ID, WHITELIST_CODE_ID } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

import { getAssetType } from '../../utils/getAssetType'

const CollectionCreationPage: NextPage = () => {
  const wallet = useWallet()
  const { minter: minterContract, whitelist: whitelistContract } = useContracts()

  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse()
  const toggleProps = getToggleProps()
  const collapseProps = getCollapseProps()

  const [uploadDetails, setUploadDetails] = useState<UploadDetailsDataProps | null>(null)
  const [collectionDetails, setCollectionDetails] = useState<CollectionDetailsDataProps | null>(null)
  const [mintingDetails, setMintingDetails] = useState<MintingDetailsDataProps | null>(null)
  const [whitelistDetails, setWhitelistDetails] = useState<WhitelistDetailsDataProps | null>(null)
  const [royaltyDetails, setRoyaltyDetails] = useState<RoyaltyDetailsDataProps | null>(null)

  const [uploading, setUploading] = useState(false)
  const [contractAddress, setContractAddress] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  const createCollection = async () => {
    try {
      checkUploadDetails()
      checkCollectionDetails()
      checkMintingDetails()
      checkWhitelistDetails()
      checkRoyaltyDetails()

      setUploading(true)

      const baseUri = await uploadFiles()
      //upload coverImageUri and append the file name
      const coverImageUri = await upload(
        collectionDetails?.imageFile as File[],
        uploadDetails?.uploadService as UploadServiceType,
        'cover',
        uploadDetails?.nftStorageApiKey as string,
        uploadDetails?.pinataApiKey as string,
        uploadDetails?.pinataSecretKey as string,
      )

      setUploading(false)

      let whitelist: string | undefined
      if (whitelistDetails?.whitelistType === 'existing') whitelist = whitelistDetails.contractAddress
      else if (whitelistDetails?.whitelistType === 'new') whitelist = await instantiateWhitelist()

      await instantiate(baseUri, coverImageUri, whitelist)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message)
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
      unit_price: coin(String(Number(whitelistDetails?.unitPrice)), 'ustars'),
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

  const instantiate = async (baseUri: string, coverImageUri: string, whitelist?: string) => {
    if (!wallet.initialized) throw new Error('Wallet not connected')
    if (!minterContract) throw new Error('Contract not found')

    let royaltyInfo = null
    if (royaltyDetails?.royaltyType === 'new') {
      royaltyInfo = {
        payment_address: royaltyDetails.paymentAddress,
        share: (Number(royaltyDetails.share) / 100).toString(),
      }
    }

    const msg = {
      base_token_uri: `ipfs://${baseUri}/`,
      num_tokens: mintingDetails?.numTokens,
      sg721_code_id: SG721_CODE_ID,
      sg721_instantiate_msg: {
        name: collectionDetails?.name,
        symbol: 'SYMBOL',
        minter: wallet.address,
        collection_info: {
          creator: wallet.address,
          description: collectionDetails?.description,
          image: `ipfs://${coverImageUri}/${collectionDetails?.imageFile[0].name as string}`,
          external_link: collectionDetails?.externalLink === '' ? null : collectionDetails?.externalLink,
          royalty_info: royaltyInfo,
        },
      },
      per_address_limit: mintingDetails?.perAddressLimit,
      unit_price: coin(String(Number(mintingDetails?.unitPrice)), 'ustars'),
      whitelist,
      start_time: mintingDetails?.startTime,
    }

    const data = await minterContract.instantiate(MINTER_CODE_ID, msg, 'Stargaze Minter Contract', wallet.address)
    setTransactionHash(data.transactionHash)
    setContractAddress(data.contractAddress)
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
          const fileArray: File[] = []
          let reader: FileReader
          for (let i = 0; i < uploadDetails.metadataFiles.length; i++) {
            reader = new FileReader()
            reader.onload = (e) => {
              const data: any = JSON.parse(e.target?.result as string)
              if (
                getAssetType(uploadDetails.assetFiles[i].name) === 'audio' ||
                getAssetType(uploadDetails.assetFiles[i].name) === 'video'
              ) {
                data.animation_url = `ipfs://${assetUri}/${uploadDetails.assetFiles[i].name}`
              }
              data.image = `ipfs://${assetUri}/${uploadDetails.assetFiles[i].name}`
              const metadataFileBlob = new Blob([JSON.stringify(data)], {
                type: 'application/json',
              })
              const updatedMetadataFile = new File(
                [metadataFileBlob],
                uploadDetails.metadataFiles[i].name.substring(0, uploadDetails.metadataFiles[i].name.lastIndexOf('.')),
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
        })
        .catch(reject)
    })
  }

  const checkUploadDetails = () => {
    if (!uploadDetails) {
      throw new Error('Please select assets and metadata')
    }
    if (uploadDetails.assetFiles.length === 0) {
      throw new Error('Please select the assets')
    }
    if (uploadDetails.metadataFiles.length === 0) {
      throw new Error('Please select the metadata files')
    }
    compareFileArrays(uploadDetails.assetFiles, uploadDetails.metadataFiles)
    if (uploadDetails.uploadService === 'nft-storage') {
      if (uploadDetails.nftStorageApiKey === '') {
        throw new Error('Please enter a valid NFT Storage API key')
      }
    } else if (uploadDetails.pinataApiKey === '' || uploadDetails.pinataSecretKey === '') {
      throw new Error('Please enter Pinata API and secret keys')
    }
  }

  const checkCollectionDetails = () => {
    if (!collectionDetails) throw new Error('Please fill out the collection details')
    if (collectionDetails.name === '') throw new Error('Collection name is required')
    if (collectionDetails.description === '') throw new Error('Collection description is required')
    if (collectionDetails.imageFile.length === 0) throw new Error('Collection cover image is required')
  }

  const checkMintingDetails = () => {
    if (!mintingDetails) throw new Error('Please fill out the minting details')
    if (mintingDetails.numTokens < 1 || mintingDetails.numTokens > 10000) throw new Error('Invalid number of tokens')
    if (Number(mintingDetails.unitPrice) < 50000000)
      throw new Error('Invalid unit price: The minimum unit price is 50 STARS')
    if (
      mintingDetails.perAddressLimit < 1 ||
      mintingDetails.perAddressLimit > 50 ||
      mintingDetails.perAddressLimit > mintingDetails.numTokens
    )
      throw new Error('Invalid limit for tokens per address')
    if (mintingDetails.startTime === '') throw new Error('Start time is required')
  }

  const checkWhitelistDetails = () => {
    if (!whitelistDetails) throw new Error('Please fill out the whitelist details')
    if (whitelistDetails.whitelistType === 'existing') {
      if (whitelistDetails.contractAddress === '') throw new Error('Whitelist contract address is required')
    } else if (whitelistDetails.whitelistType === 'new') {
      if (whitelistDetails.members?.length === 0) throw new Error('Whitelist member list cannot be empty')
      if (whitelistDetails.unitPrice === '') throw new Error('Whitelist unit price is required')
      if (Number(whitelistDetails.unitPrice) < 25000000)
        throw new Error('Invalid unit price: The minimum unit price for whitelisted addresses is 25 STARS')
      if (whitelistDetails.startTime === '') throw new Error('Start time is required')
      if (whitelistDetails.endTime === '') throw new Error('End time is required')
      if (whitelistDetails.perAddressLimit === 0) throw new Error('Per address limit is required')
      if (whitelistDetails.memberLimit === 0) throw new Error('Member limit is required')
    }
  }

  const checkRoyaltyDetails = () => {
    if (!royaltyDetails) throw new Error('Please fill out the royalty details')
    if (royaltyDetails.royaltyType === 'new') {
      if (royaltyDetails.share === 0) throw new Error('Royalty share is required')
      if (royaltyDetails.share > 100 || royaltyDetails.share < 0) throw new Error('Invalid royalty share')
      if (royaltyDetails.paymentAddress === '') throw new Error('Royalty payment address is required')
    }
  }

  return (
    <div>
      <NextSeo title="Create Collection" />

      <div className="mt-5 space-y-5 text-center">
        <h1 className="font-heading text-4xl font-bold">Create Collection</h1>

        <Conditional test={uploading}>
          <LoadingModal />
        </Conditional>

        <p>
          Make sure you check our{' '}
          <Anchor className="font-bold text-plumbus hover:underline" href={links['Docs']}>
            documentation
          </Anchor>{' '}
          on how to create your collection
        </p>
      </div>

      <div className="mx-10">
        <UploadDetails onChange={setUploadDetails} />

        <div className="flex justify-between py-3 px-8 rounded border-2 border-white/20 grid-col-2">
          <CollectionDetails onChange={setCollectionDetails} />
          <MintingDetails numberOfTokens={uploadDetails?.assetFiles.length} onChange={setMintingDetails} />
        </div>

        <div className="flex justify-between my-6">
          <Button {...toggleProps} isWide type="button" variant="outline">
            {isExpanded ? 'Hide' : 'Show'} Advanced Details
          </Button>
          <Button isWide onClick={createCollection} variant="solid">
            Create Collection
          </Button>
        </div>

        <section {...collapseProps} className="mb-10">
          <WhitelistDetails onChange={setWhitelistDetails} />
          <div className="my-6" />
          <RoyaltyDetails onChange={setRoyaltyDetails} />
        </section>
      </div>
    </div>
  )
}

export default withMetadata(CollectionCreationPage, { center: false })
