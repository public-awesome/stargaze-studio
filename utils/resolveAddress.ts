import { toUtf8 } from '@cosmjs/encoding'
import toast from 'react-hot-toast'

import type { KeplrWalletStore } from '../contexts/wallet'
import { SG721_NAME_ADDRESS } from './constants'
import { isValidAddress } from './isValidAddress'

export const resolveAddress = async (name: string, wallet: KeplrWalletStore): Promise<string> => {
  if (!name.trim().endsWith('.stars')) return name

  if (wallet.client) {
    const tokenUri = await wallet.client
      .queryContractRaw(
        SG721_NAME_ADDRESS,
        toUtf8(
          Buffer.from(
            `0006${Buffer.from('tokens').toString('hex')}${Buffer.from(
              name.substring(0, name.lastIndexOf('.')),
            ).toString('hex')}`,
            'hex',
          ).toString(),
        ),
      )
      .then((res) => {
        const parsedTokenUri = JSON.parse(new TextDecoder().decode(res as Uint8Array)).token_uri
        console.log(parsedTokenUri)
        if (parsedTokenUri && isValidAddress(parsedTokenUri)) return parsedTokenUri as string
        toast.error(`Resolved address is empty or invalid for the name: ${name}`)
        return name
      })
      .catch((e) => {
        console.log(e)
        toast.error(`Error resolving address for the name: ${name}`)
        return name
      })
    return tokenUri
  }
  toast.error('Wallet is not connected. Unable to resolve address.')
  return name
}
