import { useMinterContract, UseMinterContractProps } from 'contracts/minter'
import { useSG721Contract, UseSG721ContractProps } from 'contracts/sg721'
import {
  useWhiteListContract,
  useWhiteListContractProps,
} from 'contracts/whitelist'

import { Fragment, ReactNode, useEffect, VFC } from 'react'
import create, { State } from 'zustand'


/**
 * Contracts store type definitions
 */
export interface ContractsStore extends State {
  sg721: UseSG721ContractProps | null
  minter: UseMinterContractProps | null
  whitelist: useWhiteListContractProps | null
}

/**
 * Contracts store default values as a separate variable for reusability
 */
export const defaultValues: ContractsStore = {
  sg721: null,
  minter: null,
  whitelist: null,
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
    <Fragment>
      {children}
      <ContractsSubscription />
    </Fragment>
  )
}

/**
 * Contracts store subscriptions (side effects)
 *
 * @todo refactor all contract logics to zustand store
 */
const ContractsSubscription: VFC = () => {
  const sg721 = useSG721Contract()
  const minter = useMinterContract()
  const whitelist = useWhiteListContract()


  useEffect(() => {
    useContracts.setState({
      sg721,
      minter,
      whitelist,
    })
  }, [
    sg721,
    minter,
    whitelist,
  ])

  return null
}
