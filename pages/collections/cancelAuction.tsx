/* eslint-disable eslint-comments/disable-enable-pair */

import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput, TextInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
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

const CancelAuctionPage: NextPage = () => {
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

  const tokenIdState = useInputState({
    id: 'token-id',
    name: 'tokenId',
    title: 'Token ID',
    defaultValue: '',
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

  const handleCancelAuction = async () => {
    if (!wallet.isWalletConnected) return toast.error('Please connect your wallet.')
    if (!collectionAddressState.value) return toast.error('Please enter a collection address.')

    const client = await wallet.getSigningCosmWasmClient()
    setTxHash(undefined)
    setIsLoading(true)
    try {
      const result = await client.execute(
        wallet.address as string,
        NETWORK === 'mainnet'
          ? 'stars1vvdkcn393ddyd47v9g3qv6mvne59d0ykzy9wre3ga0c58dtdg4ksm776jg'
          : 'stars1dnadsd7tx0dmnpp26ms7d66zsp7tduygwjgfjzueh0lg9t5lq5vq9kn47c',
        {
          cancel_auction: {
            collection: collectionAddressState.value,
            token_id: tokenIdState.value,
          },
        },
        'auto',
      )
      toast.success('Auction successfully cancelled.')
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
      <NextSeo title="Cancel Auction" />
      <ContractPageHeader link={links.Documentation} title="Cancel Auction" />
      <div className="space-y-2">
        <AddressInput {...collectionAddressState} />
        <TextInput className="w-1/4" {...tokenIdState} />
      </div>

      <div className="flex flex-row content-center mt-4">
        <Button
          isDisabled={collectionAddressState.value === ''}
          isLoading={isLoading}
          onClick={() => {
            void handleCancelAuction()
          }}
        >
          Cancel Auction
        </Button>
      </div>
      <Conditional test={txHash !== undefined}>
        <Alert type="info">
          <b>Transaction Hash:</b> {txHash}
        </Alert>
      </Conditional>
    </section>
  )
}

export default withMetadata(CancelAuctionPage, { center: false })
