import { Conditional } from 'components/Conditional'
import { FormGroup } from 'components/FormGroup'
import { useInputState } from 'components/forms/FormInput.hooks'
import React, { useEffect, useState } from 'react'

import { NumberInput, TextInput } from '../../forms/FormInput'

interface RoyaltyDetailsProps {
  onChange: (data: RoyaltyDetailsDataProps) => void
}

export interface RoyaltyDetailsDataProps {
  royaltyType: RoyaltyState
  paymentAddress: string
  share: number
}

type RoyaltyState = 'none' | 'new'

export const RoyaltyDetails = ({ onChange }: RoyaltyDetailsProps) => {
  const [royaltyState, setRoyaltyState] = useState<RoyaltyState>('none')

  const royaltyPaymentAddressState = useInputState({
    id: 'royalty-payment-address',
    name: 'royaltyPaymentAddress',
    title: 'Payment Address',
    subtitle: 'Address to receive royalties',
    placeholder: 'stars1234567890abcdefghijklmnopqrstuvwxyz...',
  })

  const royaltyShareState = useInputState({
    id: 'royalty-share',
    name: 'royaltyShare',
    title: 'Share Percentage',
    subtitle: 'Percentage of royalties to be paid',
    placeholder: '8%',
  })

  useEffect(() => {
    const data: RoyaltyDetailsDataProps = {
      royaltyType: royaltyState,
      paymentAddress: royaltyPaymentAddressState.value,
      share: Number(royaltyShareState.value),
    }
    onChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [royaltyState, royaltyPaymentAddressState.value, royaltyShareState.value])

  return (
    <div className="py-3 px-8 rounded border-2 border-white/20">
      <div className="flex justify-center">
        <div className="ml-4 font-bold form-check form-check-inline">
          <input
            checked={royaltyState === 'none'}
            className="peer sr-only"
            id="royaltyRadio1"
            name="royaltyRadioOptions1"
            onClick={() => {
              setRoyaltyState('none')
            }}
            type="radio"
            value="None"
          />
          <label
            className="inline-block py-1 px-2 text-plumbus-light peer-checked:text-white hover:text-white peer-checked:bg-plumbus peer-checked:hover:bg-plumbus-light hover:bg-plumbus rounded-lg border border-plumbus-light cursor-pointer form-check-label"
            htmlFor="royaltyRadio1"
          >
            No royalty
          </label>
        </div>
        <div className="ml-4 font-bold form-check form-check-inline">
          <input
            checked={royaltyState === 'new'}
            className="peer sr-only"
            id="royaltyRadio2"
            name="royaltyRadioOptions2"
            onClick={() => {
              setRoyaltyState('new')
            }}
            type="radio"
            value="Existing"
          />
          <label
            className="inline-block py-1 px-2 text-plumbus-light peer-checked:text-white hover:text-white peer-checked:bg-plumbus peer-checked:hover:bg-plumbus-light hover:bg-plumbus rounded-lg border border-plumbus-light cursor-pointer form-check-label"
            htmlFor="royaltyRadio2"
          >
            Configure royalty details
          </label>
        </div>
      </div>
      <Conditional test={royaltyState === 'new'}>
        <FormGroup subtitle="Information about royalty" title="Royalty Details">
          <TextInput {...royaltyPaymentAddressState} isRequired />
          <NumberInput {...royaltyShareState} isRequired />
        </FormGroup>
      </Conditional>
    </div>
  )
}
