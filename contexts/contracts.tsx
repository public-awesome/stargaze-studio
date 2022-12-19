import type { UseBaseFactoryContractProps } from 'contracts/baseFactory'
import { useBaseFactoryContract } from 'contracts/baseFactory'
import type { UseBaseMinterContractProps } from 'contracts/baseMinter'
import { useBaseMinterContract } from 'contracts/baseMinter'
import type { UseSG721ContractProps } from 'contracts/sg721'
import { useSG721Contract } from 'contracts/sg721'
import type { UseVendingFactoryContractProps } from 'contracts/vendingFactory'
import { useVendingFactoryContract } from 'contracts/vendingFactory'
import type { UseVendingMinterContractProps } from 'contracts/vendingMinter'
import { useVendingMinterContract } from 'contracts/vendingMinter'
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
  vendingMinter: UseVendingMinterContractProps | null
  baseMinter: UseBaseMinterContractProps | null
  whitelist: UseWhiteListContractProps | null
  vendingFactory: UseVendingFactoryContractProps | null
  baseFactory: UseBaseFactoryContractProps | null
}

/**
 * Contracts store default values as a separate variable for reusability
 */
export const defaultValues: ContractsStore = {
  sg721: null,
  vendingMinter: null,
  baseMinter: null,
  whitelist: null,
  vendingFactory: null,
  baseFactory: null,
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
  const vendingMinter = useVendingMinterContract()
  const baseMinter = useBaseMinterContract()
  const whitelist = useWhiteListContract()
  const vendingFactory = useVendingFactoryContract()
  const baseFactory = useBaseFactoryContract()

  useEffect(() => {
    useContracts.setState({
      sg721,
      vendingMinter,
      baseMinter,
      whitelist,
      vendingFactory,
      baseFactory,
    })
  }, [sg721, vendingMinter, baseMinter, whitelist, vendingFactory, baseFactory])

  return null
}
