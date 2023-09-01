/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import clsx from 'clsx'
import { Conditional } from 'components/Conditional'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { useInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { Tooltip } from 'components/Tooltip'
import { useGlobalSettings } from 'contexts/globalSettings'
import { addLogItem } from 'contexts/log'
import type { ChangeEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { SG721_UPDATABLE_CODE_ID } from 'utils/constants'
import { uid } from 'utils/random'

import { TextInput } from '../../forms/FormInput'
import type { MinterType } from '../actions/Combobox'
import type { UploadMethod } from './UploadDetails'

interface CollectionDetailsProps {
  onChange: (data: CollectionDetailsDataProps) => void
  uploadMethod: UploadMethod
  coverImageUrl: string
  minterType: MinterType
  importedCollectionDetails?: CollectionDetailsDataProps
}

export interface CollectionDetailsDataProps {
  name: string
  description: string
  symbol: string
  imageFile: File[]
  externalLink?: string
  startTradingTime?: string
  explicit: boolean
  updatable: boolean
}

export const CollectionDetails = ({
  onChange,
  uploadMethod,
  coverImageUrl,
  minterType,
  importedCollectionDetails,
}: CollectionDetailsProps) => {
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [timestamp, setTimestamp] = useState<Date | undefined>()
  const [explicit, setExplicit] = useState<boolean>(false)
  const [updatable, setUpdatable] = useState<boolean>(false)
  const { timezone } = useGlobalSettings()

  const initialRender = useRef(true)

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

  const symbolState = useInputState({
    id: 'symbol',
    name: 'symbol',
    title: 'Symbol',
    placeholder: 'SYMBOL',
  })

  const externalLinkState = useInputState({
    id: 'external-link',
    name: 'externalLink',
    title: 'External Link (optional)',
    placeholder: 'https://my-collection...',
  })

  useEffect(() => {
    try {
      const data: CollectionDetailsDataProps = {
        name: nameState.value,
        description: descriptionState.value,
        symbol: symbolState.value,
        imageFile: coverImage ? [coverImage] : [],
        externalLink: externalLinkState.value || undefined,
        startTradingTime: timestamp ? (timestamp.getTime() * 1_000_000).toString() : '',
        explicit,
        updatable,
      }
      onChange(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    nameState.value,
    descriptionState.value,
    symbolState.value,
    externalLinkState.value,
    coverImage,
    timestamp,
    explicit,
    updatable,
  ])

  useEffect(() => {
    if (importedCollectionDetails) {
      nameState.onChange(importedCollectionDetails.name)
      descriptionState.onChange(importedCollectionDetails.description)
      symbolState.onChange(importedCollectionDetails.symbol)
      externalLinkState.onChange(importedCollectionDetails.externalLink || '')
      setTimestamp(
        importedCollectionDetails.startTradingTime
          ? new Date(parseInt(importedCollectionDetails.startTradingTime) / 1_000_000)
          : undefined,
      )
      setExplicit(importedCollectionDetails.explicit)
      setUpdatable(importedCollectionDetails.updatable)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedCollectionDetails])

  const selectCoverImage = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) return toast.error('Error selecting cover image')
    if (event.target.files.length === 0) {
      setCoverImage(null)
      return toast.error('No files selected.')
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      if (!e.target?.result) return toast.error('Error parsing file.')
      if (!event.target.files) return toast.error('No files selected.')
      const imageFile = new File([e.target.result], event.target.files[0].name, { type: 'image/jpg' })
      setCoverImage(imageFile)
    }
    reader.readAsArrayBuffer(event.target.files[0])
  }

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
    } else if (updatable) {
      toast.success('Token metadata will be updatable upon collection creation.', {
        style: { maxWidth: 'none' },
        icon: '✅📝',
      })
    } else {
      toast.error('Token metadata will not be updatable upon collection creation.', {
        style: { maxWidth: 'none' },
        icon: '⛔🔏',
      })
    }
  }, [updatable])

  return (
    <div>
      <FormGroup subtitle="Information about your collection" title="Collection Details">
        <div className={clsx(minterType === 'base' ? 'grid grid-cols-2 -ml-16 max-w-5xl' : '')}>
          <div className={clsx(minterType === 'base' ? 'ml-0' : '')}>
            <TextInput {...nameState} isRequired />
            <TextInput className="mt-2" {...descriptionState} isRequired />
            <TextInput className="mt-2" {...symbolState} isRequired />
          </div>
          <div className={clsx(minterType === 'base' ? 'ml-10' : '')}>
            <TextInput className={clsx(minterType === 'base' ? 'mt-0' : 'mt-2')} {...externalLinkState} />
            {/* Currently trading starts immediately for 1/1 Collections */}
            <Conditional test={minterType !== 'base'}>
              <FormControl
                className={clsx(minterType === 'base' ? 'mt-10' : 'mt-2')}
                htmlId="timestamp"
                subtitle="Trading start time offset will be set as 2 weeks by default."
                title={`Trading Start Time (optional | ${timezone === 'Local' ? 'local)' : 'UTC)'}`}
              >
                <InputDateTime
                  minDate={
                    timezone === 'Local'
                      ? new Date()
                      : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
                  }
                  onChange={(date) =>
                    setTimestamp(
                      timezone === 'Local'
                        ? date
                        : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
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
            </Conditional>
            <Conditional test={minterType === 'base'}>
              <div
                className={clsx(minterType === 'base' ? 'flex flex-col -ml-6 space-y-2' : 'flex flex-col space-y-2')}
              >
                <div>
                  <div className="flex mt-9 ml-6">
                    <span className="mt-1 ml-[2px] text-sm first-letter:capitalize">
                      Does the collection contain explicit content?
                    </span>
                    <div className="ml-2 font-bold form-check form-check-inline">
                      <input
                        checked={explicit}
                        className="peer sr-only"
                        id="explicitRadio1"
                        name="explicitRadioOptions1"
                        onClick={() => {
                          setExplicit(true)
                        }}
                        type="radio"
                      />
                      <label
                        className="inline-block py-1 px-2 text-sm text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                        htmlFor="explicitRadio1"
                      >
                        YES
                      </label>
                    </div>
                    <div className="ml-2 font-bold form-check form-check-inline">
                      <input
                        checked={!explicit}
                        className="peer sr-only"
                        id="explicitRadio2"
                        name="explicitRadioOptions2"
                        onClick={() => {
                          setExplicit(false)
                        }}
                        type="radio"
                      />
                      <label
                        className="inline-block py-1 px-2 text-sm text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                        htmlFor="explicitRadio2"
                      >
                        NO
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <Conditional test={SG721_UPDATABLE_CODE_ID > 0}>
                <Tooltip
                  backgroundColor="bg-blue-500"
                  label={
                    <div className="grid grid-flow-row">
                      <span>
                        ℹ️ When enabled, the metadata for tokens can be updated after the collection is created until
                        the collection is frozen by the creator.
                      </span>
                    </div>
                  }
                  placement="bottom"
                >
                  <div className={clsx('flex flex-col mt-11 space-y-2 w-full form-control')}>
                    <label className="justify-start cursor-pointer label">
                      <span className="mr-4 font-bold">Updatable Token Metadata</span>
                      <input
                        checked={updatable}
                        className={`toggle ${updatable ? `bg-stargaze` : `bg-gray-600`}`}
                        onClick={() => setUpdatable(!updatable)}
                        type="checkbox"
                      />
                    </label>
                  </div>
                </Tooltip>
              </Conditional>
            </Conditional>
          </div>
        </div>

        <FormControl
          className={clsx(minterType === 'base' ? '-ml-16' : '')}
          isRequired={uploadMethod === 'new'}
          title="Cover Image"
        >
          {uploadMethod === 'new' && (
            <input
              accept="image/*"
              className={clsx(
                minterType === 'base' ? 'w-1/2' : 'w-full',
                'p-[13px] rounded border-2 border-white/20 border-dashed cursor-pointer h-18',
                'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
                'before:hover:bg-white/5 before:transition',
              )}
              id="cover-image"
              onChange={selectCoverImage}
              type="file"
            />
          )}

          {coverImage !== null && uploadMethod === 'new' && (
            <div className="max-w-[200px] max-h-[200px] rounded border-2">
              <img alt="no-preview-available" src={URL.createObjectURL(coverImage)} />
            </div>
          )}
          {uploadMethod === 'existing' && coverImageUrl?.includes('ipfs://') && (
            <div className="max-w-[200px] max-h-[200px] rounded border-2">
              <img
                alt="no-preview-available"
                src={`https://ipfs-gw.stargaze-apis.com/ipfs/${coverImageUrl.substring(
                  coverImageUrl.lastIndexOf('ipfs://') + 7,
                )}`}
              />
            </div>
          )}
          {uploadMethod === 'existing' && coverImageUrl && !coverImageUrl?.includes('ipfs://') && (
            <div className="max-w-[200px] max-h-[200px] rounded border-2">
              <img alt="no-preview-available" src={coverImageUrl} />
            </div>
          )}
          {uploadMethod === 'existing' && !coverImageUrl && (
            <span className="italic font-light ">Waiting for cover image URL to be specified.</span>
          )}
        </FormControl>
        <Conditional test={minterType !== 'base'}>
          <div className={clsx(minterType === 'base' ? 'flex flex-col -ml-6 space-y-2' : 'flex flex-col space-y-2')}>
            <div>
              <div className="flex mt-4">
                <span className="mt-1 ml-[2px] text-sm first-letter:capitalize">
                  Does the collection contain explicit content?
                </span>
                <div className="ml-2 font-bold form-check form-check-inline">
                  <input
                    checked={explicit}
                    className="peer sr-only"
                    id="explicitRadio1"
                    name="explicitRadioOptions1"
                    onClick={() => {
                      setExplicit(true)
                    }}
                    type="radio"
                  />
                  <label
                    className="inline-block py-1 px-2 text-sm text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                    htmlFor="explicitRadio1"
                  >
                    YES
                  </label>
                </div>
                <div className="ml-2 font-bold form-check form-check-inline">
                  <input
                    checked={!explicit}
                    className="peer sr-only"
                    id="explicitRadio2"
                    name="explicitRadioOptions2"
                    onClick={() => {
                      setExplicit(false)
                    }}
                    type="radio"
                  />
                  <label
                    className="inline-block py-1 px-2 text-sm text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                    htmlFor="explicitRadio2"
                  >
                    NO
                  </label>
                </div>
              </div>
            </div>
          </div>
          <Conditional test={SG721_UPDATABLE_CODE_ID > 0}>
            <Tooltip
              backgroundColor="bg-blue-500"
              label={
                <div className="grid grid-flow-row">
                  <span>
                    ℹ️ When enabled, the metadata for tokens can be updated after the collection is created until the
                    collection is frozen by the creator.
                  </span>
                </div>
              }
              placement="bottom"
            >
              <div
                className={clsx(
                  minterType === 'base'
                    ? 'flex flex-col -ml-16 space-y-2 w-1/2 form-control'
                    : 'flex flex-col space-y-2 w-3/4 form-control',
                )}
              >
                <label className="justify-start cursor-pointer label">
                  <span className="mr-4 font-bold">Updatable Token Metadata</span>
                  <input
                    checked={updatable}
                    className={`toggle ${updatable ? `bg-stargaze` : `bg-gray-600`}`}
                    onClick={() => setUpdatable(!updatable)}
                    type="checkbox"
                  />
                </label>
              </div>
            </Tooltip>
          </Conditional>
        </Conditional>
      </FormGroup>
    </div>
  )
}
