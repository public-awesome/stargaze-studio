import { Coin } from '@cosmjs/proto-signing'
import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import { WhiteList } from './contract'
import {
  InstantiateResponse,
  WhiteList as initContract,
  WhiteListContract,
  WhiteListInstance,
} from './contract'

export interface useWhiteListContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
    funds?: Coin[]
  ) => Promise<InstantiateResponse>

  use: (customAddress: string) => WhiteListInstance | undefined
  updateContractAddress: (contractAddress: string) => void
}

export function useWhiteListContract(): useWhiteListContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [WhiteList, setWhiteList] = useState<WhiteListContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    if (wallet.initialized) {
      const getWhiteListInstance = async (): Promise<void> => {
        const client = wallet.getClient()
        const whiteListContract = initContract(client, wallet.address)
        setWhiteList(whiteListContract)
      }

      getWhiteListInstance()
    }
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId, initMsg, label, admin?, funds?): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!WhiteList) return reject('Contract is not initialized.')
        WhiteList.instantiate(
          wallet.address,
          codeId,
          initMsg,
          label,
          admin,
          funds
        )
          .then(resolve)
          .catch(reject)
      })
    },
    [WhiteList, wallet]
  )

  const use = useCallback(
    (customAddress = ''): WhiteListInstance | undefined => {
      return WhiteList?.use(address || customAddress)
    },
    [WhiteList]
  )

  return {
    instantiate,
    use,
    updateContractAddress,
  }
}
