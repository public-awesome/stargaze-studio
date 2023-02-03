import clsx from 'clsx'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { badgeHubLinkTabs } from 'components/LinkTabs.data'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { QueryType } from 'contracts/badgeHub/messages/query'
import { dispatchQuery, QUERY_LIST } from 'contracts/badgeHub/messages/query'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useQuery } from 'react-query'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const BadgeHubQueryPage: NextPage = () => {
  const { badgeHub: contract } = useContracts()
  const wallet = useWallet()

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Badge Hub Address',
    subtitle: 'Address of the Badge Hub contract',
  })
  const contractAddress = contractState.value

  const idState = useNumberInputState({
    id: 'id',
    name: 'id',
    title: 'ID',
    subtitle: 'The ID of the badge',
  })

  const pubkeyState = useInputState({
    id: 'pubkey',
    name: 'pubkey',
    title: 'Pubkey',
    subtitle: 'The public key for the badge',
  })

  const [type, setType] = useState<QueryType>('config')

  const { data: response } = useQuery(
    [contractAddress, type, contract, wallet, idState.value, pubkeyState.value] as const,
    async ({ queryKey }) => {
      const [_contractAddress, _type, _contract, _wallet, id, pubkey] = queryKey
      const messages = contract?.use(_contractAddress)
      const result = await dispatchQuery({
        id,
        pubkey,
        messages,
        type,
      })
      return result
    },
    {
      placeholderData: null,
      onError: (error: any) => {
        toast.error(error.message, { style: { maxWidth: 'none' } })
      },
      enabled: Boolean(contractAddress && contract && wallet),
    },
  )

  const router = useRouter()

  useEffect(() => {
    if (contractAddress.length > 0) {
      void router.replace({ query: { contractAddress } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress])
  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('contractAddress')
    if (initial && initial.length > 0) contractState.onChange(initial)
  }, [])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Query Vending Minter Contract" />
      <ContractPageHeader
        description="Vending Minter contract facilitates primary market vending machine style minting."
        link={links.Documentation}
        title="Vending Minter Contract"
      />
      <LinkTabs activeIndex={1} data={badgeHubLinkTabs} />

      <div className="grid grid-cols-2 p-4 space-x-8">
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <FormControl htmlId="contract-query-type" subtitle="Type of query to be dispatched" title="Query Type">
            <select
              className={clsx(
                'bg-white/10 rounded border-2 border-white/20 form-select',
                'placeholder:text-white/50',
                'focus:ring focus:ring-plumbus-20',
              )}
              id="contract-query-type"
              name="query-type"
              onChange={(e) => setType(e.target.value as QueryType)}
            >
              {QUERY_LIST.map(({ id, name }) => (
                <option key={`query-${id}`} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </FormControl>
          <Conditional test={type === 'getBadge'}>
            <NumberInput {...idState} />
          </Conditional>
        </div>
        <JsonPreview content={contractAddress ? { type, response } : null} title="Query Response" />
      </div>
    </section>
  )
}

export default withMetadata(BadgeHubQueryPage, { center: false })
