/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

//import { coin } from '@cosmjs/proto-signing'
import clsx from 'clsx'
import { Alert } from 'components/Alert'
import { Anchor } from 'components/Anchor'
import type { BadgeDetailsDataProps } from 'components/badges/creation/BadgeDetails'
import { BadgeDetails } from 'components/badges/creation/BadgeDetails'
import type { ImageUploadDetailsDataProps, MintRule } from 'components/badges/creation/ImageUploadDetails'
import { ImageUploadDetails } from 'components/badges/creation/ImageUploadDetails'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { LoadingModal } from 'components/LoadingModal'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { DispatchExecuteArgs as BadgeHubDispatchExecuteArgs } from 'contracts/badgeHub/messages/execute'
import { dispatchExecute as badgeHubDispatchExecute } from 'contracts/badgeHub/messages/execute'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { upload } from 'services/upload'
import { BADGE_HUB_ADDRESS, BLOCK_EXPLORER_URL, NETWORK, STARGAZE_URL } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

// import { ConfirmationModal } from '../../components/ConfirmationModal'
// import { badgeHub } from '../../contracts/badgeHub/contract'
// import { isValidAddress } from '../../utils/isValidAddress'

const BadgeCreationPage: NextPage = () => {
  const wallet = useWallet()
  const { badgeHub: badgeHubContract } = useContracts()
  const scrollRef = useRef<HTMLDivElement>(null)

  const badgeHubMessages = useMemo(() => badgeHubContract?.use(BADGE_HUB_ADDRESS), [badgeHubContract, wallet.address])

  const [imageUploadDetails, setImageUploadDetails] = useState<ImageUploadDetailsDataProps | null>(null)
  const [badgeDetails, setBadgeDetails] = useState<BadgeDetailsDataProps | null>(null)
  // const [baseMinterDetails, setBaseMinterDetails] = useState<BaseMinterDetailsDataProps | null>(null)

  const [uploading, setUploading] = useState(false)
  const [isCreationComplete, setIsCreationComplete] = useState(false)
  const [creatingBadge, setCreatingBadge] = useState(false)
  const [readyToCreateBadge, setReadyToCreateBadge] = useState(false)
  const [mintRule, setMintRule] = useState<MintRule>('by_key')

  const [badgeId, setBadgeId] = useState<string | null>(null)
  const [badgeNftContractAddress, setBadgeNftContractAddress] = useState<string | null>(null)
  const [tokenUri, setTokenUri] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  const performBadgeCreationChecks = () => {
    try {
      setReadyToCreateBadge(false)
      checkImageUploadDetails()
      // checkMetadataDetails()
      setReadyToCreateBadge(true)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      setUploading(false)
      setReadyToCreateBadge(false)
    }
  }

  const handleImageUrl = async () => {
    try {
      setTokenUri(null)
      setImageUrl(null)
      setBadgeId(null)
      setBadgeNftContractAddress(null)
      setTransactionHash(null)
      if (imageUploadDetails?.uploadMethod === 'new') {
        setUploading(true)

        const coverImageUrl = await upload(
          [imageUploadDetails.assetFile] as File[],
          imageUploadDetails.uploadService,
          'cover',
          imageUploadDetails.nftStorageApiKey as string,
          imageUploadDetails.pinataApiKey as string,
          imageUploadDetails.pinataSecretKey as string,
        )

        setUploading(false)
        setImageUrl(coverImageUrl)
      } else {
        setImageUrl(imageUploadDetails?.imageUrl as string)
      }
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      setCreatingBadge(false)
      setUploading(false)
    }
  }

  const createNewBadge = async () => {
    if (!wallet.initialized) throw new Error('Wallet not connected')
    if (!badgeHubContract) throw new Error('Contract not found')

    await handleImageUrl()

    const badge = {
      manager: badgeDetails?.manager as string,
      metadata: {
        name: badgeDetails?.name || undefined,
        description: badgeDetails?.description || undefined,
        image: imageUrl || undefined,
        image_data: badgeDetails?.image_data || undefined,
        external_url: badgeDetails?.external_url || undefined,
        attributes: badgeDetails?.attributes || undefined,
        background_color: badgeDetails?.background_color || undefined,
        animation_url: badgeDetails?.animation_url || undefined,
        youtube_url: badgeDetails?.youtube_url || undefined,
      },
      transferrable: badgeDetails?.transferrable as boolean,
      rule: {
        by_key: '024d529b81a16c1310cbf9d26f2b8c57e9e03179ba68fdcd1824ae1dc5cb3cb02c',
      },
      expiry: badgeDetails?.expiry || undefined,
      max_supply: badgeDetails?.max_supply || undefined,
    }

    const payload: BadgeHubDispatchExecuteArgs = {
      contract: BADGE_HUB_ADDRESS,
      messages: badgeHubMessages,
      txSigner: wallet.address,
      badge,
      type: 'create_badge',
    }
    const data = await badgeHubDispatchExecute(payload)
    console.log(data)
    // setTransactionHash(data.transactionHash)
    // setBadgeId(data.id)
  }

  const checkImageUploadDetails = () => {
    if (!wallet.initialized) throw new Error('Wallet not connected.')
    if (!imageUploadDetails) {
      throw new Error('Please select assets and metadata')
    }
    // if (minterType === 'base' && uploadDetails.uploadMethod === 'new' && uploadDetails.assetFiles.length > 1) {
    //   throw new Error('Base Minter can only mint one asset at a time. Please select only one asset.')
    // }
    if (imageUploadDetails.uploadMethod === 'new' && imageUploadDetails.assetFile === undefined) {
      throw new Error('Please select the image file')
    }
    if (imageUploadDetails.uploadMethod === 'new') {
      if (imageUploadDetails.uploadService === 'nft-storage') {
        if (imageUploadDetails.nftStorageApiKey === '') {
          throw new Error('Please enter a valid NFT.Storage API key')
        }
      } else if (imageUploadDetails.pinataApiKey === '' || imageUploadDetails.pinataSecretKey === '') {
        throw new Error('Please enter Pinata API and secret keys')
      }
    }
    if (imageUploadDetails.uploadMethod === 'existing' && !imageUploadDetails.imageUrl?.includes('ipfs://')) {
      throw new Error('Please specify a valid image URL')
    }
  }

  // const checkMetadataDetails = () => {
  //   if (!metadataDetails) throw new Error('Please fill out the collection details')
  //   if (collectionDetails.name === '') throw new Error('Collection name is required')
  //   if (collectionDetails.description === '') throw new Error('Collection description is required')
  //   if (collectionDetails.description.length > 512)
  //     throw new Error('Collection description cannot exceed 512 characters')
  //   if (uploadDetails?.uploadMethod === 'new' && collectionDetails.imageFile.length === 0)
  //     throw new Error('Collection cover image is required')
  //   if (
  //     collectionDetails.startTradingTime &&
  //     Number(collectionDetails.startTradingTime) < new Date().getTime() * 1000000
  //   )
  //     throw new Error('Invalid trading start time')
  //   if (
  //     collectionDetails.startTradingTime &&
  //     Number(collectionDetails.startTradingTime) < Number(mintingDetails?.startTime)
  //   )
  //     throw new Error('Trading start time must be after minting start time')
  //   if (collectionDetails.externalLink) {
  //     try {
  //       const url = new URL(collectionDetails.externalLink)
  //     } catch (e: any) {
  //       throw new Error(`Invalid external link: Make sure to include the protocol (e.g. https://)`)
  //     }
  //   }
  // }

  const checkwalletBalance = () => {
    if (!wallet.initialized) throw new Error('Wallet not connected.')
    // TODO: estimate creation cost and check wallet balance
  }
  useEffect(() => {
    if (badgeId !== null) scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [badgeId])

  useEffect(() => {
    setImageUrl(imageUploadDetails?.imageUrl as string)
  }, [imageUploadDetails?.imageUrl])

  useEffect(() => {
    setBadgeId(null)
    setReadyToCreateBadge(false)
    setIsCreationComplete(false)
  }, [imageUploadDetails?.uploadMethod])

  return (
    <div>
      <NextSeo title="Create Badge" />

      <div className="mt-5 space-y-5 text-center">
        <h1 className="font-heading text-4xl font-bold">Create Badge</h1>

        <Conditional test={uploading}>
          <LoadingModal />
        </Conditional>

        <p>
          Make sure you check our{' '}
          <Anchor className="font-bold text-plumbus hover:underline" external href={links['Docs']}>
            documentation
          </Anchor>{' '}
          on how to create a new badge.
        </p>
      </div>
      <div className="mx-10" ref={scrollRef}>
        <Conditional test={badgeId !== null}>
          <Alert className="mt-5" type="info">
            <div>
              <Conditional test={isCreationComplete}>
                Badge ID:{' '}
                <Anchor
                  className="text-stargaze hover:underline"
                  external
                  href={`https://ipfs.stargaze.zone/ipfs/${badgeId as string}`}
                >
                  TODO://{badgeId as string}
                </Anchor>
                <br />
              </Conditional>
              <QRCodeSVG
                className="mx-auto"
                level="H"
                size={256}
                value={`https://ipfs.stargaze.zone/ipfs/${badgeId as string}`}
              />
              <br />
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
                <Anchor className="text-white" external href={`${STARGAZE_URL}/launchpad/${wallet.address}`}>
                  TODO View on your profile
                </Anchor>
              </Button>
            </div>
          </Alert>
        </Conditional>
      </div>

      <div>
        <div
          className={clsx(
            'mx-10 mt-5',
            'grid before:absolute relative grid-cols-3 grid-flow-col items-stretch rounded',
            'before:inset-x-0 before:bottom-0 before:border-white/25',
          )}
        >
          <div
            className={clsx(
              'isolate space-y-1 border-2',
              'first-of-type:rounded-tl-md last-of-type:rounded-tr-md',
              mintRule === 'by_key' ? 'border-stargaze' : 'border-transparent',
              mintRule !== 'by_key' ? 'bg-stargaze/5 hover:bg-stargaze/80' : 'hover:bg-white/5',
            )}
          >
            <button
              className="p-4 w-full h-full text-left bg-transparent"
              onClick={() => {
                setMintRule('by_key')
                setReadyToCreateBadge(false)
              }}
              type="button"
            >
              <h4 className="font-bold">Mint Rule: By Key</h4>
              <span className="text-sm text-white/80 line-clamp-2">TODO</span>
            </button>
          </div>
          <div
            className={clsx(
              'isolate space-y-1 border-2',
              'first-of-type:rounded-tl-md last-of-type:rounded-tr-md',
              mintRule === 'by_keys' ? 'border-stargaze' : 'border-transparent',
              mintRule !== 'by_keys' ? 'bg-stargaze/5 hover:bg-stargaze/80' : 'hover:bg-white/5',
            )}
          >
            <button
              className="p-4 w-full h-full text-left bg-transparent"
              onClick={() => {
                setMintRule('by_keys')
                setReadyToCreateBadge(false)
              }}
              type="button"
            >
              <h4 className="font-bold">Mint Rule: By Keys</h4>
              <span className="text-sm text-white/80 line-clamp-2">To Do</span>
            </button>
          </div>
          <div
            className={clsx(
              'isolate space-y-1 border-2',
              'first-of-type:rounded-tl-md last-of-type:rounded-tr-md',
              mintRule === 'by_minter' ? 'border-stargaze' : 'border-transparent',
              mintRule !== 'by_minter' ? 'bg-stargaze/5 hover:bg-stargaze/80' : 'hover:bg-white/5',
            )}
          >
            <button
              className="p-4 w-full h-full text-left bg-transparent"
              onClick={() => {
                setMintRule('by_minter')
                setReadyToCreateBadge(false)
              }}
              type="button"
            >
              <h4 className="font-bold">Mint Rule: By Minter</h4>
              <span className="text-sm text-white/80 line-clamp-2">To Do</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-10">
        <ImageUploadDetails mintRule={mintRule} onChange={setImageUploadDetails} />

        <div className="flex justify-between py-3 px-8 rounded border-2 border-white/20 grid-col-2">
          <BadgeDetails
            mintRule={mintRule}
            onChange={setBadgeDetails}
            uploadMethod={imageUploadDetails?.uploadMethod ? imageUploadDetails.uploadMethod : 'new'}
          />
        </div>

        {/* <Conditional test={readyToCreateBadge}>
          <ConfirmationModal confirm={createNewBadge} />
        </Conditional> */}

        <div className="flex justify-end w-full">
          <Button
            className="relative justify-center p-2 mb-6 max-h-12 text-white bg-plumbus hover:bg-plumbus-light border-0"
            isLoading={creatingBadge}
            onClick={() => console.log('create badge')}
            variant="solid"
          >
            Create Badge
          </Button>
        </div>
      </div>
    </div>
  )
}

export default withMetadata(BadgeCreationPage, { center: false })
