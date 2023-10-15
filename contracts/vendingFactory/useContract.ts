import type { logs } from '@cosmjs/stargate'
import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'utils/wallet'

import type { VendingFactoryContract, VendingFactoryInstance, VendingFactoryMessages } from './contract'
import { vendingFactory as initContract } from './contract'

/*export interface InstantiateResponse {
  /** The address of the newly instantiated contract *-/
  readonly contractAddress: string
  readonly logs: readonly logs.Log[]
  /** Block height in which the transaction is included *-/
  readonly height: number
  /** Transaction hash (might be used as transaction ID). Guaranteed to be non-empty upper-case hex *-/
  readonly transactionHash: string
  readonly gasWanted: number
  readonly gasUsed: number
}*/

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

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
    if (!wallet.isWalletConnected) {
      return
    }

    const load = async () => {
      const client = await wallet.getSigningCosmWasmClient()
      const contract = initContract(client, wallet.address || '')
      setVendingFactory(contract)
    }

    load().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.isWalletConnected, wallet.address])

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
