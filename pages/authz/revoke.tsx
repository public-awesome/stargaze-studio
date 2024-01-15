/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { GasPrice, SigningStargateClient } from '@cosmjs/stargate'
import { Alert } from 'components/Alert'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { TextInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { LinkTabs } from 'components/LinkTabs'
import { authzLinkTabs } from 'components/LinkTabs.data'
import { getConfig } from 'config'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { NETWORK } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { useWallet } from 'utils/wallet'

const RevokeAuthorization: NextPage = () => {
  const wallet = useWallet()

  const [transactionHash, setTransactionHash] = useState<string | undefined>(undefined)

  const granteeAddressState = useInputState({
    id: 'grantee-address',
    name: 'granteeAddress',
    title: 'Grantee Address',
    subtitle: 'Address to revoke message authorization',
    placeholder: 'stars1...',
  })

  const messageState = useInputState({
    id: 'message',
    name: 'message',
    title: 'Message',
    subtitle: 'Message to revoke authorization for',
    placeholder: '/cosmos.bank.v1beta1.MsgSend',
    defaultValue: '/cosmos.bank.v1beta1.MsgSend',
  })

  const revokeAuthorization = async (granteeAddress: string, msg: string) => {
    console.log('Wallet Address: ', wallet.address)
    try {
      if (!wallet.isWalletConnected) throw new Error('Wallet not connected.')
      setTransactionHash(undefined)
      const offlineSigner = wallet.getOfflineSignerDirect()
      const stargateClient = await SigningStargateClient.connectWithSigner(getConfig(NETWORK).rpcUrl, offlineSigner, {
        gasPrice: GasPrice.fromString('0.25ustars'),
      })

      const result = await stargateClient.signAndBroadcast(
        wallet.address || '',
        [
          {
            typeUrl: '/cosmos.authz.v1beta1.MsgRevoke',
            value: {
              granter: wallet.address,
              grantee: granteeAddress,
              msgTypeUrl: msg,
            },
          },
        ],
        {
          amount: [{ amount: '500000', denom: 'ustars' }],
          gas: '200000',
        },
      )
      setTransactionHash(result.transactionHash)
      toast.success(`Revoke authorization success.`, { style: { maxWidth: 'none' } })
    } catch (e: any) {
      console.log(e)
      setTransactionHash(undefined)
      toast.error(e.message, { style: { maxWidth: 'none' } })
    }
  }

  return (
    <section className="px-4 pt-4 pb-16 mx-auto ml-8 space-y-8 w-full">
      <NextSeo title="Authorization" />
      <ContractPageHeader
        description="Here you can grant and revoke authorizations."
        link="https://docs.stargaze.zone/developers/authz"
        title="Authorization"
      />
      <LinkTabs activeIndex={1} data={authzLinkTabs} />
      <div className="flex flex-col w-1/3">
        <span className="font-bold text-white">Authorization Type</span>
        <select
          className="py-2 px-4 mt-2 bg-black rounded-md border-2 border-white"
          onChange={(e) => messageState.onChange(e.target.value)}
        >
          <option className="bg-black" value="/cosmos.bank.v1beta1.MsgSend">
            /cosmos.bank.v1beta1.MsgSend
          </option>
          <option className="bg-black" value="/cosmos.staking.v1beta1.MsgDelegate">
            /cosmos.staking.v1beta1.MsgDelegate
          </option>
          <option className="bg-black" value="/cosmos.staking.v1beta1.MsgUndelegate">
            /cosmos.staking.v1beta1.MsgUndelegate
          </option>
        </select>
      </div>
      <TextInput className="w-1/3" {...granteeAddressState} />
      {/* <TextInput className="w-1/3" {...messageState} /> */}
      <button
        className="text-white bg-stargaze btn"
        onClick={() => void revokeAuthorization(granteeAddressState.value, messageState.value)}
        type="button"
      >
        Revoke Authorization
      </button>
      {transactionHash && (
        <Alert className="justify-center items-center space-y-2 w-3/4" type="info">
          {`Transaction Hash: ${transactionHash}`}
        </Alert>
      )}
    </section>
  )
}
export default withMetadata(RevokeAuthorization, { center: false })
