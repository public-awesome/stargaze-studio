/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-nested-ternary */
import { toUtf8 } from '@cosmjs/encoding'
import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { ExecuteCombobox } from 'components/contracts/whitelist/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/contracts/whitelist/ExecuteCombobox.hooks'
import { FormControl } from 'components/FormControl'
import { AddressList } from 'components/forms/AddressList'
import { useAddressListState } from 'components/forms/AddressList.hooks'
import { FlexMemberAttributes } from 'components/forms/FlexMemberAttributes'
import { useFlexMemberAttributesState } from 'components/forms/FlexMemberAttributes.hooks'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { whitelistLinkTabs } from 'components/LinkTabs.data'
import { TransactionHash } from 'components/TransactionHash'
import type { WhitelistFlexMember } from 'components/WhitelistFlexUpload'
import { WhitelistFlexUpload } from 'components/WhitelistFlexUpload'
import { WhitelistUpload } from 'components/WhitelistUpload'
import { useContracts } from 'contexts/contracts'
import { useGlobalSettings } from 'contexts/globalSettings'
import type { DispatchExecuteArgs } from 'contracts/whitelist/messages/execute'
import { dispatchExecute, isEitherType, previewExecutePayload } from 'contracts/whitelist/messages/execute'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { useDebounce } from 'utils/debounce'
import { isValidAddress } from 'utils/isValidAddress'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { useWallet } from 'utils/wallet'

