/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApplicationAccessTokenService, FleekSdk } from '@fleekxyz/sdk'

export const uploadToFleek = async (fileArray: File[], clientId: string, directoryName: string): Promise<string> => {
  const applicationService = new ApplicationAccessTokenService({
    clientId,
  })

  const fleekSdk = new FleekSdk({
    accessTokenService: applicationService,
  })

  console.log('Uploading to Fleek...')
  const directoryCid = await fleekSdk.storage().uploadVirtualDirectory({ files: fileArray, directoryName })
  console.log('CID: ', directoryCid.pin.cid.toString().trim())
  return directoryCid.pin.cid.toString().trim()
}
