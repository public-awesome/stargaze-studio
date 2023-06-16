/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import clsx from 'clsx'
import { Conditional } from 'components/Conditional'
import { useInputState } from 'components/forms/FormInput.hooks'
import { useMetadataAttributesState } from 'components/forms/MetadataAttributes.hooks'
import { useWallet } from 'contexts/wallet'
import type { Trait } from 'contracts/badgeHub'
import type { ChangeEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

import { TextInput } from '../forms/FormInput'
import { MetadataAttributes } from '../forms/MetadataAttributes'
import { Tooltip } from '../Tooltip'
import type { UploadMethod } from './ImageUploadDetails'

interface OnChainMetadataInputDetailsProps {
  onChange: (data: OnChainMetadataInputDetailsDataProps) => void
  uploadMethod: UploadMethod | undefined
}

export interface OnChainMetadataInputDetailsDataProps {
  name?: string
  description?: string
  attributes?: Trait[]
  image_data?: string
  external_url?: string
  background_color?: string
  animation_url?: string
  youtube_url?: string
}

export const OnChainMetadataInputDetails = ({ onChange, uploadMethod }: OnChainMetadataInputDetailsProps) => {
  const wallet = useWallet()
  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined)
  const [metadataFile, setMetadataFile] = useState<File>()
  const [metadataFeeRate, setMetadataFeeRate] = useState<number>(0)

  const metadataFileRef = useRef<HTMLInputElement | null>(null)

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
    subtitle: 'External URL for the token',
    placeholder: 'https://',
  })

  const attributesState = useMetadataAttributesState()

  const animationUrlState = useInputState({
    id: 'metadata-animation-url',
    name: 'metadata-animation-url',
    title: 'Animation URL',
    subtitle: 'Animation URL for the token',
    placeholder: 'https://',
  })

  const youtubeUrlState = useInputState({
    id: 'metadata-youtube-url',
    name: 'metadata-youtube-url',
    title: 'YouTube URL',
    subtitle: 'YouTube URL for the token',
    placeholder: 'https://',
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
        imageDataState.onChange(parsedMetadata.image_data ? parsedMetadata.image_data : '')
      } else {
        attributesState.reset()
        nameState.onChange('')
        descriptionState.onChange('')
        externalUrlState.onChange('')
        youtubeUrlState.onChange('')
        animationUrlState.onChange('')
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
    try {
      const data: OnChainMetadataInputDetailsDataProps = {
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
        image_data: imageDataState.value || undefined,
        external_url: externalUrlState.value || undefined,
        animation_url: animationUrlState.value.trim() || undefined,
        youtube_url: youtubeUrlState.value || undefined,
      }
      onChange(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    nameState.value,
    descriptionState.value,
    timestamp,
    imageDataState.value,
    externalUrlState.value,
    attributesState.values,
    animationUrlState.value,
    youtubeUrlState.value,
  ])

  return (
    <div className="py-3 px-8 rounded border-2 border-white/20">
      <span className="ml-4 text-xl font-bold underline underline-offset-4">NFT Metadata</span>
      <div className={clsx('grid grid-cols-2 mt-4 mb-2 ml-4 max-w-6xl')}>
        <div className={clsx('mt-6')}>
          <TextInput className="mt-2" {...nameState} />
          <TextInput className="mt-2" {...descriptionState} />
          <TextInput className="mt-2" {...externalUrlState} />
          <Conditional test={uploadMethod === 'existing'}>
            <TextInput className="mt-2" {...animationUrlState} />
          </Conditional>
          <TextInput className="mt-2" {...youtubeUrlState} />
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
