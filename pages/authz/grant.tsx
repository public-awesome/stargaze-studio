/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-nested-ternary */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable tailwindcss/classnames-order */

import { coins, GasPrice, SigningStargateClient } from '@cosmjs/stargate'
import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput, TextInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { LinkTabs } from 'components/LinkTabs'
import { authzLinkTabs } from 'components/LinkTabs.data'
import { getConfig } from 'config'
import type { Msg } from 'config/authz'
import { AuthzExecuteContractGrantMsg, AuthzGenericGrantMsg, AuthzSendGrantMsg } from 'config/authz'
import { useGlobalSettings } from 'contexts/globalSettings'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { NETWORK } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { useWallet } from 'utils/wallet'

export type AuthorizationMode = 'Grant' | 'Revoke'
export type GrantAuthorizationType = 'Generic' | 'Send' | 'Execute Smart Contract' | 'Migrate Smart Contract'
export type GenericAuthorizationType =
  | 'MsgDelegate'
  | 'MsgUndelegate'
  | 'MsgBeginRedelegate'
  | 'MsgWithdrawDelegatorReward'
  | 'MsgVote'
  | 'MsgSend'
  | 'MsgExecuteContract'
  | 'MsgMigrateContract'
  | 'MsgStoreCode'

const Grant: NextPage = () => {
  const wallet = useWallet()
  const { timezone } = useGlobalSettings()

  const [authMode, setAuthMode] = useState<AuthorizationMode>('Grant')
  const [authType, setAuthType] = useState<GrantAuthorizationType>('Generic')
  const [genericAuthType, setGenericAuthType] = useState<GenericAuthorizationType>('MsgSend')
  const [expiration, setExpiration] = useState<Date | undefined>()
  const [transactionHash, setTransactionHash] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  const granteeAddressState = useInputState({
    id: 'grantee-address',
    name: 'granteeAddress',
    title: 'Grantee Address',
    placeholder: 'stars1...',
    subtitle: 'The address to grant authorization to',
  })

  const spendLimitDenomState = useInputState({
    id: 'spend-limit-denom',
    name: 'spendLimitDenom',
    title: 'Spend Limit Denom',
    placeholder: `ustars`,
    subtitle: 'The spend limit denom',
  })

  const spendLimitState = useNumberInputState({
    id: 'spend-limit',
    name: 'spendLimit',
    title: 'Spend Limit',
    placeholder: `1000000`,
    subtitle: 'The spend limit',
  })

  const maxFundsLimitDenomState = useInputState({
    id: 'max-funds-limit-denom',
    name: 'maxFundsLimitDenom',
    title: 'Max Funds Limit Denom',
    placeholder: `ustars`,
    subtitle: 'The denom for max funds limit',
  })

  const maxFundsLimitState = useNumberInputState({
    id: 'max-funds-limit',
    name: 'maxFundsLimit',
    title: 'Max Funds Limit',
    placeholder: `1000000`,
    subtitle: 'The max funds limit for contract execution (leave blank for no limit)',
  })

  const allowListState = useInputState({
    id: 'allow-list',
    name: 'allowList',
    title: 'Allow List',
    placeholder: `stars1..., stars1...`,
    subtitle: 'Comma separated list of addresses to allow transactions to',
  })

  const contractAddressState = useInputState({
    id: 'contract-address',
    name: 'contractAddress',
    title: 'Contract Address',
    placeholder: `stars1...`,
    subtitle: 'The contract address to authorize execution on',
  })

  const allowedMessageKeysState = useInputState({
    id: 'allowed-message-keys',
    name: 'allowedMessageKeys',
    title: 'Allowed Message Keys',
    placeholder: `mint_to, burn, transfer`,
    subtitle: 'Comma separated list of allowed message keys (leave blank to allow all)',
  })

  const callsRemainingState = useNumberInputState({
    id: 'calls-remaining',
    name: 'callsRemaining',
    title: 'Calls Remaining',
    placeholder: `10`,
    subtitle: 'The allowed number of contract execution calls (leave blank for no limit)',
  })

  const messageToSign = () => {
    if (authType === 'Generic') {
      if (genericAuthType === 'MsgSend') {
        return AuthzGenericGrantMsg(
          wallet.address || '',
          granteeAddressState.value,
          '/cosmos.bank.v1beta1.MsgSend',
          (expiration?.getTime() as number) / 1000 || 0,
        )
      }
      if (genericAuthType === 'MsgDelegate') {
        return AuthzGenericGrantMsg(
          wallet.address || '',
          granteeAddressState.value,
          '/cosmos.staking.v1beta1.MsgDelegate',
          (expiration?.getTime() as number) / 1000 || 0,
        )
      }
      if (genericAuthType === 'MsgUndelegate') {
        return AuthzGenericGrantMsg(
          wallet.address || '',
          granteeAddressState.value,
          '/cosmos.staking.v1beta1.MsgUndelegate',
          (expiration?.getTime() as number) / 1000 || 0,
        )
      }
      if (genericAuthType === 'MsgBeginRedelegate') {
        return AuthzGenericGrantMsg(
          wallet.address || '',
          granteeAddressState.value,
          '/cosmos.staking.v1beta1.MsgBeginRedelegate',
          (expiration?.getTime() as number) / 1000 || 0,
        )
      }
      if (genericAuthType === 'MsgWithdrawDelegatorReward') {
        return AuthzGenericGrantMsg(
          wallet.address || '',
          granteeAddressState.value,
          '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
          (expiration?.getTime() as number) / 1000 || 0,
        )
      }
      if (genericAuthType === 'MsgVote') {
        return AuthzGenericGrantMsg(
          wallet.address || '',
          granteeAddressState.value,
          '/cosmos.gov.v1beta1.MsgVote',
          (expiration?.getTime() as number) / 1000 || 0,
        )
      }
      if (genericAuthType === 'MsgExecuteContract') {
        return AuthzGenericGrantMsg(
          wallet.address || '',
          granteeAddressState.value,
          '/cosmwasm.wasm.v1.MsgExecuteContract',
          (expiration?.getTime() as number) / 1000 || 0,
        )
      }
      if (genericAuthType === 'MsgMigrateContract') {
        return AuthzGenericGrantMsg(
          wallet.address || '',
          granteeAddressState.value,
          '/cosmwasm.wasm.v1.MsgMigrateContract',
          (expiration?.getTime() as number) / 1000 || 0,
        )
      }
      if (genericAuthType === 'MsgStoreCode') {
        return AuthzGenericGrantMsg(
          wallet.address || '',
          granteeAddressState.value,
          '/cosmwasm.wasm.v1.MsgStoreCode',
          (expiration?.getTime() as number) / 1000 || 0,
        )
      }
    } else if (authType === 'Send') {
      return AuthzSendGrantMsg(
        wallet.address || '',
        granteeAddressState.value,
        spendLimitDenomState.value,
        spendLimitState.value,
        (expiration?.getTime() as number) / 1000 || 0,
        allowListState.value ? allowListState.value.split(',').map((address) => address.trim()) : [],
      )
    } else if (authType === 'Execute Smart Contract') {
      return AuthzExecuteContractGrantMsg(
        wallet.address || '',
        granteeAddressState.value,
        contractAddressState.value,
        (expiration?.getTime() as number) / 1000 || 0,
        callsRemainingState.value ? callsRemainingState.value : undefined,
        maxFundsLimitState.value > 0 ? coins(maxFundsLimitState.value, maxFundsLimitDenomState.value) : undefined,
        allowedMessageKeysState.value ? allowedMessageKeysState.value.split(',').map((key) => key.trim()) : undefined,
      )
    }
  }
  const handleSendMessage = async () => {
    try {
      if (!wallet.isWalletConnected) return toast.error('Please connect your wallet.')
      setTransactionHash(undefined)
      setIsLoading(true)
      const offlineSigner = wallet.getOfflineSignerDirect()
      const stargateClient = await SigningStargateClient.connectWithSigner(getConfig(NETWORK).rpcUrl, offlineSigner, {
        gasPrice: GasPrice.fromString('0.025ustars'),
      })

      const response = await stargateClient.signAndBroadcast(wallet.address || '', [messageToSign() as Msg], 'auto')
      setTransactionHash(response.transactionHash)
      toast.success(`${authType} authorization success.`, { style: { maxWidth: 'none' } })
      setIsLoading(false)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      setIsLoading(false)
      setTransactionHash(undefined)
      console.error('Error: ', error)
    }
  }

  return (
    <section className="px-4 pt-4 pb-16 mx-auto space-y-8 ml-8 w-full">
      <NextSeo title="Authorization" />
      <ContractPageHeader
        description="Here you can grant and revoke authorizations."
        link="https://docs.stargaze.zone/developers/authz"
        title="Authorization"
      />
      <LinkTabs activeIndex={0} data={authzLinkTabs} />
      <div className="flex flex-col w-1/4">
        <span className="text-xl font-bold text-white">Authorization Type</span>
        <select
          className="mt-2 pt-2 pb-2 px-4 placeholder:text-white/50 bg-white/10 rounded border-2 border-white/20 focus:ring focus:ring-plumbus-20"
          onChange={(e) => setAuthType(e.target.value as GrantAuthorizationType)}
          value={authType}
        >
          <option value="Generic">Generic</option>
          <option value="Send">Send</option>
          <option value="Execute Smart Contract">Execute Smart Contract</option>
          <option disabled value="Migrate Smart Contract">
            Migrate Smart Contract
          </option>
        </select>
      </div>
      <Conditional test={authType === 'Generic'}>
        <div className="flex flex-col w-1/4">
          <span className="text-lg font-bold text-white">Generic Authorization Type</span>
          <select
            className="mt-2 pt-2 pb-2 px-4 placeholder:text-white/50 bg-white/10 rounded border-2 border-white/20 focus:ring focus:ring-plumbus-20"
            onChange={(e) => setGenericAuthType(e.target.value as GenericAuthorizationType)}
            value={genericAuthType}
          >
            <option value="MsgSend">Send</option>
            <option value="MsgDelegate">Delegate</option>
            <option value="MsgUndelegate">Undelegate</option>
            <option value="MsgBeginRedelegate">Redelegate</option>
            <option value="MsgWithdrawDelegatorReward">Withdraw Delegator Reward</option>
            <option value="MsgVote">Vote</option>
            <option value="MsgExecuteContract">Execute Contract</option>
            <option value="MsgMigrateContract">Migrate Contract</option>
            <option value="MsgStoreCode">Store Code</option>
          </select>
        </div>
      </Conditional>
      <TextInput className="w-2/5" {...granteeAddressState} />
      <Conditional test={authType === 'Send'}>
        <div className="flex flex-row">
          <NumberInput className="w-1/4" {...spendLimitState} />
          <TextInput className="w-1/4 ml-2" {...spendLimitDenomState} />
        </div>
        {/* <TextInput className="w-2/5" {...allowListState} /> */}
      </Conditional>
      <Conditional test={authType === 'Execute Smart Contract'}>
        <AddressInput className="w-2/5" {...contractAddressState} />
        <TextInput className="w-2/5" {...allowedMessageKeysState} />
        <NumberInput className="w-2/5" {...callsRemainingState} />
        <div className="flex flex-row">
          <NumberInput className="w-2/5" {...maxFundsLimitState} />
          <TextInput className="w-1/4 ml-2" {...maxFundsLimitDenomState} />
        </div>
      </Conditional>

      <FormControl
        className="w-1/4"
        htmlId="expiration"
        subtitle={`Expiration time for the authorization ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
        title="Expiration Time (Optional)"
      >
        <InputDateTime
          minDate={
            timezone === 'Local' ? new Date() : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
          }
          onChange={(date) =>
            date
              ? setExpiration(
                  timezone === 'Local' ? date : new Date(date?.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
                )
              : setExpiration(undefined)
          }
          value={
            timezone === 'Local'
              ? expiration
              : expiration
              ? new Date(expiration.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
              : undefined
          }
        />
      </FormControl>

      <Button
        className="px-4 py-2 font-bold text-white bg-stargaze rounded-md"
        isLoading={isLoading}
        onClick={() => {
          void handleSendMessage()
        }}
      >
        {' '}
        {authMode === 'Grant' ? 'Grant Authorization' : 'Revoke Authorization'}
      </Button>
      {transactionHash && (
        <Alert className="justify-center items-center space-y-2 w-3/4" type="info">
          {`Transaction Hash: ${transactionHash}`}
        </Alert>
      )}
    </section>
  )
}

export default withMetadata(Grant, { center: false })
