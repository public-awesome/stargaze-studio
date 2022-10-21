import type { UseMinterContractProps } from 'contracts/minter'
import { useMinterContract } from 'contracts/minter'
import type { UseSG721ContractProps } from 'contracts/sg721'
import { useSG721Contract } from 'contracts/sg721'
import type { UseVendingFactoryContractProps } from 'contracts/vendingFactory'
import { useVendingFactoryContract } from 'contracts/vendingFactory'
import type { UseWhiteListContractProps } from 'contracts/whitelist'
import { useWhiteListContract } from 'contracts/whitelist'
import type { ReactNode, VFC } from 'react'
import { Fragment, useEffect } from 'react'
import type { State } from 'zustand'
import create from 'zustand'

/**
 * Contracts store type definitions
 */
export interface ContractsStore extends State {
  sg721: UseSG721ContractProps | null
  minter: UseMinterContractProps | null
  whitelist: UseWhiteListContractProps | null
  vendingFactory: UseVendingFactoryContractProps | null
}

/**
 * Contracts store default values as a separate variable for reusability
 */
export const defaultValues: ContractsStore = {
  sg721: null,
  minter: null,
  whitelist: null,
  vendingFactory: null,
}

/**
 * Entrypoint for contracts store using {@link defaultValues}
 */
export const useContracts = create<ContractsStore>(() => ({
  ...defaultValues,
}))

/**
 * Contracts store provider to easily mount {@link ContractsSubscription}
 * to listen/subscribe to contract changes
 */
export const ContractsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <ContractsSubscription />
    </>
  )
}

const ContractsSubscription: VFC = () => {
  const sg721 = useSG721Contract()
  const minter = useMinterContract()
  const whitelist = useWhiteListContract()
  const vendingFactory = useVendingFactoryContract()

  useEffect(() => {
    useContracts.setState({
      sg721,
      minter,
      whitelist,
      vendingFactory,
    })
  }, [sg721, minter, whitelist, vendingFactory])

  return null
}
