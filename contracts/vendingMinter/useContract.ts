import type { Coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'
import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'utils/wallet'

import type { MigrateResponse, VendingMinterContract, VendingMinterInstance, VendingMinterMessages } from './contract'
import { vendingMinter as initContract } from './contract'

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

export interface UseVendingMinterContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
    funds?: Coin[],
  ) => Promise<InstantiateResponse>
  migrate: (contractAddress: string, codeId: number, migrateMsg: Record<string, unknown>) => Promise<MigrateResponse>
  use: (customAddress: string) => VendingMinterInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  getContractAddress: () => string | undefined
  messages: (contractAddress: string) => VendingMinterMessages | undefined
}

export function useVendingMinterContract(): UseVendingMinterContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [vendingMinter, setVendingMinter] = useState<VendingMinterContract>()

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
      setVendingMinter(contract)
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
        if (!vendingMinter) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        vendingMinter
          .instantiate(wallet.address || '', codeId, initMsg, label, admin)
          .then(resolve)
          .catch(reject)
      })
    },
    [vendingMinter, wallet],
  )

  const migrate = useCallback(
    (contractAddress: string, codeId: number, migrateMsg: Record<string, unknown>): Promise<MigrateResponse> => {
      return new Promise((resolve, reject) => {
        if (!vendingMinter) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        console.log(wallet.address, contractAddress, codeId)
        vendingMinter
          .migrate(wallet.address || '', contractAddress, codeId, migrateMsg)
          .then(resolve)
          .catch(reject)
      })
    },
    [vendingMinter, wallet],
  )

  const use = useCallback(
    (customAddress = ''): VendingMinterInstance | undefined => {
      return vendingMinter?.use(address || customAddress)
    },
    [vendingMinter, address],
  )

  const getContractAddress = (): string | undefined => {
    return address
  }

  const messages = useCallback(
    (customAddress = ''): VendingMinterMessages | undefined => {
      return vendingMinter?.messages(address || customAddress)
    },
    [vendingMinter, address],
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
