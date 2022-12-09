import type { Coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'
import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import type { BaseMinterContract, BaseMinterInstance, BaseMinterMessages, MigrateResponse } from './contract'
import { baseMinter as initContract } from './contract'

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
  readonly logs: readonly logs.Log[]
}

export interface UseBaseMinterContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
    funds?: Coin[],
  ) => Promise<InstantiateResponse>
  migrate: (contractAddress: string, codeId: number, migrateMsg: Record<string, unknown>) => Promise<MigrateResponse>
  use: (customAddress: string) => BaseMinterInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  getContractAddress: () => string | undefined
  messages: (contractAddress: string) => BaseMinterMessages | undefined
}

export function useBaseMinterContract(): UseBaseMinterContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [baseMinter, setBaseMinter] = useState<BaseMinterContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    const BaseMinterBaseContract = initContract(wallet.getClient(), wallet.address)
    setBaseMinter(BaseMinterBaseContract)
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId: number, initMsg: Record<string, unknown>, label: string, admin?: string): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!baseMinter) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        baseMinter.instantiate(wallet.address, codeId, initMsg, label, admin).then(resolve).catch(reject)
      })
    },
    [baseMinter, wallet],
  )

  const migrate = useCallback(
    (contractAddress: string, codeId: number, migrateMsg: Record<string, unknown>): Promise<MigrateResponse> => {
      return new Promise((resolve, reject) => {
        if (!baseMinter) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        console.log(wallet.address, contractAddress, codeId)
        baseMinter.migrate(wallet.address, contractAddress, codeId, migrateMsg).then(resolve).catch(reject)
      })
    },
    [baseMinter, wallet],
  )

  const use = useCallback(
    (customAddress = ''): BaseMinterInstance | undefined => {
      return baseMinter?.use(address || customAddress)
    },
    [baseMinter, address],
  )

  const getContractAddress = (): string | undefined => {
    return address
  }

  const messages = useCallback(
    (customAddress = ''): BaseMinterMessages | undefined => {
      return baseMinter?.messages(address || customAddress)
    },
    [baseMinter, address],
  )

  return {
    instantiate,
    use,
    updateContractAddress,
    getContractAddress,
    messages,
    migrate,
  }
}
