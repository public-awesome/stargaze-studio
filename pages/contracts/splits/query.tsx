import clsx from 'clsx'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput, TextInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { splitsLinkTabs } from 'components/LinkTabs.data'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { QueryType } from 'contracts/splits/messages/query'
import { dispatchQuery, QUERY_LIST } from 'contracts/splits/messages/query'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useQuery } from 'react-query'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { resolveAddress } from 'utils/resolveAddress'

const SplitsQueryPage: NextPage = () => {
  const { splits: contract } = useContracts()
  const wallet = useWallet()

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Splits Address',
    subtitle: 'Address of the Splits contract',
  })
  const contractAddress = contractState.value

  const memberAddressState = useInputState({
    id: 'member-address',
    name: 'member-address',
    title: 'Member Address',
    subtitle: 'Member address to query the weight for',
  })

  const memberAddress = memberAddressState.value

  const startAfterStringState = useInputState({
    id: 'start-after-string',
    name: 'start-after-string',
    title: 'Start After (optional)',
    subtitle: 'The member address to start the pagination after',
  })

  const paginationLimitState = useNumberInputState({
    id: 'pagination-limit',
    name: 'pagination-limit',
    title: 'Pagination Limit (optional)',
    subtitle: 'The number of items to return (max: 30)',
    defaultValue: 5,
  })

  const [type, setType] = useState<QueryType>('list_members')

  const { data: response } = useQuery(
    [
      contractAddress,
      type,
      contract,
      wallet,
      memberAddress,
      startAfterStringState.value,
      paginationLimitState.value,
    ] as const,
    async ({ queryKey }) => {
      const [_contractAddress, _type, _contract, _wallet, _memberAddress, startAfter, limit] = queryKey
      const messages = contract?.use(contractAddress)
      const res = await resolveAddress(_memberAddress, wallet).then(async (resolvedAddress) => {
        const result = await dispatchQuery({
          messages,
          type,
          address: resolvedAddress,
          startAfter: startAfter.length > 0 ? startAfter : undefined,
          limit: limit > 0 ? limit : undefined,
        })
        return result
      })
      return res
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
      <NextSeo title="Query Splits Contract" />
      <ContractPageHeader
        description="Splits contract distributes funds to a cw4-group based on member weights."
        link={links.Documentation}
        title="Splits Contract"
      />
      <LinkTabs activeIndex={1} data={splitsLinkTabs} />

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
              defaultValue="config"
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
          <Conditional test={type === 'member'}>
            <AddressInput {...memberAddressState} />
          </Conditional>

          <Conditional test={type === 'list_members'}>
            <TextInput {...startAfterStringState} />
            <NumberInput {...paginationLimitState} />
          </Conditional>
        </div>
        <JsonPreview content={contractAddress ? { type, response } : null} title="Query Response" />
      </div>
    </section>
  )
}

export default withMetadata(SplitsQueryPage, { center: false })
