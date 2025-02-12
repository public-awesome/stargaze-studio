import { useChain as useCosmosKitChain } from '@cosmos-kit/react'
import { chains } from 'chain-registry'
import { getConfig } from 'config'
import { intergazeTestnet } from 'config/intergazeTestnet'

import { NETWORK } from './constants'

/**
 * Hook to retrieve the wallet for the current chain.
 */
export const useWallet = () => {
  const { chainId } = getConfig(NETWORK)
  const chain = chains.concat([intergazeTestnet]).find((c) => c.chain_id === chainId)
  if (!chain) {
    throw new Error('Chain not found')
  }

  return useCosmosKitChain(chain.chain_name)
}

export function truncateAddress(address?: string | null, visibleFirst = 8, visibleLast = 4) {
  if (typeof address !== 'string') {
    return ''
  }
  return address
    ? `${address.substring(0, visibleFirst)}...${address.substring(address.length - visibleLast, address.length)}`
    : null
}

export function truncateName(name: string, maxLength = 17) {
  let truncatedName = name

  if (name.length > maxLength) {
    const firstPart = name.substring(0, maxLength / 2)
    const secondPart = name.substring(name.length - 5) // stars
    truncatedName = `${firstPart}...${secondPart}`
  }
  return truncatedName
}
