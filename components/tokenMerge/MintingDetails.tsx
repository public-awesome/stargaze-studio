/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-nested-ternary */

import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { NumberInput, TextInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import type { SelectedCollection } from 'components/forms/SelectCollection'
import { SelectCollection } from 'components/forms/SelectCollection'
import { useSelectCollectionState } from 'components/forms/SelectCollection.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { useGlobalSettings } from 'contexts/globalSettings'
import React, { useEffect, useState } from 'react'
import { resolveAddress } from 'utils/resolveAddress'
import { useWallet } from 'utils/wallet'

import type { UploadMethod } from './UploadDetails'

interface MintingDetailsProps {
  onChange: (data: MintingDetailsDataProps) => void
  numberOfTokens: number | undefined
  uploadMethod: UploadMethod
  importedMintingDetails?: MintingDetailsDataProps
}

export interface MintingDetailsDataProps {
  numTokens: number
  perAddressLimit: number
  startTime: string
  paymentAddress?: string
  selectedCollections?: SelectedCollection[]
}

export const MintingDetails = ({
  onChange,
  numberOfTokens,
  uploadMethod,
  importedMintingDetails,
}: MintingDetailsProps) => {
  const wallet = useWallet()
  const { timezone } = useGlobalSettings()
  const [timestamp, setTimestamp] = useState<Date | undefined>()

  const selectedCollectionsState = useSelectCollectionState()

  const numberOfTokensState = useNumberInputState({
    id: 'numberoftokens',
    name: 'numberoftokens',
    title: 'Number Of Tokens',
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
      selectedCollections: selectedCollectionsState.values,
      perAddressLimit: perAddressLimitState.value,
      startTime: timestamp ? (timestamp.getTime() * 1_000_000).toString() : '',
      paymentAddress: paymentAddressState.value.trim(),
    }
    console.log('Timestamp:', timestamp?.getTime())
    onChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    numberOfTokens,
    numberOfTokensState.value,
    selectedCollectionsState.values,
    perAddressLimitState.value,
    timestamp,
    paymentAddressState.value,
  ])

  useEffect(() => {
    if (importedMintingDetails) {
      numberOfTokensState.onChange(importedMintingDetails.numTokens)
      perAddressLimitState.onChange(importedMintingDetails.perAddressLimit)
      setTimestamp(new Date(Number(importedMintingDetails.startTime) / 1_000_000))
      paymentAddressState.onChange(importedMintingDetails.paymentAddress ? importedMintingDetails.paymentAddress : '')
      if (importedMintingDetails.selectedCollections) {
        selectedCollectionsState.reset()
        importedMintingDetails.selectedCollections.forEach((collection) => {
          selectedCollectionsState.add({
            address: collection.address,
            amount: collection.amount,
          })
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedMintingDetails])

  useEffect(() => {
    if (!importedMintingDetails?.selectedCollections) {
      selectedCollectionsState.reset()
      selectedCollectionsState.add({
        address: '',
        amount: 0,
      })
    }
  }, [])

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
          <SelectCollection
            {...selectedCollectionsState}
            onAdd={selectedCollectionsState.add}
            onChange={selectedCollectionsState.update}
            onRemove={selectedCollectionsState.remove}
            selectedCollections={selectedCollectionsState.entries}
            subtitle="Collections and number of tokens to be burned"
            title="Burn Configuration"
          />
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