const WhitelistExecutePage: NextPage = () => {
  const { whitelist: contract } = useContracts()
  const wallet = useWallet()
  const { timezone } = useGlobalSettings()

  const [lastTx, setLastTx] = useState('')
  const [memberList, setMemberList] = useState<string[]>([])
  const [flexMemberList, setFlexMemberList] = useState<WhitelistFlexMember[]>([])
  const [whitelistType, setWhitelistType] = useState<'standard' | 'flex'>('standard')

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id

  const [timestamp, setTimestamp] = useState<Date | undefined>()

  const addressListState = useAddressListState()

  const flexAddressListState = useFlexMemberAttributesState()

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Whitelist Address',
    subtitle: 'Address of the Whitelist contract',
  })
  const contractAddress = contractState.value

  const debouncedWhitelistContractState = useDebounce(contractState.value, 300)

  const limitState = useNumberInputState({
    id: 'limit',
    name: 'limit',
    title: 'Limit',
    subtitle: 'Limit value',
    placeholder: '5',
  })

  const showLimitState = isEitherType(type, ['update_per_address_limit', 'increase_member_limit'])
  const showTimestamp = isEitherType(type, ['update_start_time', 'update_end_time'])
  const showMemberList = isEitherType(type, ['add_members'])
  const showFlexMemberList = isEitherType(type, ['add_members'])
  const showRemoveMemberList = isEitherType(type, ['remove_members'])
  const showAdminList = isEitherType(type, ['update_admins'])

  const messages = useMemo(() => contract?.use(contractState.value), [contract, contractState.value])
  const payload: DispatchExecuteArgs = {
    contract: contractState.value,
    messages,
    type,
    limit: limitState.value,
    timestamp: timestamp ? (timestamp.getTime() * 1_000_000).toString() : '',
    members:
      whitelistType === 'standard'
        ? [
            ...new Set(
              addressListState.values
                .map((a) => a.address.trim())
                .filter((address) => address !== '' && isValidAddress(address.trim()) && address.startsWith('stars'))
                .concat(memberList),
            ),
          ]
        : type === 'add_members'
        ? [
            ...new Set(
              flexAddressListState.values
                .concat(flexMemberList)
                .filter((obj, index, self) => index === self.findIndex((t) => t.address.trim() === obj.address.trim()))
                .filter(
                  (member) =>
                    member.address !== '' &&
                    isValidAddress(member.address.trim()) &&
                    member.address.startsWith('stars'),
                )
                .map((member) => {
                  return {
                    address: member.address.trim(),
                    mint_count: Math.round(member.mint_count),
                  }
                }),
            ),
          ]
        : [
            ...new Set(
              addressListState.values
                .map((a) => a.address.trim())
                .filter((address) => address !== '' && isValidAddress(address.trim()) && address.startsWith('stars'))
                .concat(memberList),
            ),
          ],
    admins: [
      ...new Set(
        addressListState.values
          .map((a) => a.address.trim())
          .filter((address) => address !== '' && isValidAddress(address.trim()) && address.startsWith('stars')),
      ),
    ] || [wallet.address],
  }
  const { isLoading, mutate } = useMutation(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!type) {
        throw new Error('Please select message type!')
      }
      if (!wallet.isWalletConnected) {
        throw new Error('Please connect your wallet.')
      }
      const txHash = await toast.promise(dispatchExecute(payload), {
        error: `${type.charAt(0).toUpperCase() + type.slice(1)} execute failed!`,
        loading: 'Executing message...',
        success: (tx) => `Transaction ${tx} success!`,
      })
      if (txHash) {
        setLastTx(txHash)
      }
    },
    {
      onError: (error) => {
        toast.error(String(error), { style: { maxWidth: 'none' } })
      },
    },
  )

  const router = useRouter()

  useEffect(() => {
    if (contractAddress.length > 0) {
      void router.replace({ query: { contractAddress } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress])

  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('contractAddress')
    if (initial && initial.length > 0) contractState.onChange(initial)
  }, [])

  useEffect(() => {
    flexAddressListState.reset()
    flexAddressListState.add({
      address: '',
      mint_count: 0,
    })
  }, [])

  useEffect(() => {
    async function getWhitelistContractType() {
      if (wallet.isWalletConnected && debouncedWhitelistContractState.length > 0) {
        const client = await wallet.getCosmWasmClient()
        const data = await toast.promise(
          client.queryContractRaw(
            debouncedWhitelistContractState,
            toUtf8(Buffer.from(Buffer.from('contract_info').toString('hex'), 'hex').toString()),
          ),
          {
            loading: 'Retrieving Whitelist type...',
            error: 'Whitelist type retrieval failed.',
            success: 'Whitelist type retrieved.',
          },
        )
        const contractType: string = JSON.parse(new TextDecoder().decode(data as Uint8Array)).contract
        console.log(contractType)
        return contractType
      }
    }
    void getWhitelistContractType()
      .then((contractType) => {
        if (contractType?.includes('flex')) {
          setWhitelistType('flex')
        } else {
          setWhitelistType('standard')
        }
      })
      .catch((err) => {
        console.log(err)
        setWhitelistType('standard')
        console.log('Unable to retrieve contract type. Defaulting to "standard".')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedWhitelistContractState, wallet.isWalletConnected])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Execute Whitelist Contract" />
      <ContractPageHeader
        description="Whitelist contract manages the whitelisted addresses for the collection."
        link={links.Documentation}
        title="Whitelist Contract"
      />
      <LinkTabs activeIndex={2} data={whitelistLinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <ExecuteCombobox {...comboboxState} />
          <Conditional test={showLimitState}>
            <NumberInput {...limitState} />
          </Conditional>
          <Conditional test={showTimestamp}>
            <FormControl
              htmlId="timestamp"
              isRequired
              subtitle={`${type === 'update_start_time' ? 'Start' : 'End'} time for minting ${
                timezone === 'Local' ? '(local)' : '(UTC)'
              }`}
              title={`${type === 'update_start_time' ? 'Start' : 'End'} Time`}
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
          </Conditional>
          <Conditional test={(whitelistType === 'standard' && showMemberList) || showAdminList || showRemoveMemberList}>
            <AddressList
              entries={addressListState.entries}
              isRequired
              onAdd={addressListState.add}
              onChange={addressListState.update}
              onRemove={addressListState.remove}
              subtitle={type === 'update_admins' ? 'Enter the admin addresses' : 'Enter the member addresses'}
              title="Addresses"
            />
            <Conditional test={whitelistType === 'standard' && showMemberList}>
              <Alert className="mt-8" type="info">
                You may optionally choose a text file of additional member addresses.
              </Alert>
              <WhitelistUpload onChange={setMemberList} />
            </Conditional>
          </Conditional>

          <Conditional test={whitelistType === 'flex' && showFlexMemberList}>
            <FlexMemberAttributes
              attributes={flexAddressListState.entries}
              onAdd={flexAddressListState.add}
              onChange={flexAddressListState.update}
              onRemove={flexAddressListState.remove}
              subtitle="Enter the member addresses and corresponding mint counts"
              title="Members"
            />
            <Conditional test={whitelistType === 'flex' && showFlexMemberList}>
              <Alert className="mt-8" type="info">
                You may optionally choose a .csv file of additional member addresses and mint counts.
              </Alert>
              <WhitelistFlexUpload onChange={setFlexMemberList} />
            </Conditional>
          </Conditional>
        </div>
        <div className="space-y-8">
          <div className="relative">
            <Button className="absolute top-0 right-0" isLoading={isLoading} rightIcon={<FaArrowRight />} type="submit">
              Execute
            </Button>
            <FormControl subtitle="View execution transaction hash" title="Transaction Hash">
              <TransactionHash hash={lastTx} />
            </FormControl>
          </div>
          <FormControl subtitle="View current message to be sent" title="Payload Preview">
            <JsonPreview content={previewExecutePayload(payload)} isCopyable />
          </FormControl>
        </div>
      </form>
    </section>
  )
}

export default withMetadata(WhitelistExecutePage, { center: false })
