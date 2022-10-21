/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { coin } from '@cosmjs/proto-signing'
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
import type { CollectionDetailsDataProps } from 'components/collections/creation/CollectionDetails'
import type { MintingDetailsDataProps } from 'components/collections/creation/MintingDetails'
import type { RoyaltyDetailsDataProps } from 'components/collections/creation/RoyaltyDetails'
import type { UploadDetailsDataProps } from 'components/collections/creation/UploadDetails'
import type { WhitelistDetailsDataProps } from 'components/collections/creation/WhitelistDetails'
import { Conditional } from 'components/Conditional'
import { LoadingModal } from 'components/LoadingModal'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { DispatchExecuteArgs } from 'contracts/vendingFactory/messages/execute'
import { dispatchExecute } from 'contracts/vendingFactory/messages/execute'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { upload } from 'services/upload'
import { compareFileArrays } from 'utils/compareFileArrays'
import {
  BLOCK_EXPLORER_URL,
  NETWORK,
  SG721_CODE_ID,
  STARGAZE_URL,
  VENDING_FACTORY_ADDRESS,
  WHITELIST_CODE_ID,
} from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

import type { UploadMethod } from '../../components/collections/creation/UploadDetails'
import { ConfirmationModal } from '../../components/ConfirmationModal'
import { getAssetType } from '../../utils/getAssetType'

