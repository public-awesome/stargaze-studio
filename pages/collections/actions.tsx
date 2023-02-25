import { toUtf8 } from '@cosmjs/encoding'
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
import toast from 'react-hot-toast'
import { useDebounce } from 'utils/debounce'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

import type { MinterType, Sg721Type } from '../../components/collections/actions/Combobox'

const CollectionActionsPage: NextPage = () => {
  const { baseMinter: baseMinterContract, vendingMinter: vendingMinterContract, sg721: sg721Contract } = useContracts()
  const wallet = useWallet()

  const [action, setAction] = useState<boolean>(false)
  const [minterType, setMinterType] = useState<MinterType>('vending')
  const [sg721Type, setSg721Type] = useState<Sg721Type>('updatable')

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

  const debouncedMinterContractState = useDebounce(minterContractState.value, 300)
  const debouncedSg721ContractState = useDebounce(sg721ContractState.value, 300)

  const vendingMinterMessages = useMemo(
    () => vendingMinterContract?.use(minterContractState.value),
    [vendingMinterContract, minterContractState.value],
  )
  const baseMinterMessages = useMemo(
    () => baseMinterContract?.use(minterContractState.value),
    [baseMinterContract, minterContractState.value],
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

  useEffect(() => {
    async function getMinterContractType() {
      if (wallet.client && debouncedMinterContractState.length > 0) {
        const client = wallet.client
        const data = await toast.promise(
          client.queryContractRaw(
            debouncedMinterContractState,
            toUtf8(Buffer.from(Buffer.from('contract_info').toString('hex'), 'hex').toString()),
          ),
          {
            loading: 'Retrieving minter type...',
            error: 'Minter type retrieval failed.',
            success: 'Minter type retrieved.',
          },
        )
        const contract: string = JSON.parse(new TextDecoder().decode(data as Uint8Array)).contract
        console.log(contract)
        return contract
      }
    }
    void getMinterContractType()
      .then((contract) => {
        if (contract?.includes('sg-base-minter')) {
          setMinterType('base')
        } else {
          setMinterType('vending')
        }
      })
      .catch((err) => {
        console.log(err)
        setMinterType('vending')
        console.log('Unable to retrieve contract type. Defaulting to "vending".')
      })
  }, [debouncedMinterContractState, wallet.client])

  useEffect(() => {
    async function getSg721ContractType() {
      if (wallet.client && debouncedSg721ContractState.length > 0) {
        const client = wallet.client
        const data = await toast.promise(
          client.queryContractRaw(
            debouncedSg721ContractState,
            toUtf8(Buffer.from(Buffer.from('contract_info').toString('hex'), 'hex').toString()),
          ),
          {
            loading: 'Retrieving SG721 type...',
            error: 'SG721 type retrieval failed.',
            success: 'SG721 type retrieved.',
          },
        )
        const contract: string = JSON.parse(new TextDecoder().decode(data as Uint8Array)).contract
        console.log(contract)
        return contract
      }
    }
    void getSg721ContractType()
      .then((contract) => {
        if (contract?.includes('sg721-updatable')) {
          setSg721Type('updatable')
        } else {
          setSg721Type('base')
        }
      })
      .catch((err) => {
        console.log(err)
        setMinterType('base')
        console.log('Unable to retrieve contract type. Defaulting to "base".')
      })
  }, [debouncedSg721ContractState, wallet.client])

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
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                <CollectionActions
                  baseMinterMessages={baseMinterMessages}
                  minterContractAddress={minterContractState.value}
                  minterType={minterType}
                  sg721ContractAddress={sg721ContractState.value}
                  sg721Messages={sg721Messages}
                  sg721Type={sg721Type}
                  vendingMinterMessages={vendingMinterMessages}
                />
              )) || (
                <CollectionQueries
                  baseMinterMessages={baseMinterMessages}
                  minterContractAddress={minterContractState.value}
                  minterType={minterType}
                  sg721ContractAddress={sg721ContractState.value}
                  sg721Messages={sg721Messages}
                  vendingMinterMessages={vendingMinterMessages}
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
