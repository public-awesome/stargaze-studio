import type { Coin } from '@cosmjs/proto-signing'
import type { logs } from '@cosmjs/stargate'
import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'utils/wallet'

import type {
  MigrateResponse,
  OpenEditionMinterContract,
  OpenEditionMinterInstance,
  OpenEditionMinterMessages,
} from './contract'
import { openEditionMinter as initContract } from './contract'

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

export interface UseOpenEditionMinterContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
    funds?: Coin[],
  ) => Promise<InstantiateResponse>
  migrate: (contractAddress: string, codeId: number, migrateMsg: Record<string, unknown>) => Promise<MigrateResponse>
  use: (customAddress: string) => OpenEditionMinterInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  getContractAddress: () => string | undefined
  messages: (contractAddress: string) => OpenEditionMinterMessages | undefined
}

export function useOpenEditionMinterContract(): UseOpenEditionMinterContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [openEditionMinter, setOpenEditionMinter] = useState<OpenEditionMinterContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    if (!wallet.isWalletConnected) {
      return
    }

    const load = async () => {
      const client = await wallet.getSigningCosmWasmClient()
      const OpenEditionMinterBaseContract = initContract(client, wallet.address || '')
      setOpenEditionMinter(OpenEditionMinterBaseContract)
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
        if (!openEditionMinter) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        openEditionMinter
          .instantiate(wallet.address || '', codeId, initMsg, label, admin)
          .then(resolve)
          .catch(reject)
      })
    },
    [openEditionMinter, wallet],
  )

  const migrate = useCallback(
    (contractAddress: string, codeId: number, migrateMsg: Record<string, unknown>): Promise<MigrateResponse> => {
      return new Promise((resolve, reject) => {
        if (!openEditionMinter) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        console.log(wallet.address, contractAddress, codeId)
        openEditionMinter
          .migrate(wallet.address || '', contractAddress, codeId, migrateMsg)
          .then(resolve)
          .catch(reject)
      })
    },
    [openEditionMinter, wallet],
  )

  const use = useCallback(
    (customAddress = ''): OpenEditionMinterInstance | undefined => {
      return openEditionMinter?.use(address || customAddress)
    },
    [openEditionMinter, address],
  )

  const getContractAddress = (): string | undefined => {
    return address
  }

  const messages = useCallback(
    (customAddress = ''): OpenEditionMinterMessages | undefined => {
      return openEditionMinter?.messages(address || customAddress)
    },
    [openEditionMinter, address],
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
