/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-nested-ternary */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { toUtf8 } from '@cosmjs/encoding'
import clsx from 'clsx'
import { Conditional } from 'components/Conditional'
import { FormControl } from 'components/FormControl'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { useMetadataAttributesState } from 'components/forms/MetadataAttributes.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { useGlobalSettings } from 'contexts/globalSettings'
import type { Trait } from 'contracts/badgeHub'
import type { ChangeEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { BADGE_HUB_ADDRESS } from 'utils/constants'
import { useWallet } from 'utils/wallet'

import { AddressInput, NumberInput, TextInput } from '../../forms/FormInput'
import { MetadataAttributes } from '../../forms/MetadataAttributes'
import { Tooltip } from '../../Tooltip'
import type { MintRule, UploadMethod } from './ImageUploadDetails'

interface BadgeDetailsProps {
  onChange: (data: BadgeDetailsDataProps) => void
  uploadMethod: UploadMethod | undefined
  mintRule: MintRule
  metadataSize: number
}

export interface BadgeDetailsDataProps {
  manager: string
  name?: string
  description?: string
  attributes?: Trait[]
  expiry?: number
  transferrable: boolean
  max_supply?: number
  image_data?: string
  external_url?: string
  background_color?: string
  animation_url?: string
  youtube_url?: string
}

export const BadgeDetails = ({ metadataSize, onChange, uploadMethod }: BadgeDetailsProps) => {
  const { address = '', isWalletConnected, getCosmWasmClient } = useWallet()
  const { timezone } = useGlobalSettings()
  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined)
  const [transferrable, setTransferrable] = useState<boolean>(false)
  const [metadataFile, setMetadataFile] = useState<File>()
  const [metadataFeeRate, setMetadataFeeRate] = useState<number>(0)

  const metadataFileRef = useRef<HTMLInputElement | null>(null)

  const managerState = useInputState({
    id: 'manager-address',
    name: 'manager',
    title: 'Manager',
    subtitle: 'Badge Hub Manager',
    defaultValue: address,
  })

  const nameState = useInputState({
    id: 'name',
    name: 'name',
    title: 'Name',
    placeholder: 'My Awesome Collection',
  })

  const descriptionState = useInputState({
    id: 'description',
    name: 'description',
    title: 'Description',
    placeholder: 'My Awesome Collection Description',
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

  const maxSupplyState = useNumberInputState({
    id: 'max-supply',
    name: 'max-supply',
    title: 'Max Supply',
    subtitle: 'Maximum number of badges that can be minted',
  })

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

  const parseMetadata = async () => {
    try {
      let parsedMetadata: any
      if (metadataFile) {
        attributesState.reset()
        parsedMetadata = JSON.parse(await metadataFile.text())

        if (!parsedMetadata.attributes || parsedMetadata.attributes.length === 0) {
          attributesState.add({
            trait_type: '',
            value: '',
          })
        } else {
          for (let i = 0; i < parsedMetadata.attributes.length; i++) {
            attributesState.add({
              trait_type: parsedMetadata.attributes[i].trait_type,
              value: parsedMetadata.attributes[i].value,
            })
          }
        }
        nameState.onChange(parsedMetadata.name ? parsedMetadata.name : '')
        descriptionState.onChange(parsedMetadata.description ? parsedMetadata.description : '')
        externalUrlState.onChange(parsedMetadata.external_url ? parsedMetadata.external_url : '')
        youtubeUrlState.onChange(parsedMetadata.youtube_url ? parsedMetadata.youtube_url : '')
        animationUrlState.onChange(parsedMetadata.animation_url ? parsedMetadata.animation_url : '')
        backgroundColorState.onChange(parsedMetadata.background_color ? parsedMetadata.background_color : '')
        imageDataState.onChange(parsedMetadata.image_data ? parsedMetadata.image_data : '')
      } else {
        attributesState.reset()
        nameState.onChange('')
        descriptionState.onChange('')
        externalUrlState.onChange('')
        youtubeUrlState.onChange('')
        animationUrlState.onChange('')
        backgroundColorState.onChange('')
        imageDataState.onChange('')
      }
    } catch (error) {
      toast.error('Error parsing metadata file: Invalid JSON format.')
      if (metadataFileRef.current) metadataFileRef.current.value = ''
      setMetadataFile(undefined)
    }
  }

  const selectMetadata = (event: ChangeEvent<HTMLInputElement>) => {
    setMetadataFile(undefined)
    if (event.target.files === null) return

    let selectedFile: File
    const reader = new FileReader()
    reader.onload = (e) => {
      if (!event.target.files) return toast.error('No file selected.')
      if (!e.target?.result) return toast.error('Error parsing file.')
      selectedFile = new File([e.target.result], event.target.files[0].name, { type: 'application/json' })
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (event.target.files[0]) reader.readAsArrayBuffer(event.target.files[0])
    else return toast.error('No file selected.')
    reader.onloadend = () => {
      if (!event.target.files) return toast.error('No file selected.')
      setMetadataFile(selectedFile)
    }
  }

  useEffect(() => {
    void parseMetadata()
    if (!metadataFile)
      attributesState.add({
        trait_type: '',
        value: '',
      })
  }, [metadataFile])

  useEffect(() => {
    animationUrlState.onChange('')
  }, [uploadMethod])

  useEffect(() => {
    try {
      const data: BadgeDetailsDataProps = {
        manager: managerState.value,
        name: nameState.value || undefined,
        description: descriptionState.value || undefined,
        attributes:
          attributesState.values[0]?.trait_type && attributesState.values[0]?.value
            ? attributesState.values
                .map((attr) => ({
                  trait_type: attr.trait_type,
                  value: attr.value,
                }))
                .filter((attr) => attr.trait_type && attr.value)
            : undefined,
        expiry: timestamp ? timestamp.getTime() / 1000 : undefined,
        max_supply: maxSupplyState.value || undefined,
        transferrable,
        image_data: imageDataState.value || undefined,
        external_url: externalUrlState.value || undefined,
        background_color: backgroundColorState.value || undefined,
        animation_url: animationUrlState.value || undefined,
        youtube_url: youtubeUrlState.value || undefined,
      }
      onChange(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    managerState.value,
    nameState.value,
    descriptionState.value,
    timestamp,
    maxSupplyState.value,
    transferrable,
    imageDataState.value,
    externalUrlState.value,
    attributesState.values,
    backgroundColorState.value,
    animationUrlState.value,
    youtubeUrlState.value,
  ])

  useEffect(() => {
    const retrieveFeeRate = async () => {
      try {
        if (isWalletConnected) {
          const feeRateRaw = await (
            await getCosmWasmClient()
          ).queryContractRaw(
            BADGE_HUB_ADDRESS,
            toUtf8(Buffer.from(Buffer.from('fee_rate').toString('hex'), 'hex').toString()),
          )
          console.log('Fee Rate Raw: ', feeRateRaw)
          const feeRate = JSON.parse(new TextDecoder().decode(feeRateRaw as Uint8Array))
          setMetadataFeeRate(Number(feeRate.metadata))
        }
      } catch (error) {
        toast.error('Error retrieving metadata fee rate.')
        setMetadataFeeRate(0)
        console.log('Error retrieving fee rate: ', error)
      }
    }
    void retrieveFeeRate()
  }, [isWalletConnected, getCosmWasmClient])

  return (
    <div>
      <div className={clsx('grid grid-cols-2 ml-4 max-w-5xl')}>
        <div className={clsx('mt-2')}>
          <AddressInput {...managerState} isRequired />
          <TextInput className="mt-2" {...nameState} />
          <TextInput className="mt-2" {...descriptionState} />
          <NumberInput className="mt-2" {...maxSupplyState} />
          {uploadMethod === 'existing' ? <TextInput className="mt-2" {...animationUrlState} /> : null}
          <TextInput className="mt-2" {...externalUrlState} />

          <FormControl
            className="mt-2"
            htmlId="expiry-date"
            subtitle={`Badge minting expiry date ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
            title="Expiry Date"
          >
            <InputDateTime
              minDate={
                timezone === 'Local' ? new Date() : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
              }
              onChange={(date) =>
                setTimestamp(
                  timezone === 'Local' ? date : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
                )
              }
              value={
                timezone === 'Local'
                  ? timestamp
                  : timestamp
                  ? new Date(timestamp.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
                  : undefined
              }
            />
          </FormControl>
          <div className="grid grid-cols-2">
            <div className="mt-2 w-1/3 form-control">
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
            <Conditional test={managerState.value !== ''}>
              <Tooltip
                backgroundColor="bg-stargaze"
                className="bg-yellow-600"
                label="This is only an estimate. Be sure to check the final amount before signing the transaction."
                placement="bottom"
              >
                <div className="grid grid-cols-2 ml-12 w-full">
                  <div className="mt-4 font-bold">Fee Estimate:</div>
                  <span className="mt-4">{(metadataSize * Number(metadataFeeRate)) / 1000000} stars</span>
                </div>
              </Tooltip>
            </Conditional>
          </div>
        </div>
        <div className={clsx('ml-10')}>
          <div>
            <MetadataAttributes
              attributes={attributesState.entries}
              onAdd={attributesState.add}
              onChange={attributesState.update}
              onRemove={attributesState.remove}
              title="Traits"
            />
          </div>
          <div className="w-full">
            <Tooltip
              backgroundColor="bg-blue-500"
              label="A metadata file can be selected to automatically fill in the related fields."
              placement="bottom"
            >
              <div>
                <label
                  className="block mt-2 mr-1 mb-1 w-full font-bold text-white dark:text-gray-300"
                  htmlFor="assetFile"
                >
                  Metadata File Selection (optional)
                </label>
                <div
                  className={clsx(
                    'flex relative justify-center items-center mt-2 space-y-4 w-full h-32',
                    'rounded border-2 border-white/20 border-dashed',
                  )}
                >
                  <input
                    accept="application/json"
                    className={clsx(
                      'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
                      'before:absolute before:inset-0 before:hover:bg-white/5 before:transition',
                    )}
                    id="metadataFile"
                    onChange={selectMetadata}
                    ref={metadataFileRef}
                    type="file"
                  />
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
