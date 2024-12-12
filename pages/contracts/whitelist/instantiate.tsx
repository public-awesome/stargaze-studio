/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-nested-ternary */
import { coin } from '@cosmjs/proto-signing'
import axios from 'axios'
import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import CustomTokenSelect from 'components/CustomTokenSelect'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { AddressList } from 'components/forms/AddressList'
import { useAddressListState } from 'components/forms/AddressList.hooks'
import { NumberInput, TextInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { whitelistLinkTabs } from 'components/LinkTabs.data'
import { type WhitelistFlexMember, WhitelistFlexUpload } from 'components/WhitelistFlexUpload'
import { WhitelistUpload } from 'components/WhitelistUpload'
import { vendingMinterList } from 'config/minter'
import type { TokenInfo } from 'config/token'
import { ibcAtom } from 'config/token'
import { useContracts } from 'contexts/contracts'
import { useGlobalSettings } from 'contexts/globalSettings'
import type { InstantiateResponse } from 'contracts/sg721'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { type FormEvent, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { isValidAddress } from 'utils/isValidAddress'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { useWallet } from 'utils/wallet'

import {
  WHITELIST_CODE_ID,
  WHITELIST_FLEX_CODE_ID,
  WHITELIST_MERKLE_TREE_API_URL,
  WHITELIST_MERKLE_TREE_CODE_ID,
} from '../../../utils/constants'

const WhitelistInstantiatePage: NextPage = () => {
  const wallet = useWallet()
  const { whitelist: contract, whitelistMerkleTree: whitelistMerkleTreeContract } = useContracts()
  const { timezone } = useGlobalSettings()

  const [stageCount, setStageCount] = useState<number>(1)

  const [stageOneStartDate, setStageOneStartDate] = useState<Date | undefined>(undefined)
  const [stageOneEndDate, setStageOneEndDate] = useState<Date | undefined>(undefined)

  const [stageTwoStartDate, setStageTwoStartDate] = useState<Date | undefined>(undefined)
  const [stageTwoEndDate, setStageTwoEndDate] = useState<Date | undefined>(undefined)

  const [stageThreeStartDate, setStageThreeStartDate] = useState<Date | undefined>(undefined)
  const [stageThreeEndDate, setStageThreeEndDate] = useState<Date | undefined>(undefined)

  const [adminsMutable, setAdminsMutable] = useState<boolean>(true)
  const [whitelistType, setWhitelistType] = useState<'standard' | 'flex' | 'merkletree' | 'merkletree-flex'>('standard')

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

  const [selectedStageOneMintToken, setSelectedStageOneMintToken] = useState<TokenInfo | undefined>(ibcAtom)
  const [selectedStageTwoMintToken, setSelectedStageTwoMintToken] = useState<TokenInfo | undefined>(ibcAtom)
  const [selectedStageThreeMintToken, setSelectedStageThreeMintToken] = useState<TokenInfo | undefined>(ibcAtom)

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
    subtitle: 'Token price for whitelisted addresses',
    placeholder: '25',
  })

  const stageTwoUnitPriceState = useNumberInputState({
    id: 'stage-two-unit-price',
    name: 'unitPrice',
    title: 'Unit Price',
    subtitle: 'Token price for whitelisted addresses',
    placeholder: '25',
  })

  const stageThreeUnitPriceState = useNumberInputState({
    id: 'stage-three-unit-price',
    name: 'unitPrice',
    title: 'Unit Price',
    subtitle: 'Token price for whitelisted addresses',
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

  const { data, isLoading, mutate } = useMutation(
    async (event: FormEvent): Promise<InstantiateResponse | undefined | null> => {
      event.preventDefault()
      if (!contract) {
        throw new Error('Smart contract connection failed')
      }

      if (!whitelistMerkleTreeContract && whitelistType === 'merkletree') {
        throw new Error('Smart contract connection failed')
      }

      if (!stageOneStartDate) {
        throw new Error('Start date is required')
      }
      if (!stageOneEndDate) {
        throw new Error('End date is required')
      }

      const standardMsg = {
        members: [
          whitelistStandardStageOneArray,
          whitelistStandardStageTwoArray,
          whitelistStandardStageThreeArray,
        ].slice(0, stageCount),
        stages: [
          {
            name: stageOneNameState.value || 'Stage I',
            start_time: stageOneStartDate ? (stageOneStartDate.getTime() * 1_000_000).toString() : '',
            end_time: stageOneEndDate ? (stageOneEndDate.getTime() * 1_000_000).toString() : '',
            per_address_limit: stageOnePerAddressLimitState.value,
            mint_price: coin(
              stageOneUnitPriceState.value
                ? (Number(stageOneUnitPriceState.value) * 1_000_000).toString()
                : stageOneUnitPriceState.value === 0
                ? '0'
                : '',
              selectedStageOneMintToken?.denom || 'ustars',
            ),
          },
          {
            name: stageTwoNameState.value || 'Stage II',
            start_time: stageTwoStartDate ? (stageTwoStartDate.getTime() * 1_000_000).toString() : '',
            end_time: stageTwoEndDate ? (stageTwoEndDate.getTime() * 1_000_000).toString() : '',
            per_address_limit: stageTwoPerAddressLimitState.value,
            mint_price: coin(
              stageTwoUnitPriceState.value
                ? (Number(stageTwoUnitPriceState.value) * 1_000_000).toString()
                : stageTwoUnitPriceState.value === 0
                ? '0'
                : '',
              selectedStageTwoMintToken?.denom || 'ustars',
            ),
          },
          {
            name: stageThreeNameState.value || 'Stage III',
            start_time: stageThreeStartDate ? (stageThreeStartDate.getTime() * 1_000_000).toString() : '',
            end_time: stageThreeEndDate ? (stageThreeEndDate.getTime() * 1_000_000).toString() : '',
            per_address_limit: stageThreePerAddressLimitState.value,
            mint_price: coin(
              stageThreeUnitPriceState.value
                ? (Number(stageThreeUnitPriceState.value) * 1_000_000).toString()
                : stageThreeUnitPriceState.value === 0
                ? '0'
                : '',
              selectedStageThreeMintToken?.denom || 'ustars',
            ),
          },
        ].slice(0, stageCount),
        member_limit: memberLimitState.value,
        admins:
          addressListState.values.length > 0
            ? [
                ...new Set(
                  addressListState.values
                    .map((a) => a.address.trim())
                    .filter(
                      (address) => address !== '' && isValidAddress(address.trim()) && address.startsWith('stars'),
                    ),
                ),
              ]
            : [wallet.address ?? ''],
        admins_mutable: adminsMutable,
      }

      const flexMsg = {
        members: [whitelistFlexStageOneArray, whitelistFlexStageTwoArray, whitelistFlexStageThreeArray].slice(
          0,
          stageCount,
        ),
        stages: [
          {
            name: stageOneNameState.value || 'Stage I',
            start_time: stageOneStartDate ? (stageOneStartDate.getTime() * 1_000_000).toString() : '',
            end_time: stageOneEndDate ? (stageOneEndDate.getTime() * 1_000_000).toString() : '',
            mint_price: coin(
              stageOneUnitPriceState.value
                ? (Number(stageOneUnitPriceState.value) * 1_000_000).toString()
                : stageOneUnitPriceState.value === 0
                ? '0'
                : '',
              selectedStageOneMintToken?.denom || 'ustars',
            ),
          },
          {
            name: stageTwoNameState.value || 'Stage II',
            start_time: stageTwoStartDate ? (stageTwoStartDate.getTime() * 1_000_000).toString() : '',
            end_time: stageTwoEndDate ? (stageTwoEndDate.getTime() * 1_000_000).toString() : '',
            mint_price: coin(
              stageTwoUnitPriceState.value
                ? (Number(stageTwoUnitPriceState.value) * 1_000_000).toString()
                : stageTwoUnitPriceState.value === 0
                ? '0'
                : '',
              selectedStageTwoMintToken?.denom || 'ustars',
            ),
          },
          {
            name: stageThreeNameState.value || 'Stage III',
            start_time: stageThreeStartDate ? (stageThreeStartDate.getTime() * 1_000_000).toString() : '',
            end_time: stageThreeEndDate ? (stageThreeEndDate.getTime() * 1_000_000).toString() : '',
            mint_price: coin(
              stageThreeUnitPriceState.value
                ? (Number(stageThreeUnitPriceState.value) * 1_000_000).toString()
                : stageThreeUnitPriceState.value === 0
                ? '0'
                : '',
              selectedStageThreeMintToken?.denom || 'ustars',
            ),
          },
        ].slice(0, stageCount),
        member_limit: memberLimitState.value,
        admins:
          addressListState.values.length > 0
            ? [
                ...new Set(
                  addressListState.values
                    .map((a) => a.address.trim())
                    .filter(
                      (address) => address !== '' && isValidAddress(address.trim()) && address.startsWith('stars'),
                    ),
                ),
              ]
            : [wallet.address ?? ''],
        admins_mutable: adminsMutable,
      }

      if (whitelistType !== 'merkletree' && whitelistType !== 'merkletree-flex') {
        return toast.promise(
          contract.instantiate(
            whitelistType === 'standard' ? WHITELIST_CODE_ID : WHITELIST_FLEX_CODE_ID,
            whitelistType === 'standard' ? standardMsg : flexMsg,
            whitelistType === 'standard'
              ? 'Stargaze Tiered Whitelist Contract'
              : 'Stargaze Tiered Whitelist Flex Contract',
            wallet.address,
          ),
          {
            loading: 'Instantiating contract...',
            error: 'Instantiation failed!',
            success: 'Instantiation success!',
          },
        )
      } else if (whitelistType === 'merkletree') {
        const rootHashes = await Promise.all(
          (
            [
              whitelistMerkleTreeStageOneArray,
              whitelistMerkleTreeStageTwoArray,
              whitelistMerkleTreeStageThreeArray,
            ].slice(0, stageCount) || []
          ).map(async (memberList, index) => {
            const members = memberList as string[]
            const membersCsv = members.join('\n')
            const membersBlob = new Blob([membersCsv], { type: 'text/csv' })
            const membersFile = new File([membersBlob], `members_${index}.csv`, { type: 'text/csv' })

            const formData = new FormData()
            formData.append('whitelist', membersFile)
            formData.append('stage_id', index.toString())

            const response = await toast
              .promise(
                axios.post(`${WHITELIST_MERKLE_TREE_API_URL}/create_whitelist`, formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                }),
                {
                  loading: `Fetching merkle root hash for WL Stage ${index + 1}...`,
                  success: `Merkle root hash for WL Stage ${index + 1} fetched successfully.`,
                  error: `Error fetching root hash from Whitelist Merkle Tree API for Stage ${index + 1}.`,
                },
              )
              .catch((error) => {
                console.error('error', error)
                throw new Error('Whitelist instantiation failed.')
              })
            console.log(`Stage ${index + 1} root hash: `, response.data.root_hash)
            return response.data.root_hash
          }),
        )

        console.log('rootHashes: ', rootHashes)

        const merkleTreeMsg = {
          merkle_roots: rootHashes,
          merkle_tree_uris: null,
          stages: [
            {
              name: stageOneNameState.value || 'Stage I',
              start_time: stageOneStartDate ? (stageOneStartDate.getTime() * 1_000_000).toString() : '',
              end_time: stageOneEndDate ? (stageOneEndDate.getTime() * 1_000_000).toString() : '',
              per_address_limit: stageOnePerAddressLimitState.value,
              mint_price: coin(
                stageOneUnitPriceState.value
                  ? (Number(stageOneUnitPriceState.value) * 1_000_000).toString()
                  : stageOneUnitPriceState.value === 0
                  ? '0'
                  : '',
                selectedStageOneMintToken?.denom || 'ustars',
              ),
            },
            {
              name: stageTwoNameState.value || 'Stage II',
              start_time: stageTwoStartDate ? (stageTwoStartDate.getTime() * 1_000_000).toString() : '',
              end_time: stageTwoEndDate ? (stageTwoEndDate.getTime() * 1_000_000).toString() : '',
              per_address_limit: stageTwoPerAddressLimitState.value,
              mint_price: coin(
                stageTwoUnitPriceState.value
                  ? (Number(stageTwoUnitPriceState.value) * 1_000_000).toString()
                  : stageTwoUnitPriceState.value === 0
                  ? '0'
                  : '',
                selectedStageTwoMintToken?.denom || 'ustars',
              ),
            },
            {
              name: stageThreeNameState.value || 'Stage III',
              start_time: stageThreeStartDate ? (stageThreeStartDate.getTime() * 1_000_000).toString() : '',
              end_time: stageThreeEndDate ? (stageThreeEndDate.getTime() * 1_000_000).toString() : '',
              per_address_limit: stageThreePerAddressLimitState.value,
              mint_price: coin(
                stageThreeUnitPriceState.value
                  ? (Number(stageThreeUnitPriceState.value) * 1_000_000).toString()
                  : stageThreeUnitPriceState.value === 0
                  ? '0'
                  : '',
                selectedStageThreeMintToken?.denom || 'ustars',
              ),
            },
          ].slice(0, stageCount),
          admins:
            addressListState.values.length > 0
              ? [
                  ...new Set(
                    addressListState.values
                      .map((a) => a.address.trim())
                      .filter(
                        (address) => address !== '' && isValidAddress(address.trim()) && address.startsWith('stars'),
                      ),
                  ),
                ]
              : [wallet.address ?? ''],
          admins_mutable: adminsMutable,
        }

        return toast.promise(
          whitelistMerkleTreeContract?.instantiate(
            WHITELIST_MERKLE_TREE_CODE_ID,
            merkleTreeMsg,
            'Stargaze Whitelist Merkle Tree Contract',
            wallet.address,
          ) as Promise<InstantiateResponse>,
          {
            loading: 'Instantiating contract...',
            error: 'Instantiation failed!',
            success: 'Instantiation success!',
          },
        )
      } else if (whitelistType === 'merkletree-flex') {
        const rootHashes = await Promise.all(
          (
            [
              whitelistMerkleTreeFlexStageOneArray,
              whitelistMerkleTreeFlexStageTwoArray,
              whitelistMerkleTreeFlexStageThreeArray,
            ].slice(0, stageCount) || []
          ).map(async (memberList, index) => {
            const members = memberList as WhitelistFlexMember[]

            const membersCsv = members.map((member) => `${member.address},${member.mint_count}`).join('\n')

            const membersBlob = new Blob([`address,count\n${membersCsv}`], { type: 'text/csv' })
            const membersFile = new File([membersBlob], `members_${index}.csv`, { type: 'text/csv' })

            const formData = new FormData()
            formData.append('whitelist', membersFile)
            formData.append('stage_id', index.toString())

            const response = await toast
              .promise(
                axios.post(`${WHITELIST_MERKLE_TREE_API_URL}/create_whitelist`, formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                }),
                {
                  loading: `Fetching merkle root hash for WL Stage ${index + 1}...`,
                  success: `Merkle root hash for WL Stage ${index + 1} fetched successfully.`,
                  error: `Error fetching root hash from Whitelist Merkle Tree API for Stage ${index + 1}.`,
                },
              )
              .catch((error) => {
                console.error('error', error)
                throw new Error('Whitelist instantiation failed.')
              })
            console.log(`Stage ${index + 1} root hash: `, response.data.root_hash)
            return response.data.root_hash
          }),
        )

        console.log('Root hashes:', rootHashes)

        const merkleTreeFlexMsg = {
          merkle_roots: rootHashes,
          merkle_tree_uris: null,
          stages: [
            {
              name: stageOneNameState.value || 'Stage I',
              start_time: stageOneStartDate ? (stageOneStartDate.getTime() * 1_000_000).toString() : '',
              end_time: stageOneEndDate ? (stageOneEndDate.getTime() * 1_000_000).toString() : '',
              mint_price: coin(
                stageOneUnitPriceState.value
                  ? (Number(stageOneUnitPriceState.value) * 1_000_000).toString()
                  : stageOneUnitPriceState.value === 0
                  ? '0'
                  : '',
                selectedStageOneMintToken?.denom || 'ustars',
              ),
              per_address_limit: 1,
            },
            {
              name: stageTwoNameState.value || 'Stage II',
              start_time: stageTwoStartDate ? (stageTwoStartDate.getTime() * 1_000_000).toString() : '',
              end_time: stageTwoEndDate ? (stageTwoEndDate.getTime() * 1_000_000).toString() : '',
              mint_price: coin(
                stageTwoUnitPriceState.value
                  ? (Number(stageTwoUnitPriceState.value) * 1_000_000).toString()
                  : stageTwoUnitPriceState.value === 0
                  ? '0'
                  : '',
                selectedStageTwoMintToken?.denom || 'ustars',
              ),
              per_address_limit: 1,
            },
            {
              name: stageThreeNameState.value || 'Stage III',
              start_time: stageThreeStartDate ? (stageThreeStartDate.getTime() * 1_000_000).toString() : '',
              end_time: stageThreeEndDate ? (stageThreeEndDate.getTime() * 1_000_000).toString() : '',
              mint_price: coin(
                stageThreeUnitPriceState.value
                  ? (Number(stageThreeUnitPriceState.value) * 1_000_000).toString()
                  : stageThreeUnitPriceState.value === 0
                  ? '0'
                  : '',
                selectedStageThreeMintToken?.denom || 'ustars',
              ),
              per_address_limit: 1,
            },
          ].slice(0, stageCount),
          admins:
            addressListState.values.length > 0
              ? [
                  ...new Set(
                    addressListState.values
                      .map((a) => a.address.trim())
                      .filter(
                        (address) => address !== '' && isValidAddress(address.trim()) && address.startsWith('stars'),
                      ),
                  ),
                ]
              : [wallet.address ?? ''],
          admins_mutable: adminsMutable,
        }

        return toast.promise(
          whitelistMerkleTreeContract?.instantiate(
            WHITELIST_MERKLE_TREE_CODE_ID,
            merkleTreeFlexMsg,
            'Stargaze Whitelist Merkle Tree Flex Contract',
            wallet.address,
          ) as Promise<InstantiateResponse>,
          {
            loading: 'Instantiating contract...',
            error: 'Instantiation failed!',
            success: 'Instantiation success!',
          },
        )
      }
    },
    {
      onError: (error) => {
        toast.error(String(error), { style: { maxWidth: 'none' } })
      },
    },
  )

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
    setStageTwoStartDate(stageOneEndDate)
  }, [stageOneEndDate])

  useEffect(() => {
    setStageThreeStartDate(stageTwoEndDate)
  }, [stageTwoEndDate])

  useEffect(() => {
    if (wallet.address) {
      addressListState.reset()
      addressListState.add({ address: wallet.address })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.address])

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
  }, [whitelistType])

  return (
    <form className="py-6 px-12 space-y-4" onSubmit={mutate}>
      <NextSeo title="Instantiate Whitelist Contract" />
      <ContractPageHeader
        description="Whitelist contract manages the whitelisted addresses for the collection."
        link={links.Documentation}
        title="Whitelist Contract"
      />
      <LinkTabs activeIndex={0} data={whitelistLinkTabs} />

      <div>
        <div className="flex justify-between mb-5 ml-6 max-w-[720px] text-lg font-bold">
          <div className="form-check form-check-inline">
            <input
              checked={whitelistType === 'standard'}
              className="peer sr-only"
              id="inlineRadio1"
              name="inlineRadioOptions3"
              onClick={() => {
                setWhitelistType('standard')
              }}
              type="radio"
              value="standard"
            />
            <label
              className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
              htmlFor="inlineRadio1"
            >
              Standard Whitelist
            </label>
          </div>

          <div className="form-check form-check-inline">
            <input
              checked={whitelistType === 'flex'}
              className="peer sr-only"
              id="inlineRadio2"
              name="inlineRadioOptions2"
              onClick={() => {
                setWhitelistType('flex')
              }}
              type="radio"
              value="flex"
            />
            <label
              className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
              htmlFor="inlineRadio2"
            >
              Whitelist Flex
            </label>
          </div>

          <div className="form-check form-check-inline">
            <input
              checked={whitelistType === 'merkletree'}
              className="peer sr-only"
              id="inlineRadio3"
              name="inlineRadioOptions3"
              onClick={() => {
                setWhitelistType('merkletree')
              }}
              type="radio"
              value="merkletree"
            />
            <label
              className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
              htmlFor="inlineRadio3"
            >
              Whitelist Merkle Tree
            </label>
          </div>

          <div className="form-check form-check-inline">
            <input
              checked={whitelistType === 'merkletree-flex'}
              className="peer sr-only"
              id="inlineRadio4"
              name="inlineRadioOptions4"
              onClick={() => {
                setWhitelistType('merkletree-flex')
              }}
              type="radio"
              value="merkletree-flex"
            />
            <label
              className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
              htmlFor="inlineRadio4"
            >
              Whitelist Merkle Tree Flex
            </label>
          </div>
        </div>

        <Conditional test={Boolean(data)}>
          <Alert type="info">
            <b>Instantiate success!</b> Here is the transaction result containing the contract address and the
            transaction hash.
          </Alert>
          <JsonPreview content={data} title="Transaction Result" />
          <br />
        </Conditional>

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
              <div className="flex flex-row items-end pr-2 w-full">
                <NumberInput isRequired {...stageOneUnitPriceState} />
                <CustomTokenSelect
                  onOptionChange={setSelectedStageOneMintToken}
                  options={vendingMinterList
                    .filter((minter) => minter.factoryAddress !== undefined && minter.updatable === false)
                    .map((minter) => minter.supportedToken)
                    .reduce((uniqueTokens: TokenInfo[], token: TokenInfo) => {
                      if (!uniqueTokens.includes(token)) {
                        uniqueTokens.push(token)
                      }
                      return uniqueTokens
                    }, [])}
                  selectedOption={selectedStageOneMintToken}
                />
              </div>
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
                <div className="flex flex-row items-end pr-2 w-full">
                  <NumberInput isRequired {...stageTwoUnitPriceState} />
                  <CustomTokenSelect
                    onOptionChange={setSelectedStageTwoMintToken}
                    options={vendingMinterList
                      .filter((minter) => minter.factoryAddress !== undefined && minter.updatable === false)
                      .map((minter) => minter.supportedToken)
                      .reduce((uniqueTokens: TokenInfo[], token: TokenInfo) => {
                        if (!uniqueTokens.includes(token)) {
                          uniqueTokens.push(token)
                        }
                        return uniqueTokens
                      }, [])}
                    selectedOption={selectedStageTwoMintToken}
                  />
                </div>
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
                <div className="flex flex-row items-end pr-2 w-full">
                  <NumberInput isRequired {...stageThreeUnitPriceState} />
                  <CustomTokenSelect
                    onOptionChange={setSelectedStageThreeMintToken}
                    options={vendingMinterList
                      .filter((minter) => minter.factoryAddress !== undefined && minter.updatable === false)
                      .map((minter) => minter.supportedToken)
                      .reduce((uniqueTokens: TokenInfo[], token: TokenInfo) => {
                        if (!uniqueTokens.includes(token)) {
                          uniqueTokens.push(token)
                        }
                        return uniqueTokens
                      }, [])}
                    selectedOption={selectedStageThreeMintToken}
                  />
                </div>
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
      </div>

      <div className="flex items-center p-4">
        <div className="flex-grow" />
        <Button isLoading={isLoading} isWide rightIcon={<FaAsterisk />} type="submit">
          Instantiate Contract
        </Button>
      </div>
    </form>
  )
}

export default withMetadata(WhitelistInstantiatePage, { center: false })
