/* eslint-disable eslint-comments/disable-enable-pair */

import { fromBech32, toBech32 } from '@cosmjs/encoding'
import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { NumberInput } from 'components/forms/FormInput'
import { useNumberInputState } from 'components/forms/FormInput.hooks'
import { ibcAtone } from 'config/token'
import type { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { useWallet } from 'utils/wallet'

const WithdrawAtonePage: NextPage = () => {
  const wallet = useWallet()

  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)

  const amountState = useNumberInputState({
    id: 'amount',
    name: 'amount',
    title: 'Amount to be Withdrawn (in uatone)',
    defaultValue: 0,
    placeholder: '1',
  })

  const revisionHeightState = useNumberInputState({
    id: 'revision-height',
    name: 'revisionHeight',
    title: 'Revision Height (get the latest from https://www.mintscan.io/atone)',
    defaultValue: 5191473,
    placeholder: '5191473',
  })

  const revisionNumberState = useNumberInputState({
    id: 'revision-number',
    name: 'revisionNumber',
    title: 'Revision Number (get the latest from https://www.mintscan.io/atone)',
    defaultValue: 4,
    placeholder: '4',
  })

  const sourceChannelState = useNumberInputState({
    id: 'source-channel',
    name: 'sourceChannel',
    title: 'Source Channel (get the latest from https://www.mintscan.io/atone)',
    defaultValue: 448,
    placeholder: '448',
  })

  function starsToAtone(starsAddr: string): string {
    const { prefix, data } = fromBech32(starsAddr)
    if (prefix !== 'stars') throw new Error(`Expected 'stars' address, got '${prefix}'`)
    if (data.length !== 20) throw new Error('Not an account address (unexpected data length)')
    return toBech32('atone', data)
  }

  const handleWithdrawal = async () => {
    if (!wallet.isWalletConnected) return toast.error('Please connect your wallet.')
    if (!amountState.value || amountState.value === 0) return toast.error('Please enter a valid amount.')

    const client = await wallet.getSigningCosmWasmClient()

    setTxHash(undefined)
    setIsLoading(true)
    console.log('ATONE address:', starsToAtone(wallet.address as string))
    try {
      const withdrawMessage: MsgTransfer = {
        sourcePort: 'transfer',
        sourceChannel: `channel-${sourceChannelState.value}`,
        receiver: starsToAtone(wallet.address as string),
        sender: wallet.address as string,
        token: {
          denom: ibcAtone.denom,
          amount: amountState.value.toString(),
        },
        timeoutHeight: {
          revisionNumber: BigInt(revisionNumberState.value),
          revisionHeight: BigInt(revisionHeightState.value + 300),
        },
        timeoutTimestamp: BigInt(new Date().getTime() + 15 * 60 * 1000) * BigInt(1_000_000),
        memo: 'Transfer ATONE to ATOM ONE',
      }

      const result = await client.signAndBroadcast(
        wallet.address as string,
        [{ typeUrl: '/ibc.applications.transfer.v1.MsgTransfer', value: withdrawMessage }],
        'auto',
      )

      toast.success('ATONE successfully withdrawn to source chain.')
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
      <NextSeo title="Withdraw ATONE" />
      <ContractPageHeader link={links.Documentation} title="Withdraw ATONE" />
      <div className="space-y-2">
        <NumberInput className="w-1/2" {...amountState} />
        <NumberInput className="w-1/2" {...revisionHeightState} />
        <NumberInput className="w-1/2" {...revisionNumberState} />
        <NumberInput className="w-1/2" {...sourceChannelState} />
      </div>

      <div className="flex flex-row content-center mt-4">
        <Button
          isDisabled={amountState.value === 0}
          isLoading={isLoading}
          onClick={() => {
            void handleWithdrawal()
          }}
        >
          Withdraw ATONE
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

export default withMetadata(WithdrawAtonePage, { center: false })
