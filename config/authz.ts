/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */

import { GenericAuthorization } from 'cosmjs-types/cosmos/authz/v1beta1/authz'
import { MsgGrant } from 'cosmjs-types/cosmos/authz/v1beta1/tx'
import { SendAuthorization } from 'cosmjs-types/cosmos/bank/v1beta1/authz'
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin'
import type { AuthorizationType } from 'cosmjs-types/cosmos/staking/v1beta1/authz'
import { StakeAuthorization, StakeAuthorization_Validators } from 'cosmjs-types/cosmos/staking/v1beta1/authz'
import {
  AcceptedMessageKeysFilter,
  AllowAllMessagesFilter,
  CombinedLimit,
  ContractExecutionAuthorization,
  MaxCallsLimit,
  MaxFundsLimit,
} from 'cosmjs-types/cosmwasm/wasm/v1/authz'
import type { AuthorizationMode, GenericAuthorizationType, GrantAuthorizationType } from 'pages/authz/grant'

export interface Msg {
  typeUrl: string
  value: any
}

export interface AuthzMessage {
  authzMode: AuthorizationMode
  authzType: GrantAuthorizationType
  displayName: string
  typeUrl: string
  genericAuthzType?: GenericAuthorizationType
}

export const grantGenericStakeAuthorization: AuthzMessage = {
  authzMode: 'Grant',
  authzType: 'Generic',
  displayName: 'Stake',
  typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
  genericAuthzType: 'MsgDelegate',
}

export const grantGenericSendAuthorization: AuthzMessage = {
  authzMode: 'Grant',
  authzType: 'Generic',
  displayName: 'Send',
  typeUrl: '/cosmos.bank.v1beta1.MsgSend',
  genericAuthzType: 'MsgSend',
}

export const authzMessages: AuthzMessage[] = [grantGenericStakeAuthorization, grantGenericSendAuthorization]

const msgAuthzGrantTypeUrl = '/cosmos.authz.v1beta1.MsgGrant'

export function AuthzSendGrantMsg(
  granter: string,
  grantee: string,
  denom: string,
  spendLimit: number,
  expiration: number,
  allowList?: string[],
): Msg {
  const sendAuthValue = SendAuthorization.encode(
    SendAuthorization.fromPartial({
      spendLimit: [
        Coin.fromPartial({
          amount: String(spendLimit),
          denom,
        }),
      ],
      //allowList,
    }),
  ).finish()

  const grantValue = MsgGrant.fromPartial({
    grant: {
      authorization: {
        typeUrl: '/cosmos.bank.v1beta1.SendAuthorization',
        value: sendAuthValue,
      },
      // TODO: fix expiration issue
      expiration: expiration ? { seconds: BigInt(expiration) } : undefined,
    },
    grantee,
    granter,
  })

  return {
    typeUrl: msgAuthzGrantTypeUrl,
    value: grantValue,
  }
}

export function AuthzExecuteContractGrantMsg(
  granter: string,
  grantee: string,
  contract: string,
  expiration: number,
  callsRemaining?: number,
  amounts?: Coin[],
  allowedMessages?: string[],
): Msg {
  const sendAuthValue = ContractExecutionAuthorization.encode(
    ContractExecutionAuthorization.fromPartial({
      grants: [
        {
          contract,
          filter: {
            typeUrl: allowedMessages
              ? '/cosmwasm.wasm.v1.AcceptedMessageKeysFilter'
              : '/cosmwasm.wasm.v1.AllowAllMessagesFilter',
            value: allowedMessages
              ? AcceptedMessageKeysFilter.encode({ keys: allowedMessages }).finish()
              : AllowAllMessagesFilter.encode({}).finish(),
          },
          limit:
            callsRemaining || amounts
              ? {
                  typeUrl:
                    callsRemaining && amounts
                      ? '/cosmwasm.wasm.v1.CombinedLimit'
                      : callsRemaining
                      ? '/cosmwasm.wasm.v1.MaxCallsLimit'
                      : '/cosmwasm.wasm.v1.MaxFundsLimit',
                  value:
                    callsRemaining && amounts
                      ? CombinedLimit.encode({
                          callsRemaining: BigInt(callsRemaining),
                          amounts,
                        }).finish()
                      : callsRemaining
                      ? MaxCallsLimit.encode({
                          remaining: BigInt(callsRemaining),
                        }).finish()
                      : MaxFundsLimit.encode({
                          amounts: amounts || [],
                        }).finish(),
                }
              : {
                  // limit: undefined is not accepted
                  typeUrl: '/cosmwasm.wasm.v1.MaxCallsLimit',
                  value: MaxCallsLimit.encode({
                    remaining: BigInt(100000),
                  }).finish(),
                },
        },
      ],
    }),
  ).finish()

  const grantValue = MsgGrant.fromPartial({
    grant: {
      authorization: {
        typeUrl: '/cosmwasm.wasm.v1.ContractExecutionAuthorization',
        value: sendAuthValue,
      },
      // TODO: fix expiration issue
      expiration: expiration ? { seconds: BigInt(expiration) } : undefined,
    },
    grantee,
    granter,
  })

  return {
    typeUrl: msgAuthzGrantTypeUrl,
    value: grantValue,
  }
}

export function AuthzGenericGrantMsg(granter: string, grantee: string, typeURL: string, expiration: number): Msg {
  return {
    typeUrl: msgAuthzGrantTypeUrl,
    value: {
      grant: {
        authorization: {
          typeUrl: '/cosmos.authz.v1beta1.GenericAuthorization',
          value: GenericAuthorization.encode(
            GenericAuthorization.fromPartial({
              msg: typeURL,
            }),
          ).finish(),
        },
        expiration: expiration ? { seconds: expiration } : undefined,
      },
      grantee,
      granter,
    },
  }
}

export function AuthzStakeGrantMsg({
  expiration,
  grantee,
  granter,
  allowList,
  denyList,
  maxTokens,
  denom,
  stakeAuthzType,
}: {
  granter: string
  grantee: string
  expiration: number
  allowList?: string[]
  denyList?: string[]
  maxTokens?: string
  denom?: string
  stakeAuthzType: AuthorizationType
}): Msg {
  const allow_list = StakeAuthorization_Validators.encode(
    StakeAuthorization_Validators.fromPartial({
      address: allowList,
    }),
  ).finish()
  const deny_list = StakeAuthorization_Validators.encode(
    StakeAuthorization_Validators.fromPartial({
      address: denyList,
    }),
  ).finish()
  const stakeAuthValue = StakeAuthorization.encode(
    StakeAuthorization.fromPartial({
      authorizationType: stakeAuthzType,
      allowList: allowList?.length ? StakeAuthorization_Validators.decode(allow_list) : undefined,
      denyList: denyList?.length ? StakeAuthorization_Validators.decode(deny_list) : undefined,
      maxTokens: maxTokens
        ? Coin.fromPartial({
            amount: maxTokens,
            denom,
          })
        : undefined,
    }),
  ).finish()
  const grantValue = MsgGrant.fromPartial({
    grant: {
      authorization: {
        typeUrl: '/cosmos.staking.v1beta1.StakeAuthorization',
        value: stakeAuthValue,
      },
      // expiration: { seconds: BigInt(expiration) },
    },
    grantee,
    granter,
  })

  return {
    typeUrl: msgAuthzGrantTypeUrl,
    value: grantValue,
  }
}
