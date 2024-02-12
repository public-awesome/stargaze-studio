/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-nested-ternary */
import { Button } from 'components/Button'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { AddressList } from 'components/forms/AddressList'
import { useAddressListState } from 'components/forms/AddressList.hooks'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import type { WhitelistFlexMember } from 'components/WhitelistFlexUpload'
import { WhitelistFlexUpload } from 'components/WhitelistFlexUpload'
import type { TokenInfo } from 'config/token'
import { useGlobalSettings } from 'contexts/globalSettings'
import React, { useEffect, useState } from 'react'
import { isValidAddress } from 'utils/isValidAddress'
import { useWallet } from 'utils/wallet'

import { Conditional } from '../../Conditional'
import { AddressInput, NumberInput } from '../../forms/FormInput'
import { JsonPreview } from '../../JsonPreview'
import { WhitelistUpload } from '../../WhitelistUpload'

interface WhitelistDetailsProps {
  onChange: (data: WhitelistDetailsDataProps) => void
  mintingTokenFromFactory?: TokenInfo
  importedWhitelistDetails?: WhitelistDetailsDataProps
}

export interface WhitelistDetailsDataProps {
  whitelistState: WhitelistState
  whitelistType: WhitelistType
  contractAddress?: string
  members?: string[] | WhitelistFlexMember[]
  unitPrice?: string
  startTime?: string
  endTime?: string
  perAddressLimit?: number
  memberLimit?: number
  admins?: string[]
  adminsMutable?: boolean
}

type WhitelistState = 'none' | 'existing' | 'new'

type WhitelistType = 'standard' | 'flex'

