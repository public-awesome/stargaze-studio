/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-nested-ternary */
import CustomTokenSelect from 'components/CustomTokenSelect'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { vendingMinterList } from 'config/minter'
import type { TokenInfo } from 'config/token'
import { stars, tokensList } from 'config/token'
import { useGlobalSettings } from 'contexts/globalSettings'
import React, { useEffect, useState } from 'react'
import { resolveAddress } from 'utils/resolveAddress'
import { useWallet } from 'utils/wallet'

import { NumberInput, TextInput } from '../../forms/FormInput'
import type { UploadMethod } from './UploadDetails'

interface MintingDetailsProps {
  onChange: (data: MintingDetailsDataProps) => void
  numberOfTokens: number | undefined
  uploadMethod: UploadMethod
  minimumMintPrice: number
  mintingTokenFromFactory?: TokenInfo
  importedMintingDetails?: MintingDetailsDataProps
  isPresale: boolean
  whitelistStartDate?: string
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
  isPresale,
  whitelistStartDate,
}: MintingDetailsProps) => {
  const wallet = useWallet()
  const { timezone } = useGlobalSettings()
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
    title: 'Mint Price',
    subtitle: `Minimum: ${minimumMintPrice} ${mintingTokenFromFactory ? mintingTokenFromFactory.displayName : 'STARS'}`,
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
    console.log('Timestamp:', timestamp?.getTime())
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

  useEffect(() => {
    if (isPresale) {
      setTimestamp(whitelistStartDate ? new Date(Number(whitelistStartDate) / 1_000_000) : undefined)
    }
  }, [whitelistStartDate, isPresale])

  return (
    <div>
      <FormGroup subtitle="Information about your minting settings" title="Minting Details">
        <NumberInput
          {...numberOfTokensState}
          disabled={uploadMethod === 'new'}
          isRequired
          value={uploadMethod === 'new' ? numberOfTokens : numberOfTokensState.value}
        />
        <div className="flex flex-row items-end mr-2">
          <NumberInput {...unitPriceState} isRequired />
          {/* <select
            className="py-[9px] px-4 ml-2 placeholder:text-white/50 bg-white/10 rounded border-2 border-white/20 focus:ring focus:ring-plumbus-20"
            onChange={(e) => setSelectedMintToken(tokensList.find((t) => t.displayName === e.target.value))}
            value={selectedMintToken?.displayName}
          >
            {vendingMinterList
              .filter(
                (minter) =>
                  minter.factoryAddress !== undefined && minter.updatable === false && minter.featured === false,
              )
              .map((minter) => (
                <option key={minter.id} className="bg-black" value={minter.supportedToken.displayName}>
                  {minter.supportedToken.displayName}
                </option>
              ))}
          </select> */}
          <CustomTokenSelect
            onOptionChange={setSelectedMintToken}
            options={vendingMinterList
              .filter(
                (minter) =>
                  minter.factoryAddress !== undefined && minter.updatable === false && minter.featured === false,
              )
              .map((minter) => minter.supportedToken)}
            selectedOption={selectedMintToken}
          />
        </div>

        <NumberInput {...perAddressLimitState} isRequired />
        <FormControl
          htmlId="timestamp"
          isRequired
          subtitle={`Minting start time ${isPresale ? '(is dictated by whitelist start time)' : ''} ${
            timezone === 'Local' ? '(local)' : '(UTC)'
          }`}
          title="Start Time"
        >
          <InputDateTime
            disabled={isPresale}
            minDate={
              timezone === 'Local' ? new Date() : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
            }
            onChange={(date) =>
              date
                ? setTimestamp(
                    timezone === 'Local' ? date : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
                  )
                : setTimestamp(undefined)
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
      </FormGroup>
      <TextInput className="p-4 mt-5" {...paymentAddressState} />
    </div>
  )
}
