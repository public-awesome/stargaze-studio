import type { Coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'
import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'utils/wallet'

import type {
  MigrateResponse,
  TokenMergeMinterContract,
  TokenMergeMinterInstance,
  TokenMergeMinterMessages,
} from './contract'
import { tokenMergeMinter as initContract } from './contract'

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

export interface UseTokenMergeMinterContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
    funds?: Coin[],
  ) => Promise<InstantiateResponse>
  migrate: (contractAddress: string, codeId: number, migrateMsg: Record<string, unknown>) => Promise<MigrateResponse>
  use: (customAddress: string) => TokenMergeMinterInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  getContractAddress: () => string | undefined
  messages: (contractAddress: string) => TokenMergeMinterMessages | undefined
}

export function useTokenMergeMinterContract(): UseTokenMergeMinterContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [tokenMergeMinter, setTokenMergeMinter] = useState<TokenMergeMinterContract>()

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
      setTokenMergeMinter(contract)
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
        if (!tokenMergeMinter) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        tokenMergeMinter
          .instantiate(wallet.address || '', codeId, initMsg, label, admin)
          .then(resolve)
          .catch(reject)
      })
    },
    [tokenMergeMinter, wallet],
  )

  const migrate = useCallback(
    (contractAddress: string, codeId: number, migrateMsg: Record<string, unknown>): Promise<MigrateResponse> => {
      return new Promise((resolve, reject) => {
        if (!tokenMergeMinter) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        console.log(wallet.address, contractAddress, codeId)
        tokenMergeMinter
          .migrate(wallet.address || '', contractAddress, codeId, migrateMsg)
          .then(resolve)
          .catch(reject)
      })
    },
    [tokenMergeMinter, wallet],
  )

  const use = useCallback(
    (customAddress = ''): TokenMergeMinterInstance | undefined => {
      return tokenMergeMinter?.use(address || customAddress)
    },
    [tokenMergeMinter, address],
  )

  const getContractAddress = (): string | undefined => {
    return address
  }

  const messages = useCallback(
    (customAddress = ''): TokenMergeMinterMessages | undefined => {
      return tokenMergeMinter?.messages(address || customAddress)
    },
    [tokenMergeMinter, address],
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
