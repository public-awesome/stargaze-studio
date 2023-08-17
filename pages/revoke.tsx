/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { coins } from '@cosmjs/proto-signing'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { TextInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const RevokeAuthorization: NextPage = () => {
  const wallet = useWallet()
  const client = wallet.getClient()

  const [transactionHash, setTransactionHash] = useState<string | undefined>(undefined)

  const granteeAddressState = useInputState({
    id: 'grantee-address',
    name: 'granteeAddress',
    title: 'Grantee Address',
    subtitle: 'Address to revoke message authorization',
    placeholder: 'stars1234567890abcdefghijklmnopqrstuvwxyz...',
    defaultValue: 'stars12vfpmlvmqrh9p0kcrtv6lw9ylkh7reuczdmmz5',
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
      await wallet.connect()
      const result = await client.signAndBroadcast(
        wallet.address,
        [
          {
            typeUrl: '/cosmos.authz.v1beta1.MsgRevoke',
            value: {
              granter: wallet.address,
              grantee: granteeAddress,
              msgTypeUrl: msg,
              funds: coins('100000', 'ustars'),
            },
          },
        ],
        'auto',
      )
      setTransactionHash(result.transactionHash)
    } catch (e: any) {
      console.log(e)
      toast.error(e.message, { style: { maxWidth: 'none' } })
    }
  }

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Revoke Authorization" />
      <ContractPageHeader description="Revoke Authorization." link={links.Documentation} title="Revoke Authorization" />
      <TextInput {...granteeAddressState} />
      <div className="font-bold">Message Types</div>
      <select
        className="py-2 px-4 bg-black border-2 border-white"
        onChange={(e) => messageState.onChange(e.target.value)}
      >
        <option className="bg-black" value="/cosmos.bank.v1beta1.MsgSend">
          /cosmos.bank.v1beta1.MsgSend
        </option>
        <option className="bg-black" value="/cosmos.staking.v1beta1.MsgUndelegate">
          /cosmos.staking.v1beta1.MsgUndelegate
        </option>
      </select>
      <TextInput {...messageState} />
      <button
        className="text-white bg-stargaze btn"
        onClick={() => void revokeAuthorization(granteeAddressState.value, messageState.value)}
        type="button"
      >
        Revoke Authorization
      </button>
      {transactionHash && (
        <div className="justify-center items-center space-y-2">{`Transaction Hash: ${transactionHash}`}</div>
      )}
    </section>
  )
}
export default withMetadata(RevokeAuthorization, { center: false })
