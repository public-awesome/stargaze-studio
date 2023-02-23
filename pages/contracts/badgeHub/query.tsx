import clsx from 'clsx'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput, TextInput } from 'components/forms/FormInput'
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

import { BADGE_HUB_ADDRESS } from '../../../utils/constants'

const BadgeHubQueryPage: NextPage = () => {
  const { badgeHub: contract } = useContracts()
  const wallet = useWallet()

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Badge Hub Address',
    subtitle: 'Address of the Badge Hub contract',
    defaultValue: BADGE_HUB_ADDRESS,
  })
  const contractAddress = contractState.value

  const idState = useNumberInputState({
    id: 'id',
    name: 'id',
    title: 'ID',
    subtitle: 'The ID of the badge',
    defaultValue: 1,
  })

  const pubkeyState = useInputState({
    id: 'pubkey',
    name: 'pubkey',
    title: 'Public Key',
    subtitle: 'The public key to check whether it can be used to mint a badge',
  })

  const startAfterNumberState = useNumberInputState({
    id: 'start-after-number',
    name: 'start-after-number',
    title: 'Start After (optional)',
    subtitle: 'The id to start the pagination after',
  })

  const startAfterStringState = useInputState({
    id: 'start-after-string',
    name: 'start-after-string',
    title: 'Start After (optional)',
    subtitle: 'The public key to start the pagination after',
  })

  const paginationLimitState = useNumberInputState({
    id: 'pagination-limit',
    name: 'pagination-limit',
    title: 'Pagination Limit (optional)',
    subtitle: 'The number of items to return (max: 30)',
    defaultValue: 5,
  })

  const [type, setType] = useState<QueryType>('config')

  const { data: response } = useQuery(
    [
      contractAddress,
      type,
      contract,
      wallet,
      idState.value,
      pubkeyState.value,
      startAfterNumberState.value,
      startAfterStringState.value,
      paginationLimitState.value,
    ] as const,
    async ({ queryKey }) => {
      const [_contractAddress, _type, _contract, _wallet, id, pubkey, startAfterNumber, startAfterString, limit] =
        queryKey
      const messages = contract?.use(_contractAddress)
      const result = await dispatchQuery({
        id,
        pubkey,
        messages,
        type,
        startAfterNumber,
        startAfterString,
        limit,
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
      <NextSeo title="Query Badge Hub Contract" />
      <ContractPageHeader
        description="The Badge Hub contract dashboard is where event organizers create, mint, or edit badges."
        link={links.Documentation}
        title="Badge Hub Contract"
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
                <option key={`query-${id}`} className="mt-2 text-lg bg-[#1A1A1A]" value={id}>
                  {name}
                </option>
              ))}
            </select>
          </FormControl>
          <Conditional test={type === 'getBadge' || type === 'getKey'}>
            <NumberInput {...idState} />
          </Conditional>
          <Conditional test={type === 'getKey'}>
            <TextInput {...pubkeyState} />
          </Conditional>
          <Conditional test={type === 'getBadges'}>
            <NumberInput {...startAfterNumberState} />
          </Conditional>
          <Conditional test={type === 'getBadges' || type === 'getKeys'}>
            <NumberInput {...paginationLimitState} />
          </Conditional>
          <Conditional test={type === 'getKeys'}>
            <TextInput {...startAfterStringState} />
          </Conditional>
        </div>
        <JsonPreview content={contractAddress ? { type, response } : null} title="Query Response" />
      </div>
    </section>
  )
}

export default withMetadata(BadgeHubQueryPage, { center: false })
