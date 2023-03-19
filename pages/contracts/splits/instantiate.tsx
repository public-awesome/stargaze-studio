import { toBase64, toUtf8 } from '@cosmjs/encoding'
import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput } from 'components/forms/FormInput'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { splitsLinkTabs } from 'components/LinkTabs.data'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { InstantiateResponse } from 'contracts/sg721'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { type FormEvent, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { isValidAddress } from 'utils/isValidAddress'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

import { useInputState } from '../../../components/forms/FormInput.hooks'
import type { Attribute } from '../../../components/forms/MemberAttributes'
import { MemberAttributes } from '../../../components/forms/MemberAttributes'
import { useMemberAttributesState } from '../../../components/forms/MemberAttributes.hooks'
import { CW4_GROUP_CODE_ID, SPLITS_CODE_ID } from '../../../utils/constants'
import { resolveAddress } from '../../../utils/resolveAddress'

export type CW4Method = 'new' | 'existing'

const SplitsInstantiatePage: NextPage = () => {
  const wallet = useWallet()
  const { splits: contract } = useContracts()
  const [members, setMembers] = useState<Attribute[]>([])
  const [cw4Method, setCw4Method] = useState<CW4Method>('new')

  const cw4GroupAddressState = useInputState({
    id: 'cw4-group-address',
    name: 'cw4-group-address',
    title: 'CW4 Group Address',
    subtitle: 'Address of the CW4 Group contract',
    placeholder: 'stars1...',
  })

  const splitsAdminState = useInputState({
    id: 'splits-admin',
    name: 'splits-admin',
    title: 'Splits Contract Admin',
    subtitle: 'Address of the Splits Contract administrator',
    defaultValue: wallet.address,
  })

  const cw4GroupAdminState = useInputState({
    id: 'cw4-group-admin',
    name: 'cw4-group-admin',
    title: 'CW4 Group Admin',
    subtitle: 'Address of the CW4 Group administrator',
    defaultValue: wallet.address,
  })

  const memberListState = useMemberAttributesState()

  useEffect(() => {
    memberListState.reset()
    memberListState.add({
      address: '',
      weight: 0,
    })
  }, [])

  const { data, isLoading, mutate } = useMutation(
    async (event: FormEvent): Promise<InstantiateResponse | null> => {
      event.preventDefault()
      if (!contract) {
        throw new Error('Smart contract connection failed')
      }
      const msg =
        cw4Method === 'existing'
          ? { admin: splitsAdminState.value, group: { cw4_address: cw4GroupAddressState.value } }
          : {
              admin: splitsAdminState.value ? splitsAdminState.value : undefined,
              group: {
                cw4_instantiate: {
                  code_id: CW4_GROUP_CODE_ID,
                  label: 'cw4-group',
                  msg: toBase64(
                    toUtf8(
                      JSON.stringify({
                        admin: cw4GroupAdminState.value ? cw4GroupAdminState.value : undefined,
                        members: [
                          ...new Set(
                            members
                              .filter(
                                (member) =>
                                  member.address !== '' &&
                                  member.weight > 0 &&
                                  isValidAddress(member.address) &&
                                  member.address.startsWith('stars'),
                              )
                              .map((member) => ({ addr: member.address, weight: member.weight })),
                          ),
                        ],
                      }),
                    ),
                  ),
                },
              },
            }
      return toast.promise(contract.instantiate(SPLITS_CODE_ID, msg, 'Stargaze Splits Contract', wallet.address), {
        loading: 'Instantiating contract...',
        error: 'Instantiation failed!',
        success: 'Instantiation success!',
      })
    },
    {
      onError: (error) => {
        toast.error(String(error), { style: { maxWidth: 'none' } })
      },
    },
  )

  const resolveMemberAddresses = () => {
    const tempMembers: Attribute[] = []
    memberListState.values.map(async (member) => {
      await resolveAddress(member.address.trim(), wallet).then((resolvedAddress) => {
        tempMembers.push({ address: resolvedAddress, weight: member.weight })
      })
    })
    setMembers(tempMembers)
    console.log('Members:', members)
  }

  useEffect(() => {
    resolveMemberAddresses()
  }, [memberListState.values])

  return (
    <form className="py-6 px-12 space-y-4" onSubmit={mutate}>
      <NextSeo title="Instantiate Splits Contract" />
      <ContractPageHeader
        description="Splits contract distributes funds to a cw4-group based on their weights."
        link={links.Documentation}
        title="Splits Contract"
      />
      <LinkTabs activeIndex={0} data={splitsLinkTabs} />

      <Conditional test={Boolean(data)}>
        <Alert type="info">
          <b>Instantiate success!</b> Here is the transaction result containing the contract address and the transaction
          hash.
        </Alert>
        <JsonPreview content={data} title="Transaction Result" />
        <br />
      </Conditional>

      <div className="justify-items-start mb-3 flex-column">
        <div className="flex">
          <div className="mt-3 ml-4 font-bold form-check form-check-inline">
            <input
              checked={cw4Method === 'new'}
              className="peer sr-only"
              id="inlineRadio2"
              name="inlineRadioOptions2"
              onClick={() => {
                setCw4Method('new')
              }}
              type="radio"
              value="New"
            />
            <label
              className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black peer-checked:border-b-2 hover:border-b-2  peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
              htmlFor="inlineRadio2"
            >
              New CW4 Group Contract
            </label>
          </div>
          <div className="mt-3 ml-2 font-bold form-check form-check-inline">
            <input
              checked={cw4Method === 'existing'}
              className="peer sr-only"
              id="inlineRadio1"
              name="inlineRadioOptions1"
              onClick={() => {
                setCw4Method('existing')
              }}
              type="radio"
              value="Existing"
            />
            <label
              className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black peer-checked:border-b-2 hover:border-b-2  peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
              htmlFor="inlineRadio1"
            >
              Use an existing CW4 Group Contract
            </label>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <AddressInput className="mt-2 ml-4 w-full" {...splitsAdminState} />
          <Conditional test={cw4Method === 'new'}>
            <AddressInput className="mt-2 ml-4 w-full" {...cw4GroupAdminState} />
          </Conditional>
          <Conditional test={cw4Method === 'existing'}>
            <AddressInput className="mt-2 ml-4 w-full" {...cw4GroupAddressState} />
          </Conditional>
        </div>
        <div>
          <Conditional test={cw4Method === 'new'}>
            <div className="ml-4 w-full">
              <MemberAttributes
                attributes={memberListState.entries}
                onAdd={memberListState.add}
                onChange={memberListState.update}
                onRemove={memberListState.remove}
                title="Members"
              />
            </div>
          </Conditional>
        </div>
      </div>

      <div className="flex items-center p-4">
        <div className="flex-grow" />
        <Button isLoading={isLoading} isWide rightIcon={<FaAsterisk />} type="submit">
          Instantiate Contract
        </Button>
      </div>
    </form>
  )
}

export default withMetadata(SplitsInstantiatePage, { center: false })
