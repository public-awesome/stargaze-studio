import { useWallet } from 'contexts/wallet'
import { Coin } from 'cosmwasm'
import { useCallback, useEffect, useState } from 'react'

import { SG721 as initContract, SG721Contract, SG721Instance } from './contract'

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface UseSG721ContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    funds: Coin[],
    admin?: string
  ) => Promise<InstantiateResponse>
  use: (customAddress: string) => SG721Instance | undefined
  updateContractAddress: (contractAddress: string) => void
}

export function useSG721Contract(): UseSG721ContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [SG721, setSG721] = useState<SG721Contract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    if (wallet.initialized) {
      const getSG721Instance = async (): Promise<void> => {
        const SG721Contract = initContract(wallet.getClient())
        setSG721(SG721Contract)
      }

      getSG721Instance()
    }
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId, initMsg, label, admin?): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!SG721) return reject('Contract is not initialized.')
        SG721.instantiate(wallet.address, codeId, initMsg, label, admin)
          .then(resolve)
          .catch(reject)
      })
    },
    [SG721, wallet]
  )

  const use = useCallback(
    (customAddress = ''): SG721Instance | undefined => {
      return SG721?.use(address || customAddress)
    },
    [SG721, address]
  )

  return {
    instantiate,
    use,
    updateContractAddress,
  }
}
