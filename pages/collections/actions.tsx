import { CollectionActions } from 'components/collections/actions/Action'
import { CollectionQueries } from 'components/collections/queries/Queries'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useMemo, useState } from 'react'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const CollectionActionsPage: NextPage = () => {
  const { vendingMinter: vendingMinterContract, sg721: sg721Contract } = useContracts()
  const wallet = useWallet()

  const [action, setAction] = useState<boolean>(false)

  const sg721ContractState = useInputState({
    id: 'sg721-contract-address',
    name: 'sg721-contract-address',
    title: 'Sg721 Address',
    subtitle: 'Address of the Sg721 contract',
  })

  const minterContractState = useInputState({
    id: 'minter-contract-address',
    name: 'minter-contract-address',
    title: 'Minter Address',
    subtitle: 'Address of the Minter contract',
  })

  const vendingMinterMessages = useMemo(
    () => vendingMinterContract?.use(minterContractState.value),
    [vendingMinterContract, minterContractState.value],
  )
  const sg721Messages = useMemo(
    () => sg721Contract?.use(sg721ContractState.value),
    [sg721Contract, sg721ContractState.value],
  )

  const sg721ContractAddress = sg721ContractState.value
  const minterContractAddress = minterContractState.value

  const router = useRouter()

  useEffect(() => {
    if (minterContractAddress.length > 0 && sg721ContractAddress.length === 0) {
      void router.replace({ query: { minterContractAddress } })
    }
    if (sg721ContractAddress.length > 0 && minterContractAddress.length === 0) {
      void router.replace({ query: { sg721ContractAddress } })
    }
    if (sg721ContractAddress.length > 0 && minterContractAddress.length > 0) {
      void router.replace({ query: { sg721ContractAddress, minterContractAddress } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sg721ContractAddress, minterContractAddress])

  useEffect(() => {
    const initialMinter = new URL(document.URL).searchParams.get('minterContractAddress')
    const initialSg721 = new URL(document.URL).searchParams.get('sg721ContractAddress')
    if (initialMinter && initialMinter.length > 0) minterContractState.onChange(initialMinter)
    if (initialSg721 && initialSg721.length > 0) sg721ContractState.onChange(initialSg721)
  }, [])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Collection Actions" />
      <ContractPageHeader
        description="Here you can execute various actions on a collection."
        link={links.Documentation}
        title="Collection Actions"
      />

      <form className="p-4">
        <div className="grid grid-cols-2">
          <AddressInput {...sg721ContractState} className="mr-2" />
          <AddressInput {...minterContractState} />
        </div>
        <div className="mt-4">
          <div className="mr-2">
            <div className="flex justify-items-start font-bold">
              <div className="form-check form-check-inline">
                <input
                  checked={!action}
                  className="peer sr-only"
                  id="inlineRadio4"
                  name="inlineRadioOptions4"
                  onClick={() => {
                    setAction(false)
                  }}
                  type="radio"
                  value="false"
                />
                <label
                  className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                  htmlFor="inlineRadio4"
                >
                  Queries
                </label>
              </div>
              <div className="ml-2 form-check form-check-inline">
                <input
                  checked={action}
                  className="peer sr-only"
                  id="inlineRadio3"
                  name="inlineRadioOptions3"
                  onClick={() => {
                    setAction(true)
                  }}
                  type="radio"
                  value="true"
                />
                <label
                  className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                  htmlFor="inlineRadio3"
                >
                  Actions
                </label>
              </div>
            </div>
            <div>
              {(action && (
                <CollectionActions
                  minterContractAddress={minterContractState.value}
                  minterMessages={vendingMinterMessages}
                  sg721ContractAddress={sg721ContractState.value}
                  sg721Messages={sg721Messages}
                />
              )) || (
                <CollectionQueries
                  minterContractAddress={minterContractState.value}
                  minterMessages={vendingMinterMessages}
                  sg721ContractAddress={sg721ContractState.value}
                  sg721Messages={sg721Messages}
                />
              )}
            </div>
          </div>
        </div>
      </form>
    </section>
  )
}

export default withMetadata(CollectionActionsPage, { center: false })
