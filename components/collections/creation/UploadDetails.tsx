import clsx from 'clsx'
import { Alert } from 'components/Alert'
import { Anchor } from 'components/Anchor'
import { AssetsPreview } from 'components/AssetsPreview'
import { Conditional } from 'components/Conditional'
import { TextInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { MetadataModal } from 'components/MetadataModal'
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import type { UploadServiceType } from 'services/upload'
import { naturalCompare } from 'utils/sort'

export type UploadMethod = 'new' | 'existing'

interface UploadDetailsProps {
  onChange: (value: UploadDetailsDataProps) => void
}

export interface UploadDetailsDataProps {
  assetFiles: File[]
  metadataFiles: File[]
  uploadService: UploadServiceType
  nftStorageApiKey?: string
  pinataApiKey?: string
  pinataSecretKey?: string
  uploadMethod: UploadMethod
  baseTokenURI?: string
  imageUrl?: string
}

export const UploadDetails = ({ onChange }: UploadDetailsProps) => {
  const [assetFilesArray, setAssetFilesArray] = useState<File[]>([])
  const [metadataFilesArray, setMetadataFilesArray] = useState<File[]>([])
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('new')
  const [uploadService, setUploadService] = useState<UploadServiceType>('nft-storage')
  const [metadataFileArrayIndex, setMetadataFileArrayIndex] = useState(0)
  const [refreshMetadata, setRefreshMetadata] = useState(false)

  const nftStorageApiKeyState = useInputState({
    id: 'nft-storage-api-key',
    name: 'nftStorageApiKey',
    title: 'NFT Storage API Key',
    placeholder: '...',
    defaultValue:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDJBODk5OGI4ZkE2YTM1NzMyYmMxQTRDQzNhOUU2M0Y2NUM3ZjA1RWIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1NTE5MTcwNDQ2MiwibmFtZSI6IlRlc3QifQ.IbdV_26bkPHSdd81sxox5AoG-5a4CCEY4aCrdbCXwAE',
  })
  const pinataApiKeyState = useInputState({
    id: 'pinata-api-key',
    name: 'pinataApiKey',
    title: 'Pinata API Key',
    placeholder: '...',
    defaultValue: 'c8c2ea440c09ee8fa639',
  })
  const pinataSecretKeyState = useInputState({
    id: 'pinata-secret-key',
    name: 'pinataSecretKey',
    title: 'Pinata Secret Key',
    placeholder: '...',
    defaultValue: '9d6f42dc01eaab15f52eac8f36cc4f0ee4184944cb3cdbcda229d06ecf877ee7',
  })

  const baseTokenUriState = useInputState({
    id: 'baseTokenUri',
    name: 'baseTokenUri',
    title: 'Base Token URI',
    placeholder: 'ipfs://',
    defaultValue: '',
  })

  const coverImageUrlState = useInputState({
    id: 'coverImageUrl',
    name: 'coverImageUrl',
    title: 'Cover Image URL',
    placeholder: 'ipfs://',
    defaultValue: '',
  })

  const selectAssets = (event: ChangeEvent<HTMLInputElement>) => {
    const files: File[] = []
    let reader: FileReader
    if (event.target.files === null) return
    setAssetFilesArray([])
    setMetadataFilesArray([])
    for (let i = 0; i < event.target.files.length; i++) {
      reader = new FileReader()
      reader.onload = (e) => {
        if (!e.target?.result) return toast.error('Error parsing file.')
        if (!event.target.files) return toast.error('No files selected.')
        const assetFile = new File([e.target.result], event.target.files[i].name, { type: 'image/jpg' })
        files.push(assetFile)
      }
      reader.readAsArrayBuffer(event.target.files[i])
      reader.onloadend = (e) => {
        if (!event.target.files) return toast.error('No file selected.')
        if (i === event.target.files.length - 1) {
          setAssetFilesArray(files.sort((a, b) => naturalCompare(a.name, b.name)))
        }
      }
    }
  }

  const selectMetadata = (event: ChangeEvent<HTMLInputElement>) => {
    const files: File[] = []
    let reader: FileReader
    if (event.target.files === null) return toast.error('No files selected.')
    setMetadataFilesArray([])
    for (let i = 0; i < event.target.files.length; i++) {
      reader = new FileReader()
      reader.onload = (e) => {
        if (!e.target?.result) return toast.error('Error parsing file.')
        if (!event.target.files) return toast.error('No files selected.')
        const metadataFile = new File([e.target.result], event.target.files[i].name, { type: 'application/json' })
        files.push(metadataFile)
      }
      reader.readAsText(event.target.files[i], 'utf8')
      reader.onloadend = (e) => {
        if (!event.target.files) return toast.error('No file selected.')
        if (i === event.target.files.length - 1) {
          setMetadataFilesArray(files.sort((a, b) => naturalCompare(a.name, b.name)))
        }
      }
    }
  }

  const updateMetadataFileIndex = (index: number) => {
    setMetadataFileArrayIndex(index)
    setRefreshMetadata((prev) => !prev)
  }

  const updateMetadataFileArray = async (updatedMetadataFile: File) => {
    metadataFilesArray[metadataFileArrayIndex] = updatedMetadataFile
    console.log('Updated Metadata File:')
    console.log(JSON.parse(await metadataFilesArray[metadataFileArrayIndex]?.text()))
  }

  useEffect(() => {
    try {
      const data: UploadDetailsDataProps = {
        assetFiles: assetFilesArray,
        metadataFiles: metadataFilesArray,
        uploadService,
        nftStorageApiKey: nftStorageApiKeyState.value,
        pinataApiKey: pinataApiKeyState.value,
        pinataSecretKey: pinataSecretKeyState.value,
        uploadMethod,
        baseTokenURI: baseTokenUriState.value,
        imageUrl: coverImageUrlState.value,
      }
      onChange(data)
    } catch (error: any) {
      toast.error(error.message)
    }
  }, [
    assetFilesArray,
    metadataFilesArray,
    uploadService,
    nftStorageApiKeyState.value,
    pinataApiKeyState.value,
    pinataSecretKeyState.value,
    uploadMethod,
    baseTokenUriState.value,
    coverImageUrlState.value,
  ])

  useEffect(() => {
    setAssetFilesArray([])
    setMetadataFilesArray([])
    baseTokenUriState.onChange('')
    coverImageUrlState.onChange('')
  }, [uploadMethod])

  return (
    <div className="justify-items-start mt-5 mb-3 rounded border border-2 border-white/20 flex-column">
      <div className="flex justify-center">
        <div className="mt-3 ml-4 font-bold form-check form-check-inline">
          <input
            checked={uploadMethod === 'existing'}
            className="float-none mr-2 mb-1 w-4 h-4 align-middle bg-white checked:bg-stargaze bg-center bg-no-repeat bg-contain rounded-full border border-gray-300 checked:border-white focus:outline-none transition duration-200 appearance-none cursor-pointer form-check-input"
            id="inlineRadio1"
            name="inlineRadioOptions1"
            onClick={() => {
              setUploadMethod('existing')
            }}
            type="radio"
            value="Existing"
          />
          <label className="inline-block text-white cursor-pointer form-check-label" htmlFor="inlineRadio1">
            Use an existing base URI
          </label>
        </div>

        <div className="mt-3 ml-4 font-bold form-check form-check-inline">
          <input
            checked={uploadMethod === 'new'}
            className="float-none mr-2 mb-1 w-4 h-4 align-middle bg-white checked:bg-stargaze bg-center bg-no-repeat bg-contain rounded-full border border-gray-300 checked:border-white focus:outline-none transition duration-200 appearance-none cursor-pointer form-check-input"
            id="inlineRadio2"
            name="inlineRadioOptions2"
            onClick={() => {
              setUploadMethod('new')
            }}
            type="radio"
            value="New"
          />
          <label className="inline-block text-white cursor-pointer form-check-label" htmlFor="inlineRadio2">
            Upload assets & metadata
          </label>
        </div>
      </div>

      <div className="p-3 py-5 pb-8">
        <Conditional test={uploadMethod === 'existing'}>
          <div className="ml-3 flex-column">
            <p className="mb-5 ml-5">
              Though Stargaze&apos;s sg721 contract allows for off-chain metadata storage, it is recommended to use a
              decentralized storage solution, such as IPFS. <br /> You may head over to{' '}
              <Anchor className="font-bold text-plumbus hover:underline" href="https://nft.storage">
                NFT Storage
              </Anchor>{' '}
              or{' '}
              <Anchor className="font-bold text-plumbus hover:underline" href="https://www.pinata.cloud/">
                Pinata
              </Anchor>{' '}
              and upload your assets & metadata manually to get a base URI for your collection.
            </p>
            <div>
              <TextInput {...baseTokenUriState} className="w-1/2" />
            </div>
            <div>
              <TextInput {...coverImageUrlState} className="mt-2 w-1/2" />
            </div>
          </div>
        </Conditional>
        <Conditional test={uploadMethod === 'new'}>
          <div>
            <div className="flex flex-col items-center px-8 w-full">
              <div className="flex justify-items-start mb-5 w-full font-bold">
                <div className="form-check form-check-inline">
                  <input
                    checked={uploadService === 'nft-storage'}
                    className="float-none mr-2 mb-1 w-4 h-4 align-middle bg-white checked:bg-stargaze bg-center bg-no-repeat bg-contain rounded-full border border-gray-300 checked:border-white focus:outline-none transition duration-200 appearance-none cursor-pointer form-check-input"
                    id="inlineRadio3"
                    name="inlineRadioOptions3"
                    onClick={() => {
                      setUploadService('nft-storage')
                    }}
                    type="radio"
                    value="nft-storage"
                  />
                  <label className="inline-block text-white cursor-pointer form-check-label" htmlFor="inlineRadio3">
                    Upload using NFT.Storage
                  </label>
                </div>

                <div className="ml-4 form-check form-check-inline">
                  <input
                    checked={uploadService === 'pinata'}
                    className="float-none mr-2 mb-1 w-4 h-4 align-middle bg-white checked:bg-stargaze bg-center bg-no-repeat bg-contain rounded-full border border-gray-300 checked:border-white focus:outline-none transition duration-200 appearance-none cursor-pointer form-check-input"
                    id="inlineRadio4"
                    name="inlineRadioOptions4"
                    onClick={() => {
                      setUploadService('pinata')
                    }}
                    type="radio"
                    value="pinata"
                  />
                  <label className="inline-block text-white cursor-pointer form-check-label" htmlFor="inlineRadio4">
                    Upload using Pinata
                  </label>
                </div>
              </div>

              <div className="flex w-full">
                <Conditional test={uploadService === 'nft-storage'}>
                  <TextInput {...nftStorageApiKeyState} className="w-full" />
                </Conditional>
                <Conditional test={uploadService === 'pinata'}>
                  <TextInput {...pinataApiKeyState} className="w-full" />
                  <div className="w-[20px]" />
                  <TextInput {...pinataSecretKeyState} className="w-full" />
                </Conditional>
              </div>
            </div>

            <div className="mt-6">
              <div className="grid grid-cols-2">
                <div className="w-full">
                  <Conditional
                    test={
                      assetFilesArray.length > 0 &&
                      metadataFilesArray.length > 0 &&
                      assetFilesArray.length !== metadataFilesArray.length
                    }
                  >
                    <Alert className="mt-4 ml-8 w-3/4" type="warning">
                      The number of assets and metadata files should match.
                    </Alert>
                  </Conditional>

                  <div>
                    <label
                      className="block mt-5 mr-1 mb-1 ml-8 w-full font-bold text-white dark:text-gray-300"
                      htmlFor="assetFiles"
                    >
                      Asset Selection
                    </label>
                    <div
                      className={clsx(
                        'flex relative justify-center items-center mx-8 mt-2 space-y-4 w-full h-32',
                        'rounded border-2 border-white/20 border-dashed',
                      )}
                    >
                      <input
                        accept="image/*, audio/*, video/*"
                        className={clsx(
                          'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
                          'before:absolute before:inset-0 before:hover:bg-white/5 before:transition',
                        )}
                        id="assetFiles"
                        multiple
                        onChange={selectAssets}
                        type="file"
                      />
                    </div>
                  </div>

                  {assetFilesArray.length > 0 && (
                    <div>
                      <label
                        className="block mt-5 mr-1 mb-1 ml-8 w-full font-bold text-white dark:text-gray-300"
                        htmlFor="metadataFiles"
                      >
                        Metadata Selection
                      </label>
                      <div
                        className={clsx(
                          'flex relative justify-center items-center mx-8 mt-2 space-y-4 w-full h-32',
                          'rounded border-2 border-white/20 border-dashed',
                        )}
                      >
                        <input
                          accept="application/json"
                          className={clsx(
                            'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
                            'before:absolute before:inset-0 before:hover:bg-white/5 before:transition',
                          )}
                          id="metadataFiles"
                          multiple
                          onChange={selectMetadata}
                          type="file"
                        />
                      </div>
                    </div>
                  )}

                  <MetadataModal
                    assetFile={assetFilesArray[metadataFileArrayIndex]}
                    metadataFile={metadataFilesArray[metadataFileArrayIndex]}
                    refresher={refreshMetadata}
                    updateMetadata={updateMetadataFileArray}
                  />
                </div>

                <Conditional test={assetFilesArray.length > 0}>
                  <AssetsPreview assetFilesArray={assetFilesArray} updateMetadataFileIndex={updateMetadataFileIndex} />
                </Conditional>
              </div>
            </div>
          </div>
        </Conditional>
      </div>
    </div>
  )
}
