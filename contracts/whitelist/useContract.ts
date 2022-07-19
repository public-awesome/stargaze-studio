import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import type { InstantiateResponse, WhiteListContract, WhiteListInstance, WhitelistMessages } from './contract'
import { WhiteList as initContract } from './contract'

export interface UseWhiteListContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>

  use: (customAddress?: string) => WhiteListInstance | undefined

  updateContractAddress: (contractAddress: string) => void

  messages: (contractAddress: string) => WhitelistMessages | undefined
}

export function useWhiteListContract(): UseWhiteListContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [whiteList, setWhiteList] = useState<WhiteListContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    if (wallet.initialized) {
      const client = wallet.getClient()
      const whiteListContract = initContract(client, wallet.address)
      setWhiteList(whiteListContract)
    }
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId: number, initMsg: Record<string, unknown>, label: string, admin?: string): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!whiteList) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        whiteList.instantiate(codeId, initMsg, label, admin).then(resolve).catch(reject)
      })
    },
    [whiteList],
  )

  const use = useCallback(
    (customAddress = ''): WhiteListInstance | undefined => {
      return whiteList?.use(address || customAddress)
    },
    [whiteList, address],
  )

  const messages = useCallback((): WhitelistMessages | undefined => {
    return whiteList?.messages(address)
  }, [whiteList, address])

  return {
    instantiate,
    use,
    updateContractAddress,
    messages,
  }
}
