import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'utils/wallet'

import type { BaseFactoryContract, BaseFactoryInstance, BaseFactoryMessages } from './contract'
import { baseFactory as initContract } from './contract'

export interface UseBaseFactoryContractProps {
  use: (customAddress: string) => BaseFactoryInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  getContractAddress: () => string | undefined
  messages: (contractAddress: string) => BaseFactoryMessages | undefined
}

export function useBaseFactoryContract(): UseBaseFactoryContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [baseFactory, setBaseFactory] = useState<BaseFactoryContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    if (!wallet.isWalletConnected) {
      return
    }

    const load = async () => {
      const client = await wallet.getSigningCosmWasmClient()
      const BaseFactoryBaseContract = initContract(client, wallet.address || '')
      setBaseFactory(BaseFactoryBaseContract)
    }

    load().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.isWalletConnected, wallet.address])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const use = useCallback(
    (customAddress = ''): BaseFactoryInstance | undefined => {
      return baseFactory?.use(address || customAddress)
    },
    [baseFactory, address],
  )

  const getContractAddress = (): string | undefined => {
    return address
  }

  const messages = useCallback(
    (customAddress = ''): BaseFactoryMessages | undefined => {
      return baseFactory?.messages(address || customAddress)
    },
    [baseFactory, address],
  )

  return {
    use,
    updateContractAddress,
    getContractAddress,
    messages,
  }
}
