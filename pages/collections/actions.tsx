import { CollectionActions } from 'components/collections/actions/Action'
import { CollectionQueries } from 'components/collections/queries/Queries'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const CollectionActionsPage: NextPage = () => {
  const { minter: minterContract, sg721: sg721Contract } = useContracts()
  const wallet = useWallet()

  const [action, setAction] = useState<boolean>(true)

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
              <div className="ml-2 form-check form-check-inline">
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
            </div>
            <div>{(action && <CollectionActions />) || <CollectionQueries />}</div>
          </div>
        </div>
      </form>
    </section>
  )
}

export default withMetadata(CollectionActionsPage, { center: false })
