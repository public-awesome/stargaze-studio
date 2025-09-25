/* eslint-disable eslint-comments/disable-enable-pair */

import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useDebounce } from 'utils/debounce'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { resolveAddress } from 'utils/resolveAddress'
import { useWallet } from 'utils/wallet'

const InfinityPoolActionsPage: NextPage = () => {
  const wallet = useWallet()

  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)

  const infinityPairAddressState = useInputState({
    id: 'infinity-pair-address',
    name: 'infinityPairAddress',
    title: 'Infinity Pair Contract Address',
    defaultValue: '',
    placeholder: 'stars1...',
  })
  const infinityPairAddress = useDebounce(infinityPairAddressState.value, 300)

  const collectionAddressState = useInputState({
    id: 'collection-address',
    name: 'collectionAddress',
    title: 'Collection Contract Address',
    defaultValue: '',
    placeholder: 'stars1...',
  })
  const collectionAddress = useDebounce(collectionAddressState.value, 300)

  const router = useRouter()

  useEffect(() => {
    if (infinityPairAddress.length > 0) {
      void router.replace({ query: { infinityPairAddress } })
    }
    if (infinityPairAddress.length === 0) {
      void router.replace({ query: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infinityPairAddress])

  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('infinityPairAddress')
    if (initial && initial.length > 0) infinityPairAddressState.onChange(initial)
  }, [])

  const resolveInfinityPairAddress = async () => {
    await resolveAddress(infinityPairAddressState.value.trim(), wallet).then((resolvedAddress) => {
      if (resolvedAddress) {
        infinityPairAddressState.onChange(resolvedAddress)
      }
    })
  }
  useEffect(() => {
    void resolveInfinityPairAddress()
  }, [infinityPairAddressState.value])

  useEffect(() => {
    if (collectionAddress.length > 0) {
      void router.replace({ query: { collectionAddress } })
    }
    if (collectionAddress.length === 0) {
      void router.replace({ query: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionAddress])

  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('collectionAddress')
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

  const handleWithdrawAnyNfts = async () => {
    if (!wallet.isWalletConnected) return toast.error('Please connect your wallet.')
    if (!infinityPairAddressState.value) return toast.error('Please enter an infinity pair address.')

    const client = await wallet.getSigningCosmWasmClient()
    setTxHash(undefined)
    setIsLoading(true)
    try {
      const result = await client.execute(
        wallet.address as string,
        infinityPairAddressState.value,
        {
          withdraw_any_nfts: {
            collection: collectionAddressState.value.trim(),
            limit: 200,
          },
        },
        'auto',
      )
      toast.success('NFTs sucessfully withdrawn.')
      setTxHash(result.transactionHash)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      setTxHash(undefined)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdrawAllTokens = async () => {
    if (!wallet.isWalletConnected) return toast.error('Please connect your wallet.')
    if (!infinityPairAddressState.value) return toast.error('Please enter an infinity pair address.')

    const client = await wallet.getSigningCosmWasmClient()
    setTxHash(undefined)
    setIsLoading(true)
    try {
      const result = await client.execute(
        wallet.address as string,
        infinityPairAddressState.value,
        {
          withdraw_all_tokens: {},
        },
        'auto',
      )
      toast.success('NFTs sucessfully withdrawn.')
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
      <NextSeo title="Infinity Pool Actions" />
      <ContractPageHeader link={links.Documentation} title="Infinity Pool Actions" />
      <div className="space-y-2 w-1/2">
        <AddressInput {...infinityPairAddressState} />
        <AddressInput {...collectionAddressState} />
      </div>

      <div className="flex flex-row content-center mt-4">
        <Button
          isDisabled={infinityPairAddressState.value === '' || collectionAddressState.value === ''}
          isLoading={isLoading}
          onClick={() => {
            void handleWithdrawAnyNfts()
          }}
        >
          Withdraw NFTs
        </Button>
      </div>

      <div className="flex flex-row content-center mt-4">
        <Button
          isDisabled={infinityPairAddressState.value === ''}
          isLoading={isLoading}
          onClick={() => {
            void handleWithdrawAllTokens()
          }}
        >
          Withdraw All Tokens
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

export default withMetadata(InfinityPoolActionsPage, { center: false })
