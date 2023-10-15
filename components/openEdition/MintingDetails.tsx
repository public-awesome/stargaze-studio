/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-nested-ternary */
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { openEditionMinterList } from 'config/minter'
import type { TokenInfo } from 'config/token'
import { stars, tokensList } from 'config/token'
import { useGlobalSettings } from 'contexts/globalSettings'
import React, { useEffect, useState } from 'react'
import { resolveAddress } from 'utils/resolveAddress'
import { useWallet } from 'utils/wallet'

import { NumberInput, TextInput } from '../forms/FormInput'
import type { UploadMethod } from './OffChainMetadataUploadDetails'

interface MintingDetailsProps {
  onChange: (data: MintingDetailsDataProps) => void
  uploadMethod: UploadMethod
  minimumMintPrice: number
  mintTokenFromFactory?: TokenInfo | undefined
  importedMintingDetails?: MintingDetailsDataProps
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
  importedMintingDetails,
}: MintingDetailsProps) => {
  const wallet = useWallet()

  const [timestamp, setTimestamp] = useState<Date | undefined>()
  const [endTimestamp, setEndTimestamp] = useState<Date | undefined>()
  const [selectedMintToken, setSelectedMintToken] = useState<TokenInfo | undefined>(stars)
  const [mintingDetailsImported, setMintingDetailsImported] = useState(false)
  const { timezone } = useGlobalSettings()

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
    if (!importedMintingDetails || (importedMintingDetails && mintingDetailsImported)) {
      void resolvePaymentAddress()
    }
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

  useEffect(() => {
    if (importedMintingDetails) {
      console.log('Selected Token ID: ', importedMintingDetails.selectedMintToken?.id)
      unitPriceState.onChange(Number(importedMintingDetails.unitPrice) / 1000000)
      perAddressLimitState.onChange(importedMintingDetails.perAddressLimit)
      setTimestamp(new Date(Number(importedMintingDetails.startTime) / 1_000_000))
      setEndTimestamp(new Date(Number(importedMintingDetails.endTime) / 1_000_000))
      paymentAddressState.onChange(importedMintingDetails.paymentAddress ? importedMintingDetails.paymentAddress : '')
      setSelectedMintToken(tokensList.find((token) => token.id === importedMintingDetails.selectedMintToken?.id))
      setMintingDetailsImported(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedMintingDetails])

  return (
    <div className="border-l-[1px] border-gray-500 border-opacity-20">
      <FormGroup subtitle="Information about your minting settings" title="Minting Details">
        <div className="flex flex-row items-center">
          <NumberInput {...unitPriceState} isRequired />
          <select
            className="py-[9px] px-4 mt-14 ml-4 placeholder:text-white/50 bg-white/10 rounded border-2 border-white/20 focus:ring focus:ring-plumbus-20"
            onChange={(e) => setSelectedMintToken(tokensList.find((t) => t.displayName === e.target.value))}
            value={selectedMintToken?.displayName}
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
        <FormControl
          htmlId="timestamp"
          isRequired
          subtitle={`Minting start time ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
          title="Start Time"
        >
          <InputDateTime
            minDate={
              timezone === 'Local' ? new Date() : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
            }
            onChange={(date) =>
              setTimestamp(
                timezone === 'Local' ? date : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
              )
            }
            value={
              timezone === 'Local'
                ? timestamp
                : timestamp
                ? new Date(timestamp.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
                : undefined
            }
          />
        </FormControl>
        <FormControl
          htmlId="endTimestamp"
          isRequired
          subtitle={`Minting end time ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
          title="End Time"
        >
          <InputDateTime
            minDate={
              timezone === 'Local' ? new Date() : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
            }
            onChange={(date) =>
              setEndTimestamp(
                timezone === 'Local' ? date : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
              )
            }
            value={
              timezone === 'Local'
                ? endTimestamp
                : endTimestamp
                ? new Date(endTimestamp.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
                : undefined
            }
          />
        </FormControl>
      </FormGroup>
      <TextInput className="pr-4 pl-4 mt-3" {...paymentAddressState} />
    </div>
  )
}
