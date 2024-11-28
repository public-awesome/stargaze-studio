import { uploadToFleek } from './fleek'
import type { UploadFileType } from './pinata'
import { uploadToPinata } from './pinata'
import { uploadToWeb3Storage } from './web3-storage'

export type UploadServiceType = 'pinata' | 'web3-storage' | 'fleek'

export const upload = async (
  fileArray: File[],
  uploadService: UploadServiceType,
  fileType: UploadFileType,
  pinataApiKey: string,
  pinataSecretKey: string,
  web3StorageEmail: string,
  web3StorageSpaceName: string,
  fleekClientId: string,
  fleekDirectoryName: string,
): Promise<string> => {
  if (uploadService === 'web3-storage') return uploadToWeb3Storage(fileArray, web3StorageEmail, web3StorageSpaceName)
  else if (uploadService === 'pinata') return uploadToPinata(fileArray, pinataApiKey, pinataSecretKey, fileType)
  else if (uploadService === 'fleek') return uploadToFleek(fileArray, fleekClientId, fleekDirectoryName)
  throw new Error('Invalid upload service')
}
