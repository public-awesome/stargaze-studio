import type { UseBadgeHubContractProps } from 'contracts/badgeHub'
import { useBadgeHubContract } from 'contracts/badgeHub'
import type { UseBaseFactoryContractProps } from 'contracts/baseFactory'
import { useBaseFactoryContract } from 'contracts/baseFactory'
import type { UseBaseMinterContractProps } from 'contracts/baseMinter'
import { useBaseMinterContract } from 'contracts/baseMinter'
import { type UseOpenEditionFactoryContractProps, useOpenEditionFactoryContract } from 'contracts/openEditionFactory'
import { type UseOpenEditionMinterContractProps, useOpenEditionMinterContract } from 'contracts/openEditionMinter'
import type { UseRoyaltyRegistryContractProps } from 'contracts/royaltyRegistry'
import { useRoyaltyRegistryContract } from 'contracts/royaltyRegistry'
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

import type { UseSplitsContractProps } from '../contracts/splits/useContract'
import { useSplitsContract } from '../contracts/splits/useContract'

/**
 * Contracts store type definitions
 */
export interface ContractsStore extends State {
  sg721: UseSG721ContractProps | null
  vendingMinter: UseVendingMinterContractProps | null
  baseMinter: UseBaseMinterContractProps | null
  openEditionMinter: UseOpenEditionMinterContractProps | null
  whitelist: UseWhiteListContractProps | null
  vendingFactory: UseVendingFactoryContractProps | null
  baseFactory: UseBaseFactoryContractProps | null
  openEditionFactory: UseOpenEditionFactoryContractProps | null
  badgeHub: UseBadgeHubContractProps | null
  splits: UseSplitsContractProps | null
  royaltyRegistry: UseRoyaltyRegistryContractProps | null
}

/**
 * Contracts store default values as a separate variable for reusability
 */
export const defaultValues: ContractsStore = {
  sg721: null,
  vendingMinter: null,
  baseMinter: null,
  openEditionMinter: null,
  whitelist: null,
  vendingFactory: null,
  baseFactory: null,
  openEditionFactory: null,
  badgeHub: null,
  splits: null,
  royaltyRegistry: null,
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
  const openEditionMinter = useOpenEditionMinterContract()
  const whitelist = useWhiteListContract()
  const vendingFactory = useVendingFactoryContract()
  const baseFactory = useBaseFactoryContract()
  const openEditionFactory = useOpenEditionFactoryContract()
  const badgeHub = useBadgeHubContract()
  const splits = useSplitsContract()
  const royaltyRegistry = useRoyaltyRegistryContract()

  useEffect(() => {
    useContracts.setState({
      sg721,
      vendingMinter,
      baseMinter,
      openEditionMinter,
      whitelist,
      vendingFactory,
      baseFactory,
      openEditionFactory,
      badgeHub,
      splits,
      royaltyRegistry,
    })
  }, [sg721, vendingMinter, baseMinter, whitelist, vendingFactory, baseFactory, badgeHub, splits, royaltyRegistry])

  return null
}
