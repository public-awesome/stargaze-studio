/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable func-names */

import clsx from 'clsx'
import { Alert } from 'components/Alert'
import Anchor from 'components/Anchor'
import Button from 'components/Button'
import { Conditional } from 'components/Conditional'
import { StyledInput } from 'components/forms/StyledInput'
import { MetadataModal } from 'components/MetadataModal'
import { setBaseTokenUri, setImage, useCollectionStore } from 'contexts/collection'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import type { ChangeEvent } from 'react'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import type { UploadServiceType } from 'services/upload'
import { upload } from 'services/upload'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { naturalCompare } from 'utils/sort'

type UploadMethod = 'new' | 'existing'

const UploadPage: NextPage = () => {
  const baseTokenURI = useCollectionStore().base_token_uri
  const [imageFilesArray, setImageFilesArray] = useState<File[]>([])
  const [metadataFilesArray, setMetadataFilesArray] = useState<File[]>([])
  const [updatedMetadataFilesArray, setUpdatedMetadataFilesArray] = useState<File[]>([])
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('new')
  const [uploadService, setUploadService] = useState<UploadServiceType>('nft-storage')
  const [metadataFileArrayIndex, setMetadataFileArrayIndex] = useState(0)
  const [refreshMetadata, setRefreshMetadata] = useState(false)
  const [nftStorageApiKey, setNftStorageApiKey] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDJBODk5OGI4ZkE2YTM1NzMyYmMxQTRDQzNhOUU2M0Y2NUM3ZjA1RWIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1NTE5MTcwNDQ2MiwibmFtZSI6IlRlc3QifQ.IbdV_26bkPHSdd81sxox5AoG-5a4CCEY4aCrdbCXwAE',
  )
  const [pinataApiKey, setPinataApiKey] = useState('c8c2ea440c09ee8fa639')
  const [pinataSecretKey, setPinataSecretKey] = useState(
    '9d6f42dc01eaab15f52eac8f36cc4f0ee4184944cb3cdbcda229d06ecf877ee7',
  )
  const imageFilesRef = useRef<HTMLInputElement>(null)
  const metadataFilesRef = useRef<HTMLInputElement>(null)

  const handleChangeBaseTokenUri = (event: { target: { value: React.SetStateAction<string> } }) => {
    setBaseTokenUri(event.target.value.toString())
  }

  const handleChangeImage = (event: { target: { value: React.SetStateAction<string> } }) => {
    setImage(event.target.value.toString())
  }

  const selectImages = (event: ChangeEvent<HTMLInputElement>) => {
    setImageFilesArray([])
    console.log(event.target.files)
    let reader: FileReader
    if (event.target.files === null) return
    for (let i = 0; i < event.target.files.length; i++) {
      reader = new FileReader()
      reader.onload = function (e) {
        if (!e.target?.result) return toast.error('Error parsing file.')
        if (!event.target.files) return toast.error('No files selected.')
        const imageFile = new File([e.target.result], event.target.files[i].name, { type: 'image/jpg' })
        setImageFilesArray((prev) => [...prev, imageFile])
      }
      if (!event.target.files) return toast.error('No file selected.')
      reader.readAsArrayBuffer(event.target.files[i])
      reader.onloadend = function (e) {
        setImageFilesArray((prev) => prev.sort((a, b) => naturalCompare(a.name, b.name)))
      }
    }
  }

  const selectMetadata = (event: ChangeEvent<HTMLInputElement>) => {
    setMetadataFilesArray([])
    setUpdatedMetadataFilesArray([])
    console.log(imageFilesArray)
    console.log(event.target.files)
    let reader: FileReader
    if (event.target.files === null) return toast.error('No files selected.')
    for (let i = 0; i < event.target.files.length; i++) {
      reader = new FileReader()
      reader.onload = function (e) {
        if (!e.target?.result) return toast.error('Error parsing file.')
        if (!event.target.files) return toast.error('No files selected.')
        const metadataFile = new File([e.target.result], event.target.files[i].name, { type: 'application/json' })
        setMetadataFilesArray((prev) => [...prev, metadataFile])
      }
      if (!event.target.files) return toast.error('No file selected.')
      reader.readAsText(event.target.files[i], 'utf8')
      reader.onloadend = function (e) {
        setMetadataFilesArray((prev) => prev.sort((a, b) => naturalCompare(a.name, b.name)))
        console.log(metadataFilesArray)
      }
    }
  }
  const updateMetadata = async () => {
    const metadataFileNames = metadataFilesArray.map((file) => file.name)
    console.log(metadataFileNames)
    const imageFileNames = imageFilesArray.map((file) => file.name.substring(0, file.name.lastIndexOf('.')))
    console.log(imageFileNames)
    //compare the two arrays to make sure they are the same
    const areArraysEqual = metadataFileNames.every((val, index) => val === imageFileNames[index])
    if (!areArraysEqual) {
      return toast.error('Asset and metadata file names do not match.')
    }

    console.log(imageFilesArray)
    const imageURI = await upload(
      imageFilesArray,
      uploadService,
      'images',
      nftStorageApiKey,
      pinataApiKey,
      pinataSecretKey,
    )
    console.log(imageURI)
    setUpdatedMetadataFilesArray([])
    let reader: FileReader
    for (let i = 0; i < metadataFilesArray.length; i++) {
      reader = new FileReader()
      reader.onload = function (e) {
        const metadataJSON = JSON.parse(e.target?.result as string)
        metadataJSON.image = `ipfs://${imageURI}/${imageFilesArray[i].name}`
        const metadataFileBlob = new Blob([JSON.stringify(metadataJSON)], {
          type: 'application/json',
        })
        const updatedMetadataFile = new File([metadataFileBlob], metadataFilesArray[i].name, {
          type: 'application/json',
        })
        updatedMetadataFilesArray.push(updatedMetadataFile)
        console.log(`${updatedMetadataFile.name} => ${metadataJSON.image}`)
        if (i === metadataFilesArray.length - 1) {
          void uploadUpdatedMetadata()
        }
      }
      reader.readAsText(metadataFilesArray[i], 'utf8')
    }
  }
  const uploadUpdatedMetadata = async () => {
    setUpdatedMetadataFilesArray(updatedMetadataFilesArray)
    const result = await upload(
      updatedMetadataFilesArray,
      uploadService,
      'metadata',
      nftStorageApiKey,
      pinataApiKey,
      pinataSecretKey,
    )
    setBaseTokenUri(`ipfs://${result}`)
    console.log(`ipfs://${result}`)
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

  return (
    <div>
      <NextSeo title="Create Collection" />

      <div className="mt-5 space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Upload Assets & Metadata</h1>

        <p>
          Make sure you check our{' '}
          <Anchor className="font-bold text-plumbus hover:underline" href={links['Docs']}>
            documentation
          </Anchor>{' '}
          on how to create your collection
        </p>
      </div>

      <hr className="border-white/20" />

      <div className="justify-items-start mt-5 mb-3 ml-3 flex-column">
        <div className="mt-3 ml-4 form-check form-check-inline">
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
            Use an existing URI
          </label>
        </div>

        <div className="mt-3 ml-4 form-check form-check-inline">
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
        {baseTokenURI && (
          <Alert className="mt-5" type="info">
            <a href={baseTokenURI} rel="noreferrer" target="_blank">
              Base Token URI: {baseTokenURI}
            </a>
          </Alert>
        )}
      </div>

      <hr className="border-white/20" />

      {uploadMethod === 'existing' && (
        <div className="ml-3 flex-column">
          <p className="my-3 ml-5">
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
            <label className="block mt-3 mr-1 mb-1 ml-5 font-bold text-white dark:text-gray-300" htmlFor="baseTokenURI">
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
      )}
      {uploadMethod === 'new' && (
        <div>
          <div className="justify-items-start mt-5 mb-3 ml-3 flex-column">
            <div className="mt-3 ml-4 form-check form-check-inline">
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

            <div className="mt-3 ml-4 form-check form-check-inline">
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

          <div className="flex flex-col ml-8 w-1/2">
            <Conditional test={uploadService === 'nft-storage'}>
              <label htmlFor="nft_storage_api_key">NFT.Storage API Key</label>
              <StyledInput
                id="nft_storage_api_key"
                onChange={(e) => setNftStorageApiKey(e.target.value)}
                value={nftStorageApiKey}
              />
            </Conditional>
          </div>
          <div className="flex flex-col ml-8 w-1/2">
            <Conditional test={uploadService === 'pinata'}>
              <label htmlFor="pinata-api_key">Pinata API Key</label>
              <StyledInput
                className="flex mb-2 w-1/2"
                id="pinata_api_key"
                onChange={(e) => setPinataApiKey(e.target.value)}
                value={pinataApiKey}
              />
              <label htmlFor="pinata_secret_key">Pinata Secret Key</label>
              <StyledInput
                className="flex"
                id="pinata_secret_key"
                onChange={(e) => setPinataSecretKey(e.target.value)}
                value={pinataSecretKey}
              />
            </Conditional>
          </div>

          <div>
            <div className="grid grid-cols-2">
              <div className="w-full">
                <div>
                  <label
                    className="block mt-5 mr-1 mb-1 ml-8 w-full font-bold text-white dark:text-gray-300"
                    htmlFor="imageFiles"
                  >
                    Image File Selection
                  </label>
                  <div
                    className={clsx(
                      'flex relative justify-center items-center mx-8 mt-2 space-y-4 w-full h-32',
                      'rounded border-2 border-white/20 border-dashed',
                    )}
                  >
                    <input
                      accept="image/*"
                      className={clsx(
                        'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
                        'before:absolute before:inset-0 before:hover:bg-white/5 before:transition',
                      )}
                      id="imageFiles"
                      multiple
                      onChange={selectImages}
                      ref={imageFilesRef}
                      type="file"
                    />
                  </div>
                </div>

                {imageFilesArray.length > 0 && (
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
                        ref={metadataFilesRef}
                        type="file"
                      />
                    </div>
                  </div>
                )}
                <Conditional
                  test={
                    imageFilesArray.length > 0 &&
                    metadataFilesArray.length > 0 &&
                    imageFilesArray.length !== metadataFilesArray.length
                  }
                >
                  <Alert className="mt-4 ml-8 w-3/4" type="warning">
                    The number of assets and metadata files should match.
                  </Alert>
                </Conditional>

                <div className="mt-5 ml-8">
                  <Button
                    className="mb-8 w-[120px]"
                    isDisabled={imageFilesArray.length === 0 || imageFilesArray.length !== metadataFilesArray.length}
                    isWide
                    onClick={updateMetadata}
                    variant="solid"
                  >
                    Upload
                  </Button>
                </div>
                <MetadataModal
                  imageFile={imageFilesArray[metadataFileArrayIndex]}
                  metadataFile={metadataFilesArray[metadataFileArrayIndex]}
                  refresher={refreshMetadata}
                  updateMetadata={updateMetadataFileArray}
                  updatedMetadataFile={updatedMetadataFilesArray[metadataFileArrayIndex]}
                />
              </div>
              {imageFilesArray.length > 0 && (
                <div className="mt-2 mr-10 ml-20 w-4/5 h-96 border-2 border-dashed carousel carousel-vertical rounded-box">
                  {imageFilesArray.map((imageSource, index) => (
                    <div key={`carousel-item-${index}`} className="w-full carousel-item h-1/8">
                      <div className="grid grid-cols-4 col-auto">
                        <Conditional test={imageFilesArray.length > 4 * index}>
                          <button
                            key={4 * index}
                            className="relative p-0 w-full h-full bg-transparent hover:bg-transparent border-0 btn modal-button"
                            onClick={() => {
                              updateMetadataFileIndex(4 * index)
                            }}
                            type="button"
                          >
                            <label
                              className="relative p-0 w-full h-full bg-transparent hover:bg-transparent border-0 btn modal-button"
                              htmlFor="my-modal-4"
                            >
                              <img
                                key={`image-${4 * index}`}
                                alt="asset"
                                className="px-1 my-1 thumbnail"
                                src={imageFilesArray[4 * index] ? URL.createObjectURL(imageFilesArray[4 * index]) : ''}
                              />
                            </label>
                          </button>
                        </Conditional>
                        <Conditional test={imageFilesArray.length > 4 * index + 1}>
                          <button
                            key={4 * index + 1}
                            className="relative p-0 w-full h-full bg-transparent hover:bg-transparent border-0 btn modal-button"
                            onClick={() => {
                              updateMetadataFileIndex(4 * index + 1)
                            }}
                            type="button"
                          >
                            <label
                              className="relative p-0 w-full h-full bg-transparent hover:bg-transparent border-0 btn modal-button"
                              htmlFor="my-modal-4"
                            >
                              <img
                                key={`image-${4 * index + 1}`}
                                alt="asset"
                                className="px-1 my-1 thumbnail"
                                src={
                                  imageFilesArray[4 * index + 1]
                                    ? URL.createObjectURL(imageFilesArray[4 * index + 1])
                                    : ''
                                }
                              />
                            </label>
                          </button>
                        </Conditional>
                        <Conditional test={imageFilesArray.length > 4 * index + 2}>
                          <button
                            key={4 * index + 2}
                            className="relative p-0 w-full h-full bg-transparent hover:bg-transparent border-0 btn modal-button"
                            onClick={() => {
                              updateMetadataFileIndex(4 * index + 2)
                            }}
                            type="button"
                          >
                            <label
                              className="relative p-0 w-full h-full bg-transparent hover:bg-transparent border-0 btn modal-button"
                              htmlFor="my-modal-4"
                            >
                              <img
                                key={`image-${4 * index + 2}`}
                                alt="asset"
                                className="px-1 my-1 thumbnail"
                                src={
                                  imageFilesArray[4 * index + 2]
                                    ? URL.createObjectURL(imageFilesArray[4 * index + 2])
                                    : ''
                                }
                              />
                            </label>
                          </button>
                        </Conditional>
                        <Conditional test={imageFilesArray.length > 4 * index + 3}>
                          <button
                            key={4 * index + 3}
                            className="relative p-0 w-full h-full bg-transparent hover:bg-transparent border-0 btn modal-button"
                            onClick={() => {
                              updateMetadataFileIndex(4 * index + 3)
                            }}
                            type="button"
                          >
                            <label
                              className="relative p-0 w-full h-full bg-transparent hover:bg-transparent border-0 btn modal-button"
                              htmlFor="my-modal-4"
                            >
                              <img
                                key={`image-${4 * index + 3}`}
                                alt={' '}
                                className="px-1 my-1 thumbnail"
                                src={
                                  imageFilesArray[4 * index + 3]
                                    ? URL.createObjectURL(imageFilesArray[4 * index + 3])
                                    : ''
                                }
                              />
                            </label>
                          </button>
                        </Conditional>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default withMetadata(UploadPage, { center: false })
