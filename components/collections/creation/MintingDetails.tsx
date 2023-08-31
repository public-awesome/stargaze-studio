/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-nested-ternary */
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { vendingMinterList } from 'config/minter'
import type { TokenInfo } from 'config/token'
import { stars, tokensList } from 'config/token'
import React, { useEffect, useState } from 'react'
import { resolveAddress } from 'utils/resolveAddress'

import { useWallet } from '../../../contexts/wallet'
import { NumberInput, TextInput } from '../../forms/FormInput'
import type { UploadMethod } from './UploadDetails'

interface MintingDetailsProps {
  onChange: (data: MintingDetailsDataProps) => void
  numberOfTokens: number | undefined
  uploadMethod: UploadMethod
  minimumMintPrice: number
  mintingTokenFromFactory?: TokenInfo
  importedMintingDetails?: MintingDetailsDataProps
}

export interface MintingDetailsDataProps {
  numTokens: number
  unitPrice: string
  perAddressLimit: number
  startTime: string
  paymentAddress?: string
  selectedMintToken?: TokenInfo
}

export const MintingDetails = ({
  onChange,
  numberOfTokens,
  uploadMethod,
  minimumMintPrice,
  mintingTokenFromFactory,
  importedMintingDetails,
}: MintingDetailsProps) => {
  const wallet = useWallet()

  const [timestamp, setTimestamp] = useState<Date | undefined>()
  const [selectedMintToken, setSelectedMintToken] = useState<TokenInfo | undefined>(stars)

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
    subtitle: `Price of each token (min. ${minimumMintPrice} ${
      mintingTokenFromFactory ? mintingTokenFromFactory.displayName : 'STARS'
    })`,
    placeholder: '50',
  })

  const perAddressLimitState = useNumberInputState({
    id: 'peraddresslimit',
    name: 'peraddresslimit',
    title: 'Per Address Limit',
    subtitle: '',
    placeholder: '1',
  })

  const paymentAddressState = useInputState({
    id: 'payment-address',
    name: 'paymentAddress',
    title: 'Payment Address (optional)',
    subtitle: 'Address to receive minting revenues (defaults to current wallet address)',
    placeholder: 'stars1234567890abcdefghijklmnopqrstuvwxyz...',
  })

  const resolvePaymentAddress = async () => {
    await resolveAddress(paymentAddressState.value.trim(), wallet).then((resolvedAddress) => {
      paymentAddressState.onChange(resolvedAddress)
    })
  }

  useEffect(() => {
    void resolvePaymentAddress()
  }, [paymentAddressState.value])

  useEffect(() => {
    if (numberOfTokens) numberOfTokensState.onChange(numberOfTokens)
    const data: MintingDetailsDataProps = {
      numTokens: numberOfTokensState.value,
      unitPrice: unitPriceState.value
        ? (Number(unitPriceState.value) * 1_000_000).toString()
        : unitPriceState.value === 0
        ? '0'
        : '',
      perAddressLimit: perAddressLimitState.value,
      startTime: timestamp ? (timestamp.getTime() * 1_000_000).toString() : '',
      paymentAddress: paymentAddressState.value.trim(),
      selectedMintToken,
    }
    onChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    numberOfTokens,
    numberOfTokensState.value,
    unitPriceState.value,
    perAddressLimitState.value,
    timestamp,
    paymentAddressState.value,
    selectedMintToken,
  ])

  useEffect(() => {
    if (importedMintingDetails) {
      numberOfTokensState.onChange(importedMintingDetails.numTokens)
      unitPriceState.onChange(Number(importedMintingDetails.unitPrice) / 1_000_000)
      perAddressLimitState.onChange(importedMintingDetails.perAddressLimit)
      setTimestamp(new Date(Number(importedMintingDetails.startTime) / 1_000_000))
      paymentAddressState.onChange(importedMintingDetails.paymentAddress ? importedMintingDetails.paymentAddress : '')
      setSelectedMintToken(tokensList.find((token) => token.id === importedMintingDetails.selectedMintToken?.id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedMintingDetails])

  return (
    <div>
      <FormGroup subtitle="Information about your minting settings" title="Minting Details">
        <NumberInput
          {...numberOfTokensState}
          disabled={uploadMethod === 'new'}
          isRequired
          value={uploadMethod === 'new' ? numberOfTokens : numberOfTokensState.value}
        />
        <div className="flex flex-row items-center">
          <NumberInput {...unitPriceState} isRequired />
          <select
            className="py-[9px] px-4 mt-14 ml-2 placeholder:text-white/50 bg-white/10 rounded border-2 border-white/20 focus:ring focus:ring-plumbus-20"
            onChange={(e) => setSelectedMintToken(tokensList.find((t) => t.displayName === e.target.value))}
            value={selectedMintToken?.displayName}
          >
            {vendingMinterList
              .filter((minter) => minter.factoryAddress !== undefined && minter.updatable === false)
              .map((minter) => (
                <option key={minter.id} className="bg-black" value={minter.supportedToken.displayName}>
                  {minter.supportedToken.displayName}
                </option>
              ))}
          </select>
        </div>

        <NumberInput {...perAddressLimitState} isRequired />
        <FormControl htmlId="timestamp" isRequired subtitle="Minting start time (local)" title="Start Time">
          <InputDateTime minDate={new Date()} onChange={(date) => setTimestamp(date)} value={timestamp} />
        </FormControl>
      </FormGroup>
      <TextInput className="p-4 mt-5" {...paymentAddressState} />
    </div>
  )
}
