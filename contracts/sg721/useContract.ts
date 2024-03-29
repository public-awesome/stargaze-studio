import type { Coin } from '@cosmjs/proto-signing'
import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'utils/wallet'

import type { MigrateResponse, SG721Contract, SG721Instance, Sg721Messages } from './contract'
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
  migrate: (contractAddress: string, codeId: number, migrateMsg: Record<string, unknown>) => Promise<MigrateResponse>
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
    if (!wallet.isWalletConnected) {
      return
    }

    const load = async () => {
      const client = await wallet.getSigningCosmWasmClient()
      const contract = initContract(client, wallet.address || '')
      setSG721(contract)
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
        if (!SG721) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        SG721.instantiate(wallet.address || '', codeId, initMsg, label, admin)
          .then(resolve)
          .catch(reject)
      })
    },
    [SG721, wallet],
  )

  const migrate = useCallback(
    (contractAddress: string, codeId: number, migrateMsg: Record<string, unknown>): Promise<MigrateResponse> => {
      return new Promise((resolve, reject) => {
        if (!SG721) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        console.log(wallet.address, contractAddress, codeId)
        SG721.migrate(wallet.address || '', contractAddress, codeId, migrateMsg)
          .then(resolve)
          .catch(reject)
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

  const messages = useCallback(
    (customAddress = ''): Sg721Messages | undefined => {
      return SG721?.messages(address || customAddress)
    },
    [SG721, address],
  )

  return {
    instantiate,
    migrate,
    use,
    updateContractAddress,
    messages,
  }
}
