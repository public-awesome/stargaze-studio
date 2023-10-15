import { useChain as useCosmosKitChain } from '@cosmos-kit/react'
import { chains } from 'chain-registry'
import { getConfig } from 'config'

import { NETWORK } from './constants'

/**
 * Hook to retrieve the wallet for the current chain.
 */
export const useWallet = () => {
  const { chainId } = getConfig(NETWORK)
  const chain = chains.find((c) => c.chain_id === chainId)
  if (!chain) {
    throw new Error('Chain not found')
  }

  return useCosmosKitChain(chain.chain_name)
}
