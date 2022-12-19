import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

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
    const BaseFactoryBaseContract = initContract(wallet.getClient(), wallet.address)
    setBaseFactory(BaseFactoryBaseContract)
  }, [wallet])

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
