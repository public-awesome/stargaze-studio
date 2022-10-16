import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import React, { useEffect, useState } from 'react'

import { NumberInput } from '../../forms/FormInput'
import type { UploadMethod } from './UploadDetails'

interface MintingDetailsProps {
  onChange: (data: MintingDetailsDataProps) => void
  numberOfTokens: number | undefined
  uploadMethod: UploadMethod
}

export interface MintingDetailsDataProps {
  numTokens: number
  unitPrice: string
  perAddressLimit: number
  startTime: string
}

export const MintingDetails = ({ onChange, numberOfTokens, uploadMethod }: MintingDetailsProps) => {
  const [timestamp, setTimestamp] = useState<Date | undefined>()

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
    subtitle: 'Price of each token (min. 50 STARS)',
    placeholder: '50',
  })

  const perAddressLimitState = useNumberInputState({
    id: 'peraddresslimit',
    name: 'peraddresslimit',
    title: 'Per Address Limit',
    subtitle: '',
    placeholder: '1',
  })

  useEffect(() => {
    if (numberOfTokens) numberOfTokensState.onChange(numberOfTokens)
    const data: MintingDetailsDataProps = {
      numTokens: numberOfTokensState.value,
      unitPrice: unitPriceState.value ? (Number(unitPriceState.value) * 1_000_000).toString() : '',
      perAddressLimit: perAddressLimitState.value,
      startTime: timestamp ? (timestamp.getTime() * 1_000_000).toString() : '',
    }
    onChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfTokens, numberOfTokensState.value, unitPriceState.value, perAddressLimitState.value, timestamp])

  return (
    <div>
      <FormGroup subtitle="Information about your minting settings" title="Minting Details">
        <NumberInput
          {...numberOfTokensState}
          disabled={uploadMethod === 'new'}
          isRequired
          value={uploadMethod === 'new' ? numberOfTokens : numberOfTokensState.value}
        />
        <NumberInput {...unitPriceState} isRequired />
        <NumberInput {...perAddressLimitState} isRequired />
        <FormControl htmlId="timestamp" isRequired subtitle="Minting start time (local)" title="Start Time">
          <InputDateTime minDate={new Date()} onChange={(date) => setTimestamp(date)} value={timestamp} />
        </FormControl>
      </FormGroup>
    </div>
  )
}
