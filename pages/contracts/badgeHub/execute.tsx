import { toUtf8 } from '@cosmjs/encoding'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { ExecuteCombobox } from 'components/contracts/badgeHub/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/contracts/badgeHub/ExecuteCombobox.hooks'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { badgeHubLinkTabs } from 'components/LinkTabs.data'
import { TransactionHash } from 'components/TransactionHash'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { Badge } from 'contracts/badgeHub'
import type { DispatchExecuteArgs } from 'contracts/badgeHub/messages/execute'
import { dispatchExecute, isEitherType, previewExecutePayload } from 'contracts/badgeHub/messages/execute'
import * as crypto from 'crypto'
import { toPng } from 'html-to-image'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import sizeof from 'object-sizeof'
import { QRCodeCanvas } from 'qrcode.react'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight, FaCopy, FaSave } from 'react-icons/fa'
import { useMutation } from 'react-query'
import * as secp256k1 from 'secp256k1'
import { NETWORK } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { resolveAddress } from 'utils/resolveAddress'

import { TextInput } from '../../../components/forms/FormInput'
import { MetadataAttributes } from '../../../components/forms/MetadataAttributes'
import { useMetadataAttributesState } from '../../../components/forms/MetadataAttributes.hooks'
import { BADGE_HUB_ADDRESS } from '../../../utils/constants'

