/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-await-in-loop */
/* eslint-disable array-callback-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-misleading-character-class */
/* eslint-disable no-control-regex */
/* eslint-disable @typescript-eslint/no-loop-func */
import { create } from '@web3-storage/w3up-client'
import type { EmailAddress } from '@web3-storage/w3up-client/dist/src/types'
import clsx from 'clsx'
import { Alert } from 'components/Alert'
import { Anchor } from 'components/Anchor'
import { AssetsPreview } from 'components/AssetsPreview'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { TextInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { MetadataModal } from 'components/MetadataModal'
import { Tooltip } from 'components/Tooltip'
import { addLogItem } from 'contexts/log'
import type { ChangeEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import type { UploadServiceType } from 'services/upload'
import type { AssetType } from 'utils/getAssetType'
import { getAssetType } from 'utils/getAssetType'
import { uid } from 'utils/random'
import { naturalCompare } from 'utils/sort'

export type UploadMethod = 'new' | 'existing'

interface UploadDetailsProps {
  onChange: (value: UploadDetailsDataProps) => void
  importedUploadDetails?: UploadDetailsDataProps
}

export interface UploadDetailsDataProps {
  assetFiles: File[]
  metadataFiles: File[]
  thumbnailFiles?: File[]
  thumbnailCompatibleAssetFileNames?: string[]
  uploadService: UploadServiceType
  pinataApiKey?: string
  pinataSecretKey?: string
  web3StorageEmail?: EmailAddress
  web3StorageLoginSuccessful?: boolean
  fleekClientId?: string
  uploadMethod: UploadMethod
  baseTokenURI?: string
  imageUrl?: string
}

export const UploadDetails = ({ onChange, importedUploadDetails }: UploadDetailsProps) => {
  const [assetFilesArray, setAssetFilesArray] = useState<File[]>([])
  const [metadataFilesArray, setMetadataFilesArray] = useState<File[]>([])
  const [thumbnailCompatibleAssetFileNames, setThumbnailCompatibleAssetFileNames] = useState<string[]>([])
  const [thumbnailFilesArray, setThumbnailFilesArray] = useState<File[]>([])
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('new')
  const [uploadService, setUploadService] = useState<UploadServiceType>('web3-storage')
  const [metadataFileArrayIndex, setMetadataFileArrayIndex] = useState(0)
  const [refreshMetadata, setRefreshMetadata] = useState(false)

  const [web3StorageLoginSuccessful, setWeb3StorageLoginSuccessful] = useState(false)
  const [web3StorageLoginInProgress, setWeb3StorageLoginInProgress] = useState(false)
  const [web3StorageLoginCancelled, setWeb3StorageLoginCancelled] = useState(false)
  const cancelRef = useRef(web3StorageLoginCancelled)

  const assetFilesRef = useRef<HTMLInputElement | null>(null)
  const metadataFilesRef = useRef<HTMLInputElement | null>(null)
  const thumbnailFilesRef = useRef<HTMLInputElement | null>(null)

  const pinataApiKeyState = useInputState({
    id: 'pinata-api-key',
    name: 'pinataApiKey',
    title: 'Pinata API Key',
    placeholder: 'Enter Pinata API Key',
    defaultValue: '',
  })
  const pinataSecretKeyState = useInputState({
    id: 'pinata-secret-key',
    name: 'pinataSecretKey',
    title: 'Pinata Secret Key',
    placeholder: 'Enter Pinata Secret Key',
    defaultValue: '',
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

  const web3StorageEmailState = useInputState({
    id: 'web3-storage-email',
    name: 'web3StorageEmail',
    title: 'web3.Storage Email',
    placeholder: 'my@happy.email',
    defaultValue: '',
  })

  const fleekClientIdState = useInputState({
    id: 'fleek-client-id',
    name: 'fleekClientId',
    title: 'Fleek Client ID',
    placeholder: 'Enter Fleek Client ID',
    defaultValue: '',
  })

  const selectAssets = (event: ChangeEvent<HTMLInputElement>) => {
    setAssetFilesArray([])
    setMetadataFilesArray([])
    setThumbnailFilesArray([])
    setThumbnailCompatibleAssetFileNames([])
    if (event.target.files === null) return
    const thumbnailCompatibleAssetTypes: AssetType[] = ['video', 'audio', 'html', 'document']
    const thumbnailCompatibleFileNamesList: string[] = []

    //sort the files
    const sortedFiles = Array.from(event.target.files).sort((a, b) => naturalCompare(a.name, b.name))
    //check if the sorted file names are in numerical order
    const sortedFileNames = sortedFiles.map((file) => file.name.split('.')[0])
    sortedFiles.map((file) => {
      if (thumbnailCompatibleAssetTypes.includes(getAssetType(file.name))) {
        thumbnailCompatibleFileNamesList.push(file.name.split('.')[0])
      }
    })
    setThumbnailCompatibleAssetFileNames(thumbnailCompatibleFileNamesList)
    console.log('Thumbnail Compatible Files: ', thumbnailCompatibleFileNamesList)
    for (let i = 0; i < sortedFileNames.length; i++) {
      if (isNaN(Number(sortedFileNames[i])) || parseInt(sortedFileNames[i]) !== i + 1) {
        toast.error('The file names should be in numerical order starting from 1.')
        setThumbnailCompatibleAssetFileNames([])
        addLogItem({
          id: uid(),
          message: 'The file names should be in numerical order starting from 1.',
          type: 'Error',
          timestamp: new Date(),
        })
        //clear the input
        event.target.value = ''
        return
      }
    }

    let loadedFileCount = 0
    const files: File[] = []
    let reader: FileReader
    for (let i = 0; i < event.target.files.length; i++) {
      reader = new FileReader()
      reader.onload = (e) => {
        if (!e.target?.result) return toast.error('Error parsing file.')
        if (!event.target.files) return toast.error('No files selected.')
        const assetFile = new File([e.target.result], event.target.files[i].name.replaceAll('#', ''), {
          type: 'image/jpg',
        })
        files.push(assetFile)
      }
      reader.readAsArrayBuffer(event.target.files[i])
      reader.onloadend = () => {
        if (!event.target.files) return toast.error('No file selected.')
        loadedFileCount++
        if (loadedFileCount === event.target.files.length) {
          setAssetFilesArray(files.sort((a, b) => naturalCompare(a.name, b.name)))
        }
      }
    }
  }

  const selectMetadata = (event: ChangeEvent<HTMLInputElement>) => {
    setMetadataFilesArray([])
    if (event.target.files === null) return toast.error('No files selected.')
    if (event.target.files.length !== assetFilesArray.length) {
      event.target.value = ''
      return toast.error('The number of metadata files should be equal to the number of asset files.')
    }
    // compare the first file name for asset and metadata files

    //sort the files
    const sortedFiles = Array.from(event.target.files).sort((a, b) => naturalCompare(a.name, b.name))
    //check if the sorted file names are in numerical order
    const sortedFileNames = sortedFiles.map((file) => file.name.split('.')[0])
    for (let i = 0; i < sortedFileNames.length; i++) {
      if (isNaN(Number(sortedFileNames[i])) || parseInt(sortedFileNames[i]) !== i + 1) {
        toast.error('The file names should be in numerical order starting from 1.')
        addLogItem({
          id: uid(),
          message: 'The file names should be in numerical order starting from 1.',
          type: 'Error',
          timestamp: new Date(),
        })
        event.target.value = ''
        return
      }
    }

    let loadedFileCount = 0
    const files: File[] = []
    let reader: FileReader
    for (let i = 0; i < event.target.files.length; i++) {
      reader = new FileReader()
      reader.onload = async (e) => {
        if (!e.target?.result) return toast.error('Error parsing file.')
        if (!event.target.files) return toast.error('No files selected.')
        const metadataFile = new File([e.target.result], event.target.files[i].name.replaceAll('#', ''), {
          type: 'application/json',
        })
        files.push(metadataFile)
        try {
          const parsedMetadata = JSON.parse(await metadataFile.text())
          if (!parsedMetadata || typeof parsedMetadata !== 'object') {
            event.target.value = ''
            setMetadataFilesArray([])
            return toast.error(`Invalid metadata file: ${metadataFile.name}`)
          }
        } catch (error: any) {
          event.target.value = ''
          setMetadataFilesArray([])
          addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
          return toast.error(`Invalid metadata file: ${metadataFile.name}`)
        }
      }
      reader.readAsText(event.target.files[i], 'utf8')
      reader.onloadend = () => {
        if (!event.target.files) return toast.error('No file selected.')
        loadedFileCount++
        if (loadedFileCount === event.target.files.length) {
          setMetadataFilesArray(files.sort((a, b) => naturalCompare(a.name, b.name)))
        }
      }
    }
  }

  const updateMetadataFileIndex = (index: number) => {
    setMetadataFileArrayIndex(index)
    setRefreshMetadata((prev) => !prev)
  }

  const updateMetadataFileArray = (updatedMetadataFile: File) => {
    metadataFilesArray[metadataFileArrayIndex] = updatedMetadataFile
  }

  const attemptWeb3StorageLogin = async () => {
    try {
      setWeb3StorageLoginCancelled(false)
      setWeb3StorageLoginSuccessful(false)
      setWeb3StorageLoginInProgress(true)
      if (!web3StorageEmailState.value) {
        setWeb3StorageLoginInProgress(false)
        return toast.error('Please enter a valid email address.')
      }
      const client = await create()
      const account = await toast.promise(
        client.login(web3StorageEmailState.value as EmailAddress),
        {
          loading: 'Waiting for email verification... Please check your inbox.',
          success: 'web3.storage login successful.',
          error: 'Failed to log in.',
        },
        { style: { maxWidth: 'none' } },
      )

      console.log('Waiting for payment plan to be selected...')
      while (true) {
        if (cancelRef.current) {
          setWeb3StorageLoginInProgress(false)
          setWeb3StorageLoginSuccessful(false)
          setWeb3StorageLoginCancelled(false)
          return
        }
        const res = await account.plan.get()
        toast.loading(
          'Waiting for payment plan to be selected... Please check your inbox and follow the instructions.',
          {
            duration: 2000,
            style: { maxWidth: 'none' },
          },
        )
        if (res.ok) {
          toast.success('web3.storage payment plan validation successful.', { duration: 5000 })
          break
        }
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
      setWeb3StorageLoginSuccessful(true)
      setWeb3StorageLoginInProgress(false)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      setWeb3StorageLoginInProgress(false)
      setWeb3StorageLoginSuccessful(false)
      setWeb3StorageLoginCancelled(true)
      addLogItem({
        id: uid(),
        message: error.message,
        type: 'Error',
        timestamp: new Date(),
      })
    }
  }

  const cancelWeb3StorageLogin = () => {
    setWeb3StorageLoginInProgress(false)
    setWeb3StorageLoginSuccessful(false)
    setWeb3StorageLoginCancelled(true)
    web3StorageEmailState.onChange('')
  }

  useEffect(() => {
    cancelRef.current = web3StorageLoginCancelled
  }, [web3StorageLoginCancelled])

  useEffect(() => {
    setWeb3StorageLoginInProgress(false)
    setWeb3StorageLoginSuccessful(false)
    setWeb3StorageLoginCancelled(true)
    web3StorageEmailState.onChange('')
  }, [uploadMethod, uploadService])

  const regex =
    /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u2020-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g

  const selectThumbnails = (event: ChangeEvent<HTMLInputElement>) => {
    setThumbnailFilesArray([])
    if (event.target.files === null) return

    // if (minterType === 'vending' || (minterType === 'base' && thumbnailCompatibleAssetFileNames.length > 1)) {
    const sortedFiles = Array.from(event.target.files).sort((a, b) => naturalCompare(a.name, b.name))
    const sortedFileNames = sortedFiles.map((file) => file.name.split('.')[0])
    // make sure the sorted file names match thumbnail compatible asset file names
    for (let i = 0; i < thumbnailCompatibleAssetFileNames.length; i++) {
      if (sortedFileNames[i] !== thumbnailCompatibleAssetFileNames[i]) {
        toast.error('The thumbnail file names should match the thumbnail compatible asset file names.')
        addLogItem({
          id: uid(),
          message: 'The thumbnail file names should match the thumbnail compatible asset file names.',
          type: 'Error',
          timestamp: new Date(),
        })
        //clear the input
        event.target.value = ''
        return
      }
    }
    // }
    let loadedFileCount = 0
    const files: File[] = []
    let reader: FileReader
    for (let i = 0; i < event.target.files.length; i++) {
      reader = new FileReader()
      reader.onload = (e) => {
        if (!e.target?.result) return toast.error('Error parsing file.')
        if (!event.target.files) return toast.error('No files selected.')
        const thumbnailFile = new File([e.target.result], event.target.files[i].name.replaceAll('#', ''), {
          type: 'image/jpg',
        })
        files.push(thumbnailFile)
      }
      reader.readAsArrayBuffer(event.target.files[i])
      reader.onloadend = () => {
        if (!event.target.files) return toast.error('No file selected.')
        loadedFileCount++
        if (loadedFileCount === event.target.files.length) {
          setThumbnailFilesArray(files.sort((a, b) => naturalCompare(a.name, b.name)))
        }
      }
    }
  }

  useEffect(() => {
    try {
      const data: UploadDetailsDataProps = {
        assetFiles: assetFilesArray,
        metadataFiles: metadataFilesArray,
        thumbnailFiles: thumbnailFilesArray,
        thumbnailCompatibleAssetFileNames,
        uploadService,
        pinataApiKey: pinataApiKeyState.value,
        pinataSecretKey: pinataSecretKeyState.value,
        web3StorageEmail: web3StorageEmailState.value as EmailAddress,
        web3StorageLoginSuccessful,
        fleekClientId: fleekClientIdState.value,
        uploadMethod,
        baseTokenURI: baseTokenUriState.value
          .replace('IPFS://', 'ipfs://')
          .replace(/,/g, '')
          .replace(/"/g, '')
          .replace(/'/g, '')
          .replace(regex, '')
          .trim(),
        imageUrl: coverImageUrlState.value
          .replace('IPFS://', 'ipfs://')
          .replace(/,/g, '')
          .replace(/"/g, '')
          .replace(/'/g, '')
          .replace(regex, '')
          .trim(),
      }
      onChange(data)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      addLogItem({ id: uid(), message: error.message, type: 'Error', timestamp: new Date() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    assetFilesArray,
    metadataFilesArray,
    thumbnailFilesArray,
    thumbnailCompatibleAssetFileNames,
    uploadService,
    pinataApiKeyState.value,
    pinataSecretKeyState.value,
    web3StorageEmailState.value,
    web3StorageLoginSuccessful,
    fleekClientIdState.value,
    uploadMethod,
    baseTokenUriState.value,
    coverImageUrlState.value,
    refreshMetadata,
  ])

  useEffect(() => {
    if (metadataFilesRef.current) metadataFilesRef.current.value = ''
    setMetadataFilesArray([])
    if (assetFilesRef.current) assetFilesRef.current.value = ''
    setAssetFilesArray([])
    if (thumbnailFilesRef.current) thumbnailFilesRef.current.value = ''
    setThumbnailFilesArray([])
    setThumbnailCompatibleAssetFileNames([])
    if (!importedUploadDetails) {
      baseTokenUriState.onChange('')
      coverImageUrlState.onChange('')
    }
  }, [uploadMethod])

  useEffect(() => {
    if (importedUploadDetails) {
      if (importedUploadDetails.uploadMethod === 'new') {
        setUploadMethod('new')
        setUploadService(importedUploadDetails.uploadService)
        pinataApiKeyState.onChange(importedUploadDetails.pinataApiKey || '')
        pinataSecretKeyState.onChange(importedUploadDetails.pinataSecretKey || '')
        fleekClientIdState.onChange(importedUploadDetails.fleekClientId || '')
        baseTokenUriState.onChange(importedUploadDetails.baseTokenURI || '')
        coverImageUrlState.onChange(importedUploadDetails.imageUrl || '')
      } else if (importedUploadDetails.uploadMethod === 'existing') {
        setUploadMethod('existing')
        baseTokenUriState.onChange(importedUploadDetails.baseTokenURI || '')
        coverImageUrlState.onChange(importedUploadDetails.imageUrl || '')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedUploadDetails])

  return (
    <div className="justify-items-start mb-3 rounded border-2 border-white/20 flex-column">
      <div className="flex justify-center">
        <div className="mt-3 ml-4 font-bold form-check form-check-inline">
          <input
            checked={uploadMethod === 'new'}
            className="peer sr-only"
            id="inlineRadio2"
            name="inlineRadioOptions2"
            onClick={() => {
              setUploadMethod('new')
            }}
            type="radio"
            value="New"
          />
          <label
            className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black peer-checked:border-b-2 hover:border-b-2  peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
            htmlFor="inlineRadio2"
          >
            Upload assets & metadata
          </label>
        </div>
        <div className="mt-3 ml-2 font-bold form-check form-check-inline">
          <input
            checked={uploadMethod === 'existing'}
            className="peer sr-only"
            id="inlineRadio1"
            name="inlineRadioOptions1"
            onClick={() => {
              setUploadMethod('existing')
            }}
            type="radio"
            value="Existing"
          />
          <label
            className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black peer-checked:border-b-2 hover:border-b-2  peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
            htmlFor="inlineRadio1"
          >
            Use an existing base URI
          </label>
        </div>
      </div>

      <div className="p-3 py-5 pb-8">
        <Conditional test={uploadMethod === 'existing'}>
          <div className="ml-3 flex-column">
            <p className="mb-5 ml-5">
              Though Stargaze&apos;s sg721 contract allows for off-chain metadata storage, it is recommended to use a
              decentralized storage solution, such as IPFS. <br /> You may head over to{' '}
              <Anchor className="font-bold text-plumbus hover:underline" href="https://web3.storage/">
                Web3.Storage
              </Anchor>{' '}
              ,{' '}
              <Anchor className="font-bold text-plumbus hover:underline" href="https://www.pinata.cloud/">
                Pinata
              </Anchor>{' '}
              or{' '}
              <Anchor className="font-bold text-plumbus hover:underline" href="https://fleek.xyz/">
                Fleek
              </Anchor>{' '}
              and upload your assets & metadata manually to get a base URI for your collection.
            </p>
            <div>
              <Tooltip
                backgroundColor="bg-blue-500"
                className="mb-2 ml-20"
                label="The base token URI that points to the IPFS folder containing the metadata files."
                placement="top"
              >
                <TextInput {...baseTokenUriState} className="ml-4 w-1/2" />
              </Tooltip>
            </div>

            <div>
              <TextInput {...coverImageUrlState} className="mt-2 ml-4 w-1/2" />
            </div>
          </div>
        </Conditional>

        <Conditional test={uploadMethod === 'new'}>
          <div>
            <div className="flex flex-col items-center px-8 w-full">
              <div className="flex justify-items-start mb-5 w-full font-bold">
                <div className="form-check form-check-inline">
                  <input
                    checked={uploadService === 'web3-storage'}
                    className="peer sr-only"
                    id="inlineRadio-web3-storage"
                    name="inlineRadioOptions-web3-storage"
                    onClick={() => {
                      setUploadService('web3-storage')
                    }}
                    type="radio"
                    value="web3-storage"
                  />
                  <label
                    className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                    htmlFor="inlineRadio-web3-storage"
                  >
                    Upload using Web3.Storage
                  </label>
                </div>

                <div className="ml-2 form-check form-check-inline">
                  <input
                    checked={uploadService === 'pinata'}
                    className="peer sr-only"
                    id="inlineRadio4"
                    name="inlineRadioOptions4"
                    onClick={() => {
                      setUploadService('pinata')
                    }}
                    type="radio"
                    value="pinata"
                  />
                  <label
                    className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                    htmlFor="inlineRadio4"
                  >
                    Upload using Pinata
                  </label>
                </div>

                <div className="ml-2 form-check form-check-inline">
                  <input
                    checked={uploadService === 'fleek'}
                    className="peer sr-only"
                    id="inlineRadio5"
                    name="inlineRadioOptions5"
                    onClick={() => {
                      setUploadService('fleek')
                    }}
                    type="radio"
                    value="fleek"
                  />
                  <label
                    className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                    htmlFor="inlineRadio5"
                  >
                    Upload using Fleek
                  </label>
                </div>
              </div>

              <div className="flex w-full">
                <Conditional test={uploadService === 'pinata'}>
                  <TextInput {...pinataApiKeyState} className="w-full" />
                  <div className="w-[20px]" />
                  <TextInput {...pinataSecretKeyState} className="w-full" />
                </Conditional>
                <Conditional test={uploadService === 'fleek'}>
                  <TextInput {...fleekClientIdState} className="w-3/4" />
                </Conditional>
                <Conditional test={uploadService === 'web3-storage'}>
                  <div className="flex flex-row w-full">
                    <TextInput {...web3StorageEmailState} className="w-[53%]" disabled={web3StorageLoginSuccessful} />
                    <Button
                      className={`mt-8 ml-2 h-[55%] ${
                        web3StorageLoginSuccessful ? 'bg-blue-500 opacity-80 hover:bg-blue-600 ' : 'bg-stargaze'
                      }`}
                      disabled={web3StorageLoginSuccessful}
                      isLoading={web3StorageLoginInProgress}
                      onClick={attemptWeb3StorageLogin}
                    >
                      {web3StorageLoginSuccessful
                        ? web3StorageLoginInProgress
                          ? 'Logging in...'
                          : 'Logged In'
                        : 'Log In'}
                    </Button>
                    <Conditional test={web3StorageLoginInProgress || web3StorageLoginSuccessful}>
                      <Button className="mt-8 ml-2 h-[55%]" onClick={cancelWeb3StorageLogin}>
                        {web3StorageLoginInProgress ? 'Cancel' : 'Log Out'}
                      </Button>
                    </Conditional>
                  </div>
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
                        accept="image/*, audio/*, video/*, .html, .pdf"
                        className={clsx(
                          'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
                          'before:absolute before:inset-0 before:hover:bg-white/5 before:transition',
                        )}
                        id="assetFiles"
                        multiple
                        onChange={selectAssets}
                        ref={assetFilesRef}
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
                          ref={metadataFilesRef}
                          type="file"
                        />
                      </div>
                    </div>
                  )}

                  {thumbnailCompatibleAssetFileNames.length > 0 && (
                    <div>
                      <label
                        className="block mt-5 mr-1 mb-1 ml-8 w-full font-bold text-white dark:text-gray-300"
                        htmlFor="thumbnailFiles"
                      >
                        {thumbnailCompatibleAssetFileNames.length > 1
                          ? 'Thumbnail Selection for Compatible Assets (optional)'
                          : 'Thumbnail Selection (optional)'}
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
                          id="thumbnailFiles"
                          multiple
                          onChange={selectThumbnails}
                          ref={thumbnailFilesRef}
                          type="file"
                        />
                      </div>
                    </div>
                  )}
                  <Conditional test={assetFilesArray.length >= 1}>
                    <MetadataModal
                      assetFile={assetFilesArray[metadataFileArrayIndex]}
                      metadataFile={metadataFilesArray[metadataFileArrayIndex]}
                      refresher={refreshMetadata}
                      updateMetadata={updateMetadataFileArray}
                    />
                  </Conditional>
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
