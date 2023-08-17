/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-nested-ternary */
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { openEditionMinterList } from 'config/minter'
import type { TokenInfo } from 'config/token'
import { stars, tokensList } from 'config/token'
import React, { useEffect, useState } from 'react'
import { resolveAddress } from 'utils/resolveAddress'

import { useWallet } from '../../contexts/wallet'
import { NumberInput, TextInput } from '../forms/FormInput'
import type { UploadMethod } from './OffChainMetadataUploadDetails'

interface MintingDetailsProps {
  onChange: (data: MintingDetailsDataProps) => void
  uploadMethod: UploadMethod
  minimumMintPrice: number
  mintTokenFromFactory?: TokenInfo | undefined
}

export interface MintingDetailsDataProps {
  unitPrice: string
  perAddressLimit: number
  startTime: string
  endTime: string
  paymentAddress?: string
  selectedMintToken?: TokenInfo
}

export const MintingDetails = ({
  onChange,
  uploadMethod,
  minimumMintPrice,
  mintTokenFromFactory,
}: MintingDetailsProps) => {
  const wallet = useWallet()

  const [timestamp, setTimestamp] = useState<Date | undefined>()
  const [endTimestamp, setEndTimestamp] = useState<Date | undefined>()
  const [selectedMintToken, setSelectedMintToken] = useState<TokenInfo | undefined>(stars)

  const unitPriceState = useNumberInputState({
    id: 'unitPrice',
    name: 'unitPrice',
    title: 'Mint Price',
    subtitle: `Price of each token (min. ${minimumMintPrice} ${
      mintTokenFromFactory ? mintTokenFromFactory.displayName : 'STARS'
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
    const data: MintingDetailsDataProps = {
      unitPrice: unitPriceState.value
        ? (Number(unitPriceState.value) * 1_000_000).toString()
        : unitPriceState.value === 0
        ? '0'
        : '',
      perAddressLimit: perAddressLimitState.value,
      startTime: timestamp ? (timestamp.getTime() * 1_000_000).toString() : '',
      endTime: endTimestamp ? (endTimestamp.getTime() * 1_000_000).toString() : '',
      paymentAddress: paymentAddressState.value.trim(),
      selectedMintToken,
    }
    onChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    unitPriceState.value,
    perAddressLimitState.value,
    timestamp,
    endTimestamp,
    paymentAddressState.value,
    selectedMintToken,
  ])

  return (
    <div className="border-l-[1px] border-gray-500 border-opacity-20">
      <FormGroup subtitle="Information about your minting settings" title="Minting Details">
        <div className="flex flex-row items-center">
          <NumberInput {...unitPriceState} isRequired />
          <select
            className="py-[9px] px-4 mt-14 ml-4 placeholder:text-white/50 bg-white/10 rounded border-2 border-white/20 focus:ring focus:ring-plumbus-20"
            onChange={(e) => setSelectedMintToken(tokensList.find((t) => t.displayName === e.target.value))}
          >
            {openEditionMinterList
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
        <FormControl htmlId="endTimestamp" isRequired subtitle="Minting end time (local)" title="End Time">
          <InputDateTime minDate={new Date()} onChange={(date) => setEndTimestamp(date)} value={endTimestamp} />
        </FormControl>
      </FormGroup>
      <TextInput className="pr-4 pl-4 mt-3" {...paymentAddressState} />
    </div>
  )
}
