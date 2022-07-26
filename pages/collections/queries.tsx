import { QueryCombobox } from 'components/collections/queries/Combobox'
import { useQueryComboboxState } from 'components/collections/queries/Combobox.hooks'
import { dispatchQuery } from 'components/collections/queries/query'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormControl } from 'components/FormControl'
import { AddressInput, TextInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import { useContracts } from 'contexts/contracts'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { useQuery } from 'react-query'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const CollectionQueriesPage: NextPage = () => {
  const { minter: minterContract, sg721: sg721Contract } = useContracts()

  const comboboxState = useQueryComboboxState()
  const type = comboboxState.value?.id

  const sg721ContractState = useInputState({
    id: 'sg721-contract-address',
    name: 'sg721-contract-address',
    title: 'Sg721 Address',
    subtitle: 'Address of the Sg721 contract',
  })
  const sg721ContractAddress = sg721ContractState.value

  const minterContractState = useInputState({
    id: 'minter-contract-address',
    name: 'minter-contract-address',
    title: 'Minter Address',
    subtitle: 'Address of the Minter contract',
  })
  const minterContractAddress = minterContractState.value

  const tokenIdState = useInputState({
    id: 'token-id',
    name: 'tokenId',
    title: 'Token ID',
    subtitle: 'Enter the token ID',
    placeholder: '1',
  })
  const tokenId = tokenIdState.value

  const addressState = useInputState({
    id: 'address',
    name: 'address',
    title: 'User Address',
    subtitle: 'Address of the user',
  })
  const address = addressState.value

  const showTokenIdField = type === 'token_info'
  const showAddressField = type === 'tokens_minted_to_user'

  const minterMessages = useMemo(
    () => minterContract?.use(minterContractAddress),
    [minterContract, minterContractAddress],
  )
  const sg721Messages = useMemo(() => sg721Contract?.use(sg721ContractAddress), [sg721Contract, sg721ContractAddress])

  const { data: response } = useQuery(
    [sg721Messages, minterMessages, type, tokenId, address] as const,
    async ({ queryKey }) => {
      const [_sg721Messages, _minterMessages, _type, _tokenId, _address] = queryKey
      const result = await dispatchQuery({
        tokenId: _tokenId,
        minterMessages: _minterMessages,
        sg721Messages: _sg721Messages,
        address: _address,
        type: _type,
      })
      return result
    },
    {
      placeholderData: null,
      onError: (error: any) => {
        toast.error(error.message)
      },
      enabled: Boolean(sg721ContractAddress && minterContractAddress && type),
      retry: false,
    },
  )

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Collection Queries" />
      <ContractPageHeader
        description="Here you can query your collection for information"
        link={links.Documentation}
        title="Collection Queries"
      />

      <div className="grid grid-cols-2 p-4 space-x-8">
        <div className="space-y-8">
          <AddressInput {...sg721ContractState} />
          <AddressInput {...minterContractState} />
          <QueryCombobox {...comboboxState} />
          {showAddressField && <AddressInput {...addressState} />}
          {showTokenIdField && <TextInput {...tokenIdState} />}
        </div>
        <div className="space-y-8">
          <FormControl title="Query Response">
            <JsonPreview content={response || {}} isCopyable />
          </FormControl>
        </div>
      </div>
    </section>
  )
}

export default withMetadata(CollectionQueriesPage, { center: false })
