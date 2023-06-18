import type { logs } from '@cosmjs/stargate'
import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import type { OpenEditionFactoryContract, OpenEditionFactoryInstance, OpenEditionFactoryMessages } from './contract'
import { openEditionFactory as initContract } from './contract'

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

export interface UseOpenEditionFactoryContractProps {
  use: (customAddress: string) => OpenEditionFactoryInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  getContractAddress: () => string | undefined
  messages: (contractAddress: string) => OpenEditionFactoryMessages | undefined
}

export function useOpenEditionFactoryContract(): UseOpenEditionFactoryContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [openEditionFactory, setOpenEditionFactory] = useState<OpenEditionFactoryContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    const OpenEditionFactoryBaseContract = initContract(wallet.getClient(), wallet.address)
    setOpenEditionFactory(OpenEditionFactoryBaseContract)
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const use = useCallback(
    (customAddress = ''): OpenEditionFactoryInstance | undefined => {
      return openEditionFactory?.use(address || customAddress)
    },
    [openEditionFactory, address],
  )

  const getContractAddress = (): string | undefined => {
    return address
  }

  const messages = useCallback(
    (customAddress = ''): OpenEditionFactoryMessages | undefined => {
      return openEditionFactory?.messages(address || customAddress)
    },
    [openEditionFactory, address],
  )

  return {
    use,
    updateContractAddress,
    getContractAddress,
    messages,
  }
}
