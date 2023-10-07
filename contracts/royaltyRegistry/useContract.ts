/* eslint-disable eslint-comments/disable-enable-pair */

import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import type {
  InstantiateResponse,
  MigrateResponse,
  RoyaltyRegistryContract,
  RoyaltyRegistryInstance,
  RoyaltyRegistryMessages,
} from './contract'
import { RoyaltyRegistry as initContract } from './contract'

export interface UseRoyaltyRegistryContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>

  migrate: (contractAddress: string, codeId: number, migrateMsg: Record<string, unknown>) => Promise<MigrateResponse>

  use: (customAddress?: string) => RoyaltyRegistryInstance | undefined

  updateContractAddress: (contractAddress: string) => void

  messages: (contractAddress: string) => RoyaltyRegistryMessages | undefined
}

export function useRoyaltyRegistryContract(): UseRoyaltyRegistryContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [royaltyRegistry, setRoyaltyRegistry] = useState<RoyaltyRegistryContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    const royaltyRegistryContract = initContract(wallet.getClient(), wallet.address)
    setRoyaltyRegistry(royaltyRegistryContract)
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId: number, initMsg: Record<string, unknown>, label: string, admin?: string): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!royaltyRegistry) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        royaltyRegistry.instantiate(codeId, initMsg, label, admin).then(resolve).catch(reject)
      })
    },
    [royaltyRegistry],
  )

  const migrate = useCallback(
    (contractAddress: string, codeId: number, migrateMsg: Record<string, unknown>): Promise<MigrateResponse> => {
      return new Promise((resolve, reject) => {
        if (!royaltyRegistry) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        console.log(wallet.address, contractAddress, codeId)
        royaltyRegistry.migrate(wallet.address, contractAddress, codeId, migrateMsg).then(resolve).catch(reject)
      })
    },
    [royaltyRegistry, wallet],
  )

  const use = useCallback(
    (customAddress = ''): RoyaltyRegistryInstance | undefined => {
      return royaltyRegistry?.use(address || customAddress)
    },
    [royaltyRegistry, address],
  )

  const messages = useCallback(
    (customAddress = ''): RoyaltyRegistryMessages | undefined => {
      return royaltyRegistry?.messages(address || customAddress)
    },
    [royaltyRegistry, address],
  )

  return {
    instantiate,
    migrate,
    use,
    updateContractAddress,
    messages,
  }
}
