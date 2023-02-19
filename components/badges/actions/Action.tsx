// import { AirdropUpload } from 'components/AirdropUpload'
import type { DispatchExecuteArgs } from 'components/badges/actions/actions'
import { dispatchExecute, isEitherType, previewExecutePayload } from 'components/badges/actions/actions'
import { ActionsCombobox } from 'components/badges/actions/Combobox'
import { useActionsComboboxState } from 'components/badges/actions/Combobox.hooks'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { FormControl } from 'components/FormControl'
// import { FormGroup } from 'components/FormGroup'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { MetadataAttributes } from 'components/forms/MetadataAttributes'
import { useMetadataAttributesState } from 'components/forms/MetadataAttributes.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { JsonPreview } from 'components/JsonPreview'
import { TransactionHash } from 'components/TransactionHash'
import { useWallet } from 'contexts/wallet'
import type { Badge, BadgeHubInstance } from 'contracts/badgeHub'
import * as crypto from 'crypto'
import { toPng } from 'html-to-image'
import { QRCodeCanvas } from 'qrcode.react'
import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight, FaCopy, FaSave } from 'react-icons/fa'
import { useMutation } from 'react-query'
import * as secp256k1 from 'secp256k1'
import { NETWORK } from 'utils/constants'
import type { AirdropAllocation } from 'utils/isValidAccountsFile'
import { resolveAddress } from 'utils/resolveAddress'

import { TextInput } from '../../forms/FormInput'
import type { MintRule } from '../creation/ImageUploadDetails'

interface BadgeActionsProps {
  badgeHubContractAddress: string
  badgeId: number
  badgeHubMessages: BadgeHubInstance | undefined
  mintRule: MintRule
}

type TransferrableType = true | false | undefined

export const BadgeActions = ({ badgeHubContractAddress, badgeId, badgeHubMessages, mintRule }: BadgeActionsProps) => {
  const wallet = useWallet()
  const [lastTx, setLastTx] = useState('')

  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined)
  const [airdropAllocationArray, setAirdropAllocationArray] = useState<AirdropAllocation[]>([])
  const [airdropArray, setAirdropArray] = useState<string[]>([])
  const [badge, setBadge] = useState<Badge>()
  const [transferrable, setTransferrable] = useState<TransferrableType>(undefined)
  const [resolvedOwnerAddress, setResolvedOwnerAddress] = useState<string>('')

  const [createdBadgeId, setCreatedBadgeId] = useState<string | undefined>(undefined)
  const [createdBadgeKey, setCreatedBadgeKey] = useState<string | undefined>(undefined)
  const qrRef = useRef<HTMLDivElement>(null)

  const actionComboboxState = useActionsComboboxState()
  const type = actionComboboxState.value?.id

  const maxSupplyState = useNumberInputState({
    id: 'max-supply',
    name: 'max-supply',
    title: 'Max Supply',
    subtitle: 'Maximum number of badges that can be minted',
  })

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
      transferrable: transferrable === true,
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
    id: badgeId,
    owner: resolvedOwnerAddress,
    pubkey: pubkeyState.value,
    signature: signatureState.value,
    keys: [],
    limit: limitState.value,
    owners: [],
    nft: nftState.value,
    badgeHubMessages,
    badgeHubContract: badgeHubContractAddress,
    txSigner: wallet.address,
    type,
  }
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
        transferrable: transferrable === true,
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
      transferrable: transferrable === true,
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

  useEffect(() => {
    const addresses: string[] = []
    airdropAllocationArray.forEach((allocation) => {
      for (let i = 0; i < Number(allocation.amount); i++) {
        addresses.push(allocation.address)
      }
    })
    //shuffle the addresses array
    for (let i = addresses.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[addresses[i], addresses[j]] = [addresses[j], addresses[i]]
    }
    setAirdropArray(addresses)
  }, [airdropAllocationArray])

  const { isLoading, mutate } = useMutation(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!type) {
        throw new Error('Please select an action.')
      }
      if (badgeHubContractAddress === '') {
        throw new Error('Please enter the Badge Hub contract addresses.')
      }

      // if (wallet.client && type === 'update_mint_price') {
      //   const contractConfig = wallet.client.queryContractSmart(minterContractAddress, {
      //     config: {},
      //   })
      //   await toast
      //     .promise(
      //       wallet.client.queryContractSmart(minterContractAddress, {
      //         mint_price: {},
      //       }),
      //       {
      //         error: `Querying mint price failed!`,
      //         loading: 'Querying current mint price...',
      //         success: (price) => {
      //           console.log('Current mint price: ', price)
      //           return `Current mint price is ${Number(price.public_price.amount) / 1000000} STARS`
      //         },
      //       },
      //     )
      //     .then(async (price) => {
      //       if (Number(price.public_price.amount) / 1000000 <= priceState.value) {
      //         await contractConfig
      //           .then((config) => {
      //             console.log(config.start_time, Date.now() * 1000000)
      //             if (Number(config.start_time) < Date.now() * 1000000) {
      //               throw new Error(
      //                 `Minting has already started on ${new Date(
      //                   Number(config.start_time) / 1000000,
      //                 ).toLocaleString()}. Updated mint price cannot be higher than the current price of ${
      //                   Number(price.public_price.amount) / 1000000
      //                 } STARS`,
      //               )
      //             }
      //           })
      //           .catch((error) => {
      //             throw new Error(String(error).substring(String(error).lastIndexOf('Error:') + 7))
      //           })
      //       }
      //     })
      // }

      const txHash = await toast.promise(dispatchExecute(payload), {
        error: `${type.charAt(0).toUpperCase() + type.slice(1)} execute failed!`,
        loading: 'Executing message...',
        success: (tx) => `Transaction ${tx} success!`,
      })
      if (txHash) {
        setLastTx(txHash)
      }
    },
    {
      onError: (error) => {
        toast.error(String(error), { style: { maxWidth: 'none' } })
      },
    },
  )

  const airdropFileOnChange = (data: AirdropAllocation[]) => {
    setAirdropAllocationArray(data)
  }

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

  return (
    <form>
      <div className="grid grid-cols-2 mt-4">
        <div className="mr-2">
          <ActionsCombobox mintRule={mintRule} {...actionComboboxState} />
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

          {/* {showAirdropFileField && (
            <FormGroup
              subtitle="CSV file that contains the airdrop addresses and the amount of tokens allocated for each address. Should start with the following header row: address,amount"
              title="Airdrop File"
            >
              <AirdropUpload onChange={airdropFileOnChange} />
            </FormGroup>
          )} */}
          <Conditional test={showBadgeField}>
            <FormControl className="mt-2" htmlId="start-date" title="Start Time">
              <InputDateTime minDate={new Date()} onChange={(date) => setTimestamp(date)} value={timestamp} />
            </FormControl>
          </Conditional>

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
        <div className="-mt-6">
          <div className="relative mb-2">
            <Button
              className="absolute top-0 right-0"
              isLoading={isLoading}
              onClick={mutate}
              rightIcon={<FaArrowRight />}
            >
              Execute
            </Button>
            <FormControl subtitle="View execution transaction hash" title="Transaction Hash">
              <TransactionHash hash={lastTx} />
            </FormControl>
          </div>
          <FormControl subtitle="View current message to be sent" title="Payload Preview">
            <JsonPreview content={previewExecutePayload(payload)} isCopyable />
          </FormControl>
        </div>
      </div>
    </form>
  )
}