const CollectionCreationPage: NextPage = () => {
  const wallet = useWallet()
  const {
    minter: minterContract,
    whitelist: whitelistContract,
    vendingFactory: vendingFactoryContract,
  } = useContracts()
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = useMemo(
    () => vendingFactoryContract?.use(VENDING_FACTORY_ADDRESS),
    [vendingFactoryContract, wallet.address],
  )

  const [uploadDetails, setUploadDetails] = useState<UploadDetailsDataProps | null>(null)
  const [collectionDetails, setCollectionDetails] = useState<CollectionDetailsDataProps | null>(null)
  const [mintingDetails, setMintingDetails] = useState<MintingDetailsDataProps | null>(null)
  const [whitelistDetails, setWhitelistDetails] = useState<WhitelistDetailsDataProps | null>(null)
  const [royaltyDetails, setRoyaltyDetails] = useState<RoyaltyDetailsDataProps | null>(null)

  const [uploading, setUploading] = useState(false)
  const [creatingCollection, setCreatingCollection] = useState(false)
  const [readyToCreate, setReadyToCreate] = useState(false)
  const [minterContractAddress, setMinterContractAddress] = useState<string | null>(null)
  const [sg721ContractAddress, setSg721ContractAddress] = useState<string | null>(null)
  const [whitelistContractAddress, setWhitelistContractAddress] = useState<string | null | undefined>(null)
  const [baseTokenUri, setBaseTokenUri] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  const performChecks = () => {
    try {
      setReadyToCreate(false)
      checkUploadDetails()
      checkCollectionDetails()
      checkMintingDetails()
      checkRoyaltyDetails()
      checkWhitelistDetails()
        .then(() => {
          setReadyToCreate(true)
        })
        .catch((err) => {
          toast.error(`Error in Whitelist Configuration: ${err.message}`)
          setReadyToCreate(false)
        })
    } catch (error: any) {
      toast.error(error.message)
      setUploading(false)
    }
  }

  const createCollection = async () => {
    try {
      setCreatingCollection(true)
      setBaseTokenUri(null)
      setCoverImageUrl(null)
      setMinterContractAddress(null)
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

        await instantiate(baseUri, coverImageUri, whitelist)
      } else {
        setBaseTokenUri(uploadDetails?.baseTokenURI as string)
        setCoverImageUrl(uploadDetails?.imageUrl as string)

        let whitelist: string | undefined
        if (whitelistDetails?.whitelistType === 'existing') whitelist = whitelistDetails.contractAddress
        else if (whitelistDetails?.whitelistType === 'new') whitelist = await instantiateWhitelist()
        setWhitelistContractAddress(whitelist as string)

        await instantiate(baseTokenUri as string, coverImageUrl as string, whitelist)
      }
      setCreatingCollection(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message)
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
      create_minter: {
        init_msg: {
          base_token_uri: `${uploadDetails?.uploadMethod === 'new' ? `ipfs://${baseUri}/` : `${baseUri}`}`,
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
          code_id: SG721_CODE_ID,
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

    const payload: DispatchExecuteArgs = {
      contract: VENDING_FACTORY_ADDRESS,
      messages,
      txSigner: wallet.address,
      msg,
      funds: [coin('1000000000', 'ustars')],
    }
    const data = await dispatchExecute(payload)
    setTransactionHash(data.transactionHash)
    setMinterContractAddress(data.minterAddress)
    setSg721ContractAddress(data.sg721Address)
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
    if (uploadDetails.uploadMethod === 'new' && uploadDetails.assetFiles.length === 0) {
      throw new Error('Please select the assets')
    }
    if (uploadDetails.uploadMethod === 'new' && uploadDetails.metadataFiles.length === 0) {
      throw new Error('Please select the metadata files')
    }
    if (uploadDetails.uploadMethod === 'new') compareFileArrays(uploadDetails.assetFiles, uploadDetails.metadataFiles)
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
  }

  const checkCollectionDetails = () => {
    if (!collectionDetails) throw new Error('Please fill out the collection details')
    if (collectionDetails.name === '') throw new Error('Collection name is required')
    if (collectionDetails.description === '') throw new Error('Collection description is required')
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
      }
    } else if (whitelistDetails.whitelistType === 'new') {
      if (whitelistDetails.members?.length === 0) throw new Error('Whitelist member list cannot be empty')
      if (whitelistDetails.unitPrice === '') throw new Error('Whitelist unit price is required')
      if (Number(whitelistDetails.unitPrice) < 25000000)
        throw new Error('Invalid unit price: The minimum unit price for whitelisted addresses is 25 STARS')
      if (whitelistDetails.startTime === '') throw new Error('Start time is required')
      if (whitelistDetails.endTime === '') throw new Error('End time is required')
      if (whitelistDetails.perAddressLimit === 0) throw new Error('Per address limit is required')
      if (whitelistDetails.memberLimit === 0) throw new Error('Member limit is required')
      if (Number(whitelistDetails.startTime) > Number(whitelistDetails.endTime))
        throw new Error('Whitelist start time cannot be later than whitelist end time')
      if (Number(whitelistDetails.endTime) > Number(mintingDetails?.startTime))
        throw new Error('Whitelist end time cannot be later than public start time')
    }
  }

  const checkRoyaltyDetails = () => {
    if (!royaltyDetails) throw new Error('Please fill out the royalty details')
    if (royaltyDetails.royaltyType === 'new') {
      if (royaltyDetails.share === 0) throw new Error('Royalty share percentage is required')
      if (royaltyDetails.share > 100 || royaltyDetails.share < 0) throw new Error('Invalid royalty share percentage')
      if (royaltyDetails.paymentAddress === '') throw new Error('Royalty payment address is required')
    }
  }
  useEffect(() => {
    if (minterContractAddress !== null) scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [minterContractAddress])

  useEffect(() => {
    setBaseTokenUri(uploadDetails?.baseTokenURI as string)
    setCoverImageUrl(uploadDetails?.imageUrl as string)
  }, [uploadDetails?.baseTokenURI, uploadDetails?.imageUrl])

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
          <Anchor className="font-bold text-plumbus hover:underline" external href={links['Docs']}>
            documentation
          </Anchor>{' '}
          on how to create your collection
        </p>
      </div>
      <div className="mx-10" ref={scrollRef}>
        <Conditional test={minterContractAddress !== null}>
          <Alert className="mt-5" type="info">
            <div>
              Base Token URI:{' '}
              {uploadDetails?.uploadMethod === 'new' && (
                <Anchor
                  className="text-stargaze hover:underline"
                  external
                  href={`https://ipfs.stargaze.zone/ipfs/${baseTokenUri as string}/`}
                >
                  ipfs://{baseTokenUri as string}/
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
                  ipfs://{baseTokenUri?.substring(baseTokenUri.lastIndexOf('ipfs://') + 7)}/
                </Anchor>
              )}
              <br />
              Minter Contract Address:{'  '}
              <Anchor
                className="text-stargaze hover:underline"
                external
                href={`/contracts/minter/query/?contractAddress=${minterContractAddress as string}`}
              >
                {minterContractAddress}
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
                  href={`${STARGAZE_URL}/launchpad/${minterContractAddress as string}`}
                >
                  View on Launchpad
                </Anchor>
              </Button>
            </div>
          </Alert>
        </Conditional>
      </div>
      <div className="mx-10">
        <UploadDetails onChange={setUploadDetails} />

        <div className="flex justify-between py-3 px-8 rounded border-2 border-white/20 grid-col-2">
          <CollectionDetails
            coverImageUrl={coverImageUrl as string}
            onChange={setCollectionDetails}
            uploadMethod={uploadDetails?.uploadMethod as UploadMethod}
          />
          <MintingDetails
            numberOfTokens={uploadDetails?.assetFiles.length}
            onChange={setMintingDetails}
            uploadMethod={uploadDetails?.uploadMethod as UploadMethod}
          />
        </div>
        <div className="my-6">
          <WhitelistDetails onChange={setWhitelistDetails} />
          <div className="my-6" />
          <RoyaltyDetails onChange={setRoyaltyDetails} />
        </div>
        {readyToCreate && <ConfirmationModal confirm={createCollection} />}
        <div className="flex justify-end w-full">
          <Button
            className="relative justify-center p-2 mb-6 max-h-12 text-white bg-plumbus hover:bg-plumbus-light border-0"
            isLoading={creatingCollection}
            onClick={performChecks}
            variant="solid"
          >
            Create Collection
          </Button>
        </div>
      </div>
    </div>
  )
}

export default withMetadata(CollectionCreationPage, { center: false })
