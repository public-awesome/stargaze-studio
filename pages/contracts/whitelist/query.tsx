/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { toUtf8 } from '@cosmjs/encoding'
import clsx from 'clsx'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput, TextInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { whitelistLinkTabs } from 'components/LinkTabs.data'
import { useContracts } from 'contexts/contracts'
import type { QueryType } from 'contracts/whitelist/messages/query'
import { dispatchQuery, QUERY_LIST } from 'contracts/whitelist/messages/query'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useQuery } from 'react-query'
import { useDebounce } from 'utils/debounce'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { resolveAddress } from 'utils/resolveAddress'
import { useWallet } from 'utils/wallet'

const WhitelistQueryPage: NextPage = () => {
  const { whitelist: contract } = useContracts()
  const wallet = useWallet()
  const [exporting, setExporting] = useState(false)

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Whitelist Address',
    subtitle: 'Address of the Whitelist contract',
  })
  const contractAddress = contractState.value

  const addressState = useInputState({
    id: 'address',
    name: 'address',
    title: 'Address',
    subtitle: 'Address of the user - defaults to current address',
  })
  const address = addressState.value

  const limit = useNumberInputState({
    id: 'limit',
    name: 'limit',
    title: 'Limit',
    subtitle: 'Maximum number of addresses to return',
    defaultValue: 20,
  })

  const debouncedLimit = useDebounce(limit.value, 500)

  const startAfter = useInputState({
    id: 'start-after',
    name: 'start-after',
    title: 'Start After',
    subtitle: 'Address to start after',
  })

  useEffect(() => {
    if (debouncedLimit > 100) {
      toast.success('Only 100 addresses can be returned at a time even if the limit is higher.', {
        style: { maxWidth: 'none' },
        icon: '📝',
        duration: 5000,
      })
    }
  }, [debouncedLimit])

  const [type, setType] = useState<QueryType>('config')

  const addressVisible = type === 'has_member'

  const { data: response } = useQuery(
    [contractAddress, type, contract, wallet.address, address, startAfter.value, limit.value] as const,
    async ({ queryKey }) => {
      const [_contractAddress, _type, _contract, _wallet, _address, _startAfter, _limit] = queryKey
      const messages = contract?.use(contractAddress)
      const res = await resolveAddress(_address, wallet).then(async (resolvedAddress) => {
        const result = await dispatchQuery({
          messages,
          type,
          address: resolvedAddress,
          startAfter: _startAfter || undefined,
          limit: _limit,
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
      enabled: Boolean(contractAddress && contract),
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

  const exportAllMembers = async () => {
    if (wallet.isWalletDisconnected) {
      toast.error('Please connect your wallet first.', { style: { maxWidth: 'none' } })
      setExporting(false)
      return
    }
    try {
      const messages = contract?.use(contractAddress)

      setExporting(true)
      const contractInfoResponse = await (await wallet.getCosmWasmClient())
        .queryContractRaw(
          contractAddress.trim(),
          toUtf8(Buffer.from(Buffer.from('contract_info').toString('hex'), 'hex').toString()),
        )
        .catch((e) => {
          if (e.message.includes('bech32')) throw new Error('Invalid whitelist contract address.')
          console.log(e.message)
        })
      const contractInfo = JSON.parse(new TextDecoder().decode(contractInfoResponse as Uint8Array))
      console.log('Contract Info: ', contractInfo.contract)

      if (contractInfo.contract.includes('flex')) {
        let membersResponse = (await dispatchQuery({ messages, address, type: 'members', limit: 100 })) as any
        let membersArray = [...membersResponse.members]
        let lastMember = membersResponse.members[membersResponse.members.length - 1]

        while (membersResponse.members.length === 100) {
          membersResponse = (await dispatchQuery({
            messages,
            address,
            type: 'members',
            limit: 100,
            startAfter: lastMember.address,
          })) as any
          lastMember = membersResponse.members[membersResponse.members.length - 1]
          membersArray = [...membersArray, ...membersResponse.members]
        }

        membersArray.unshift({ address: 'address', mint_count: 'mint_count' })
        const csv = membersArray.map((row) => Object.values(row).join(',')).join('\n')
        const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const csvURL = window.URL.createObjectURL(csvData)
        const tempLink = document.createElement('a')
        tempLink.href = csvURL
        tempLink.setAttribute('download', 'whitelist_flex_members.csv')
        tempLink.click()
      } else if (contractInfo.contract.includes('whitelist') && !contractInfo.contract.includes('flex')) {
        let membersResponse = (await dispatchQuery({ messages, address, type: 'members', limit: 100 })) as any
        let membersArray = [...membersResponse.members]
        let lastMember = membersResponse.members[membersResponse.members.length - 1]

        while (membersResponse.members.length === 100) {
          membersResponse = (await dispatchQuery({
            messages,
            address,
            type: 'members',
            limit: 100,
            startAfter: lastMember,
          })) as any
          lastMember = membersResponse.members[membersResponse.members.length - 1]
          membersArray = [...membersArray, ...membersResponse.members]
        }

        const txt = membersArray.map((member) => member).join('\n')
        const txtData = new Blob([txt], { type: 'text/txt;charset=utf-8;' })
        const txtURL = window.URL.createObjectURL(txtData)
        const tempLink = document.createElement('a')
        tempLink.href = txtURL
        tempLink.setAttribute('download', 'whitelist_members.txt')
        tempLink.click()
      } else {
        toast.error('Invalid whitelist contract address.', { style: { maxWidth: 'none' } })
      }
      setExporting(false)
    } catch (e: any) {
      console.log(e)
      toast.error(e.message, { style: { maxWidth: 'none' } })
      setExporting(false)
    }
  }

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Query Whitelist Contract" />
      <ContractPageHeader
        description="Whitelist contract manages the whitelisted addresses for the collection."
        link={links.Documentation}
        title="Whitelist Contract"
      />
      <LinkTabs activeIndex={1} data={whitelistLinkTabs} />

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
          <Conditional test={addressVisible}>
            <AddressInput {...addressState} />
          </Conditional>
          <Conditional test={type === 'members'}>
            <TextInput {...startAfter} />
            <NumberInput {...limit} />
            <Button
              className="py-2 px-4 font-bold text-white/90 bg-stargaze hover:bg-stargaze-80 rounded"
              isLoading={exporting}
              onClick={exportAllMembers}
              type="button"
            >
              Export All Members
            </Button>
          </Conditional>
        </div>
        <JsonPreview content={contractAddress ? { type, response } : null} title="Query Response" />
      </div>
    </section>
  )
}

export default withMetadata(WhitelistQueryPage, { center: false })