export const WhitelistDetails = ({
  onChange,
  mintingTokenFromFactory,
  importedWhitelistDetails,
}: WhitelistDetailsProps) => {
  const wallet = useWallet()
  const { timezone } = useGlobalSettings()

  const [whitelistState, setWhitelistState] = useState<WhitelistState>('none')
  const [whitelistType, setWhitelistType] = useState<WhitelistType>('standard')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [whitelistStandardArray, setWhitelistStandardArray] = useState<string[]>([])
  const [whitelistFlexArray, setWhitelistFlexArray] = useState<WhitelistFlexMember[]>([])
  const [adminsMutable, setAdminsMutable] = useState<boolean>(true)

  const whitelistAddressState = useInputState({
    id: 'whitelist-address',
    name: 'whitelistAddress',
    title: 'Whitelist Address',
    defaultValue: '',
  })

  const unitPriceState = useNumberInputState({
    id: 'unit-price',
    name: 'unitPrice',
    title: 'Unit Price',
    subtitle: `Token price for whitelisted addresses \n (min. 0 ${
      mintingTokenFromFactory ? mintingTokenFromFactory.displayName : 'STARS'
    })`,
    placeholder: '25',
  })

  const memberLimitState = useNumberInputState({
    id: 'member-limit',
    name: 'memberLimit',
    title: 'Member Limit',
    subtitle: 'Maximum number of whitelisted addresses',
    placeholder: '1000',
  })

  const perAddressLimitState = useNumberInputState({
    id: 'per-address-limit',
    name: 'perAddressLimit',
    title: 'Per Address Limit',
    subtitle: 'Maximum number of tokens per whitelisted address',
    placeholder: '5',
  })

  const addressListState = useAddressListState()

  const whitelistFileOnChange = (data: string[]) => {
    setWhitelistStandardArray(data)
  }

  const whitelistFlexFileOnChange = (whitelistData: WhitelistFlexMember[]) => {
    setWhitelistFlexArray(whitelistData)
  }

  const downloadSampleWhitelistFlexFile = () => {
    const csvData =
      'address,mint_count\nstars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e,3\nstars1xkes5r2k8u3m3ayfpverlkcrq3k4jhdk8ws0uz,1\nstars1s8qx0zvz8yd6e4x0mqmqf7fr9vvfn622wtp3g3,2'
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', 'sample_whitelist_flex.csv')
    a.click()
  }

  const downloadSampleWhitelistFile = () => {
    const txtData =
      'stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e\nstars1xkes5r2k8u3m3ayfpverlkcrq3k4jhdk8ws0uz\nstars1s8qx0zvz8yd6e4x0mqmqf7fr9vvfn622wtp3g3'
    const blob = new Blob([txtData], { type: 'text/txt' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', 'sample_whitelist.txt')
    a.click()
  }

  useEffect(() => {
    if (!importedWhitelistDetails) {
      setWhitelistStandardArray([])
      setWhitelistFlexArray([])
    }
  }, [whitelistType])

  useEffect(() => {
    const data: WhitelistDetailsDataProps = {
      whitelistState,
      whitelistType,
      contractAddress: whitelistAddressState.value
        .toLowerCase()
        .replace(/,/g, '')
        .replace(/"/g, '')
        .replace(/'/g, '')
        .replace(/ /g, ''),
      members: whitelistType === 'standard' ? whitelistStandardArray : whitelistFlexArray,
      unitPrice: unitPriceState.value
        ? (Number(unitPriceState.value) * 1_000_000).toString()
        : unitPriceState.value === 0
        ? '0'
        : undefined,
      startTime: startDate ? (startDate.getTime() * 1_000_000).toString() : '',
      endTime: endDate ? (endDate.getTime() * 1_000_000).toString() : '',
      perAddressLimit: perAddressLimitState.value,
      memberLimit: memberLimitState.value,
      admins: [
        ...new Set(
          addressListState.values
            .map((a) => a.address.trim())
            .filter((address) => address !== '' && isValidAddress(address.trim()) && address.startsWith('stars')),
        ),
      ],
      adminsMutable,
    }
    onChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    whitelistAddressState.value,
    unitPriceState.value,
    memberLimitState.value,
    perAddressLimitState.value,
    startDate,
    endDate,
    whitelistStandardArray,
    whitelistFlexArray,
    whitelistState,
    addressListState.values,
    adminsMutable,
  ])

  // make the necessary changes with respect to imported whitelist details
  useEffect(() => {
    if (importedWhitelistDetails) {
      setWhitelistState(importedWhitelistDetails.whitelistState)
      setWhitelistType(importedWhitelistDetails.whitelistType)
      whitelistAddressState.onChange(
        importedWhitelistDetails.contractAddress ? importedWhitelistDetails.contractAddress : '',
      )
      unitPriceState.onChange(
        importedWhitelistDetails.unitPrice ? Number(importedWhitelistDetails.unitPrice) / 1000000 : 0,
      )
      memberLimitState.onChange(importedWhitelistDetails.memberLimit ? importedWhitelistDetails.memberLimit : 0)
      perAddressLimitState.onChange(
        importedWhitelistDetails.perAddressLimit ? importedWhitelistDetails.perAddressLimit : 0,
      )
      setStartDate(
        importedWhitelistDetails.startTime
          ? new Date(Number(importedWhitelistDetails.startTime) / 1_000_000)
          : undefined,
      )
      setEndDate(
        importedWhitelistDetails.endTime ? new Date(Number(importedWhitelistDetails.endTime) / 1_000_000) : undefined,
      )
      setAdminsMutable(importedWhitelistDetails.adminsMutable ? importedWhitelistDetails.adminsMutable : true)
      importedWhitelistDetails.admins?.forEach((admin) => {
        addressListState.reset()
        addressListState.add({ address: admin })
      })
      if (importedWhitelistDetails.whitelistType === 'standard') {
        setWhitelistStandardArray([])
        importedWhitelistDetails.members?.forEach((member) => {
          setWhitelistStandardArray((standardArray) => [...standardArray, member as string])
        })
      } else {
        setWhitelistFlexArray([])
        importedWhitelistDetails.members?.forEach((member) => {
          setWhitelistFlexArray((flexArray) => [
            ...flexArray,
            {
              address: (member as WhitelistFlexMember).address,
              mint_count: (member as WhitelistFlexMember).mint_count,
            },
          ])
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedWhitelistDetails])

  useEffect(() => {
    if (whitelistState === 'new' && wallet.address) {
      addressListState.reset()
      addressListState.add({ address: wallet.address })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whitelistState, wallet.address])

  return (
    <div className="py-3 px-8 rounded border-2 border-white/20">
      <div className="flex justify-center">
        <div className="ml-4 font-bold form-check form-check-inline">
          <input
            checked={whitelistState === 'none'}
            className="peer sr-only"
            id="whitelistRadio1"
            name="whitelistRadioOptions1"
            onClick={() => {
              setWhitelistState('none')
              setWhitelistType('standard')
            }}
            type="radio"
            value="None"
          />
          <label
            className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
            htmlFor="whitelistRadio1"
          >
            No whitelist
          </label>
        </div>
        <div className="ml-4 font-bold form-check form-check-inline">
          <input
            checked={whitelistState === 'existing'}
            className="peer sr-only"
            id="whitelistRadio2"
            name="whitelistRadioOptions2"
            onClick={() => {
              setWhitelistState('existing')
            }}
            type="radio"
            value="Existing"
          />
          <label
            className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
            htmlFor="whitelistRadio2"
          >
            Existing whitelist
          </label>
        </div>
        <div className="ml-4 font-bold form-check form-check-inline">
          <input
            checked={whitelistState === 'new'}
            className="peer sr-only"
            id="whitelistRadio3"
            name="whitelistRadioOptions3"
            onClick={() => {
              setWhitelistState('new')
            }}
            type="radio"
            value="New"
          />
          <label
            className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
            htmlFor="whitelistRadio3"
          >
            New whitelist
          </label>
        </div>
      </div>

      <Conditional test={whitelistState === 'existing'}>
        <AddressInput {...whitelistAddressState} className="pb-5" isRequired />
      </Conditional>

      <Conditional test={whitelistState === 'new'}>
        <div className="flex justify-between mb-5 ml-6 max-w-[300px] text-lg font-bold">
          <div className="form-check form-check-inline">
            <input
              checked={whitelistType === 'standard'}
              className="peer sr-only"
              id="inlineRadio7"
              name="inlineRadioOptions7"
              onClick={() => {
                setWhitelistType('standard')
              }}
              type="radio"
              value="nft-storage"
            />
            <label
              className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
              htmlFor="inlineRadio7"
            >
              Standard Whitelist
            </label>
          </div>

          <div className="form-check form-check-inline">
            <input
              checked={whitelistType === 'flex'}
              className="peer sr-only"
              id="inlineRadio8"
              name="inlineRadioOptions8"
              onClick={() => {
                setWhitelistType('flex')
              }}
              type="radio"
              value="flex"
            />
            <label
              className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
              htmlFor="inlineRadio8"
            >
              Whitelist Flex
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2">
          <FormGroup subtitle="Information about your minting settings" title="Whitelist Minting Details">
            <NumberInput isRequired {...unitPriceState} />
            <NumberInput isRequired {...memberLimitState} />
            <Conditional test={whitelistType === 'standard'}>
              <NumberInput isRequired {...perAddressLimitState} />
            </Conditional>
            <FormControl
              htmlId="start-date"
              isRequired
              subtitle="Start time for minting tokens to whitelisted addresses"
              title={`Whitelist Start Time ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
            >
              <InputDateTime
                minDate={
                  timezone === 'Local' ? new Date() : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
                }
                onChange={(date) =>
                  date
                    ? setStartDate(
                        timezone === 'Local'
                          ? date
                          : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
                      )
                    : setStartDate(undefined)
                }
                value={
                  timezone === 'Local'
                    ? startDate
                    : startDate
                    ? new Date(startDate.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
                    : undefined
                }
              />
            </FormControl>
            <FormControl
              htmlId="end-date"
              isRequired
              subtitle="Whitelist End Time dictates when public sales will start"
              title={`Whitelist End Time ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
            >
              <InputDateTime
                minDate={
                  timezone === 'Local' ? new Date() : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
                }
                onChange={(date) =>
                  date
                    ? setEndDate(
                        timezone === 'Local'
                          ? date
                          : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
                      )
                    : setEndDate(undefined)
                }
                value={
                  timezone === 'Local'
                    ? endDate
                    : endDate
                    ? new Date(endDate.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
                    : undefined
                }
              />
            </FormControl>
          </FormGroup>
          <div>
            <div className="mt-2 ml-3 w-[65%] form-control">
              <label className="justify-start cursor-pointer label">
                <span className="mr-4 font-bold">Mutable Administrator Addresses</span>
                <input
                  checked={adminsMutable}
                  className={`toggle ${adminsMutable ? `bg-stargaze` : `bg-gray-600`}`}
                  onClick={() => setAdminsMutable(!adminsMutable)}
                  type="checkbox"
                />
              </label>
            </div>
            <div className="my-4 ml-4">
              <AddressList
                entries={addressListState.entries}
                onAdd={addressListState.add}
                onChange={addressListState.update}
                onRemove={addressListState.remove}
                subtitle="The list of administrator addresses"
                title="Administrator Addresses"
              />
            </div>
            <Conditional test={whitelistType === 'standard'}>
              <FormGroup
                subtitle={
                  <div>
                    <span>TXT file that contains the whitelisted addresses</span>
                    <Button className="mt-2 text-sm text-white" onClick={downloadSampleWhitelistFile}>
                      Download Sample File
                    </Button>
                  </div>
                }
                title="Whitelist File"
              >
                <WhitelistUpload onChange={whitelistFileOnChange} />
              </FormGroup>
              <Conditional test={whitelistStandardArray.length > 0}>
                <JsonPreview content={whitelistStandardArray} initialState title="File Contents" />
              </Conditional>
            </Conditional>
            <Conditional test={whitelistType === 'flex'}>
              <FormGroup
                subtitle={
                  <div>
                    <span>CSV file that contains the whitelisted addresses and corresponding mint counts</span>
                    <Button className="mt-2 text-sm text-white" onClick={downloadSampleWhitelistFlexFile}>
                      Download Sample File
                    </Button>
                  </div>
                }
                title="Whitelist File"
              >
                <WhitelistFlexUpload onChange={whitelistFlexFileOnChange} />
              </FormGroup>
              <Conditional test={whitelistFlexArray.length > 0}>
                <JsonPreview content={whitelistFlexArray} initialState={false} title="File Contents" />
              </Conditional>
            </Conditional>
          </div>
        </div>
      </Conditional>
    </div>
  )
}
