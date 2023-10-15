import { QueryCombobox } from 'components/collections/queries/Combobox'
import { useQueryComboboxState } from 'components/collections/queries/Combobox.hooks'
import { dispatchQuery } from 'components/collections/queries/query'
import { FormControl } from 'components/FormControl'
import { AddressInput, TextInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import type { BaseMinterInstance } from 'contracts/baseMinter'
import type { OpenEditionMinterInstance } from 'contracts/openEditionMinter'
import type { RoyaltyRegistryInstance } from 'contracts/royaltyRegistry'
import type { SG721Instance } from 'contracts/sg721'
import type { VendingMinterInstance } from 'contracts/vendingMinter'
import { toast } from 'react-hot-toast'
import { useQuery } from 'react-query'
import { useWallet } from 'utils/wallet'

import { resolveAddress } from '../../../utils/resolveAddress'
import type { MinterType } from '../actions/Combobox'

interface CollectionQueriesProps {
  minterContractAddress: string
  sg721ContractAddress: string
  royaltyRegistryContractAddress: string
  sg721Messages: SG721Instance | undefined
  vendingMinterMessages: VendingMinterInstance | undefined
  baseMinterMessages: BaseMinterInstance | undefined
  openEditionMinterMessages: OpenEditionMinterInstance | undefined
  royaltyRegistryMessages: RoyaltyRegistryInstance | undefined
  minterType: MinterType
}
export const CollectionQueries = ({
  sg721ContractAddress,
  sg721Messages,
  minterContractAddress,
  vendingMinterMessages,
  openEditionMinterMessages,
  baseMinterMessages,
  minterType,
  royaltyRegistryMessages,
}: CollectionQueriesProps) => {
  const wallet = useWallet()

  const comboboxState = useQueryComboboxState()
  const type = comboboxState.value?.id

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
  const showAddressField = type === 'tokens_minted_to_user' || type === 'tokens'

  const { data: response } = useQuery(
    [
      sg721Messages,
      baseMinterMessages,
      vendingMinterMessages,
      openEditionMinterMessages,
      royaltyRegistryMessages,
      type,
      tokenId,
      address,
      sg721ContractAddress,
    ] as const,
    async ({ queryKey }) => {
      const [
        _sg721Messages,
        _baseMinterMessages_,
        _vendingMinterMessages,
        _openEditionMinterMessages,
        _royaltyRegistryMessages,
        _type,
        _tokenId,
        _address,
        _sg721ContractAddress,
      ] = queryKey
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const res = await resolveAddress(_address, wallet).then(async (resolvedAddress) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await dispatchQuery({
          tokenId: _tokenId,
          vendingMinterMessages: _vendingMinterMessages,
          baseMinterMessages: _baseMinterMessages_,
          openEditionMinterMessages: _openEditionMinterMessages,
          sg721Messages: _sg721Messages,
          royaltyRegistryMessages: _royaltyRegistryMessages,
          address: resolvedAddress,
          type: _type,
          sg721ContractAddress: _sg721ContractAddress,
        })
        return result
      })
      return res
    },
    {
      placeholderData: null,
      onError: (error: any) => {
        if (addressState.value.length > 12 && !addressState.value.includes('.')) {
          toast.error(error.message, { style: { maxWidth: 'none' } })
        }
      },
      enabled:
        Boolean(type && type === 'infinity_swap_royalties' && sg721ContractAddress) ||
        Boolean(sg721ContractAddress && minterContractAddress && type),
      retry: false,
    },
  )

  return (
    <div className="grid grid-cols-2 mt-4">
      <div className="mr-2 space-y-8">
        <QueryCombobox minterType={minterType} {...comboboxState} />
        {showAddressField && <AddressInput {...addressState} />}
        {showTokenIdField && <TextInput {...tokenIdState} />}
      </div>
      <div className="space-y-8">
        <FormControl title="Query Response">
          <JsonPreview content={response || {}} isCopyable />
        </FormControl>
      </div>
    </div>
  )
}
