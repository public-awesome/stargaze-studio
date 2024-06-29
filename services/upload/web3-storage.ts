/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */

import { create } from '@web3-storage/w3up-client'
import type { EmailAddress } from '@web3-storage/w3up-client/dist/src/types'
import { CID } from 'multiformats/cid'
import toast from 'react-hot-toast'

export const uploadToWeb3Storage = async (fileArray: File[], email: string, spaceName: string): Promise<string> => {
  const client = await create()
  const space = await client.createSpace(spaceName)
  console.log('Uploading to web3.storage...')

  const account = await toast.promise(client.login(email as EmailAddress), {
    loading: 'Waiting for email verification...',
    success: 'web3.storage login successful.',
    error: 'Failed to log in.',
  })

  console.log('Waiting for payment plan to be selected...')
  while (true) {
    const res = await account.plan.get()
    toast.loading('Waiting for for payment plan to be selected... Please check your inbox.', {
      duration: 5000,
      style: { maxWidth: 'none' },
    })
    if (res.ok) {
      toast.success('web3.storage payment plan is acquired.')
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 5000))
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
