import { Coin } from '@cosmjs/proto-signing'
import { logs } from '@cosmjs/stargate'
import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import {
  minter as initContract,
  MinterContract,
  MinterInstance,
} from './contract'

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

export interface UseMinterContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
    funds?: Coin[]
  ) => Promise<InstantiateResponse>
  use: (customAddress: string) => MinterInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  getContractAddress: () => string | undefined
}

export function useMinterContract(): UseMinterContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [minter, setMinter] = useState<MinterContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    if (wallet.initialized) {
      const getMinterBaseInstance = async (): Promise<void> => {
        const MinterBaseContract = initContract(wallet.getClient())
        setMinter(MinterBaseContract)
      }

      getMinterBaseInstance()
    }
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId, initMsg, label, admin?, funds?): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!minter) return reject('Contract is not initialized.')
        minter
          .instantiate(wallet.address, codeId, initMsg, label, admin, funds)
          .then(resolve)
          .catch(reject)
      })
    },
    [minter, wallet]
  )

  const use = useCallback(
    (customAddress = ''): MinterInstance | undefined => {
      return minter?.use(address || customAddress)
    },
    [minter, address]
  )

  const getContractAddress = (): string | undefined => {
    return address
  }

  return {
    instantiate,
    use,
    updateContractAddress,
    getContractAddress,
  }
}
