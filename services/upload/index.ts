import { uploadToNftStorage } from './nft-storage'
import type { UploadFileType } from './pinata'
import { uploadToPinata } from './pinata'
import { uploadToWeb3Storage } from './web3-storage'

export type UploadServiceType = 'nft-storage' | 'pinata' | 'web3-storage'

export const upload = async (
  fileArray: File[],
  uploadService: UploadServiceType,
  fileType: UploadFileType,
  nftStorageApiKey: string,
  pinataApiKey: string,
  pinataSecretKey: string,
  web3StorageEmail: string,
  web3StorageSpaceName: string,
): Promise<string> => {
  if (uploadService === 'nft-storage') return uploadToNftStorage(fileArray, nftStorageApiKey)
  if (uploadService === 'web3-storage') return uploadToWeb3Storage(fileArray, web3StorageEmail, web3StorageSpaceName)
  return uploadToPinata(fileArray, pinataApiKey, pinataSecretKey, fileType)
}
