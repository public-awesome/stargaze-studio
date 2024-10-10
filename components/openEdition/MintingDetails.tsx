/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-nested-ternary */
import { Conditional } from 'components/Conditional'
import CustomTokenSelect from 'components/CustomTokenSelect'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { openEditionMinterList } from 'config/minter'
import type { TokenInfo } from 'config/token'
import { ibcAtom, tokensList } from 'config/token'
import { useGlobalSettings } from 'contexts/globalSettings'
import React, { useEffect, useState } from 'react'
import { resolveAddress } from 'utils/resolveAddress'
import { useWallet } from 'utils/wallet'

import { NumberInput, TextInput } from '../forms/FormInput'
import type { UploadMethod } from './OffChainMetadataUploadDetails'

export type LimitType = 'count_limited' | 'time_limited' | 'time_and_count_limited'

interface MintingDetailsProps {
  onChange: (data: MintingDetailsDataProps) => void
  uploadMethod: UploadMethod
  minimumMintPrice: number
  mintTokenFromFactory?: TokenInfo | undefined
  importedMintingDetails?: MintingDetailsDataProps
  isPresale: boolean
  whitelistStartDate?: string
}

export interface MintingDetailsDataProps {
  unitPrice: string
  perAddressLimit: number
  startTime: string
  endTime?: string
  tokenCountLimit?: number
  paymentAddress?: string
  selectedMintToken?: TokenInfo
  limitType: LimitType
}

export const MintingDetails = ({
  onChange,
  uploadMethod,
  minimumMintPrice,
  mintTokenFromFactory,
  importedMintingDetails,
  isPresale,
  whitelistStartDate,
}: MintingDetailsProps) => {
  const wallet = useWallet()

  const [timestamp, setTimestamp] = useState<Date | undefined>()
  const [endTimestamp, setEndTimestamp] = useState<Date | undefined>()
  const [selectedMintToken, setSelectedMintToken] = useState<TokenInfo | undefined>(ibcAtom)
  const [mintingDetailsImported, setMintingDetailsImported] = useState(false)
  const [limitType, setLimitType] = useState<LimitType>('time_limited')
  const { timezone } = useGlobalSettings()

  const unitPriceState = useNumberInputState({
    id: 'unitPrice',
    name: 'unitPrice',
    title: 'Mint Price',
    subtitle: `Minimum: ${minimumMintPrice} ${mintTokenFromFactory ? mintTokenFromFactory.displayName : 'STARS'}`,
    placeholder: '50',
  })

  const perAddressLimitState = useNumberInputState({
    id: 'peraddresslimit',
    name: 'peraddresslimit',
    title: 'Per Address Limit',
    subtitle: '',
    placeholder: '1',
  })

  const tokenCountLimitState = useNumberInputState({
    id: 'tokencountlimit',
    name: 'tokencountlimit',
    title: 'Maximum Token Count',
    subtitle: 'Total number of mintable tokens',
    placeholder: '100',
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
      endTime:
        limitType === 'time_limited' || limitType === 'time_and_count_limited'
          ? endTimestamp
            ? (endTimestamp.getTime() * 1_000_000).toString()
            : ''
          : undefined,
      paymentAddress: paymentAddressState.value.trim(),
      selectedMintToken,
      limitType,
      tokenCountLimit:
        limitType === 'count_limited' || limitType === 'time_and_count_limited'
          ? tokenCountLimitState.value
          : undefined,
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
    tokenCountLimitState.value,
    limitType,
  ])

  useEffect(() => {
    if (importedMintingDetails) {
      console.log('Selected Token ID: ', importedMintingDetails.selectedMintToken?.id)
      unitPriceState.onChange(Number(importedMintingDetails.unitPrice) / 1000000)
      perAddressLimitState.onChange(importedMintingDetails.perAddressLimit)
      setLimitType(importedMintingDetails.limitType)
      tokenCountLimitState.onChange(importedMintingDetails.tokenCountLimit ? importedMintingDetails.tokenCountLimit : 0)
      setTimestamp(new Date(Number(importedMintingDetails.startTime) / 1_000_000))
      setEndTimestamp(new Date(Number(importedMintingDetails.endTime) / 1_000_000))
      paymentAddressState.onChange(importedMintingDetails.paymentAddress ? importedMintingDetails.paymentAddress : '')
      setSelectedMintToken(tokensList.find((token) => token.id === importedMintingDetails.selectedMintToken?.id))
      setMintingDetailsImported(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedMintingDetails])

  useEffect(() => {
    if (isPresale) {
      setTimestamp(whitelistStartDate ? new Date(Number(whitelistStartDate) / 1_000_000) : undefined)
    }
  }, [whitelistStartDate, isPresale])

  return (
    <div className="border-l-[1px] border-gray-500 border-opacity-20">
      <FormGroup subtitle="Information about your minting settings" title="Minting Details">
        <div className="flex flex-row items-end mr-2">
          <NumberInput {...unitPriceState} isRequired />
          {/* <select
            className="py-[9px] px-4 ml-4 placeholder:text-white/50 bg-white/10 rounded border-2 border-white/20 focus:ring focus:ring-plumbus-20"
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
          </select> */}
          <CustomTokenSelect
            onOptionChange={setSelectedMintToken}
            options={openEditionMinterList
              .filter((minter) => minter.factoryAddress !== undefined && minter.updatable === false)
              .map((minter) => minter.supportedToken)
              .reduce((uniqueTokens: TokenInfo[], token: TokenInfo) => {
                if (!uniqueTokens.includes(token)) {
                  uniqueTokens.push(token)
                }
                return uniqueTokens
              }, [])}
            selectedOption={selectedMintToken}
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

        <div className="flex-row mt-2 w-full form-control">
          <h1 className="mt-2 font-bold text-md">Limit Type: </h1>
          <label className="justify-start ml-6 cursor-pointer label">
            <span className="mr-2">Time</span>
            <input
              checked={limitType === 'time_limited' || limitType === 'time_and_count_limited'}
              className={`${limitType === 'time_limited' ? `bg-stargaze` : `bg-gray-600`} checkbox`}
              onClick={() => {
                if (limitType === 'time_and_count_limited') setLimitType('count_limited' as LimitType)
                else if (limitType === 'count_limited') setLimitType('time_and_count_limited' as LimitType)
                else setLimitType('count_limited' as LimitType)
              }}
              type="checkbox"
            />
          </label>
          <label className="justify-start ml-4 cursor-pointer label">
            <span className="mr-2">Token Count</span>
            <input
              checked={limitType === 'count_limited' || limitType === 'time_and_count_limited'}
              className={`${limitType === 'count_limited' ? `bg-stargaze` : `bg-gray-600`} checkbox`}
              onClick={() => {
                if (limitType === 'time_and_count_limited') setLimitType('time_limited' as LimitType)
                else if (limitType === 'time_limited') setLimitType('time_and_count_limited' as LimitType)
                else setLimitType('time_limited' as LimitType)
              }}
              type="checkbox"
            />
          </label>
        </div>
        <Conditional test={limitType === 'time_limited' || limitType === 'time_and_count_limited'}>
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
                date
                  ? setEndTimestamp(
                      timezone === 'Local'
                        ? date
                        : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
                    )
                  : setEndTimestamp(undefined)
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
        </Conditional>
        <Conditional test={limitType === 'count_limited' || limitType === 'time_and_count_limited'}>
          <NumberInput {...tokenCountLimitState} isRequired />
        </Conditional>
      </FormGroup>
      <TextInput className="pr-4 pl-4 mt-3" {...paymentAddressState} />
    </div>
  )
}
