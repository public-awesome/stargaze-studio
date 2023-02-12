/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import clsx from 'clsx'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { useMetadataAttributesState } from 'components/forms/MetadataAttributes.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { useWallet } from 'contexts/wallet'
import type { Trait } from 'contracts/badgeHub'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import { AddressInput, NumberInput, TextInput } from '../../forms/FormInput'
import { MetadataAttributes } from '../../forms/MetadataAttributes'
import type { MintRule, UploadMethod } from './ImageUploadDetails'

interface BadgeDetailsProps {
  onChange: (data: BadgeDetailsDataProps) => void
  uploadMethod: UploadMethod
  mintRule: MintRule
}

export interface BadgeDetailsDataProps {
  manager: string
  name?: string
  description?: string
  attributes?: Trait[]
  expiry?: number
  transferrable?: boolean
  max_supply?: number
  image_data?: string
  external_url?: string
  background_color?: string
  animation_url?: string
  youtube_url?: string
}

export const BadgeDetails = ({ onChange, uploadMethod, mintRule }: BadgeDetailsProps) => {
  const wallet = useWallet()
  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined)
  const [transferrable, setTransferrable] = useState<boolean>(false)

  const managerState = useInputState({
    id: 'manager-address',
    name: 'manager',
    title: 'Manager',
    subtitle: 'Badge Hub Manager',
    defaultValue: wallet.address,
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
        expiry: timestamp ? timestamp.getTime() * 1000000 : undefined,
        max_supply: maxSupplyState.value || undefined,
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

  return (
    <div>
      <FormGroup subtitle="Information about your collection" title="Collection Details">
        <div className={clsx('grid grid-cols-2 -ml-16 max-w-5xl')}>
          <div className={clsx('ml-0')}>
            <AddressInput {...managerState} isRequired />
            <TextInput {...nameState} />
            <TextInput className="mt-2" {...descriptionState} />
            <NumberInput className="mt-2" {...maxSupplyState} />
            <div>
              <MetadataAttributes
                attributes={attributesState.entries}
                onAdd={attributesState.add}
                onChange={attributesState.update}
                onRemove={attributesState.remove}
                title="Traits"
              />
            </div>
          </div>
          <div className={clsx('ml-10')}>
            <TextInput {...externalUrlState} />
            <FormControl htmlId="expiry-date" subtitle="Badge minting expiry date" title="Expiry Date">
              <InputDateTime minDate={new Date()} onChange={(date) => setTimestamp(date)} value={timestamp} />
            </FormControl>
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
          </div>
        </div>
      </FormGroup>
    </div>
  )
}
