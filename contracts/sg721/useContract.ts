import type { Coin } from '@cosmjs/proto-signing'
import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import type { SG721Contract, SG721Instance, Sg721Messages } from './contract'
import { SG721 as initContract } from './contract'

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface UseSG721ContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
    funds?: Coin[],
  ) => Promise<InstantiateResponse>
  use: (customAddress: string) => SG721Instance | undefined
  updateContractAddress: (contractAddress: string) => void
  messages: (contractAddress: string) => Sg721Messages | undefined
}

export function useSG721Contract(): UseSG721ContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [SG721, setSG721] = useState<SG721Contract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    const contract = initContract(wallet.getClient(), wallet.address)
    setSG721(contract)
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId: number, initMsg: Record<string, unknown>, label: string, admin?: string): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!SG721) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        SG721.instantiate(wallet.address, codeId, initMsg, label, admin).then(resolve).catch(reject)
      })
    },
    [SG721, wallet],
  )

  const use = useCallback(
    (customAddress = ''): SG721Instance | undefined => {
      return SG721?.use(address || customAddress)
    },
    [SG721, address],
  )

  const messages = useCallback((): Sg721Messages | undefined => {
    return SG721?.messages(address)
  }, [SG721, address])

  return {
    instantiate,
    use,
    updateContractAddress,
    messages,
  }
}
