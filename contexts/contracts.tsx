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
import { type UseTokenMergeFactoryContractProps, useTokenMergeFactoryContract } from 'contracts/tokenMergeFactory'
import { type UseTokenMergeMinterContractProps, useTokenMergeMinterContract } from 'contracts/tokenMergeMinter'
import type { UseVendingFactoryContractProps } from 'contracts/vendingFactory'
import { useVendingFactoryContract } from 'contracts/vendingFactory'
import type { UseVendingMinterContractProps } from 'contracts/vendingMinter'
import { useVendingMinterContract } from 'contracts/vendingMinter'
import type { UseWhiteListContractProps } from 'contracts/whitelist'
import { useWhiteListContract } from 'contracts/whitelist'
import { type UseWhiteListMerkleTreeContractProps, useWhiteListMerkleTreeContract } from 'contracts/whitelistMerkleTree'
import type { ReactNode, VFC } from 'react'
import { Fragment, useEffect } from 'react'
import { create } from 'zustand'

import type { UseSplitsContractProps } from '../contracts/splits/useContract'
import { useSplitsContract } from '../contracts/splits/useContract'

/**
 * Contracts store type definitions
 */
export interface ContractsStore {
  sg721: UseSG721ContractProps | null
  vendingMinter: UseVendingMinterContractProps | null
  tokenMergeMinter: UseTokenMergeMinterContractProps | null
  baseMinter: UseBaseMinterContractProps | null
  openEditionMinter: UseOpenEditionMinterContractProps | null
  whitelist: UseWhiteListContractProps | null
  whitelistMerkleTree: UseWhiteListMerkleTreeContractProps | null
  vendingFactory: UseVendingFactoryContractProps | null
  tokenMergeFactory: UseTokenMergeFactoryContractProps | null
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
  tokenMergeMinter: null,
  baseMinter: null,
  openEditionMinter: null,
  whitelist: null,
  whitelistMerkleTree: null,
  vendingFactory: null,
  tokenMergeFactory: null,
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
  const tokenMergeMinter = useTokenMergeMinterContract()
  const baseMinter = useBaseMinterContract()
  const openEditionMinter = useOpenEditionMinterContract()
  const whitelist = useWhiteListContract()
  const whitelistMerkleTree = useWhiteListMerkleTreeContract()
  const vendingFactory = useVendingFactoryContract()
  const tokenMergeFactory = useTokenMergeFactoryContract()
  const baseFactory = useBaseFactoryContract()
  const openEditionFactory = useOpenEditionFactoryContract()
  const badgeHub = useBadgeHubContract()
  const splits = useSplitsContract()
  const royaltyRegistry = useRoyaltyRegistryContract()

  useEffect(() => {
    useContracts.setState({
      sg721,
      vendingMinter,
      tokenMergeMinter,
      baseMinter,
      openEditionMinter,
      whitelist,
      whitelistMerkleTree,
      vendingFactory,
      tokenMergeFactory,
      baseFactory,
      openEditionFactory,
      badgeHub,
      splits,
      royaltyRegistry,
    })
  }, [
    sg721,
    vendingMinter,
    tokenMergeMinter,
    baseMinter,
    whitelist,
    whitelistMerkleTree,
    vendingFactory,
    tokenMergeFactory,
    baseFactory,
    badgeHub,
    splits,
    royaltyRegistry,
    openEditionMinter,
    openEditionFactory,
  ])

  return null
}