const BadgeHubExecutePage: NextPage = () => {
  const { badgeHub: contract } = useContracts()
  const wallet = useWallet()
  const [lastTx, setLastTx] = useState('')
  const [badge, setBadge] = useState<Badge>()

  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined)
  const [transferrable, setTransferrable] = useState<boolean>(false)
  const [createdBadgeId, setCreatedBadgeId] = useState<string | undefined>(undefined)
  const [createdBadgeKey, setCreatedBadgeKey] = useState<string | undefined>(undefined)
  const [resolvedOwnerAddress, setResolvedOwnerAddress] = useState<string>('')
  const [editFee, setEditFee] = useState<number | undefined>(undefined)
  const [triggerDispatch, setTriggerDispatch] = useState<boolean>(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id

  const badgeIdState = useNumberInputState({
    id: 'badge-id',
    name: 'badgeId',
    title: 'Badge ID',
    subtitle: 'Enter the badge ID',
    defaultValue: 1,
  })

  const maxSupplyState = useNumberInputState({
    id: 'max-supply',
    name: 'max-supply',
    title: 'Max Supply',
    subtitle: 'Maximum number of badges that can be minted',
  })

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Badge Hub Address',
    subtitle: 'Address of the Badge Hub contract',
    defaultValue: BADGE_HUB_ADDRESS,
  })
  const contractAddress = contractState.value

  // Metadata related fields
  const managerState = useInputState({
    id: 'manager-address',
    name: 'manager',
    title: 'Manager',
    subtitle: 'Badge Hub Manager',
    defaultValue: wallet.address,
  })

  const nameState = useInputState({
    id: 'metadata-name',
    name: 'metadata-name',
    title: 'Name',
    subtitle: 'Name of the badge',
  })

  const descriptionState = useInputState({
    id: 'metadata-description',
    name: 'metadata-description',
    title: 'Description',
    subtitle: 'Description of the badge',
  })

  const imageState = useInputState({
    id: 'metadata-image',
    name: 'metadata-image',
    title: 'Image',
    subtitle: 'Badge Image URL',
  })

  const imageDataState = useInputState({
    id: 'metadata-image-data',
    name: 'metadata-image-data',
    title: 'Image Data',
    subtitle: 'Raw SVG image data',
  })

  const externalUrlState = useInputState({
    id: 'metadata-external-url',
    name: 'metadata-external-url',
    title: 'External URL',
    subtitle: 'External URL for the badge',
  })

  const attributesState = useMetadataAttributesState()

  const backgroundColorState = useInputState({
    id: 'metadata-background-color',
    name: 'metadata-background-color',
    title: 'Background Color',
    subtitle: 'Background color of the badge',
  })

  const animationUrlState = useInputState({
    id: 'metadata-animation-url',
    name: 'metadata-animation-url',
    title: 'Animation URL',
    subtitle: 'Animation URL for the badge',
  })

  const youtubeUrlState = useInputState({
    id: 'metadata-youtube-url',
    name: 'metadata-youtube-url',
    title: 'YouTube URL',
    subtitle: 'YouTube URL for the badge',
  })
  // Rules related fields
  const keyState = useInputState({
    id: 'key',
    name: 'key',
    title: 'Key',
    subtitle: 'The key generated for the badge',
  })

  const ownerState = useInputState({
    id: 'owner-address',
    name: 'owner',
    title: 'Owner',
    subtitle: 'The owner of the badge',
  })

  const pubkeyState = useInputState({
    id: 'pubkey',
    name: 'pubkey',
    title: 'Pubkey',
    subtitle: 'The public key for the badge',
  })

  const signatureState = useInputState({
    id: 'signature',
    name: 'signature',
    title: 'Signature',
    subtitle: 'The signature for the badge',
  })

  const nftState = useInputState({
    id: 'nft-address',
    name: 'nft-address',
    title: 'NFT Contract Address',
    subtitle: 'The NFT Contract Address for the badge',
  })

  const limitState = useNumberInputState({
    id: 'limit',
    name: 'limit',
    title: 'Limit',
    subtitle: 'Number of keys/owners to execute the action for',
  })

  const showBadgeField = type === 'create_badge'
  const showMetadataField = isEitherType(type, ['create_badge', 'edit_badge'])
  const showIdField = type === 'edit_badge'
  const showNFTField = type === 'set_nft'

  const messages = useMemo(() => contract?.use(contractState.value), [contract, wallet.address, contractState.value])
  const payload: DispatchExecuteArgs = {
    badge: {
      manager: managerState.value,
      metadata: {
        name: nameState.value || undefined,
        description: descriptionState.value || undefined,
        image: imageState.value || undefined,
        image_data: imageDataState.value || undefined,
        external_url: externalUrlState.value || undefined,
        attributes:
          attributesState.values[0]?.trait_type && attributesState.values[0]?.value
            ? attributesState.values
                .map((attr) => ({
                  trait_type: attr.trait_type,
                  value: attr.value,
                }))
                .filter((attr) => attr.trait_type && attr.value)
            : undefined,
        background_color: backgroundColorState.value || undefined,
        animation_url: animationUrlState.value || undefined,
        youtube_url: youtubeUrlState.value || undefined,
      },
      transferrable,
      rule: {
        by_key: keyState.value,
      },
      expiry: timestamp ? timestamp.getTime() * 1000000 : undefined,
      max_supply: maxSupplyState.value || undefined,
    },
    metadata: {
      name: nameState.value || undefined,
      description: descriptionState.value || undefined,
      image: imageState.value || undefined,
      image_data: imageDataState.value || undefined,
      external_url: externalUrlState.value || undefined,
      attributes:
        attributesState.values[0]?.trait_type && attributesState.values[0]?.value
          ? attributesState.values
              .map((attr) => ({
                trait_type: attr.trait_type,
                value: attr.value,
              }))
              .filter((attr) => attr.trait_type && attr.value)
          : undefined,
      background_color: backgroundColorState.value || undefined,
      animation_url: animationUrlState.value || undefined,
      youtube_url: youtubeUrlState.value || undefined,
    },
    id: badgeIdState.value,
    owner: ownerState.value,
    pubkey: pubkeyState.value,
    signature: signatureState.value,
    keys: [],
    limit: limitState.value,
    owners: [],
    nft: nftState.value,
    editFee,
    contract: contractState.value,
    messages,
    txSigner: wallet.address,
    type,
  }
  const { isLoading, mutate } = useMutation(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!type) {
        throw new Error('Please select message type!')
      }
      if (!wallet.initialized) {
        throw new Error('Please connect your wallet.')
      }
      if (contractState.value === '') {
        throw new Error('Please enter the contract address.')
      }
      if (wallet.client && type === 'edit_badge') {
        const feeRateRaw = await wallet.client.queryContractRaw(
          contractAddress,
          toUtf8(Buffer.from(Buffer.from('fee_rate').toString('hex'), 'hex').toString()),
        )
        const feeRate = JSON.parse(new TextDecoder().decode(feeRateRaw as Uint8Array))

        await toast
          .promise(
            wallet.client.queryContractSmart(contractAddress, {
              badge: { id: badgeIdState.value },
            }),
            {
              error: `Edit Fee calculation failed!`,
              loading: 'Calculating Edit Fee...',
              success: (currentBadge) => {
                console.log('Current badge: ', currentBadge)
                return `Current metadata is ${
                  Number(sizeof(currentBadge.metadata)) + Number(sizeof(currentBadge.metadata.attributes))
                } bytes in size.`
              },
            },
          )
          .then((currentBadge) => {
            // TODO - Go over the calculation
            const currentBadgeMetadataSize =
              Number(sizeof(currentBadge.metadata)) + Number(sizeof(currentBadge.metadata.attributes) * 2)
            console.log('Current badge metadata size: ', currentBadgeMetadataSize)
            const newBadgeMetadataSize =
              Number(sizeof(badge?.metadata)) + Number(sizeof(badge?.metadata.attributes)) * 2
            console.log('New badge metadata size: ', newBadgeMetadataSize)
            if (newBadgeMetadataSize > currentBadgeMetadataSize) {
              const calculatedFee = ((newBadgeMetadataSize - currentBadgeMetadataSize) * Number(feeRate.metadata)) / 2
              setEditFee(calculatedFee)
              setTriggerDispatch(!triggerDispatch)
            } else {
              setEditFee(undefined)
              setTriggerDispatch(!triggerDispatch)
            }
          })
          .catch((error) => {
            throw new Error(String(error).substring(String(error).lastIndexOf('Error:') + 7))
          })
      } else {
        const txHash = await toast.promise(dispatchExecute(payload), {
          error: `${type.charAt(0).toUpperCase() + type.slice(1)} execute failed!`,
          loading: 'Executing message...',
          success: (tx) => `Transaction ${tx} success!`,
        })
        if (txHash) {
          setLastTx(txHash)
        }
      }
    },
    {
      onError: (error) => {
        toast.error(String(error), { style: { maxWidth: 'none' } })
      },
    },
  )

  const handleGenerateKey = () => {
    let privKey: Buffer
    do {
      privKey = crypto.randomBytes(32)
    } while (!secp256k1.privateKeyVerify(privKey))

    const privateKey = privKey.toString('hex')
    setCreatedBadgeKey(privateKey)
    console.log('Private Key: ', privateKey)

    const publicKey = Buffer.from(secp256k1.publicKeyCreate(privKey)).toString('hex')

    keyState.onChange(publicKey)
  }

  const handleDownloadQr = async () => {
    const qrElement = qrRef.current
    await toPng(qrElement as HTMLElement).then((dataUrl) => {
      const link = document.createElement('a')
      link.download = `badge-${createdBadgeId as string}.png`
      link.href = dataUrl
      link.click()
    })
  }

  const copyClaimURL = async () => {
    const baseURL = NETWORK === 'testnet' ? 'https://badges.publicawesome.dev' : 'https://badges.stargaze.zone'
    const claimURL = `${baseURL}/?id=${createdBadgeId as string}&key=${createdBadgeKey as string}`
    await navigator.clipboard.writeText(claimURL)
    toast.success('Copied claim URL to clipboard')
  }

  const dispatchEditBadgeMessage = async () => {
    if (type) {
      const txHash = await toast.promise(dispatchExecute(payload), {
        error: `${type.charAt(0).toUpperCase() + type.slice(1)} execute failed!`,
        loading: 'Executing message...',
        success: (tx) => `Transaction ${tx} success!`,
      })
      if (txHash) {
        setLastTx(txHash)
      }
    }
  }

  const router = useRouter()

  useEffect(() => {
    if (contractAddress.length > 0) {
      void router.replace({ query: { contractAddress } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress])

  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('contractAddress')
    if (initial && initial.length > 0) contractState.onChange(initial)
    if (attributesState.values.length === 0)
      attributesState.add({
        trait_type: '',
        value: '',
      })
  }, [])

  useEffect(() => {
    void dispatchEditBadgeMessage().catch((err) => {
      toast.error(String(err), { style: { maxWidth: 'none' } })
    })
  }, [triggerDispatch])

  const resolveOwnerAddress = async () => {
    await resolveAddress(ownerState.value.trim(), wallet).then((resolvedAddress) => {
      setResolvedOwnerAddress(resolvedAddress)
    })
  }
  useEffect(() => {
    void resolveOwnerAddress()
  }, [ownerState.value])

  const resolveManagerAddress = async () => {
    await resolveAddress(managerState.value.trim(), wallet).then((resolvedAddress) => {
      setBadge({
        manager: resolvedAddress,
        metadata: {
          name: nameState.value || undefined,
          description: descriptionState.value || undefined,
          image: imageState.value || undefined,
          image_data: imageDataState.value || undefined,
          external_url: externalUrlState.value || undefined,
          attributes:
            attributesState.values[0]?.trait_type && attributesState.values[0]?.value
              ? attributesState.values
                  .map((attr) => ({
                    trait_type: attr.trait_type,
                    value: attr.value,
                  }))
                  .filter((attr) => attr.trait_type && attr.value)
              : undefined,
          background_color: backgroundColorState.value || undefined,
          animation_url: animationUrlState.value || undefined,
          youtube_url: youtubeUrlState.value || undefined,
        },
        transferrable,
        rule: {
          by_key: keyState.value,
        },
        expiry: timestamp ? timestamp.getTime() * 1000000 : undefined,
        max_supply: maxSupplyState.value || undefined,
      })
    })
  }

  useEffect(() => {
    void resolveManagerAddress()
  }, [managerState.value])

  useEffect(() => {
    setBadge({
      manager: managerState.value,
      metadata: {
        name: nameState.value || undefined,
        description: descriptionState.value || undefined,
        image: imageState.value || undefined,
        image_data: imageDataState.value || undefined,
        external_url: externalUrlState.value || undefined,
        attributes:
          attributesState.values[0]?.trait_type && attributesState.values[0]?.value
            ? attributesState.values
                .map((attr) => ({
                  trait_type: attr.trait_type,
                  value: attr.value,
                }))
                .filter((attr) => attr.trait_type && attr.value)
            : undefined,
        background_color: backgroundColorState.value || undefined,
        animation_url: animationUrlState.value || undefined,
        youtube_url: youtubeUrlState.value || undefined,
      },
      transferrable,
      rule: {
        by_key: keyState.value,
      },
      expiry: timestamp ? timestamp.getTime() * 1000000 : undefined,
      max_supply: maxSupplyState.value || undefined,
    })
  }, [
    managerState.value,
    nameState.value,
    descriptionState.value,
    imageState.value,
    imageDataState.value,
    externalUrlState.value,
    attributesState.values,
    backgroundColorState.value,
    animationUrlState.value,
    youtubeUrlState.value,
    transferrable,
    keyState.value,
    timestamp,
    maxSupplyState.value,
  ])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Execute Badge Hub Contract" />
      <ContractPageHeader
        description="The Badge Hub contract is where event organizers create, mint, or edit badges."
        link={links.Documentation}
        title="Badge Hub Contract"
      />
      <LinkTabs activeIndex={2} data={badgeHubLinkTabs} />

      {showBadgeField && createdBadgeId && createdBadgeKey && (
        <div className="ml-4">
          <div className="w-[384px] h-[384px]" ref={qrRef}>
            <QRCodeCanvas
              size={384}
              value={`${
                NETWORK === 'testnet' ? 'https://badges.publicawesome.dev' : 'https://badges.stargaze.zone'
              }/?id=${createdBadgeId}&key=${createdBadgeKey}`}
            />
          </div>
          {/* <div className="flex flex-row items-center mt-2 space-x-2 w-[384px] h-12"> */}
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
      )}
      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <ExecuteCombobox {...comboboxState} />
          {showIdField && <NumberInput {...badgeIdState} />}
          {showBadgeField && <AddressInput {...managerState} />}
          {showBadgeField && <TextInput {...keyState} />}
          {showBadgeField && <Button onClick={handleGenerateKey}>Generate Key</Button>}
          {showMetadataField && (
            <div className="p-4 rounded-md border-2 border-gray-800">
              <span className="text-gray-400">Metadata</span>
              <TextInput className="mt-2" {...nameState} />
              <TextInput className="mt-2" {...descriptionState} />
              <TextInput className="mt-2" {...imageState} />
              <TextInput className="mt-2" {...imageDataState} />
              <TextInput className="mt-2" {...externalUrlState} />
              <div className="mt-2">
                <MetadataAttributes
                  attributes={attributesState.entries}
                  onAdd={attributesState.add}
                  onChange={attributesState.update}
                  onRemove={attributesState.remove}
                  title="Traits"
                />
              </div>
              <TextInput className="mt-2" {...backgroundColorState} />
              <TextInput className="mt-2" {...animationUrlState} />
              <TextInput className="mt-2" {...youtubeUrlState} />
            </div>
          )}
          {showNFTField && <AddressInput {...nftState} />}
        </div>

        <div className="space-y-8">
          <div className="relative">
            <Button className="absolute top-0 right-0" isLoading={isLoading} rightIcon={<FaArrowRight />} type="submit">
              Execute
            </Button>
            <FormControl subtitle="View execution transaction hash" title="Transaction Hash">
              <TransactionHash hash={lastTx} />
            </FormControl>
          </div>
          <FormControl subtitle="View current message to be sent" title="Payload Preview">
            <JsonPreview content={previewExecutePayload(payload)} isCopyable />
          </FormControl>
          <div className="pt-9">
            <Conditional test={showBadgeField}>
              <FormControl htmlId="expiry-date" subtitle="Badge minting expiry date" title="Expiry Date">
                <InputDateTime minDate={new Date()} onChange={(date) => setTimestamp(date)} value={timestamp} />
              </FormControl>
            </Conditional>
            {showBadgeField && <NumberInput className="mt-2" {...maxSupplyState} />}
            {showBadgeField && (
              <div className="mt-2 form-control">
                <label className="justify-start cursor-pointer label">
                  <span className="mr-4 font-bold">Transferrable</span>
                  <input
                    checked={transferrable}
                    className={`toggle ${transferrable ? `bg-stargaze` : `bg-gray-600`}`}
                    onClick={() => setTransferrable(!transferrable)}
                    type="checkbox"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </form>
    </section>
  )
}

export default withMetadata(BadgeHubExecutePage, { center: false })
