/* eslint-disable eslint-comments/disable-enable-pair */
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
import { NumberInput } from 'components/forms/FormInput'
import { useNumberInputState } from 'components/forms/FormInput.hooks'
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

  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [adminsMutable, setAdminsMutable] = useState<boolean>(true)
  const [whitelistType, setWhitelistType] = useState<'standard' | 'flex' | 'merkletree'>('standard')

  const [whitelistStandardArray, setWhitelistStandardArray] = useState<string[]>([])
  const [whitelistFlexArray, setWhitelistFlexArray] = useState<WhitelistFlexMember[]>([])

  const [selectedMintToken, setSelectedMintToken] = useState<TokenInfo | undefined>(ibcAtom)

  const unitPriceState = useNumberInputState({
    id: 'unit-price',
    name: 'unitPrice',
    title: 'Unit Price',
    subtitle: 'Mint price per token',
    placeholder: '500',
  })

  const memberLimitState = useNumberInputState({
    id: 'member-limit',
    name: 'memberLimit',
    title: 'Member Limit',
    subtitle: 'Limit of the whitelisted members',
    placeholder: '1000',
  })

  const perAddressLimitState = useNumberInputState({
    id: 'per-address-limit',
    name: 'perAddressLimit',
    title: 'Per Address Limit',
    subtitle: 'Limit of tokens per address',
    placeholder: '5',
  })

  const whaleCapState = useNumberInputState({
    id: 'whale-cap',
    name: 'whaleCap',
    title: 'Whale Cap (optional)',
    subtitle: 'Maximum number of tokens a single address can mint',
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

      if (!startDate) {
        throw new Error('Start date is required')
      }
      if (!endDate) {
        throw new Error('End date is required')
      }

      const standardMsg = {
        members: whitelistStandardArray,
        start_time: (startDate.getTime() * 1_000_000).toString(),
        end_time: (endDate.getTime() * 1_000_000).toString(),
        mint_price: coin(String(Number(unitPriceState.value) * 1000000), selectedMintToken?.denom || 'ustars'),
        per_address_limit: perAddressLimitState.value,
        member_limit: memberLimitState.value,
        admins: [
          ...new Set(
            addressListState.values
              .map((a) => a.address.trim())
              .filter((address) => address !== '' && isValidAddress(address.trim()) && address.startsWith('stars')),
          ),
        ] || [wallet.address],
        admins_mutable: adminsMutable,
      }

      const flexMsg = {
        members: whitelistFlexArray,
        start_time: (startDate.getTime() * 1_000_000).toString(),
        end_time: (endDate.getTime() * 1_000_000).toString(),
        mint_price: coin(String(Number(unitPriceState.value) * 1000000), selectedMintToken?.denom || 'ustars'),
        whale_cap: whaleCapState.value || undefined,
        member_limit: memberLimitState.value,
        admins: [
          ...new Set(
            addressListState.values
              .map((a) => a.address.trim())
              .filter((address) => address !== '' && isValidAddress(address.trim()) && address.startsWith('stars')),
          ),
        ] || [wallet.address],
        admins_mutable: adminsMutable,
      }

      if (whitelistType !== 'merkletree') {
        return toast.promise(
          contract.instantiate(
            whitelistType === 'standard' ? WHITELIST_CODE_ID : WHITELIST_FLEX_CODE_ID,
            whitelistType === 'standard' ? standardMsg : flexMsg,
            whitelistType === 'standard' ? 'Stargaze Whitelist Contract' : 'Stargaze Whitelist Flex Contract',
            wallet.address,
          ),
          {
            loading: 'Instantiating contract...',
            error: 'Instantiation failed!',
            success: 'Instantiation success!',
          },
        )
      } else if (whitelistType === 'merkletree') {
        const members = whitelistStandardArray
        const membersCsv = members.join('\n')
        const membersBlob = new Blob([membersCsv], { type: 'text/csv' })
        const membersFile = new File([membersBlob], 'members.csv', { type: 'text/csv' })
        const formData = new FormData()
        formData.append('whitelist', membersFile)
        const response = await toast
          .promise(
            axios.post(`${WHITELIST_MERKLE_TREE_API_URL}/create_whitelist`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }),
            {
              loading: 'Fetching merkle root hash...',
              success: 'Merkle root fetched successfully.',
              error: 'Error fetching root hash from Whitelist Merkle Tree API.',
            },
          )
          .catch((error) => {
            console.log('error', error)
            throw new Error('Whitelist instantiation failed.')
          })

        const rootHash = response.data.root_hash
        console.log('rootHash', rootHash)

        const merkleTreeMsg = {
          merkle_root: rootHash,
          merkle_tree_uri: null,
          start_time: (startDate.getTime() * 1_000_000).toString(),
          end_time: (endDate.getTime() * 1_000_000).toString(),
          mint_price: coin(String(Number(unitPriceState.value) * 1000000), selectedMintToken?.denom || 'ustars'),
          per_address_limit: perAddressLimitState.value,
          admins: [
            ...new Set(
              addressListState.values
                .map((a) => a.address.trim())
                .filter((address) => address !== '' && isValidAddress(address.trim()) && address.startsWith('stars')),
            ),
          ] || [wallet.address],
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
      }
    },
    {
      onError: (error) => {
        toast.error(String(error), { style: { maxWidth: 'none' } })
      },
    },
  )

  const whitelistFileOnChange = (whitelistData: string[]) => {
    setWhitelistStandardArray(whitelistData)
  }

  const whitelistFlexFileOnChange = (whitelistData: WhitelistFlexMember[]) => {
    setWhitelistFlexArray(whitelistData)
  }

  useEffect(() => {
    setWhitelistStandardArray([])
    setWhitelistFlexArray([])
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

      <div className="flex justify-between mb-5 ml-6 max-w-[520px] text-lg font-bold">
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
      </div>

      <Conditional test={Boolean(data)}>
        <Alert type="info">
          <b>Instantiate success!</b> Here is the transaction result containing the contract address and the transaction
          hash.
        </Alert>
        <JsonPreview content={data} title="Transaction Result" />
        <br />
      </Conditional>

      <div className="mt-2 ml-3 w-1/3 form-control">
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
      <div className="my-4 ml-4 w-1/2">
        <AddressList
          entries={addressListState.entries}
          isRequired
          onAdd={addressListState.add}
          onChange={addressListState.update}
          onRemove={addressListState.remove}
          subtitle="The list of administrator addresses"
          title="Administrator Addresses"
        />
      </div>

      <FormGroup subtitle="Your whitelisted addresses" title="Whitelist File">
        <Conditional test={whitelistType === 'standard' || whitelistType === 'merkletree'}>
          <WhitelistUpload onChange={whitelistFileOnChange} />
          <Conditional test={whitelistStandardArray.length > 0}>
            <JsonPreview content={whitelistStandardArray} initialState={false} title="File Contents" />
          </Conditional>
        </Conditional>
        <Conditional test={whitelistType === 'flex'}>
          <WhitelistFlexUpload onChange={whitelistFlexFileOnChange} />
          <Conditional test={whitelistFlexArray.length > 0}>
            <JsonPreview content={whitelistFlexArray} initialState={false} title="File Contents" />
          </Conditional>
        </Conditional>
      </FormGroup>

      <FormGroup key="minting-details" subtitle="Information about your minting settings" title="Minting Details">
        <div className="flex flex-row items-end">
          <NumberInput {...unitPriceState} isRequired />
          {/* <select
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
          </select> */}
          <CustomTokenSelect
            onOptionChange={setSelectedMintToken}
            options={vendingMinterList
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

        <Conditional test={whitelistType !== 'merkletree'}>
          <NumberInput isRequired {...memberLimitState} />
        </Conditional>
        <Conditional test={whitelistType === 'standard' || whitelistType === 'merkletree'}>
          <NumberInput isRequired {...perAddressLimitState} />
        </Conditional>
        <Conditional test={whitelistType === 'flex'}>
          <NumberInput {...whaleCapState} />
        </Conditional>
        <FormControl
          htmlId="start-date"
          isRequired
          subtitle={`Start time for minting ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
          title="Start Time"
        >
          <InputDateTime
            minDate={
              timezone === 'Local' ? new Date() : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
            }
            onChange={(date) =>
              setStartDate(
                timezone === 'Local' ? date : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
              )
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
          subtitle={`End time for minting ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
          title="End Time"
        >
          <InputDateTime
            minDate={
              timezone === 'Local' ? new Date() : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
            }
            onChange={(date) =>
              setEndDate(
                timezone === 'Local' ? date : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
              )
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
