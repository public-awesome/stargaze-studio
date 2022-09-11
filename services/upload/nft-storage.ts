import type { CIDString } from 'nft.storage'
import { NFTStorage } from 'nft.storage'

export const uploadToNftStorage = async (fileArray: File[], nftStorageApiKey: string): Promise<CIDString> => {
  console.log('Uploading to NFT.Storage...')
  const client = new NFTStorage({ token: nftStorageApiKey })
  return client.storeDirectory(fileArray)
}
