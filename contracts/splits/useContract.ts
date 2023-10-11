/* eslint-disable eslint-comments/disable-enable-pair */

import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'utils/wallet'

import type { InstantiateResponse, MigrateResponse, SplitsContract, SplitsInstance, SplitsMessages } from './contract'
import { Splits as initContract } from './contract'

export interface UseSplitsContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>

  migrate: (contractAddress: string, codeId: number, migrateMsg: Record<string, unknown>) => Promise<MigrateResponse>

  use: (customAddress?: string) => SplitsInstance | undefined

  updateContractAddress: (contractAddress: string) => void

  messages: (contractAddress: string) => SplitsMessages | undefined
}

export function useSplitsContract(): UseSplitsContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [splits, setSplits] = useState<SplitsContract>()

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
      setSplits(contract)
    }

    load().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.isWalletConnected, wallet.address])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId: number, initMsg: Record<string, unknown>, label: string, admin?: string): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!splits) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        splits.instantiate(codeId, initMsg, label, admin).then(resolve).catch(reject)
      })
    },
    [splits],
  )

  const migrate = useCallback(
    (contractAddress: string, codeId: number, migrateMsg: Record<string, unknown>): Promise<MigrateResponse> => {
      return new Promise((resolve, reject) => {
        if (!splits) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        console.log(wallet.address, contractAddress, codeId)
        splits
          .migrate(wallet.address || '', contractAddress, codeId, migrateMsg)
          .then(resolve)
          .catch(reject)
      })
    },
    [splits, wallet],
  )

  const use = useCallback(
    (customAddress = ''): SplitsInstance | undefined => {
      return splits?.use(address || customAddress)
    },
    [splits, address],
  )

  const messages = useCallback(
    (customAddress = ''): SplitsMessages | undefined => {
      return splits?.messages(address || customAddress)
    },
    [splits, address],
  )

  return {
    instantiate,
    migrate,
    use,
    updateContractAddress,
    messages,
  }
}
