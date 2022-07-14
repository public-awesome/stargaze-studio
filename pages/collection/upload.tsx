import clsx from 'clsx'
import Anchor from 'components/Anchor'
import AnchorButton from 'components/AnchorButton'
import Button from 'components/Button'
import { useCollectionStore } from 'contexts/collection'
import { setBaseTokenUri, setImage } from 'contexts/collection'
import { useWallet } from 'contexts/wallet'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { Blob, File, NFTStorage } from 'nft.storage'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { naturalCompare } from 'utils/sort'

const UploadPage: NextPage = () => {
  const wallet = useWallet()

  const baseTokenURI = useCollectionStore().base_token_uri
  const [baseImageURI, setBaseImageURI] = useState('')
  const [uploadMethod, setUploadMethod] = useState('New')

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [metadataFiles, setMetadataFiles] = useState<File[]>([])
  const [updatedMetadataFiles, setUpdatedMetadataFiles] = useState<File[]>([])
  let imageFilesArray: File[] = []
  let metadataFilesArray: File[] = []
  let updatedMetadataFilesArray: File[] = []

  const imageFilesRef = useRef<HTMLInputElement>(null)
  const metadataFilesRef = useRef<HTMLInputElement>(null)

  const NFT_STORAGE_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDJBODk5OGI4ZkE2YTM1NzMyYmMxQTRDQzNhOUU2M0Y2NUM3ZjA1RWIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1NTE5MTcwNDQ2MiwibmFtZSI6IlRlc3QifQ.IbdV_26bkPHSdd81sxox5AoG-5a4CCEY4aCrdbCXwAE'
  const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

  const handleChangeBaseTokenUri = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setBaseTokenUri(event.target.value.toString())
  }

  const handleChangeImage = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setImage(event.target.value.toString())
  }

  const selectImages = async () => {
    imageFilesArray = []
    let reader: FileReader
    if (!imageFilesRef.current?.files) return toast.error('No files selected.')
    for (let i = 0; i < imageFilesRef.current.files.length; i++) {
      reader = new FileReader()
      reader.onload = function (e) {
        if (!e.target?.result) return toast.error('Error parsing file.')
        if (!imageFilesRef.current?.files)
          return toast.error('No files selected.')
        let imageFile = new File(
          [e.target.result],
          imageFilesRef.current.files[i].name,
          { type: 'image/jpg' }
        )
        imageFilesArray.push(imageFile)
        if (i === imageFilesRef.current.files.length - 1) {
          imageFilesArray.sort((a, b) => naturalCompare(a.name, b.name))
          console.log(imageFilesArray)
          selectMetadata()
        }
      }
      if (!imageFilesRef.current.files) return toast.error('No file selected.')
      reader.readAsArrayBuffer(imageFilesRef.current.files[i])
      //reader.onloadend = function (e) { ...
    }
  }
  const selectMetadata = async () => {
    metadataFilesArray = []

    let reader: FileReader
    if (!metadataFilesRef.current?.files)
      return toast.error('No files selected.')
    for (let i = 0; i < metadataFilesRef.current.files.length; i++) {
      reader = new FileReader()
      reader.onload = function (e) {
        if (!e.target?.result) return toast.error('Error parsing file.')
        if (!metadataFilesRef.current?.files)
          return toast.error('No files selected.')
        let metadataFile = new File(
          [e.target.result],
          metadataFilesRef.current.files[i].name,
          { type: 'image/jpg' }
        )
        metadataFilesArray.push(metadataFile)
        if (i === metadataFilesRef.current.files.length - 1) {
          metadataFilesArray.sort((a, b) => naturalCompare(a.name, b.name))
          console.log(metadataFilesArray)
          updateMetadata()
        }

      }
      if (!metadataFilesRef.current?.files)
        return toast.error('No file selected.')
      reader.readAsText(metadataFilesRef.current.files[i], 'utf8')
      //reader.onloadend = function (e) { ...
    }
  }
  const updateMetadata = async () => {
    const imageURI = await client.storeDirectory(imageFilesArray)
    console.log(imageURI)
    updatedMetadataFilesArray = []
    let reader: FileReader
    for (let i = 0; i < metadataFilesArray.length; i++) {
      reader = new FileReader()
      reader.onload = function (e) {
        let metadataJSON = JSON.parse(e.target?.result as string)
        metadataJSON.image = `ipfs://${imageURI}/${imageFilesArray[i].name}`
        let metadataFileBlob = new Blob([JSON.stringify(metadataJSON)], {
          type: 'application/json',
        })
        let updatedMetadataFile = new File(
          [metadataFileBlob],
          metadataFilesArray[i].name,
          { type: 'application/json' }
        )
        updatedMetadataFilesArray.push(updatedMetadataFile)
        console.log(updatedMetadataFile.name + ' => ' + metadataJSON.image)
        if (i === metadataFilesArray.length - 1) {
          upload()
        }
      }
      reader.readAsText(metadataFilesArray[i], 'utf8')
      //reader.onloadend = function (e) { ...
    }
  }
  const upload = async () => {
    const baseTokenURI = await client.storeDirectory(updatedMetadataFilesArray)
    console.log(baseTokenURI)
  }

  return (
    <div>
      <NextSeo title="Create Collection" />

      <div className="space-y-8 mt-5 text-center">
        <h1 className="font-heading text-4xl font-bold">
          Upload Assets & Metadata
        </h1>
        
        <p>
          Make sure you check our{' '}
          <Anchor
            href={links['Docs']}
            className="font-bold text-plumbus hover:underline"
          >
            documentation
          </Anchor>{' '}
          on how to create your collection
        </p>
      </div>

      <hr className="border-white/20" />

      <div className="justify-items-start mt-5 mb-3 ml-3 flex-column">
        <div className="mt-3 ml-4 form-check form-check-inline">
          <input
            className="float-none mr-2 mb-1 w-4 h-4 align-middle bg-white checked:bg-stargaze bg-center bg-no-repeat bg-contain rounded-full border border-gray-300 checked:border-white focus:outline-none transition duration-200 appearance-none cursor-pointer form-check-input"
            type="radio"
            name="inlineRadioOptions2"
            id="inlineRadio2"
            value="Existing"
            onClick={() => {
              setUploadMethod('Existing')
            }}
            onChange={() => { }}
            checked={uploadMethod === 'Existing'}
          />
          <label
            className="inline-block text-white cursor-pointer form-check-label"
            htmlFor="inlineRadio2"
          >
            Use an existing URI
          </label>
        </div>
        <div className="mt-3 ml-4 form-check form-check-inline">
          <input
            className="float-none mr-2 mb-1 w-4 h-4 align-middle bg-white checked:bg-stargaze bg-center bg-no-repeat bg-contain rounded-full border border-gray-300 checked:border-white focus:outline-none transition duration-200 appearance-none cursor-pointer form-check-input"
            type="radio"
            name="inlineRadioOptions"
            id="inlineRadio3"
            value="New"
            onClick={() => {
              setUploadMethod('New')
            }}
            onChange={() => { }}
            checked={uploadMethod === 'New'}
          />
          <label
            className="inline-block text-white cursor-pointer form-check-label"
            htmlFor="inlineRadio3"
          >
            Upload assets & metadata
          </label>
        </div>
      </div>

      <hr className="border-white/20" />

      {uploadMethod == 'Existing' && (
        <div className="ml-3 flex-column">
          <p className="my-3 ml-5">
            Though Stargaze&apos;s sg721 contract allows for off-chain metadata
            storage, it is recommended to use a decentralized storage solution,
            such as IPFS. <br /> You may head over to{' '}
            <Anchor
              href="https://nft.storage"
              className="font-bold text-plumbus hover:underline"
            >
              NFT Storage
            </Anchor>{' '}
            and upload your assets & metadata manually to get a base URI for
            your collection.
          </p>
          <div>
            <label className="block mr-1 mb-1 ml-5 font-bold text-white dark:text-gray-300">
              Collection Cover Image
            </label>
            <input
              onChange={handleChangeImage}
              placeholder="ipfs://bafybeigi3bwpvyvsmnbj46ra4hyffcxdeaj6ntfk5jpic5mx27x6ih2qvq/images/1.png"
              className="py-2 px-1 mx-5 mt-2 mb-2 w-1/2 bg-white/10 rounded border-2 border-white/20 focus:ring
          focus:ring-plumbus-20
          form-input, placeholder:text-white/50,"
            />
          </div>
          <div>
            <label className="block mt-3 mr-1 mb-1 ml-5 font-bold text-white dark:text-gray-300">
              Base Token URI
            </label>
            <input
              onChange={handleChangeBaseTokenUri}
              placeholder="ipfs://..."
              className="py-2 px-1 mx-5 mt-2 mb-2 w-1/2 bg-white/10 rounded border-2 border-white/20 focus:ring
          focus:ring-plumbus-20
          form-input, placeholder:text-white/50,"
            />
          </div>
        </div>
      )}
      {uploadMethod == 'New' && (
        <div>
          <label className="block mt-5 mr-1 mb-1 ml-8 w-full font-bold text-white dark:text-gray-300">
            Image File Selection
          </label>
          <div
            className={clsx(
              'flex relative justify-center items-center mx-8 mt-2 space-y-4 w-1/2 h-32',
              'rounded border-2 border-white/20 border-dashed'
            )}
          >
            <input
              id="imageFiles"
              accept="image/*"
              className={clsx(
                'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
                'before:absolute before:inset-0 before:hover:bg-white/5 before:transition'
              )}
              onChange={() => { }}
              ref={imageFilesRef}
              type="file"
              multiple
            />
          </div>

          <label className="block mt-5 mr-1 mb-1 ml-8 w-full font-bold text-white dark:text-gray-300">
            Metadata Selection
          </label>
          <div
            className={clsx(
              'flex relative justify-center items-center mx-8 mt-2 space-y-4 w-1/2 h-32',
              'rounded border-2 border-white/20 border-dashed'
            )}
          >
            <input
              id="metadataFiles"
              accept=""
              className={clsx(
                'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
                'before:absolute before:inset-0 before:hover:bg-white/5 before:transition'
              )}
              onChange={() => { }}
              ref={metadataFilesRef}
              type="file"
              multiple
            />
          </div>

          <div className="mt-5 ml-8">
            <Button
              onClick={selectImages}
              variant="solid"
              isWide
              className="w-[120px]"
            >
              Upload
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default withMetadata(UploadPage, { center: false })
