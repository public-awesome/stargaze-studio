/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { MintRule } from 'components/badges/creation/ImageUploadDetails'
import { BadgeQueries } from 'components/badges/queries/Queries'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useDebounce } from 'utils/debounce'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

import { BadgeActions } from '../../components/badges/actions/Action'
import { useNumberInputState } from '../../components/forms/FormInput.hooks'
import { BADGE_HUB_ADDRESS } from '../../utils/constants'

const BadgeActionsPage: NextPage = () => {
  const { badgeHub: badgeHubContract } = useContracts()
  const wallet = useWallet()

  const [action, setAction] = useState<boolean>(false)
  const [mintRule, setMintRule] = useState<MintRule>('by_key')

  const badgeHubContractState = useInputState({
    id: 'badge-hub-contract-address',
    name: 'badge-hub-contract-address',
    title: 'Badge Hub Contract Address',
    subtitle: 'Address of the Badge Hub contract',
    defaultValue: BADGE_HUB_ADDRESS,
  })

  const badgeIdState = useNumberInputState({
    id: 'badge-id',
    name: 'badge-id',
    title: 'Badge ID',
    subtitle: 'The ID of the badge to interact with',
    defaultValue: 1,
  })

  const debouncedBadgeHubContractState = useDebounce(badgeHubContractState.value, 300)
  const debouncedBadgeIdState = useDebounce(badgeIdState.value, 300)

  const badgeHubMessages = useMemo(
    () => badgeHubContract?.use(badgeHubContractState.value),
    [badgeHubContract, badgeHubContractState.value],
  )

  const badgeHubContractAddress = badgeHubContractState.value
  const badgeId = badgeIdState.value

  const router = useRouter()

  useEffect(() => {
    if (badgeHubContractAddress.length > 0 && badgeId < 1) {
      void router.replace({ query: { badgeHubContractAddress } })
    }
    if (badgeId > 0 && badgeHubContractAddress.length === 0) {
      void router.replace({ query: { badgeId } })
    }
    if (badgeId > 0 && badgeHubContractAddress.length > 0) {
      void router.replace({ query: { badgeHubContractAddress, badgeId } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badgeHubContractAddress, badgeId])

  useEffect(() => {
    const initialBadgeHub = new URL(document.URL).searchParams.get('badgeHubContractAddress')
    const initialBadgeId = new URL(document.URL).searchParams.get('badgeId')
    if (initialBadgeHub && initialBadgeHub.length > 0) badgeHubContractState.onChange(initialBadgeHub)
    if (initialBadgeId && initialBadgeId.length > 0)
      badgeIdState.onChange(isNaN(parseInt(initialBadgeId)) ? 0 : parseInt(initialBadgeId))
  }, [])

  useEffect(() => {
    async function getMintRule() {
      if (wallet.client && debouncedBadgeHubContractState.length > 0 && debouncedBadgeIdState > 0) {
        const client = wallet.client
        const data = await toast.promise(
          client.queryContractSmart(debouncedBadgeHubContractState, {
            badge: {
              id: badgeId,
            },
          }),
          {
            loading: 'Retrieving Mint Rule...',
            error: 'Mint Rule retrieval failed.',
            success: 'Mint Rule retrieved.',
          },
        )
        console.log(data)
        const rule = data.rule
        console.log(rule)
        return rule
      }
    }
    void getMintRule()
      .then((rule) => {
        if (JSON.stringify(rule).includes('keys')) {
          setMintRule('by_keys')
        } else if (JSON.stringify(rule).includes('minter')) {
          setMintRule('by_minter')
        } else {
          setMintRule('by_key')
        }
      })
      .catch((err) => {
        console.log(err)
        setMintRule('not_resolved')
        console.log('Unable to retrieve Mint Rule. Defaulting to "by_key".')
      })
  }, [debouncedBadgeHubContractState, debouncedBadgeIdState, wallet.client])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Badge Actions" />
      <ContractPageHeader
        description="Here you can execute various actions and queries for a badge."
        link={links.Documentation}
        title="Badge Actions"
      />

      <form className="p-4">
        <div className="grid grid-cols-2">
          <AddressInput {...badgeHubContractState} className="mr-2" />
          <div className="flex-row">
            <NumberInput className="w-1/2" {...badgeIdState} />
            <div className="mt-2">
              <span className="font-bold">Mint Rule: </span>
              <span>
                {mintRule
                  .toString()
                  .split('_')
                  .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                  .join(' ')}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="mr-2">
            <div className="flex justify-items-start font-bold">
              <div className="form-check form-check-inline">
                <input
                  checked={!action}
                  className="peer sr-only"
                  id="inlineRadio4"
                  name="inlineRadioOptions4"
                  onClick={() => {
                    setAction(false)
                  }}
                  type="radio"
                  value="false"
                />
                <label
                  className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                  htmlFor="inlineRadio4"
                >
                  Queries
                </label>
              </div>
              <div className="ml-2 form-check form-check-inline">
                <input
                  checked={action}
                  className="peer sr-only"
                  id="inlineRadio3"
                  name="inlineRadioOptions3"
                  onClick={() => {
                    setAction(true)
                  }}
                  type="radio"
                  value="true"
                />
                <label
                  className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                  htmlFor="inlineRadio3"
                >
                  Actions
                </label>
              </div>
            </div>
            <div>
              {(action && (
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                <BadgeActions
                  badgeHubContractAddress={badgeHubContractState.value}
                  badgeHubMessages={badgeHubMessages}
                  badgeId={badgeIdState.value}
                  mintRule={mintRule}
                />
              )) || (
                <BadgeQueries
                  badgeHubContractAddress={badgeHubContractState.value}
                  badgeHubMessages={badgeHubMessages}
                  badgeId={badgeIdState.value}
                  mintRule={mintRule}
                />
              )}
            </div>
          </div>
        </div>
      </form>
    </section>
  )
}

export default withMetadata(BadgeActionsPage, { center: false })
