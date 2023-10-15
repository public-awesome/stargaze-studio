import { toUtf8 } from '@cosmjs/encoding'
import type { ChainContext } from '@cosmos-kit/core'
import toast from 'react-hot-toast'

import { SG721_NAME_ADDRESS } from './constants'
import { isValidAddress } from './isValidAddress'

export const resolveAddress = async (name: string, wallet: ChainContext): Promise<string> => {
  if (!name.trim().endsWith('.stars')) return name.trim()

  if (wallet.isWalletConnected) {
    const tokenUri = await (
      await wallet.getCosmWasmClient()
    )
      .queryContractRaw(
        SG721_NAME_ADDRESS,
        toUtf8(
          Buffer.from(
            `0006${Buffer.from('tokens').toString('hex')}${Buffer.from(
              name.trim().substring(0, name.trim().lastIndexOf('.')),
            ).toString('hex')}`,
            'hex',
          ).toString(),
        ),
      )
      .then((res) => {
        const parsedTokenUri = JSON.parse(new TextDecoder().decode(res as Uint8Array)).token_uri
        console.log(parsedTokenUri)
        if (parsedTokenUri && isValidAddress(parsedTokenUri)) return parsedTokenUri as string
        toast.error(`Resolved address is empty or invalid for the name: ${name.trim()}`)
        return name
      })
      .catch((e) => {
        console.log(e)
        toast.error(`Error resolving address for the name: ${name.trim()}`)
        return name
      })
    return tokenUri
  }
  toast.error('Wallet is not connected. Unable to resolve address.')
  return name
}
