import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import React, { useEffect, useState } from 'react'

import { Conditional } from '../../Conditional'
import { AddressInput, NumberInput } from '../../forms/FormInput'
import { JsonPreview } from '../../JsonPreview'
import { WhitelistUpload } from '../../WhitelistUpload'

interface WhitelistDetailsProps {
  onChange: (data: WhitelistDetailsDataProps) => void
}

export interface WhitelistDetailsDataProps {
  whitelistType: WhitelistState
  contractAddress?: string
  members?: string[]
  unitPrice?: string
  startTime?: string
  endTime?: string
  perAddressLimit?: number
  memberLimit?: number
}

type WhitelistState = 'none' | 'existing' | 'new'

export const WhitelistDetails = ({ onChange }: WhitelistDetailsProps) => {
  const [whitelistState, setWhitelistState] = useState<WhitelistState>('none')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [whitelistArray, setWhitelistArray] = useState<string[]>([])

  const whitelistAddressState = useInputState({
    id: 'whitelist-address',
    name: 'whitelistAddress',
    title: 'Whitelist Address',
    defaultValue: '',
  })

  const uniPriceState = useNumberInputState({
    id: 'unit-price',
    name: 'unitPrice',
    title: 'Unit Price',
    subtitle: 'Token price for whitelisted addresses \n (min. 25 STARS)',
    placeholder: '25',
  })

  const memberLimitState = useNumberInputState({
    id: 'member-limit',
    name: 'memberLimit',
    title: 'Member Limit',
    subtitle: 'Maximum number of whitelisted addresses',
    placeholder: '1000',
  })

  const perAddressLimitState = useNumberInputState({
    id: 'per-address-limit',
    name: 'perAddressLimit',
    title: 'Per Address Limit',
    subtitle: 'Maximum number of tokens per whitelisted address',
    placeholder: '5',
  })

  const whitelistFileOnChange = (data: string[]) => {
    setWhitelistArray(data)
  }

  useEffect(() => {
    const data: WhitelistDetailsDataProps = {
      whitelistType: whitelistState,
      contractAddress: whitelistAddressState.value,
      members: whitelistArray,
      unitPrice: uniPriceState.value ? (Number(uniPriceState.value) * 1_000_000).toString() : '',
      startTime: startDate ? (startDate.getTime() * 1_000_000).toString() : '',
      endTime: endDate ? (endDate.getTime() * 1_000_000).toString() : '',
      perAddressLimit: perAddressLimitState.value,
      memberLimit: memberLimitState.value,
    }
    onChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    whitelistAddressState.value,
    uniPriceState.value,
    memberLimitState.value,
    perAddressLimitState.value,
    startDate,
    endDate,
    whitelistArray,
    whitelistState,
  ])

  return (
    <div className="py-3 px-8 rounded border-2 border-white/20">
      <div className="flex justify-center">
        <div className="ml-4 font-bold form-check form-check-inline">
          <input
            checked={whitelistState === 'none'}
            className="peer sr-only"
            id="whitelistRadio1"
            name="whitelistRadioOptions1"
            onClick={() => {
              setWhitelistState('none')
            }}
            type="radio"
            value="None"
          />
          <label
            className="inline-block py-1 px-2 text-plumbus-light peer-checked:text-white hover:text-white peer-checked:bg-plumbus peer-checked:hover:bg-plumbus-light hover:bg-plumbus rounded-lg border border-plumbus-light cursor-pointer form-check-label"
            htmlFor="whitelistRadio1"
          >
            No whitelist
          </label>
        </div>
        <div className="ml-4 font-bold form-check form-check-inline">
          <input
            checked={whitelistState === 'existing'}
            className="peer sr-only"
            id="whitelistRadio2"
            name="whitelistRadioOptions2"
            onClick={() => {
              setWhitelistState('existing')
            }}
            type="radio"
            value="Existing"
          />
          <label
            className="inline-block py-1 px-2 text-plumbus-light peer-checked:text-white hover:text-white peer-checked:bg-plumbus peer-checked:hover:bg-plumbus-light hover:bg-plumbus rounded-lg border border-plumbus-light cursor-pointer form-check-label"
            htmlFor="whitelistRadio2"
          >
            Existing whitelist
          </label>
        </div>
        <div className="ml-4 font-bold form-check form-check-inline">
          <input
            checked={whitelistState === 'new'}
            className="peer sr-only"
            id="whitelistRadio3"
            name="whitelistRadioOptions3"
            onClick={() => {
              setWhitelistState('new')
            }}
            type="radio"
            value="New"
          />
          <label
            className="inline-block py-1 px-2 text-plumbus-light peer-checked:text-white hover:text-white peer-checked:bg-plumbus peer-checked:hover:bg-plumbus-light hover:bg-plumbus rounded-lg border border-plumbus-light cursor-pointer form-check-label"
            htmlFor="whitelistRadio3"
          >
            New whitelist
          </label>
        </div>
      </div>

      <Conditional test={whitelistState === 'existing'}>
        <AddressInput {...whitelistAddressState} className="pb-5" isRequired />
      </Conditional>

      <Conditional test={whitelistState === 'new'}>
        <div className="grid grid-cols-2">
          <FormGroup subtitle="Information about your minting settings" title="Whitelist Minting Details">
            <NumberInput isRequired {...uniPriceState} />
            <NumberInput isRequired {...memberLimitState} />
            <NumberInput isRequired {...perAddressLimitState} />
            <FormControl
              htmlId="start-date"
              isRequired
              subtitle="Start time for minting tokens to whitelisted addresses"
              title="Start Time"
            >
              <InputDateTime minDate={new Date()} onChange={(date) => setStartDate(date)} value={startDate} />
            </FormControl>
            <FormControl
              htmlId="end-date"
              isRequired
              subtitle="End time for minting tokens to whitelisted addresses"
              title="End Time"
            >
              <InputDateTime minDate={new Date()} onChange={(date) => setEndDate(date)} value={endDate} />
            </FormControl>
          </FormGroup>
          <div>
            <FormGroup subtitle="TXT file that contains the whitelisted addresses" title="Whitelist File">
              <WhitelistUpload onChange={whitelistFileOnChange} />
            </FormGroup>
            <Conditional test={whitelistArray.length > 0}>
              <JsonPreview content={whitelistArray} initialState title="File Contents" />
            </Conditional>
          </div>
        </div>
      </Conditional>
    </div>
  )
}
