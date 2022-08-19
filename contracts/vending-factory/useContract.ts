import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import type { VendingFactoryContract, VendingFactoryInstance, VendingFactoryMessages } from './contract'
import { vendingFactory as initContract } from './contract'

export interface UseVendingFactoryContractProps {
  use: (customAddress: string) => VendingFactoryInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  getContractAddress: () => string | undefined
  messages: (contractAddress: string) => VendingFactoryMessages | undefined
}

export function useVendingFactoryContract(): UseVendingFactoryContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [vendingFactory, setVendingFactory] = useState<VendingFactoryContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    const VendingFactoryBaseContract = initContract(wallet.getClient(), wallet.address)
    setVendingFactory(VendingFactoryBaseContract)
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const use = useCallback(
    (customAddress = ''): VendingFactoryInstance | undefined => {
      return vendingFactory?.use(address || customAddress)
    },
    [vendingFactory, address],
  )

  const getContractAddress = (): string | undefined => {
    return address
  }

  const messages = useCallback(
    (customAddress = ''): VendingFactoryMessages | undefined => {
      return vendingFactory?.messages(address || customAddress)
    },
    [vendingFactory, address],
  )

  return {
    use,
    updateContractAddress,
    getContractAddress,
    messages,
  }
}
