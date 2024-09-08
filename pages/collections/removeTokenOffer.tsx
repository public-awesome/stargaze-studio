/* eslint-disable eslint-comments/disable-enable-pair */

import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { NETWORK } from 'utils/constants'
import { useDebounce } from 'utils/debounce'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { resolveAddress } from 'utils/resolveAddress'
import { useWallet } from 'utils/wallet'

const RemoveTokenOfferPage: NextPage = () => {
  const wallet = useWallet()

  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)

  const collectionAddressState = useInputState({
    id: 'collection-address',
    name: 'collectionAddress',
    title: 'Collection Contract Address',
    defaultValue: '',
    placeholder: 'stars1...',
  })
  const collectionAddress = useDebounce(collectionAddressState.value, 300)

  const tokenIdState = useNumberInputState({
    id: 'token-id',
    name: 'tokenId',
    title: 'Token ID',
    defaultValue: 1,
    placeholder: '1',
  })

  const router = useRouter()

  useEffect(() => {
    if (collectionAddress.length > 0) {
      void router.replace({ query: { contractAddress: collectionAddress } })
    }
    if (collectionAddress.length === 0) {
      void router.replace({ query: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionAddress])

  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('contractAddress')
    if (initial && initial.length > 0) collectionAddressState.onChange(initial)
  }, [])

  const resolveCollectionAddress = async () => {
    await resolveAddress(collectionAddressState.value.trim(), wallet).then((resolvedAddress) => {
      if (resolvedAddress) {
        collectionAddressState.onChange(resolvedAddress)
      }
    })
  }
  useEffect(() => {
    void resolveCollectionAddress()
  }, [collectionAddressState.value])

  const handleRemoveOffer = async () => {
    if (!wallet.isWalletConnected) return toast.error('Please connect your wallet.')
    if (!collectionAddressState.value) return toast.error('Please enter a collection address.')
    if (!tokenIdState.value) return toast.error('Please enter a token ID.')

    const client = await wallet.getSigningCosmWasmClient()
    setTxHash(undefined)
    setIsLoading(true)
    try {
      const result = await client.execute(
        wallet.address as string,
        NETWORK === 'mainnet'
          ? 'stars1fvhcnyddukcqfnt7nlwv3thm5we22lyxyxylr9h77cvgkcn43xfsvgv0pl'
          : 'stars18cszlvm6pze0x9sz32qnjq4vtd45xehqs8dq7cwy8yhq35wfnn3qgzs5gu',
        {
          remove_bid: {
            collection: collectionAddressState.value,
            token_id: tokenIdState.value,
          },
        },
        'auto',
      )
      toast.success('Offer successfully removed.')
      setTxHash(result.transactionHash)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      setTxHash(undefined)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Remove Token Offer" />
      <ContractPageHeader link={links.Documentation} title="Remove Token Offer" />
      <div className="space-y-8">
        <AddressInput className="w-3/4" {...collectionAddressState} />
        <NumberInput className="w-1/4" {...tokenIdState} />
      </div>

      <div className="flex flex-row content-center">
        <Button
          className="mt-4"
          isDisabled={collectionAddressState.value === ''}
          isLoading={isLoading}
          onClick={() => {
            void handleRemoveOffer()
          }}
        >
          Remove Token Offer
        </Button>
      </div>
      <Conditional test={txHash !== undefined}>
        <Alert className="w-3/4" type="info">
          <b>Transaction Hash:</b> {txHash}
        </Alert>
      </Conditional>
    </section>
  )
}

export default withMetadata(RemoveTokenOfferPage, { center: false })
