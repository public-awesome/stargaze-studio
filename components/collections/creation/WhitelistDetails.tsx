/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-nested-ternary */
import { coin } from '@cosmjs/proto-signing'
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
import type { Stage } from 'contracts/whitelist/messages/execute'
import React, { useEffect, useState } from 'react'
import { isValidAddress } from 'utils/isValidAddress'
import { useWallet } from 'utils/wallet'

import { Conditional } from '../../Conditional'
import { AddressInput, NumberInput, TextInput } from '../../forms/FormInput'
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
  stageCount?: number
  contractAddress?: string
  members?: string[][] | WhitelistFlexMember[][]
  stages?: Stage[]
  memberLimit?: number
  admins?: string[]
  adminsMutable?: boolean
}

type WhitelistState = 'none' | 'existing' | 'new'

export type WhitelistType = 'standard' | 'flex' | 'merkletree' | 'merkletree-flex'

export const WhitelistDetails = ({
  onChange,
  mintingTokenFromFactory,
  importedWhitelistDetails,
}: WhitelistDetailsProps) => {
  const wallet = useWallet()
  const { timezone } = useGlobalSettings()

  const [whitelistState, setWhitelistState] = useState<WhitelistState>('none')
  const [whitelistType, setWhitelistType] = useState<WhitelistType>('standard')

  const [stageCount, setStageCount] = useState<number>(1)

  const [stageOneStartDate, setStageOneStartDate] = useState<Date | undefined>(undefined)
  const [stageOneEndDate, setStageOneEndDate] = useState<Date | undefined>(undefined)

  const [stageTwoStartDate, setStageTwoStartDate] = useState<Date | undefined>(undefined)
  const [stageTwoEndDate, setStageTwoEndDate] = useState<Date | undefined>(undefined)

  const [stageThreeStartDate, setStageThreeStartDate] = useState<Date | undefined>(undefined)
  const [stageThreeEndDate, setStageThreeEndDate] = useState<Date | undefined>(undefined)

  const [whitelistStandardStageOneArray, setWhitelistStandardStageOneArray] = useState<string[]>([])
  const [whitelistStandardStageTwoArray, setWhitelistStandardStageTwoArray] = useState<string[]>([])
  const [whitelistStandardStageThreeArray, setWhitelistStandardStageThreeArray] = useState<string[]>([])

  const [whitelistFlexStageOneArray, setWhitelistFlexStageOneArray] = useState<WhitelistFlexMember[]>([])
  const [whitelistFlexStageTwoArray, setWhitelistFlexStageTwoArray] = useState<WhitelistFlexMember[]>([])
  const [whitelistFlexStageThreeArray, setWhitelistFlexStageThreeArray] = useState<WhitelistFlexMember[]>([])

  const [whitelistMerkleTreeStageOneArray, setWhitelistMerkleTreeStageOneArray] = useState<string[]>([])
  const [whitelistMerkleTreeStageTwoArray, setWhitelistMerkleTreeStageTwoArray] = useState<string[]>([])
  const [whitelistMerkleTreeStageThreeArray, setWhitelistMerkleTreeStageThreeArray] = useState<string[]>([])

  const [whitelistMerkleTreeFlexStageOneArray, setWhitelistMerkleTreeFlexStageOneArray] = useState<
    WhitelistFlexMember[]
  >([])
  const [whitelistMerkleTreeFlexStageTwoArray, setWhitelistMerkleTreeFlexStageTwoArray] = useState<
    WhitelistFlexMember[]
  >([])
  const [whitelistMerkleTreeFlexStageThreeArray, setWhitelistMerkleTreeFlexStageThreeArray] = useState<
    WhitelistFlexMember[]
  >([])

  const [adminsMutable, setAdminsMutable] = useState<boolean>(true)

  const whitelistAddressState = useInputState({
    id: 'whitelist-address',
    name: 'whitelistAddress',
    title: 'Whitelist Address',
    defaultValue: '',
  })

  const stageOneNameState = useInputState({
    id: 'stage-one-name',
    name: 'stage-one-name',
    title: 'Stage Name',
    defaultValue: 'Stage I',
  })

  const stageTwoNameState = useInputState({
    id: 'stage-two-name',
    name: 'stage-two-name',
    title: 'Stage Name',
    defaultValue: 'Stage II',
  })

  const stageThreeNameState = useInputState({
    id: 'stage-three-name',
    name: 'stage-three-name',
    title: 'Stage Name',
    defaultValue: 'Stage III',
  })

  const stageOneUnitPriceState = useNumberInputState({
    id: 'stage-one-unit-price',
    name: 'unitPrice',
    title: 'Unit Price',
    subtitle: `Token price for whitelisted addresses \n (min. 0 ${
      mintingTokenFromFactory ? mintingTokenFromFactory.displayName : 'STARS'
    })`,
    placeholder: '25',
  })

  const stageTwoUnitPriceState = useNumberInputState({
    id: 'stage-two-unit-price',
    name: 'unitPrice',
    title: 'Unit Price',
    subtitle: `Token price for whitelisted addresses \n (min. 0 ${
      mintingTokenFromFactory ? mintingTokenFromFactory.displayName : 'STARS'
    })`,
    placeholder: '25',
  })

  const stageThreeUnitPriceState = useNumberInputState({
    id: 'stage-three-unit-price',
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
    subtitle: 'Limited to 10k addresses in total during instantiation',
    placeholder: '1000',
  })

  const stageOnePerAddressLimitState = useNumberInputState({
    id: 'stage-one-per-address-limit',
    name: 'perAddressLimit',
    title: 'Per Address Limit',
    subtitle: 'Maximum number of tokens per whitelisted address',
    placeholder: '5',
  })
  const stageTwoPerAddressLimitState = useNumberInputState({
    id: 'stage-one-per-address-limit',
    name: 'perAddressLimit',
    title: 'Per Address Limit',
    subtitle: 'Maximum number of tokens per whitelisted address',
    placeholder: '5',
  })
  const stageThreePerAddressLimitState = useNumberInputState({
    id: 'stage-one-per-address-limit',
    name: 'perAddressLimit',
    title: 'Per Address Limit',
    subtitle: 'Maximum number of tokens per whitelisted address',
    placeholder: '5',
  })

  const addressListState = useAddressListState()

  const stageOneWhitelistFileOnChange = (data: string[]) => {
    if (whitelistType === 'standard') setWhitelistStandardStageOneArray(data)
    if (whitelistType === 'merkletree') setWhitelistMerkleTreeStageOneArray(data)
  }

  const stageOneWhitelistFlexFileOnChange = (whitelistData: WhitelistFlexMember[]) => {
    if (whitelistType === 'flex') setWhitelistFlexStageOneArray(whitelistData)
    if (whitelistType === 'merkletree-flex') setWhitelistMerkleTreeFlexStageOneArray(whitelistData)
  }

  const stageTwoWhitelistFileOnChange = (data: string[]) => {
    if (whitelistType === 'standard') setWhitelistStandardStageTwoArray(data)
    if (whitelistType === 'merkletree') setWhitelistMerkleTreeStageTwoArray(data)
  }

  const stageTwoWhitelistFlexFileOnChange = (whitelistData: WhitelistFlexMember[]) => {
    if (whitelistType === 'flex') setWhitelistFlexStageTwoArray(whitelistData)
    if (whitelistType === 'merkletree-flex') setWhitelistMerkleTreeFlexStageTwoArray(whitelistData)
  }

  const stageThreeWhitelistFileOnChange = (data: string[]) => {
    if (whitelistType === 'standard') setWhitelistStandardStageThreeArray(data)
    if (whitelistType === 'merkletree') setWhitelistMerkleTreeStageThreeArray(data)
  }

  const stageThreeWhitelistFlexFileOnChange = (whitelistData: WhitelistFlexMember[]) => {
    if (whitelistType === 'flex') setWhitelistFlexStageThreeArray(whitelistData)
    if (whitelistType === 'merkletree-flex') setWhitelistMerkleTreeFlexStageThreeArray(whitelistData)
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

  const addStage = () => {
    setStageCount((count) => count + 1)
  }

  const removeStage = () => {
    setStageCount((count) => count - 1)
  }

  useEffect(() => {
    if (!importedWhitelistDetails) {
      setStageCount(1)

      setWhitelistStandardStageOneArray([])
      setWhitelistFlexStageOneArray([])
      setWhitelistMerkleTreeStageOneArray([])
      setWhitelistMerkleTreeFlexStageOneArray([])

      setWhitelistStandardStageTwoArray([])
      setWhitelistFlexStageTwoArray([])
      setWhitelistMerkleTreeStageTwoArray([])
      setWhitelistMerkleTreeFlexStageTwoArray([])

      setWhitelistStandardStageThreeArray([])
      setWhitelistFlexStageThreeArray([])
      setWhitelistMerkleTreeStageThreeArray([])
      setWhitelistMerkleTreeFlexStageThreeArray([])
    }
  }, [whitelistType])

  useEffect(() => {
    if (stageCount === 1) {
      setWhitelistStandardStageTwoArray([])
      setWhitelistFlexStageTwoArray([])
      setWhitelistMerkleTreeStageTwoArray([])
      setWhitelistMerkleTreeFlexStageTwoArray([])

      setWhitelistStandardStageThreeArray([])
      setWhitelistFlexStageThreeArray([])
      setWhitelistMerkleTreeStageThreeArray([])
      setWhitelistMerkleTreeFlexStageThreeArray([])
    } else if (stageCount === 2) {
      setWhitelistStandardStageThreeArray([])
      setWhitelistFlexStageThreeArray([])
      setWhitelistMerkleTreeStageThreeArray([])
      setWhitelistMerkleTreeFlexStageThreeArray([])
    }
  }, [stageCount])

  useEffect(() => {
    const data: WhitelistDetailsDataProps = {
      whitelistState,
      whitelistType,
      stageCount,
      contractAddress: whitelistAddressState.value
        .toLowerCase()
        .replace(/,/g, '')
        .replace(/"/g, '')
        .replace(/'/g, '')
        .replace(/ /g, ''),
      members:
        whitelistType === 'standard'
          ? [whitelistStandardStageOneArray, whitelistStandardStageTwoArray, whitelistStandardStageThreeArray]
          : whitelistType === 'merkletree'
          ? [whitelistMerkleTreeStageOneArray, whitelistMerkleTreeStageTwoArray, whitelistMerkleTreeStageThreeArray]
          : whitelistType === 'flex'
          ? [whitelistFlexStageOneArray, whitelistFlexStageTwoArray, whitelistFlexStageThreeArray]
          : [
              whitelistMerkleTreeFlexStageOneArray,
              whitelistMerkleTreeFlexStageTwoArray,
              whitelistMerkleTreeFlexStageThreeArray,
            ],
      stages: [
        {
          name: stageOneNameState.value || '',
          startTime: stageOneStartDate ? (stageOneStartDate.getTime() * 1_000_000).toString() : '',
          endTime: stageOneEndDate ? (stageOneEndDate.getTime() * 1_000_000).toString() : '',
          perAddressLimit: stageOnePerAddressLimitState.value,
          mintPrice: coin(
            stageOneUnitPriceState?.value
              ? isNaN(Number(stageOneUnitPriceState.value))
                ? '0'
                : (Number(stageOneUnitPriceState.value) * 1_000_000).toString()
              : '0',
            mintingTokenFromFactory?.denom || 'ustars',
          ),
        },
        {
          name: stageTwoNameState.value || '',
          startTime: stageTwoStartDate ? (stageTwoStartDate.getTime() * 1_000_000).toString() : '',
          endTime: stageTwoEndDate ? (stageTwoEndDate.getTime() * 1_000_000).toString() : '',
          perAddressLimit: stageTwoPerAddressLimitState.value,
          mintPrice: coin(
            stageTwoUnitPriceState?.value
              ? isNaN(Number(stageTwoUnitPriceState.value))
                ? '0'
                : (Number(stageTwoUnitPriceState.value) * 1_000_000).toString()
              : '0',
            mintingTokenFromFactory?.denom || 'ustars',
          ),
        },
        {
          name: stageThreeNameState.value || '',
          startTime: stageThreeStartDate ? (stageThreeStartDate.getTime() * 1_000_000).toString() : '',
          endTime: stageThreeEndDate ? (stageThreeEndDate.getTime() * 1_000_000).toString() : '',
          perAddressLimit: stageThreePerAddressLimitState.value,
          mintPrice: coin(
            stageThreeUnitPriceState?.value
              ? isNaN(Number(stageThreeUnitPriceState.value))
                ? '0'
                : (Number(stageThreeUnitPriceState.value) * 1_000_000).toString()
              : '0',
            mintingTokenFromFactory?.denom || 'ustars',
          ),
        },
      ],
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
    memberLimitState.value,
    stageOneNameState.value,
    stageTwoNameState.value,
    stageThreeNameState.value,
    stageOneStartDate,
    stageOneEndDate,
    stageOneUnitPriceState.value,
    stageOnePerAddressLimitState.value,
    stageTwoStartDate,
    stageTwoEndDate,
    stageTwoUnitPriceState.value,
    stageTwoPerAddressLimitState.value,
    stageThreeStartDate,
    stageThreeEndDate,
    stageThreeUnitPriceState.value,
    stageThreePerAddressLimitState.value,
    whitelistStandardStageOneArray,
    whitelistFlexStageOneArray,
    whitelistMerkleTreeStageOneArray,
    whitelistMerkleTreeFlexStageOneArray,
    whitelistStandardStageTwoArray,
    whitelistFlexStageTwoArray,
    whitelistMerkleTreeStageTwoArray,
    whitelistMerkleTreeFlexStageTwoArray,
    whitelistStandardStageThreeArray,
    whitelistFlexStageThreeArray,
    whitelistMerkleTreeStageThreeArray,
    whitelistMerkleTreeFlexStageThreeArray,
    whitelistState,
    whitelistType,
    stageCount,
    addressListState.values,
    adminsMutable,
    mintingTokenFromFactory,
  ])

  useEffect(() => {
    setStageTwoStartDate(stageOneEndDate)
  }, [stageOneEndDate])

  useEffect(() => {
    setStageThreeStartDate(stageTwoEndDate)
  }, [stageTwoEndDate])

  // make the necessary changes with respect to imported whitelist details
  useEffect(() => {
    if (importedWhitelistDetails) {
      setWhitelistState(importedWhitelistDetails.whitelistState)
      setWhitelistType(importedWhitelistDetails.whitelistType)
      setStageCount(importedWhitelistDetails.stageCount ? importedWhitelistDetails.stageCount : 1)

      whitelistAddressState.onChange(
        importedWhitelistDetails.contractAddress ? importedWhitelistDetails.contractAddress : '',
      )

      stageOneNameState.onChange(
        importedWhitelistDetails.stages && importedWhitelistDetails.stages.length > 0
          ? importedWhitelistDetails.stages[0].name || 'Stage I'
          : '',
      )

      stageTwoNameState.onChange(
        importedWhitelistDetails.stages && importedWhitelistDetails.stages.length > 1
          ? importedWhitelistDetails.stages[1].name || 'Stage II'
          : '',
      )

      stageThreeNameState.onChange(
        importedWhitelistDetails.stages && importedWhitelistDetails.stages.length > 2
          ? importedWhitelistDetails.stages[2].name || 'Stage III'
          : '',
      )

      stageOneUnitPriceState.onChange(
        importedWhitelistDetails.stages && importedWhitelistDetails.stages.length > 0
          ? Number(importedWhitelistDetails.stages[0].mintPrice?.amount) / 1000000
          : 0,
      )

      stageTwoUnitPriceState.onChange(
        importedWhitelistDetails.stages && importedWhitelistDetails.stages.length > 1
          ? Number(importedWhitelistDetails.stages[1].mintPrice?.amount) / 1000000
          : 0,
      )

      stageThreeUnitPriceState.onChange(
        importedWhitelistDetails.stages && importedWhitelistDetails.stages.length > 2
          ? Number(importedWhitelistDetails.stages[2].mintPrice?.amount) / 1000000
          : 0,
      )

      memberLimitState.onChange(importedWhitelistDetails.memberLimit ? importedWhitelistDetails.memberLimit : 0)

      stageOnePerAddressLimitState.onChange(
        importedWhitelistDetails.stages && importedWhitelistDetails.stages.length > 0
          ? (importedWhitelistDetails.stages[0].perAddressLimit as number)
          : 0,
      )

      stageTwoPerAddressLimitState.onChange(
        importedWhitelistDetails.stages && importedWhitelistDetails.stages.length > 1
          ? (importedWhitelistDetails.stages[1].perAddressLimit as number)
          : 0,
      )

      stageThreePerAddressLimitState.onChange(
        importedWhitelistDetails.stages && importedWhitelistDetails.stages.length > 2
          ? (importedWhitelistDetails.stages[2].perAddressLimit as number)
          : 0,
      )

      setStageOneStartDate(
        importedWhitelistDetails.stages &&
          importedWhitelistDetails.stages.length > 0 &&
          importedWhitelistDetails.stages[0].startTime
          ? new Date(Number(importedWhitelistDetails.stages[0].startTime) / 1_000_000)
          : undefined,
      )
      setStageOneEndDate(
        importedWhitelistDetails.stages &&
          importedWhitelistDetails.stages.length > 0 &&
          importedWhitelistDetails.stages[0].endTime
          ? new Date(Number(importedWhitelistDetails.stages[0].endTime) / 1_000_000)
          : undefined,
      )

      setStageTwoStartDate(
        importedWhitelistDetails.stages &&
          importedWhitelistDetails.stages.length > 1 &&
          importedWhitelistDetails.stages[1].startTime
          ? new Date(Number(importedWhitelistDetails.stages[1].startTime) / 1_000_000)
          : undefined,
      )
      setStageTwoEndDate(
        importedWhitelistDetails.stages &&
          importedWhitelistDetails.stages.length > 1 &&
          importedWhitelistDetails.stages[1].endTime
          ? new Date(Number(importedWhitelistDetails.stages[1].endTime) / 1_000_000)
          : undefined,
      )

      setStageThreeStartDate(
        importedWhitelistDetails.stages &&
          importedWhitelistDetails.stages.length > 2 &&
          importedWhitelistDetails.stages[2].startTime
          ? new Date(Number(importedWhitelistDetails.stages[2].startTime) / 1_000_000)
          : undefined,
      )
      setStageThreeEndDate(
        importedWhitelistDetails.stages &&
          importedWhitelistDetails.stages.length > 2 &&
          importedWhitelistDetails.stages[2].endTime
          ? new Date(Number(importedWhitelistDetails.stages[2].endTime) / 1_000_000)
          : undefined,
      )

      setAdminsMutable(importedWhitelistDetails.adminsMutable ? importedWhitelistDetails.adminsMutable : true)
      importedWhitelistDetails.admins?.forEach((admin) => {
        addressListState.reset()
        addressListState.add({ address: admin })
      })
      if (importedWhitelistDetails.whitelistType === 'standard') {
        setWhitelistStandardStageOneArray([])
        setWhitelistStandardStageTwoArray([])
        setWhitelistStandardStageThreeArray([])

        importedWhitelistDetails.members?.forEach((member, index) => {
          if (index === 0) {
            setWhitelistStandardStageOneArray(member as string[])
          } else if (index === 1) {
            setWhitelistStandardStageTwoArray(member as string[])
          } else if (index === 2) {
            setWhitelistStandardStageThreeArray(member as string[])
          }
        })
      } else if (importedWhitelistDetails.whitelistType === 'merkletree') {
        setWhitelistMerkleTreeStageOneArray([])
        setWhitelistMerkleTreeStageTwoArray([])
        setWhitelistMerkleTreeStageThreeArray([])

        // importedWhitelistDetails.members?.forEach((member, index) => {
        //   if (index === 0) {
        //     setWhitelistMerkleTreeStageOneArray(member as string[])
        //   } else if (index === 1) {
        //     setWhitelistMerkleTreeStageTwoArray(member as string[])
        //   } else if (index === 2) {
        //     setWhitelistMerkleTreeStageThreeArray(member as string[])
        //   }
        // })
      } else if (importedWhitelistDetails.whitelistType === 'flex') {
        setWhitelistFlexStageOneArray([])
        setWhitelistFlexStageTwoArray([])
        setWhitelistFlexStageThreeArray([])
        // importedWhitelistDetails.members?.forEach((member) => {
        //   setWhitelistFlexArray((flexArray) => [
        //     ...flexArray,
        //     {
        //       address: (member as WhitelistFlexMember).address,
        //       mint_count: (member as WhitelistFlexMember).mint_count,
        //     },
        //   ])
        // })

        importedWhitelistDetails.members?.forEach((member, index) => {
          if (index === 0) {
            setWhitelistFlexStageOneArray(member as WhitelistFlexMember[])
          } else if (index === 1) {
            setWhitelistFlexStageTwoArray(member as WhitelistFlexMember[])
          } else if (index === 2) {
            setWhitelistFlexStageThreeArray(member as WhitelistFlexMember[])
          }
        })
      } else if (importedWhitelistDetails.whitelistType === 'merkletree-flex') {
        setWhitelistMerkleTreeFlexStageOneArray([])
        setWhitelistMerkleTreeFlexStageTwoArray([])
        setWhitelistMerkleTreeFlexStageThreeArray([])
        // importedWhitelistDetails.members?.forEach((member) => {
        //   setWhitelistMerkleTreeFlexArray((merkleTreeFlexArray) => [
        //     ...merkleTreeFlexArray,
        //     {
        //       address: (member as WhitelistFlexMember).address,
        //       mint_count: (member as WhitelistFlexMember).mint_count,
        //     },
        //   ])
        // })

        importedWhitelistDetails.members?.forEach((member, index) => {
          if (index === 0) {
            setWhitelistMerkleTreeFlexStageOneArray(member as WhitelistFlexMember[])
          } else if (index === 1) {
            setWhitelistMerkleTreeFlexStageTwoArray(member as WhitelistFlexMember[])
          } else if (index === 2) {
            setWhitelistMerkleTreeFlexStageThreeArray(member as WhitelistFlexMember[])
          }
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
        <div className="flex justify-between my-5 ml-6 max-w-[750px] text-lg font-bold">
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
              value="standard"
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
          <div className="form-check form-check-inline">
            <input
              checked={whitelistType === 'merkletree'}
              className="peer sr-only"
              id="inlineRadio9"
              name="inlineRadioOptions9"
              onClick={() => {
                setWhitelistType('merkletree')
              }}
              type="radio"
              value="merkletree"
            />
            <label
              className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
              htmlFor="inlineRadio9"
            >
              Whitelist Merkle Tree
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              checked={whitelistType === 'merkletree-flex'}
              className="peer sr-only"
              id="inlineRadio10"
              name="inlineRadioOptions10"
              onClick={() => {
                setWhitelistType('merkletree-flex')
              }}
              type="radio"
              value="merkletree-flex"
            />
            <label
              className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
              htmlFor="inlineRadio10"
            >
              Whitelist Merkle Tree Flex
            </label>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="grid grid-cols-2">
            <Conditional test={whitelistType === 'standard' || whitelistType === 'flex'}>
              <FormGroup subtitle="Primary whitelist configuration" title="Whitelist Details">
                <NumberInput isRequired {...memberLimitState} />
              </FormGroup>
            </Conditional>
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
            </div>
          </div>
          <div className="grid grid-cols-2">
            <FormGroup subtitle="Information about your minting settings" title="Whitelist Stage I Minting Details">
              <TextInput {...stageOneNameState} />
              <NumberInput isRequired {...stageOneUnitPriceState} />
              <Conditional test={whitelistType === 'standard' || whitelistType === 'merkletree'}>
                <NumberInput isRequired {...stageOnePerAddressLimitState} />
              </Conditional>
              <FormControl
                htmlId="start-date"
                isRequired
                subtitle="Start time for minting tokens for Stage I"
                title={`Stage I Start Time ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
              >
                <InputDateTime
                  minDate={
                    timezone === 'Local'
                      ? new Date()
                      : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
                  }
                  onChange={(date) =>
                    date
                      ? setStageOneStartDate(
                          timezone === 'Local'
                            ? date
                            : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
                        )
                      : setStageOneStartDate(undefined)
                  }
                  value={
                    timezone === 'Local'
                      ? stageOneStartDate
                      : stageOneStartDate
                      ? new Date(stageOneStartDate.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
                      : undefined
                  }
                />
              </FormControl>
              <FormControl
                htmlId="end-date"
                isRequired
                subtitle={`End time dictates when ${
                  stageCount > 1 ? 'the next stage will start' : 'public sales will start'
                }`}
                title={`Stage I End Time ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
              >
                <InputDateTime
                  minDate={
                    timezone === 'Local'
                      ? new Date()
                      : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
                  }
                  onChange={(date) =>
                    date
                      ? setStageOneEndDate(
                          timezone === 'Local'
                            ? date
                            : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
                        )
                      : setStageOneEndDate(undefined)
                  }
                  value={
                    timezone === 'Local'
                      ? stageOneEndDate
                      : stageOneEndDate
                      ? new Date(stageOneEndDate.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
                      : undefined
                  }
                />
              </FormControl>
            </FormGroup>

            <Conditional test={whitelistType === 'standard'}>
              <div className="flex flex-col">
                <FormGroup
                  subtitle={
                    <div>
                      <span>TXT file that contains the whitelisted addresses for Stage I</span>
                      <Button className="mt-2 text-sm text-white" onClick={downloadSampleWhitelistFile}>
                        Download Sample File
                      </Button>
                    </div>
                  }
                  title="Whitelist File"
                >
                  <WhitelistUpload onChange={stageOneWhitelistFileOnChange} />
                </FormGroup>
                <Conditional test={whitelistStandardStageOneArray.length > 0}>
                  <JsonPreview content={whitelistStandardStageOneArray} initialState title="File Contents" />
                </Conditional>
              </div>
            </Conditional>
            <Conditional test={whitelistType === 'flex'}>
              <div className="flex flex-col">
                <FormGroup
                  subtitle={
                    <div>
                      <span>
                        CSV file that contains the whitelisted addresses and corresponding mint counts for Stage I
                      </span>
                      <Button className="mt-2 text-sm text-white" onClick={downloadSampleWhitelistFlexFile}>
                        Download Sample File
                      </Button>
                    </div>
                  }
                  title="Whitelist File"
                >
                  <WhitelistFlexUpload onChange={stageOneWhitelistFlexFileOnChange} />
                </FormGroup>
                <Conditional test={whitelistFlexStageOneArray.length > 0}>
                  <JsonPreview content={whitelistFlexStageOneArray} initialState title="File Contents" />
                </Conditional>
              </div>
            </Conditional>
            <Conditional test={whitelistType === 'merkletree'}>
              <div className="flex flex-col">
                <FormGroup
                  subtitle={
                    <div>
                      <span>TXT file that contains the whitelisted addresses for Stage I</span>
                      <Button className="mt-2 text-sm text-white" onClick={downloadSampleWhitelistFile}>
                        Download Sample File
                      </Button>
                    </div>
                  }
                  title="Whitelist File"
                >
                  <WhitelistUpload onChange={stageOneWhitelistFileOnChange} />
                </FormGroup>
                <Conditional test={whitelistStandardStageOneArray.length > 0}>
                  <JsonPreview content={whitelistStandardStageOneArray} initialState title="File Contents" />
                </Conditional>
              </div>
            </Conditional>
            <Conditional test={whitelistType === 'merkletree-flex'}>
              <div className="flex flex-col">
                <FormGroup
                  subtitle={
                    <div>
                      <span>
                        CSV file that contains the whitelisted addresses and corresponding mint counts for Stage I
                      </span>
                      <Button className="mt-2 text-sm text-white" onClick={downloadSampleWhitelistFlexFile}>
                        Download Sample File
                      </Button>
                    </div>
                  }
                  title="Whitelist File"
                >
                  <WhitelistFlexUpload onChange={stageOneWhitelistFlexFileOnChange} />
                </FormGroup>
                <Conditional test={whitelistMerkleTreeFlexStageOneArray.length > 0}>
                  <JsonPreview content={whitelistMerkleTreeFlexStageOneArray} initialState title="File Contents" />
                </Conditional>
              </div>
            </Conditional>
          </div>
          <Conditional test={stageCount === 1}>
            <div className="flex justify-end">
              <Button className="my-2 mr-4 w-40 text-sm text-white" onClick={addStage}>
                Add Whitelist Stage
              </Button>
            </div>
          </Conditional>

          <Conditional test={stageCount > 1}>
            <div className="grid grid-cols-2 mt-4">
              <FormGroup subtitle="Information about your minting settings" title="Whitelist Stage II Minting Details">
                <TextInput {...stageTwoNameState} />
                <NumberInput isRequired {...stageTwoUnitPriceState} />
                <Conditional test={whitelistType === 'standard' || whitelistType === 'merkletree'}>
                  <NumberInput isRequired {...stageTwoPerAddressLimitState} />
                </Conditional>
                <FormControl
                  htmlId="start-date-2"
                  isRequired
                  subtitle="Start time for minting tokens for Stage II"
                  title={`Stage II Start Time ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
                >
                  <InputDateTime
                    disabled
                    minDate={
                      timezone === 'Local'
                        ? new Date()
                        : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
                    }
                    onChange={(date) =>
                      date
                        ? setStageTwoStartDate(
                            timezone === 'Local'
                              ? date
                              : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
                          )
                        : setStageTwoStartDate(undefined)
                    }
                    value={
                      timezone === 'Local'
                        ? stageOneEndDate
                        : stageOneEndDate
                        ? new Date(stageOneEndDate.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
                        : undefined
                    }
                  />
                </FormControl>
                <FormControl
                  htmlId="end-date-2"
                  isRequired
                  subtitle={`End time dictates when ${
                    stageCount > 2 ? 'the next stage will start' : 'public sales will start'
                  }`}
                  title={`Stage II End Time ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
                >
                  <InputDateTime
                    minDate={
                      timezone === 'Local'
                        ? new Date()
                        : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
                    }
                    onChange={(date) =>
                      date
                        ? setStageTwoEndDate(
                            timezone === 'Local'
                              ? date
                              : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
                          )
                        : setStageTwoEndDate(undefined)
                    }
                    value={
                      timezone === 'Local'
                        ? stageTwoEndDate
                        : stageTwoEndDate
                        ? new Date(stageTwoEndDate.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
                        : undefined
                    }
                  />
                </FormControl>
              </FormGroup>
              <div>
                <Conditional test={whitelistType === 'standard'}>
                  <div className="flex flex-col">
                    <FormGroup
                      subtitle={
                        <div>
                          <span>TXT file that contains the whitelisted addresses for Stage II</span>
                        </div>
                      }
                      title="Whitelist File"
                    >
                      <WhitelistUpload onChange={stageTwoWhitelistFileOnChange} />
                    </FormGroup>
                    <Conditional test={whitelistStandardStageTwoArray.length > 0}>
                      <JsonPreview content={whitelistStandardStageTwoArray} initialState title="File Contents" />
                    </Conditional>
                  </div>
                </Conditional>
                <Conditional test={whitelistType === 'flex'}>
                  <div className="flex flex-col">
                    <FormGroup
                      subtitle={
                        <div>
                          <span>
                            CSV file that contains the whitelisted addresses and corresponding mint counts for Stage II
                          </span>
                        </div>
                      }
                      title="Whitelist File"
                    >
                      <WhitelistFlexUpload onChange={stageTwoWhitelistFlexFileOnChange} />
                    </FormGroup>
                    <Conditional test={whitelistFlexStageTwoArray.length > 0}>
                      <JsonPreview content={whitelistFlexStageTwoArray} initialState title="File Contents" />
                    </Conditional>
                  </div>
                </Conditional>
                <Conditional test={whitelistType === 'merkletree'}>
                  <div className="flex flex-col">
                    <FormGroup
                      subtitle={
                        <div>
                          <span>TXT file that contains the whitelisted addresses for Stage II</span>
                        </div>
                      }
                      title="Whitelist File"
                    >
                      <WhitelistUpload onChange={stageTwoWhitelistFileOnChange} />
                    </FormGroup>
                    <Conditional test={whitelistStandardStageTwoArray.length > 0}>
                      <JsonPreview content={whitelistStandardStageTwoArray} initialState title="File Contents" />
                    </Conditional>
                  </div>
                </Conditional>
                <Conditional test={whitelistType === 'merkletree-flex'}>
                  <div className="flex flex-col">
                    <FormGroup
                      subtitle={
                        <div>
                          <span>
                            CSV file that contains the whitelisted addresses and corresponding mint counts for Stage II
                          </span>
                        </div>
                      }
                      title="Whitelist File"
                    >
                      <WhitelistFlexUpload onChange={stageTwoWhitelistFlexFileOnChange} />
                    </FormGroup>
                    <Conditional test={whitelistMerkleTreeFlexStageTwoArray.length > 0}>
                      <JsonPreview content={whitelistMerkleTreeFlexStageTwoArray} initialState title="File Contents" />
                    </Conditional>
                  </div>
                </Conditional>
              </div>
            </div>
            <Conditional test={stageCount === 2}>
              <div className="flex justify-end">
                <Button
                  className="my-2 mr-2 text-sm text-white bg-blue-500 hover:bg-blue-600 w-50"
                  onClick={removeStage}
                >
                  Remove Whitelist Stage
                </Button>
                <Button className="my-2 mr-4 w-40 text-sm text-white" onClick={addStage}>
                  Add Whitelist Stage
                </Button>
              </div>
            </Conditional>
          </Conditional>

          <Conditional test={stageCount > 2}>
            <div className="grid grid-cols-2 mt-4">
              <FormGroup subtitle="Information about your minting settings" title="Whitelist Stage III Minting Details">
                <TextInput {...stageThreeNameState} />
                <NumberInput isRequired {...stageThreeUnitPriceState} />
                <Conditional test={whitelistType === 'standard' || whitelistType === 'merkletree'}>
                  <NumberInput isRequired {...stageThreePerAddressLimitState} />
                </Conditional>
                <FormControl
                  htmlId="start-date-3"
                  isRequired
                  subtitle="Start time for minting tokens for Stage III"
                  title={`Stage III Start Time ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
                >
                  <InputDateTime
                    disabled
                    minDate={
                      timezone === 'Local'
                        ? new Date()
                        : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
                    }
                    onChange={(date) =>
                      date
                        ? setStageThreeStartDate(
                            timezone === 'Local'
                              ? date
                              : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
                          )
                        : setStageThreeStartDate(undefined)
                    }
                    value={
                      timezone === 'Local'
                        ? stageTwoEndDate
                        : stageTwoEndDate
                        ? new Date(stageTwoEndDate.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
                        : undefined
                    }
                  />
                </FormControl>
                <FormControl
                  htmlId="end-date"
                  isRequired
                  subtitle="End time dictates when public sales will start"
                  title={`Stage III End Time ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
                >
                  <InputDateTime
                    minDate={
                      timezone === 'Local'
                        ? new Date()
                        : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
                    }
                    onChange={(date) =>
                      date
                        ? setStageThreeEndDate(
                            timezone === 'Local'
                              ? date
                              : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
                          )
                        : setStageThreeEndDate(undefined)
                    }
                    value={
                      timezone === 'Local'
                        ? stageThreeEndDate
                        : stageThreeEndDate
                        ? new Date(stageThreeEndDate.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
                        : undefined
                    }
                  />
                </FormControl>
              </FormGroup>
              <div>
                <Conditional test={whitelistType === 'standard'}>
                  <div className="flex flex-col">
                    <FormGroup
                      subtitle={
                        <div>
                          <span>TXT file that contains the whitelisted addresses for Stage III</span>
                        </div>
                      }
                      title="Whitelist File"
                    >
                      <WhitelistUpload onChange={stageThreeWhitelistFileOnChange} />
                    </FormGroup>
                    <Conditional test={whitelistStandardStageThreeArray.length > 0}>
                      <JsonPreview content={whitelistStandardStageThreeArray} initialState title="File Contents" />
                    </Conditional>
                  </div>
                </Conditional>
                <Conditional test={whitelistType === 'flex'}>
                  <div className="flex flex-col">
                    <FormGroup
                      subtitle={
                        <div>
                          <span>
                            CSV file that contains the whitelisted addresses and corresponding mint counts for Stage III
                          </span>
                        </div>
                      }
                      title="Whitelist File"
                    >
                      <WhitelistFlexUpload onChange={stageThreeWhitelistFlexFileOnChange} />
                    </FormGroup>
                    <Conditional test={whitelistFlexStageThreeArray.length > 0}>
                      <JsonPreview content={whitelistFlexStageThreeArray} initialState title="File Contents" />
                    </Conditional>
                  </div>
                </Conditional>
                <Conditional test={whitelistType === 'merkletree'}>
                  <div className="flex flex-col">
                    <FormGroup
                      subtitle={
                        <div>
                          <span>TXT file that contains the whitelisted addresses for Stage III</span>
                        </div>
                      }
                      title="Whitelist File"
                    >
                      <WhitelistUpload onChange={stageThreeWhitelistFileOnChange} />
                    </FormGroup>
                    <Conditional test={whitelistStandardStageThreeArray.length > 0}>
                      <JsonPreview content={whitelistStandardStageThreeArray} initialState title="File Contents" />
                    </Conditional>
                  </div>
                </Conditional>
                <Conditional test={whitelistType === 'merkletree-flex'}>
                  <div className="flex flex-col">
                    <FormGroup
                      subtitle={
                        <div>
                          <span>
                            CSV file that contains the whitelisted addresses and corresponding mint counts for Stage III
                          </span>
                        </div>
                      }
                      title="Whitelist File"
                    >
                      <WhitelistFlexUpload onChange={stageThreeWhitelistFlexFileOnChange} />
                    </FormGroup>
                    <Conditional test={whitelistMerkleTreeFlexStageThreeArray.length > 0}>
                      <JsonPreview
                        content={whitelistMerkleTreeFlexStageThreeArray}
                        initialState
                        title="File Contents"
                      />
                    </Conditional>
                  </div>
                </Conditional>
              </div>
            </div>
            <Conditional test={stageCount === 3}>
              <div className="flex justify-end">
                <Button
                  className="my-2 mr-4 text-sm text-white bg-blue-500 hover:bg-blue-600 w-50"
                  onClick={removeStage}
                >
                  Remove Whitelist Stage
                </Button>
              </div>
            </Conditional>
          </Conditional>
        </div>
      </Conditional>
    </div>
  )
}
