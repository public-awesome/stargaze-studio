import { QueryCombobox } from 'components/badges/queries/Combobox'
import { useQueryComboboxState } from 'components/badges/queries/Combobox.hooks'
import { dispatchQuery } from 'components/badges/queries/query'
import { Conditional } from 'components/Conditional'
import { FormControl } from 'components/FormControl'
import { NumberInput, TextInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import type { BadgeHubInstance } from 'contracts/badgeHub'
import { toast } from 'react-hot-toast'
import { useQuery } from 'react-query'

import type { MintRule } from '../creation/ImageUploadDetails'

interface BadgeQueriesProps {
  badgeHubContractAddress: string
  badgeId: number
  badgeHubMessages: BadgeHubInstance | undefined
  mintRule: MintRule
}
export const BadgeQueries = ({ badgeHubContractAddress, badgeId, badgeHubMessages, mintRule }: BadgeQueriesProps) => {
  const comboboxState = useQueryComboboxState()
  const type = comboboxState.value?.id

  const pubkeyState = useInputState({
    id: 'pubkey',
    name: 'pubkey',
    title: 'Public Key',
    subtitle: 'The public key to check whether it can be used to mint a badge',
  })

  const startAfterNumberState = useNumberInputState({
    id: 'start-after-number',
    name: 'start-after-number',
    title: 'Start After (optional)',
    subtitle: 'The id to start the pagination after',
  })

  const startAfterStringState = useInputState({
    id: 'start-after-string',
    name: 'start-after-string',
    title: 'Start After (optional)',
    subtitle: 'The public key to start the pagination after',
  })

  const paginationLimitState = useNumberInputState({
    id: 'pagination-limit',
    name: 'pagination-limit',
    title: 'Pagination Limit (optional)',
    subtitle: 'The number of items to return (max: 30)',
    defaultValue: 5,
  })

  const { data: response } = useQuery(
    [
      badgeHubMessages,
      type,
      badgeId,
      pubkeyState.value,
      startAfterNumberState.value,
      startAfterStringState.value,
      paginationLimitState.value,
    ] as const,
    async ({ queryKey }) => {
      const [_badgeHubMessages, _type, _badgeId, _pubKey, _startAfterNumber, _startAfterString, _limit] = queryKey

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await dispatchQuery({
        badgeHubMessages: _badgeHubMessages,
        id: _badgeId,
        startAfterNumber: _startAfterNumber,
        startAfterString: _startAfterString,
        limit: _limit,
        type: _type,
        pubkey: _pubKey,
      })
      return result
    },
    {
      placeholderData: null,
      onError: (error: any) => {
        toast.error(error.message, { style: { maxWidth: 'none' } })
      },
      enabled: Boolean(badgeHubContractAddress && type && badgeId),
      retry: false,
    },
  )

  return (
    <div className="grid grid-cols-2 mt-4">
      <div className="mr-2 space-y-8">
        <QueryCombobox mintRule={mintRule} {...comboboxState} />
        <Conditional test={type === 'getKey'}>
          <TextInput {...pubkeyState} />
        </Conditional>
        <Conditional test={type === 'getBadges'}>
          <NumberInput {...startAfterNumberState} />
        </Conditional>
        <Conditional test={type === 'getBadges' || type === 'getKeys'}>
          <NumberInput {...paginationLimitState} />
        </Conditional>
        <Conditional test={type === 'getKeys'}>
          <TextInput {...startAfterStringState} />
        </Conditional>
      </div>
      <div className="space-y-8">
        <FormControl title="Query Response">
          <JsonPreview content={response || {}} isCopyable />
        </FormControl>
      </div>
    </div>
  )
}
