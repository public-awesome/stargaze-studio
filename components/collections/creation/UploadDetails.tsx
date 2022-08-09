import clsx from 'clsx'
import { Alert } from 'components/Alert'
import Anchor from 'components/Anchor'
import { Conditional } from 'components/Conditional'
import { TextInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { MetadataModal } from 'components/MetadataModal'
import { setBaseTokenUri, setImage, useCollectionStore } from 'contexts/collection'
import type { ChangeEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import type { UploadServiceType } from 'services/upload'
import { getAssetType } from 'utils/getAssetType'
import { naturalCompare } from 'utils/sort'

type UploadMethod = 'new' | 'existing'

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
}

export const UploadDetails = ({ onChange }: UploadDetailsProps) => {
  const baseTokenURI = useCollectionStore().base_token_uri
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

  const handleChangeBaseTokenUri = (event: { target: { value: React.SetStateAction<string> } }) => {
    setBaseTokenUri(event.target.value.toString())
  }

  const handleChangeImage = (event: { target: { value: React.SetStateAction<string> } }) => {
    setImage(event.target.value.toString())
  }

  const selectAssets = (event: ChangeEvent<HTMLInputElement>) => {
    setAssetFilesArray([])
    setMetadataFilesArray([])
    console.log(event.target.files)
    let reader: FileReader
    if (event.target.files === null) return
    for (let i = 0; i < event.target.files.length; i++) {
      reader = new FileReader()
      reader.onload = (e) => {
        if (!e.target?.result) return toast.error('Error parsing file.')
        if (!event.target.files) return toast.error('No files selected.')
        const assetFile = new File([e.target.result], event.target.files[i].name, { type: 'image/jpg' })
        setAssetFilesArray((prev) => [...prev, assetFile])
      }
      if (!event.target.files) return toast.error('No file selected.')
      reader.readAsArrayBuffer(event.target.files[i])
      reader.onloadend = (e) => {
        setAssetFilesArray((prev) => prev.sort((a, b) => naturalCompare(a.name, b.name)))
      }
    }
  }

  const selectMetadata = (event: ChangeEvent<HTMLInputElement>) => {
    setMetadataFilesArray([])
    console.log(assetFilesArray)
    console.log(event.target.files)
    let reader: FileReader
    if (event.target.files === null) return toast.error('No files selected.')
    for (let i = 0; i < event.target.files.length; i++) {
      reader = new FileReader()
      reader.onload = async (e) => {
        if (!e.target?.result) return toast.error('Error parsing file.')
        if (!event.target.files) return toast.error('No files selected.')
        if (!JSON.parse(await event.target.files[i].text()).attributes)
          return toast.error(`The file with name '${event.target.files[i].name}' doesn't have an attributes list!`)
        const metadataFile = new File([e.target.result], event.target.files[i].name, { type: 'application/json' })
        setMetadataFilesArray((prev) => [...prev, metadataFile])
      }
      if (!event.target.files) return toast.error('No file selected.')
      reader.readAsText(event.target.files[i], 'utf8')
      reader.onloadend = (e) => {
        setMetadataFilesArray((prev) => prev.sort((a, b) => naturalCompare(a.name, b.name)))
        console.log(metadataFilesArray)
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

  const checkAssetMetadataMatch = () => {
    const metadataFileNames = metadataFilesArray.map((file) => file.name)
    const assetFileNames = assetFilesArray.map((file) => file.name.substring(0, file.name.lastIndexOf('.')))
    // Compare the two arrays to make sure they are the same
    const areArraysEqual = metadataFileNames.every((val, index) => val === assetFileNames[index])
    if (!areArraysEqual) {
      throw new Error('Asset and metadata file names do not match.')
    }
  }

  const videoPreviewElements = useMemo(() => {
    const tempArray: JSX.Element[] = []
    assetFilesArray.forEach((assetFile) => {
      if (getAssetType(assetFile.name) === 'video') {
        tempArray.push(
          <video
            key={assetFile.name}
            className="absolute px-1 my-1 thumbnail"
            id="video"
            muted
            onMouseEnter={(e) => {
              void e.currentTarget.play()
            }}
            onMouseLeave={(e) => {
              e.currentTarget.pause()
              e.currentTarget.currentTime = 0
            }}
            src={URL.createObjectURL(assetFile)}
          />,
        )
      }
    })
    return tempArray
  }, [assetFilesArray])

  useEffect(() => {
    try {
      checkAssetMetadataMatch()
      const data: UploadDetailsDataProps = {
        assetFiles: assetFilesArray,
        metadataFiles: metadataFilesArray,
        uploadService,
        nftStorageApiKey: nftStorageApiKeyState.value,
        pinataApiKey: pinataApiKeyState.value,
        pinataSecretKey: pinataSecretKeyState.value,
      }
      onChange(data)
    } catch (error: any) {
      toast.error(error.message)
    }
  }, [assetFilesArray, metadataFilesArray])

  useEffect(() => {
    setAssetFilesArray([])
    setMetadataFilesArray([])
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

      {baseTokenURI && (
        <Alert className="mt-5" type="info">
          <a href={baseTokenURI} rel="noreferrer" target="_blank">
            Base Token URI: {baseTokenURI}
          </a>
        </Alert>
      )}

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
              <label className="block mr-1 mb-1 ml-5 font-bold text-white dark:text-gray-300" htmlFor="coverImage">
                Collection Cover Image
              </label>
              <input
                className="py-2 px-1 mx-5 mt-2 mb-2 w-1/2 bg-white/10 rounded border-2 border-white/20 focus:ring
          focus:ring-plumbus-20
          form-input, placeholder:text-white/50,"
                id="coverImage"
                onChange={handleChangeImage}
                placeholder="ipfs://bafybeigi3bwpvyvsmnbj46ra4hyffcxdeaj6ntfk5jpic5mx27x6ih2qvq/images/1.png"
              />
            </div>
            <div>
              <label
                className="block mt-3 mr-1 mb-1 ml-5 font-bold text-white dark:text-gray-300"
                htmlFor="baseTokenURI"
              >
                Base Token URI
              </label>
              <input
                className="py-2 px-1 mx-5 mt-2 mb-2 w-1/2 bg-white/10 rounded border-2 border-white/20 focus:ring
          focus:ring-plumbus-20
          form-input, placeholder:text-white/50,"
                id="baseTokenURI"
                onChange={handleChangeBaseTokenUri}
                placeholder="ipfs://..."
              />
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
                          accept=""
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
                  <div className="overflow-auto mt-2 mr-10 ml-20 w-4/5 h-96">
                    {assetFilesArray.map((assetSource, index) => (
                      <button
                        key={assetSource.name}
                        className="relative p-0 w-[100px] h-[100px] bg-transparent hover:bg-transparent border-0 btn modal-button"
                        onClick={() => {
                          updateMetadataFileIndex(index)
                        }}
                        type="button"
                      >
                        <label
                          className="relative p-0 w-full h-full bg-transparent hover:bg-transparent border-0 btn modal-button"
                          htmlFor="my-modal-4"
                        >
                          {getAssetType(assetSource.name) === 'audio' && (
                            <div className="flex absolute flex-col items-center mt-4 ml-2">
                              <img
                                key={`audio-${index}`}
                                alt="audio_icon"
                                className="mb-2 ml-1 w-6 h-6 thumbnail"
                                src="/audio.png"
                              />
                              <span className="flex self-center ">{assetSource.name}</span>
                            </div>
                          )}
                          {getAssetType(assetSource.name) === 'video' &&
                            videoPreviewElements.filter(
                              (videoPreviewElement) => videoPreviewElement.key === assetSource.name,
                            )}

                          {getAssetType(assetSource.name) === 'image' && (
                            <img
                              key={`image-${index}`}
                              alt="asset"
                              className="px-1 my-1 thumbnail"
                              src={URL.createObjectURL(assetSource)}
                            />
                          )}
                        </label>
                      </button>
                    ))}
                  </div>
                </Conditional>
              </div>
            </div>
          </div>
        </Conditional>
      </div>
    </div>
  )
}
