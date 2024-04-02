import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'utils/wallet'

import type {
  InstantiateResponse,
  WhiteListMerkleTreeContract,
  WhiteListMerkleTreeInstance,
  WhiteListMerkleTreeMessages,
} from './contract'
import { WhiteListMerkleTree as initContract } from './contract'

export interface UseWhiteListMerkleTreeContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>

  use: (customAddress?: string) => WhiteListMerkleTreeInstance | undefined

  updateContractAddress: (contractAddress: string) => void

  messages: (contractAddress: string) => WhiteListMerkleTreeMessages | undefined
}

export function useWhiteListMerkleTreeContract(): UseWhiteListMerkleTreeContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [whiteListMerkleTree, setWhiteListMerkleTree] = useState<WhiteListMerkleTreeContract>()

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
      setWhiteListMerkleTree(contract)
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
        if (!whiteListMerkleTree) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        whiteListMerkleTree.instantiate(codeId, initMsg, label, admin).then(resolve).catch(reject)
      })
    },
    [whiteListMerkleTree],
  )

  const use = useCallback(
    (customAddress = ''): WhiteListMerkleTreeInstance | undefined => {
      return whiteListMerkleTree?.use(address || customAddress)
    },
    [whiteListMerkleTree, address],
  )

  const messages = useCallback(
    (customAddress = ''): WhiteListMerkleTreeMessages | undefined => {
      return whiteListMerkleTree?.messages(address || customAddress)
    },
    [whiteListMerkleTree, address],
  )

  return {
    instantiate,
    use,
    updateContractAddress,
    messages,
  }
}
