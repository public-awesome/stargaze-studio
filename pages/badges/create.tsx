/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-nested-ternary */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

//import { coin } from '@cosmjs/proto-signing'
import { Sidetab } from '@typeform/embed-react'
import clsx from 'clsx'
import { Alert } from 'components/Alert'
import { Anchor } from 'components/Anchor'
import { BadgeConfirmationModal } from 'components/BadgeConfirmationModal'
import { BadgeLoadingModal } from 'components/BadgeLoadingModal'
import type { BadgeDetailsDataProps } from 'components/badges/creation/BadgeDetails'
import { BadgeDetails } from 'components/badges/creation/BadgeDetails'
import type { ImageUploadDetailsDataProps, MintRule } from 'components/badges/creation/ImageUploadDetails'
import { ImageUploadDetails } from 'components/badges/creation/ImageUploadDetails'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { TextInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { Tooltip } from 'components/Tooltip'
import { useContracts } from 'contexts/contracts'
import { addLogItem } from 'contexts/log'
import type { Badge } from 'contracts/badgeHub'
import type { DispatchExecuteArgs as BadgeHubDispatchExecuteArgs } from 'contracts/badgeHub/messages/execute'
import { dispatchExecute as badgeHubDispatchExecute } from 'contracts/badgeHub/messages/execute'
import * as crypto from 'crypto'
import { toPng } from 'html-to-image'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import sizeof from 'object-sizeof'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaCopy, FaSave } from 'react-icons/fa'
import * as secp256k1 from 'secp256k1'
import { upload } from 'services/upload'
import { copy } from 'utils/clipboard'
import { BADGE_HUB_ADDRESS, BLOCK_EXPLORER_URL, NETWORK } from 'utils/constants'
import { getAssetType } from 'utils/getAssetType'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { uid } from 'utils/random'
import { resolveAddress } from 'utils/resolveAddress'
import { truncateMiddle } from 'utils/text'
import { useWallet } from 'utils/wallet'

import { generateKeyPairs } from '../../utils/hash'

