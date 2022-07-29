import { Button } from 'components/Button'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import React, { useState } from 'react'
import useCollapse from 'react-collapsed'
import { useMutation } from 'react-query'

import { Conditional } from './Conditional'
import { NumberInput, TextInput } from './forms/FormInput'
import { JsonPreview } from './JsonPreview'
import { WhitelistUpload } from './WhitelistUpload'

export const CollectionInfo = () => {
  const { getCollapseProps, getToggleProps } = useCollapse()
  const [timestamp, setTimestamp] = useState<Date | undefined>()

  const toggleProps = getToggleProps()
  const collapseProps = getCollapseProps()

  const [wlstartDate, setwlStartDate] = useState<Date | undefined>(undefined)
  const [wlendDate, setwlEndDate] = useState<Date | undefined>(undefined)
  const [whitelistArray, setWhitelistArray] = useState<string[]>([])

  const nameState = useInputState({
    id: 'name',
    name: 'name',
    title: 'Name',
    subtitle: '',
  })

  const descriptionState = useInputState({
    id: 'description',
    name: 'description',
    title: 'Description',
    subtitle: '',
  })

  const imageState = useInputState({
    id: 'image',
    name: 'image',
    title: 'Image',
    subtitle: '',
  })

  const externalImageState = useInputState({
    id: 'externalImage',
    name: 'externalImage',
    title: 'External Image',
    subtitle: '',
  })

  const numberOfTokensState = useNumberInputState({
    id: 'numberoftokens',
    name: 'numberoftokens',
    title: 'Number Of Tokens',
    subtitle: '',
    placeholder: '100',
  })

  const unitPriceState = useNumberInputState({
    id: 'unitPrice',
    name: 'unitPrice',
    title: 'Unit Price',
    subtitle: '',
    placeholder: '100',
  })

  const perAddressLimitState = useNumberInputState({
    id: 'peraddresslimit',
    name: 'peraddresslimit',
    title: 'Per Address Limit',
    subtitle: '',
    placeholder: '1',
  })

  const royaltyPaymentAddressState = useInputState({
    id: 'royalty-payment-address',
    name: 'royaltyPaymentAddress',
    title: 'Payment Address',
    subtitle: 'Address to receive royalties',
    placeholder: 'stars1234567890abcdefghijklmnopqrstuvwxyz...',
  })

  const royaltyShareState = useNumberInputState({
    id: 'royalty-share',
    name: 'royaltyShare',
    title: 'Share Percentage',
    subtitle: 'Percentage of royalties to be paid',
    placeholder: '8',
  })

  const wlunitPriceState = useNumberInputState({
    id: 'unit-price',
    name: 'unitPrice',
    title: 'Unit Price',
    subtitle: 'Price of each tokens in collection',
    placeholder: '500',
  })

  const wlmemberLimitState = useNumberInputState({
    id: 'member-limit',
    name: 'memberLimit',
    title: 'Member Limit',
    subtitle: 'Limit of the whitelisted members',
    placeholder: '1000',
  })

  const wlperAddressLimitState = useNumberInputState({
    id: 'per-address-limit',
    name: 'perAddressLimit',
    title: 'Per Address Limit',
    subtitle: 'Limit of tokens per address',
    placeholder: '5',
  })

  const { isLoading, mutate } = useMutation(
    (event: FormEvent) => {
      //event.preventDefault()
    },
    {
      onError: (error) => {
        //toast.error(String(error))
      },
    },
  )

  const whitelistFileOnChange = (data: string[]) => {
    setWhitelistArray(data)
  }

  return (
    <div>
      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <FormGroup subtitle="Information about your collection" title="Collection Info">
            <TextInput {...nameState} />
            <TextInput {...descriptionState} />
            <TextInput {...imageState} />
            <TextInput {...externalImageState} />
          </FormGroup>
          <FormGroup subtitle="Information about your minting settings" title="Minting Details">
            <NumberInput {...numberOfTokensState} />
            <NumberInput {...unitPriceState} />
            <NumberInput {...perAddressLimitState} />
            <FormControl htmlId="timestamp" isRequired subtitle="Start time for the minting" title="Start Time">
              <InputDateTime minDate={new Date()} onChange={(date) => setTimestamp(date)} value={timestamp} />
            </FormControl>
          </FormGroup>
          <button {...toggleProps} type="button">
            Advanced
          </button>
          <section {...collapseProps}>
            <FormGroup subtitle="Your whitelisted addresses" title="Whitelist File">
              <WhitelistUpload onChange={whitelistFileOnChange} />
              <Conditional test={whitelistArray.length > 0}>
                <JsonPreview content={whitelistArray} initialState={false} title="File Contents" />
              </Conditional>
            </FormGroup>

            <FormGroup subtitle="Information about your minting settings" title="Minting Details">
              <NumberInput isRequired {...wlunitPriceState} />
              <NumberInput isRequired {...wlmemberLimitState} />
              <NumberInput isRequired {...wlperAddressLimitState} />
              <FormControl htmlId="start-date" isRequired subtitle="Start time for the minting" title="Start Time">
                <InputDateTime minDate={new Date()} onChange={(date) => setwlStartDate(date)} value={wlstartDate} />
              </FormControl>
              <FormControl htmlId="end-date" isRequired subtitle="End time for the minting" title="End Time">
                <InputDateTime minDate={new Date()} onChange={(date) => setwlEndDate(date)} value={wlendDate} />
              </FormControl>
            </FormGroup>
            <FormGroup subtitle="Information about royalty" title="Royalty Details">
              <TextInput {...royaltyPaymentAddressState} />
              <NumberInput {...royaltyShareState} />
            </FormGroup>
          </section>
        </div>
        <div className="space-y-8">
          <div className="relative">
            <Button className="absolute top-0 right-0" isLoading={isLoading} type="submit">
              Upload
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
