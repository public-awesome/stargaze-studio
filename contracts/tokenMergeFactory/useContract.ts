import type { logs } from '@cosmjs/stargate'
import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'utils/wallet'

import type { TokenMergeFactoryContract, TokenMergeFactoryInstance, TokenMergeFactoryMessages } from './contract'
import { tokenMergeFactory as initContract } from './contract'

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface UseTokenMergeFactoryContractProps {
  use: (customAddress: string) => TokenMergeFactoryInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  getContractAddress: () => string | undefined
  messages: (contractAddress: string) => TokenMergeFactoryMessages | undefined
}

export function useTokenMergeFactoryContract(): UseTokenMergeFactoryContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [tokenMergeFactory, setTokenMergeFactory] = useState<TokenMergeFactoryContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    if (!wallet.isWalletConnected) {
      return
    }

    const load = async () => {
      const client = await wallet.getSigningCosmWasmClient()
      const contract = initContract(client, wallet.address || '')
      setTokenMergeFactory(contract)
    }

    load().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.isWalletConnected, wallet.address])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const use = useCallback(
    (customAddress = ''): TokenMergeFactoryInstance | undefined => {
      return tokenMergeFactory?.use(address || customAddress)
    },
    [tokenMergeFactory, address],
  )

  const getContractAddress = (): string | undefined => {
    return address
  }

  const messages = useCallback(
    (customAddress = ''): TokenMergeFactoryMessages | undefined => {
      return tokenMergeFactory?.messages(address || customAddress)
    },
    [tokenMergeFactory, address],
  )

  return {
    use,
    updateContractAddress,
    getContractAddress,
    messages,
  }
}
