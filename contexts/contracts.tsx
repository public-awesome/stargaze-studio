import type { UseCW721BaseContractProps } from 'contracts/cw721/base'
import { useCW721BaseContract } from 'contracts/cw721/base'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import type { State } from 'zustand'
import create from 'zustand'

/**
 * Contracts store type definitions
 */
export interface ContractsStore extends State {
  cw721Base: UseCW721BaseContractProps | null
}

/**
 * Contracts store default values as a separate variable for reusability
 */
export const defaultValues: ContractsStore = {
 cw721Base: null,
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

/**
 * Contracts store subscriptions (side effects)
 *
 * TODO: refactor all contract logics to zustand store
 */
const ContractsSubscription = () => {
  const cw721Base = useCW721BaseContract()

  useEffect(() => {
    useContracts.setState({
      cw721Base,
    })
  }, [
    cw721Base,
    //
  ])

  return null
}
