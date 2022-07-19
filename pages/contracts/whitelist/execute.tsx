import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { ExecuteCombobox } from 'components/contracts/whitelist/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/contracts/whitelist/ExecuteCombobox.hooks'
import { FormControl } from 'components/FormControl'
import { AddressList } from 'components/forms/AddressList'
import { useAddressListState } from 'components/forms/AddressList.hooks'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { whitelistLinkTabs } from 'components/LinkTabs.data'
import { TransactionHash } from 'components/TransactionHash'
import { useContracts } from 'contexts/contracts'
import type { DispatchExecuteArgs } from 'contracts/whitelist/messages/execute'
import { dispatchExecute, isEitherType, previewExecutePayload } from 'contracts/whitelist/messages/execute'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const WhitelistExecutePage: NextPage = () => {
  const { whitelist: contract } = useContracts()
  const [lastTx, setLastTx] = useState('')

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id

  const [timestamp, setTimestamp] = useState<Date | undefined>()

  const addressListState = useAddressListState()

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Whitelist Address',
    subtitle: 'Address of the Whitelist contract',
  })
  const contractAddress = contractState.value

  const limitState = useNumberInputState({
    id: 'limit',
    name: 'limit',
    title: 'Limit',
    subtitle: 'Limit value',
    placeholder: '5',
  })

  const showLimitState = isEitherType(type, ['update_per_address_limit', 'increase_member_limit'])
  const showTimestamp = isEitherType(type, ['update_start_time', 'update_end_time'])
  const showMemberList = isEitherType(type, ['add_members', 'remove_members'])

  const messages = useMemo(() => contract?.use(contractState.value), [contract, contractState.value])
  const payload: DispatchExecuteArgs = {
    contract: contractState.value,
    messages,
    type,
    limit: limitState.value,
    timestamp: timestamp ? (timestamp.getTime() * 1_000_000).toString() : '',
    members: addressListState.values.map((a) => a.address),
  }
  const { isLoading, mutate } = useMutation(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!type) {
        throw new Error('Please select message type!')
      }
      const txHash = await toast.promise(dispatchExecute(payload), {
        error: `${type.charAt(0).toUpperCase() + type.slice(1)} execute failed!`,
        loading: 'Executing message...',
        success: (tx) => `Transaction ${tx} success!`,
      })
      if (txHash) {
        setLastTx(txHash)
      }
    },
    {
      onError: (error) => {
        toast.error(String(error))
      },
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
      <NextSeo title="Execute Whitelist Contract" />
      <ContractPageHeader
        description="Whitelist contract manages the whitelisted addresses for the collection."
        link={links.Documentation}
        title="Whitelist Contract"
      />
      <LinkTabs activeIndex={3} data={whitelistLinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <ExecuteCombobox {...comboboxState} />
          <Conditional test={showLimitState}>
            <NumberInput {...limitState} />
          </Conditional>
          <Conditional test={showTimestamp}>
            <FormControl
              htmlId="timestamp"
              isRequired
              subtitle={`${type === 'update_start_time' ? 'Start' : 'End'} time for the minting`}
              title={`${type === 'update_start_time' ? 'Start' : 'End'} Time`}
            >
              <InputDateTime minDate={new Date()} onChange={(date) => setTimestamp(date)} value={timestamp} />
            </FormControl>
          </Conditional>
          <Conditional test={showMemberList}>
            <AddressList
              entries={addressListState.entries}
              isRequired
              onAdd={addressListState.add}
              onChange={addressListState.update}
              onRemove={addressListState.remove}
              subtitle="Enter the member addresses"
              title="Addresses"
            />
          </Conditional>
        </div>
        <div className="space-y-8">
          <div className="relative">
            <Button className="absolute top-0 right-0" isLoading={isLoading} rightIcon={<FaArrowRight />} type="submit">
              Execute
            </Button>
            <FormControl subtitle="View execution transaction hash" title="Transaction Hash">
              <TransactionHash hash={lastTx} />
            </FormControl>
          </div>
          <FormControl subtitle="View current message to be sent" title="Payload Preview">
            <JsonPreview content={previewExecutePayload(payload)} isCopyable />
          </FormControl>
        </div>
      </form>
    </section>
  )
}

export default withMetadata(WhitelistExecutePage, { center: false })
