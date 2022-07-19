import { coin } from '@cosmjs/proto-signing'
import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { AddressList } from 'components/forms/AddressList'
import { useAddressListState } from 'components/forms/AddressList.hooks'
import { NumberInput } from 'components/forms/FormInput'
import { useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { whitelistLinkTabs } from 'components/LinkTabs.data'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { InstantiateResponse } from 'contracts/sg721'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { type FormEvent, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { WHITELIST_CODE_ID } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const Sg721InstantiatePage: NextPage = () => {
  const wallet = useWallet()
  const { whitelist: contract } = useContracts()

  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const addressListState = useAddressListState()

  const unitPriceState = useNumberInputState({
    id: 'unit-price',
    name: 'unitPrice',
    title: 'Unit Price',
    subtitle: 'Price of each tokens in collection',
    placeholder: '500',
  })

  const memberLimitState = useNumberInputState({
    id: 'member-limit',
    name: 'memberLimit',
    title: 'Member Limit',
    subtitle: 'Limit of the whitelisted members',
    placeholder: '1000',
  })

  const perAddressLimitState = useNumberInputState({
    id: 'per-address-limit',
    name: 'perAddressLimit',
    title: 'Per Address Limit',
    subtitle: 'Limit of tokens per address',
    placeholder: '5',
  })

  const { data, isLoading, mutate } = useMutation(
    async (event: FormEvent): Promise<InstantiateResponse | null> => {
      event.preventDefault()
      if (!contract) {
        throw new Error('Smart contract connection failed')
      }

      if (!startDate) {
        throw new Error('Start date is required')
      }
      if (!endDate) {
        throw new Error('End date is required')
      }

      const msg = {
        members: addressListState.values.map((a) => a.address),
        start_time: (startDate.getTime() * 1_000_000).toString(),
        end_time: (endDate.getTime() * 1_000_000).toString(),
        unit_price: coin(String(Number(unitPriceState.value) * 1000000), 'ustars'),
        per_address_limit: perAddressLimitState.value,
        member_limit: memberLimitState.value,
      }
      return toast.promise(
        contract.instantiate(WHITELIST_CODE_ID, msg, 'Stargaze Whitelist Contract', wallet.address),
        {
          loading: 'Instantiating contract...',
          error: 'Instantiation failed!',
          success: 'Instantiation success!',
        },
      )
    },
    {
      onError: (error) => {
        toast.error(String(error))
      },
    },
  )

  return (
    <form className="py-6 px-12 space-y-4" onSubmit={mutate}>
      <NextSeo title="Instantiate Whitelist Contract" />
      <ContractPageHeader
        description="Whitelist contract manages the whitelisted addresses for the collection."
        link={links.Documentation}
        title="Whitelist Contract"
      />
      <LinkTabs activeIndex={0} data={whitelistLinkTabs} />

      <Conditional test={Boolean(data)}>
        <Alert type="info">
          <b>Instantiate success!</b> Here is the transaction result containing the contract address and the transaction
          hash.
        </Alert>
        <JsonPreview content={data} title="Transaction Result" />
        <br />
      </Conditional>

      <FormGroup subtitle="Information about your whitelisted addresses" title="Whitelist Details">
        <AddressList
          entries={addressListState.entries}
          isRequired
          onAdd={addressListState.add}
          onChange={addressListState.update}
          onRemove={addressListState.remove}
          subtitle="Enter the members you want in your contract"
          title="Members"
        />
      </FormGroup>

      <FormGroup subtitle="Information about your minting settings" title="Minting Details">
        <NumberInput isRequired {...unitPriceState} />
        <NumberInput isRequired {...memberLimitState} />
        <NumberInput isRequired {...perAddressLimitState} />
        <FormControl htmlId="start-date" isRequired subtitle="Start time for the minting" title="Start Time">
          <InputDateTime minDate={new Date()} onChange={(date) => setStartDate(date)} value={startDate} />
        </FormControl>
        <FormControl htmlId="end-date" isRequired subtitle="End time for the minting" title="End Time">
          <InputDateTime minDate={new Date()} onChange={(date) => setEndDate(date)} value={endDate} />
        </FormControl>
      </FormGroup>

      <div className="flex items-center p-4">
        <div className="flex-grow" />
        <Button isLoading={isLoading} isWide rightIcon={<FaAsterisk />} type="submit">
          Instantiate Contract
        </Button>
      </div>
    </form>
  )
}

export default withMetadata(Sg721InstantiatePage, { center: false })
