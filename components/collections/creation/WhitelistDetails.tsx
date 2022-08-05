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
  })

  const uniPriceState = useNumberInputState({
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
  }, [uniPriceState.value, memberLimitState.value, perAddressLimitState.value, startDate, endDate, whitelistArray])

  return (
    <div className="py-3 px-8 rounded border-2 border-white/20">
      <div className="flex justify-center">
        <div className="ml-4 font-bold form-check form-check-inline">
          <input
            checked={whitelistState === 'none'}
            className="float-none mr-2 mb-1 w-4 h-4 align-middle bg-white checked:bg-stargaze bg-center bg-no-repeat bg-contain rounded-full border border-gray-300 checked:border-white focus:outline-none transition duration-200 appearance-none cursor-pointer form-check-input"
            id="whitelistRadio1"
            name="whitelistRadioOptions1"
            onClick={() => {
              setWhitelistState('none')
            }}
            type="radio"
            value="None"
          />
          <label className="inline-block text-white cursor-pointer form-check-label" htmlFor="whitelistRadio1">
            No whitelist
          </label>
        </div>
        <div className="ml-4 font-bold form-check form-check-inline">
          <input
            checked={whitelistState === 'existing'}
            className="float-none mr-2 mb-1 w-4 h-4 align-middle bg-white checked:bg-stargaze bg-center bg-no-repeat bg-contain rounded-full border border-gray-300 checked:border-white focus:outline-none transition duration-200 appearance-none cursor-pointer form-check-input"
            id="whitelistRadio2"
            name="whitelistRadioOptions2"
            onClick={() => {
              setWhitelistState('existing')
            }}
            type="radio"
            value="Existing"
          />
          <label className="inline-block text-white cursor-pointer form-check-label" htmlFor="whitelistRadio2">
            Existing whitelist
          </label>
        </div>
        <div className="ml-4 font-bold form-check form-check-inline">
          <input
            checked={whitelistState === 'new'}
            className="float-none mr-2 mb-1 w-4 h-4 align-middle bg-white checked:bg-stargaze bg-center bg-no-repeat bg-contain rounded-full border border-gray-300 checked:border-white focus:outline-none transition duration-200 appearance-none cursor-pointer form-check-input"
            id="whitelistRadio3"
            name="whitelistRadioOptions3"
            onClick={() => {
              setWhitelistState('new')
            }}
            type="radio"
            value="New"
          />
          <label className="inline-block text-white cursor-pointer form-check-label" htmlFor="whitelistRadio3">
            New whitelist
          </label>
        </div>
      </div>

      <Conditional test={whitelistState === 'existing'}>
        <AddressInput {...whitelistAddressState} className="pb-5" />
      </Conditional>

      <Conditional test={whitelistState === 'new'}>
        <div className="grid grid-cols-2">
          <FormGroup subtitle="Information about your minting settings" title="Whitelist Minting Details">
            <NumberInput isRequired {...uniPriceState} />
            <NumberInput isRequired {...memberLimitState} />
            <NumberInput isRequired {...perAddressLimitState} />
            <FormControl htmlId="start-date" isRequired subtitle="Start time for the minting" title="Start Time">
              <InputDateTime minDate={new Date()} onChange={(date) => setStartDate(date)} value={startDate} />
            </FormControl>
            <FormControl htmlId="end-date" isRequired subtitle="End time for the minting" title="End Time">
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
