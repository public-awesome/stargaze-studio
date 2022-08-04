import { FormGroup } from 'components/FormGroup'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import React, { useEffect } from 'react'

import { NumberInput, TextInput } from '../../forms/FormInput'

interface RoyaltyDetailsProps {
  onChange: (data: RoyaltyDetailsDataProps) => void
}

export interface RoyaltyDetailsDataProps {
  paymentAddress: string
  share: number
}

export const RoyaltyDetails = ({ onChange }: RoyaltyDetailsProps) => {
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

  useEffect(() => {
    const data: RoyaltyDetailsDataProps = {
      paymentAddress: royaltyPaymentAddressState.value,
      share: royaltyShareState.value,
    }
    onChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [royaltyPaymentAddressState.value, royaltyShareState.value])

  return (
    <div>
      <FormGroup subtitle="Information about royalty" title="Royalty Details">
        <TextInput {...royaltyPaymentAddressState} />
        <NumberInput {...royaltyShareState} />
      </FormGroup>
    </div>
  )
}