const BadgeCreationPage: NextPage = () => {
  const wallet = useWallet()
  const { badgeHub: badgeHubContract } = useContracts()
  const scrollRef = useRef<HTMLDivElement>(null)

  const badgeHubMessages = useMemo(() => badgeHubContract?.use(BADGE_HUB_ADDRESS), [badgeHubContract, wallet.address])

  const [imageUploadDetails, setImageUploadDetails] = useState<ImageUploadDetailsDataProps | null>(null)
  const [badgeDetails, setBadgeDetails] = useState<BadgeDetailsDataProps | null>(null)

  const [uploading, setUploading] = useState(false)
  const [creatingBadge, setCreatingBadge] = useState(false)
  const [isAddingKeysComplete, setIsAddingKeysComplete] = useState(false)
  const [readyToCreateBadge, setReadyToCreateBadge] = useState(false)
  const [mintRule, setMintRule] = useState<MintRule>('by_key')
  const [resolvedMinterAddress, setResolvedMinterAddress] = useState<string>('')
  const [tempBadge, setTempBadge] = useState<Badge>()

  const [badgeId, setBadgeId] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [createdBadgeKey, setCreatedBadgeKey] = useState<string | undefined>(undefined)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [keyPairs, setKeyPairs] = useState<{ publicKey: string; privateKey: string }[]>([])
  const [numberOfKeys, setNumberOfKeys] = useState(1)
  const qrRef = useRef<HTMLDivElement>(null)

  const keyState = useInputState({
    id: 'key',
    name: 'key',
    title: 'Public Key',
    subtitle: 'Part of the key pair to be utilized for post-creation access control',
  })

  const designatedMinterState = useInputState({
    id: 'designatedMinter',
    name: 'designatedMinter',
    title: 'Minter Address',
    subtitle: 'The address of the designated minter for this badge',
    defaultValue: wallet.address,
  })

  const performBadgeCreationChecks = () => {
    try {
      setReadyToCreateBadge(false)
      checkImageUploadDetails()
      checkBadgeDetails()
      setTimeout(() => {
        setReadyToCreateBadge(true)
      }, 100)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
      setUploading(false)
      setReadyToCreateBadge(false)
    }
  }

  const handleImageUrl = async () => {
    try {
      setImageUrl(null)
      setBadgeId(null)
      setTransactionHash(null)
      if (imageUploadDetails?.uploadMethod === 'new') {
        setUploading(true)
        const coverUrl = await upload(
          [imageUploadDetails.assetFile] as File[],
          imageUploadDetails.uploadService,
          'cover',
          imageUploadDetails.pinataApiKey as string,
          imageUploadDetails.pinataSecretKey as string,
          imageUploadDetails.web3StorageEmail as string,
          badgeDetails?.name as string,
          imageUploadDetails.fleekClientId as string,
          badgeDetails?.name as string,
        ).then((imageBaseUrl) => {
          setUploading(false)
          return `ipfs://${imageBaseUrl}/${imageUploadDetails.assetFile?.name as string}`
        })
        setImageUrl(coverUrl)
        return coverUrl
      }
      setImageUrl(imageUploadDetails?.imageUrl as string)
      return imageUploadDetails?.imageUrl as string
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
      setCreatingBadge(false)
      setUploading(false)
      throw new Error("Couldn't upload the image.")
    }
  }

  const resolveMinterAddress = async () => {
    await resolveAddress(designatedMinterState.value.trim(), wallet).then((resolvedAddress) => {
      setResolvedMinterAddress(resolvedAddress)
    })
  }
  useEffect(() => {
    void resolveMinterAddress()
  }, [designatedMinterState.value])

  useEffect(() => {
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
      rule:
        mintRule === 'by_key'
          ? {
              by_key: keyState.value,
            }
          : mintRule === 'by_minter'
          ? {
              by_minter: resolvedMinterAddress,
            }
          : 'by_keys',
      expiry: badgeDetails?.expiry || undefined,
      max_supply: badgeDetails?.max_supply || undefined,
    }
    setTempBadge(badge)
  }, [badgeDetails, keyState.value, mintRule, resolvedMinterAddress, imageUrl])

  const createNewBadge = async () => {
    try {
      if (!wallet.isWalletConnected) throw new Error('Wallet not connected')
      if (!badgeHubContract) throw new Error('Contract not found')
      setCreatingBadge(true)
      const coverUrl = await handleImageUrl()
      const badge = {
        manager: badgeDetails?.manager as string,
        metadata: {
          name: badgeDetails?.name || undefined,
          description: badgeDetails?.description?.replaceAll('\\n', '\n') || undefined,
          image: coverUrl || undefined,
          image_data: badgeDetails?.image_data || undefined,
          external_url: badgeDetails?.external_url || undefined,
          attributes: badgeDetails?.attributes || undefined,
          background_color: badgeDetails?.background_color || undefined,
          animation_url: badgeDetails?.animation_url
            ? badgeDetails.animation_url
            : imageUploadDetails?.assetFile && getAssetType(imageUploadDetails.assetFile.name) === 'video'
            ? coverUrl
            : undefined,
          youtube_url: badgeDetails?.youtube_url || undefined,
        },
        transferrable: badgeDetails?.transferrable as boolean,
        rule:
          mintRule === 'by_key'
            ? {
                by_key: keyState.value,
              }
            : mintRule === 'by_minter'
            ? {
                by_minter: resolvedMinterAddress,
              }
            : 'by_keys',
        expiry: badgeDetails?.expiry || undefined,
        max_supply: badgeDetails?.max_supply || undefined,
      }

      const payload: BadgeHubDispatchExecuteArgs = {
        contract: BADGE_HUB_ADDRESS,
        messages: badgeHubMessages,
        txSigner: wallet.address || '',
        badge,
        type: 'create_badge',
      }
      if (mintRule !== 'by_keys') {
        setBadgeId(null)
        setIsAddingKeysComplete(false)
        const data = await badgeHubDispatchExecute(payload)
        console.log(data)
        setCreatingBadge(false)
        setTransactionHash(data.split(':')[0])
        setBadgeId(data.split(':')[1])
      } else {
        setBadgeId(null)
        setIsAddingKeysComplete(false)
        setKeyPairs([])
        const generatedKeyPairs = generateKeyPairs(numberOfKeys)
        setKeyPairs(generatedKeyPairs)
        await badgeHubDispatchExecute(payload)
          .then(async (data) => {
            setCreatingBadge(false)
            setTransactionHash(data.split(':')[0])
            setBadgeId(data.split(':')[1])
            const res = await toast.promise(
              badgeHubContract.use(BADGE_HUB_ADDRESS)?.addKeys(
                wallet.address || '',
                Number(data.split(':')[1]),
                generatedKeyPairs.map((key) => key.publicKey),
              ) as Promise<string>,
              {
                loading: 'Adding keys...',
                success: (result) => {
                  setIsAddingKeysComplete(true)
                  return `Keys added successfully! Tx Hash: ${result}`
                },
                error: (error: { message: any }) => `Failed to add keys: ${error.message}`,
              },
            )
          })
          .catch((error: { message: any }) => {
            toast.error(error.message, { style: { maxWidth: 'none' } })
            addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
            setUploading(false)
            setIsAddingKeysComplete(false)
            setCreatingBadge(false)
          })
      }
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
      setCreatingBadge(false)
      setUploading(false)
    }
  }

  const checkImageUploadDetails = () => {
    if (!wallet.isWalletConnected) throw new Error('Wallet not connected.')
    if (!imageUploadDetails) {
      throw new Error('Please specify the image related details.')
    }

    if (imageUploadDetails.uploadMethod === 'new' && imageUploadDetails.assetFile === undefined) {
      throw new Error('Please select the image file')
    }
    if (imageUploadDetails.uploadMethod === 'new') {
      if (
        imageUploadDetails.uploadService === 'pinata' &&
        (imageUploadDetails.pinataApiKey === '' || imageUploadDetails.pinataSecretKey === '')
      ) {
        throw new Error('Please enter Pinata API and secret keys')
      }
      if (imageUploadDetails.uploadService === 'fleek' && imageUploadDetails.fleekClientId === '') {
        throw new Error('Please enter a valid Fleek client ID')
      }
      if (imageUploadDetails.uploadService === 'web3-storage') {
        if (imageUploadDetails.web3StorageEmail === '' || !imageUploadDetails.web3StorageLoginSuccessful) {
          throw new Error('Please complete the login process for Web3.Storage')
        }
      }
    }
    if (imageUploadDetails.uploadMethod === 'existing' && !imageUploadDetails.imageUrl?.includes('ipfs://')) {
      throw new Error('Please specify a valid image URL')
    }
  }

  const checkBadgeDetails = () => {
    if (!badgeDetails) throw new Error('Please fill out the required fields')
    if (mintRule === 'by_key' && (keyState.value === '' || !createdBadgeKey))
      throw new Error('Please generate a public key')
    if (badgeDetails.external_url) {
      try {
        const url = new URL(badgeDetails.external_url)
      } catch (e: any) {
        throw new Error(`Invalid external url: Make sure to include the protocol (e.g. https://)`)
        addLogItem({
          id: uid(),
          message: 'Invalid external url: Make sure to include the protocol (e.g. https://)',
          type: 'Error',
          timestamp: new Date(),
        })
      }
    }
  }

  const handleGenerateKey = () => {
    let privKey: Buffer
    do {
      privKey = crypto.randomBytes(32)
    } while (!secp256k1.privateKeyVerify(new Uint8Array(privKey)))

    const privateKey = privKey.toString('hex')
    setCreatedBadgeKey(privateKey)
    console.log('Private Key: ', privateKey)

    const publicKey = Buffer.from(secp256k1.publicKeyCreate(new Uint8Array(privKey))).toString('hex')
    setBadgeId(null)
    keyState.onChange(publicKey)
  }

  const handleDownloadQr = async () => {
    const qrElement = qrRef.current
    await toPng(qrElement as HTMLElement).then((dataUrl) => {
      const link = document.createElement('a')
      link.download = `badge-${badgeId as string}.png`
      link.href = dataUrl
      link.click()
    })
  }

  const handleDownloadKeys = () => {
    const element = document.createElement('a')
    const file = new Blob([JSON.stringify(keyPairs)], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `badge-${badgeId as string}-keys.json`
    document.body.appendChild(element)
    element.click()
  }

  const copyClaimURL = async () => {
    const baseURL = NETWORK === 'testnet' ? 'https://badges.publicawesome.dev' : 'https://badges.stargaze.zone'
    const claimURL = `${baseURL}/?id=${badgeId as string}&key=${createdBadgeKey as string}`
    await navigator.clipboard.writeText(claimURL)
    toast.success('Copied claim URL to clipboard')
  }

  const checkwalletBalance = () => {
    if (!wallet.isWalletConnected) throw new Error('Wallet not connected.')
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
  }, [imageUploadDetails?.uploadMethod])

  useEffect(() => {
    if (keyPairs.length > 0) {
      toast.success('Key pairs generated successfully.')
    }
  }, [keyPairs])

  return (
    <div>
      <NextSeo title="Create Badge" />

      <div className="mt-5 space-y-5 text-center">
        <h1 className="font-heading text-4xl font-bold">Create Badge</h1>

        <Conditional test={uploading}>
          <BadgeLoadingModal />
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
          <Conditional test={mintRule === 'by_key'}>
            <Alert className="mt-5" type="info">
              <div className="flex flex-row">
                <div>
                  <div className="w-[384px] h-[384px]" ref={qrRef}>
                    <QRCodeSVG
                      className="mx-auto"
                      level="H"
                      size={384}
                      value={`${
                        NETWORK === 'testnet' ? 'https://badges.publicawesome.dev' : 'https://badges.stargaze.zone'
                      }/?id=${badgeId as string}&key=${createdBadgeKey as string}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 w-[384px]">
                    <Button
                      className="items-center w-full text-sm text-center rounded"
                      leftIcon={<FaSave />}
                      onClick={() => void handleDownloadQr()}
                    >
                      Download QR Code
                    </Button>
                    <Button
                      className="w-full text-sm text-center rounded"
                      isWide
                      leftIcon={<FaCopy />}
                      onClick={() => void copyClaimURL()}
                      variant="solid"
                    >
                      Copy Claim URL
                    </Button>
                  </div>
                </div>
                <div className="ml-4 text-lg">
                  Badge ID:{` ${badgeId as string}`}
                  <br />
                  Private Key:
                  <Tooltip label="Click to copy the private key">
                    <button
                      className="group flex space-x-2 font-mono text-base text-white/50 hover:underline"
                      onClick={() => void copy(createdBadgeKey as string)}
                      type="button"
                    >
                      <span>{truncateMiddle(createdBadgeKey ? createdBadgeKey : '', 32)}</span>
                      <FaCopy className="opacity-50 group-hover:opacity-100" />
                    </button>
                  </Tooltip>
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
                  <br />
                  <div className="text-base">
                    <div className="flex-row pt-4 mt-4 border-t-2">
                      <span>
                        You may click{' '}
                        <Anchor
                          className="text-stargaze hover:underline"
                          external
                          href={`${
                            NETWORK === 'testnet' ? 'https://badges.publicawesome.dev' : 'https://badges.stargaze.zone'
                          }/?id=${badgeId as string}&key=${createdBadgeKey as string}`}
                        >
                          here
                        </Anchor>{' '}
                        or scan the QR code to claim a badge.
                      </span>
                    </div>
                    <br />
                    <span className="mt-4">
                      You may download the QR code or copy the claim URL to share with others.
                    </span>
                  </div>
                  <br />
                </div>
              </div>
            </Alert>
          </Conditional>

          <Conditional test={mintRule === 'by_keys'}>
            <Alert className="mt-5" type="info">
              <div className="ml-4 text-lg">
                Badge ID:{` ${badgeId as string}`}
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
                <br />
                <Conditional test={isAddingKeysComplete}>
                  <div className="pt-2 mt-4 border-t-2">
                    <span className="mt-2">
                      Make sure to download the whitelisted keys added during badge creation.
                    </span>
                    <Button className="mt-2" onClick={() => handleDownloadKeys()}>
                      Download Keys
                    </Button>
                  </div>
                </Conditional>
                <div className="text-base">
                  <div className="flex-row pt-4 mt-4 border-t-2">
                    <span>
                      You may click{' '}
                      <Anchor
                        className="text-stargaze hover:underline"
                        external
                        href={`/badges/actions/?badgeHubContractAddress=${BADGE_HUB_ADDRESS}&badgeId=${
                          badgeId as string
                        }`}
                      >
                        here
                      </Anchor>{' '}
                      and select Actions {'>'} Add Keys to add (additional) whitelisted keys or select Actions {'>'}{' '}
                      Mint by Keys to use one of the keys to mint a badge.
                    </span>
                  </div>
                </div>
              </div>
            </Alert>
          </Conditional>

          <Conditional test={mintRule === 'by_minter'}>
            <Alert className="mt-5" type="info">
              <div className="ml-4 text-lg">
                Badge ID:{` ${badgeId as string}`}
                <br />
                Designated Minter Address: {` ${resolvedMinterAddress}`}
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
                <br />
                <div className="text-base">
                  <div className="flex-row pt-4 mt-4 border-t-2">
                    <span>
                      You may click{' '}
                      <Anchor
                        className="text-stargaze hover:underline"
                        external
                        href={`/badges/actions/?badgeHubContractAddress=${BADGE_HUB_ADDRESS}&badgeId=${
                          badgeId as string
                        }`}
                      >
                        here
                      </Anchor>{' '}
                      and select Actions {'>'} Mint By Minter to mint a badge.
                    </span>
                  </div>
                </div>
              </div>
            </Alert>
          </Conditional>
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
            <Tooltip
              backgroundColor="bg-blue-500"
              className="m-0 w-1/3"
              label="The same single private key can be utilized by multiple users to share badge minting authority. Ideal for projects with multiple administrators."
              placement="bottom"
            >
              <button
                className="p-4 w-full h-full text-left bg-transparent"
                onClick={() => {
                  setMintRule('by_key')
                  setReadyToCreateBadge(false)
                  setBadgeId(null)
                }}
                type="button"
              >
                <h4 className="font-bold">Mint Rule: By Key</h4>
                <span className="text-sm text-white/80 line-clamp-4">
                  Multiple badges can be minted to different addresses by the owner of a single designated key.
                </span>
              </button>
            </Tooltip>
          </div>
          <div
            className={clsx(
              'isolate space-y-1 border-2',
              'first-of-type:rounded-tl-md last-of-type:rounded-tr-md',
              mintRule === 'by_keys' ? 'border-stargaze' : 'border-transparent',
              mintRule !== 'by_keys' ? 'bg-stargaze/5 hover:bg-stargaze/80' : 'hover:bg-white/5',
            )}
          >
            <Tooltip
              backgroundColor="bg-blue-500"
              className="m-0 w-1/3"
              label="The key pairs are intended to be saved and shared with others. Each user can claim a badge separately using the key pair that they received."
              placement="bottom"
            >
              <button
                className="p-4 w-full h-full text-left bg-transparent"
                onClick={() => {
                  setMintRule('by_keys')
                  setReadyToCreateBadge(false)
                  setBadgeId(null)
                }}
                type="button"
              >
                <h4 className="font-bold">Mint Rule: By Keys</h4>
                <span className="text-sm text-white/80 line-clamp-4">
                  Multiple key pairs are generated and designated to be only used once to mint a single badge.
                </span>
              </button>
            </Tooltip>
          </div>
          <div
            className={clsx(
              'isolate space-y-1 border-2',
              'first-of-type:rounded-tl-md last-of-type:rounded-tr-md',
              mintRule === 'by_minter' ? 'border-stargaze' : 'border-transparent',
              mintRule !== 'by_minter' ? 'bg-stargaze/5 hover:bg-stargaze/80' : 'hover:bg-white/5',
            )}
          >
            <Tooltip
              backgroundColor="bg-blue-500"
              className="m-0 w-1/3"
              label="The most basic approach. However, having just one authorized address for minting badges might limit your ability to delegate that responsibility."
              placement="bottom"
            >
              <button
                className="p-4 w-full h-full text-left bg-transparent"
                onClick={() => {
                  setMintRule('by_minter')
                  setReadyToCreateBadge(false)
                  setBadgeId(null)
                }}
                type="button"
              >
                <h4 className="font-bold">Mint Rule: By Minter</h4>
                <span className="text-sm text-white/80 line-clamp-4">
                  No key designation. Multiple badges can be minted to different addresses by a pre-determined minter
                  address.
                </span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="mx-10">
        <ImageUploadDetails mintRule={mintRule} onChange={setImageUploadDetails} />
        <Conditional test={mintRule === 'by_key'}>
          <div className="flex flex-row justify-start py-3 px-8 mb-3 w-full rounded border-2 border-white/20">
            <TextInput className="ml-4 w-full max-w-2xl" {...keyState} disabled required />
            <Button className="mt-14 ml-4" isDisabled={creatingBadge} onClick={handleGenerateKey}>
              Generate Key
            </Button>
          </div>
        </Conditional>

        <Conditional test={mintRule === 'by_keys'}>
          <div className="flex flex-row justify-start py-3 px-8 mb-3 w-full rounded border-2 border-white/20">
            <div className="grid grid-cols-2 gap-24">
              <div className="flex flex-col ml-4">
                <span className="font-bold">Number of Keys</span>
                <span className="text-sm text-white/80">
                  The number of key pairs to be whitelisted for post-creation access control
                </span>
              </div>
              <input
                className="p-2 w-1/4 max-w-2xl bg-white/10 rounded border-2 border-white/20"
                onChange={(e) => setNumberOfKeys(Number(e.target.value))}
                required
                type="number"
                value={numberOfKeys}
              />
            </div>
          </div>
        </Conditional>

        <Conditional test={mintRule === 'by_minter'}>
          <div className="flex flex-row justify-start py-3 px-8 mb-3 w-full rounded border-2 border-white/20">
            <TextInput className="ml-4 w-full max-w-lg" {...designatedMinterState} required />
          </div>
        </Conditional>

        <div className="flex justify-between py-3 px-8 rounded border-2 border-white/20 grid-col-2">
          <BadgeDetails
            metadataSize={
              tempBadge?.metadata.image === undefined
                ? Number(sizeof(tempBadge)) + Number(sizeof(tempBadge?.metadata.attributes)) + 150
                : Number(sizeof(tempBadge)) + Number(sizeof(tempBadge.metadata.attributes))
            }
            mintRule={mintRule}
            onChange={setBadgeDetails}
            uploadMethod={imageUploadDetails?.uploadMethod ? imageUploadDetails.uploadMethod : 'new'}
          />
        </div>

        <Conditional test={readyToCreateBadge}>
          <BadgeConfirmationModal confirm={createNewBadge} />
        </Conditional>

        <div className="flex justify-end w-full">
          <Button
            className="relative justify-center p-2 mt-2 mb-6 max-h-12 text-white bg-plumbus hover:bg-plumbus-light border-0"
            isLoading={creatingBadge}
            onClick={() => performBadgeCreationChecks()}
            variant="solid"
          >
            Create Badge
          </Button>
        </div>
        <Sidetab buttonColor="#455CF9" buttonText="Studio Survey" height={600} id="yJnL8fXk" width={800} />
      </div>
    </div>
  )
}

export default withMetadata(BadgeCreationPage, { center: false })
