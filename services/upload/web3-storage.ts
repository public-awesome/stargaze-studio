/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */

import { create } from '@web3-storage/w3up-client'
import type { EmailAddress } from '@web3-storage/w3up-client/dist/src/types'
import { CID } from 'multiformats/cid'

export const uploadToWeb3Storage = async (fileArray: File[], email: string, spaceName: string): Promise<string> => {
  const client = await create()
  const space = await client.createSpace(spaceName)
  console.log('Uploading to web3.storage...')

  const account = await client.login(email as EmailAddress)

  while (true) {
    const res = await account.plan.get()

    if (res.ok) {
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }

  await account.provision(space.did())

  await space.save()
  await client.setCurrentSpace(space.did())

  const recovery = await space.createRecovery(account.did())
  await client.capability.access.delegate({
    space: space.did(),
    delegations: [recovery],
  })

  const directoryCid = await client.uploadDirectory(fileArray)

  const cid = CID.create(directoryCid.version, directoryCid.code, directoryCid.multihash)

  return cid.toString().trim()
}
