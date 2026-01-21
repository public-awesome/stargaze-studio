import type { Coin } from '@cosmjs/proto-signing'
import { Popover, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { tokensList } from 'config/token'
import { Fragment, useEffect, useState } from 'react'
import { FaCopy, FaPowerOff, FaRedo } from 'react-icons/fa'
import { copy } from 'utils/clipboard'
import { convertDenomToReadable } from 'utils/convertDenomToReadable'
import { getShortAddress } from 'utils/getShortAddress'
import { useWallet } from 'utils/wallet'

import { WalletButton } from './WalletButton'
import { WalletPanelButton } from './WalletPanelButton'

export const WalletLoader = () => {
  const {
    address = '',
    username,
    connect,
    disconnect,
    isWalletConnecting,
    isWalletConnected,
    getStargateClient,
  } = useWallet()

  // Once wallet connects, load balances.
  const [balances, setBalances] = useState<readonly Coin[] | undefined>()
  useEffect(() => {
    if (!isWalletConnected) {
      setBalances(undefined)
      return
    }

    const loadBalances = async () => {
      const client = await getStargateClient()
      setBalances(await client.getAllBalances(address))
    }

    loadBalances().catch(console.error)
  }, [isWalletConnected, getStargateClient, address])

  return (
    <Popover className="mt-4 mb-2">
      {({ close }) => (
        <>
          <div className="grid">
            {isWalletConnected ? (
              <Popover.Button as={WalletButton} className="w-full">
                {username || address}
              </Popover.Button>
            ) : (
              <WalletButton
                className="w-full"
                isLoading={isWalletConnecting}
                onClick={() => void connect().catch(console.error)}
              >
                Connect Wallet
              </WalletButton>
            )}
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <Popover.Panel
              className={clsx(
                'absolute inset-x-4 z-50 mt-2',
                // Glass panel styling
                'bg-[rgba(20,20,25,0.95)] backdrop-blur-xl',
                'rounded-xl border border-white/[0.1]',
                'shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]',
                'flex flex-col items-stretch text-sm divide-y divide-white/[0.08]',
                'overflow-hidden',
              )}
            >
              <div className="flex flex-col items-center py-4 px-4 space-y-2 text-center">
                <span
                  className={clsx(
                    'py-1 px-3 mb-2 font-mono text-xs rounded-full',
                    'text-gray-400 bg-white/[0.05]',
                    'border border-white/[0.1]',
                  )}
                >
                  {getShortAddress(address)}
                </span>
                <div className="font-bold text-white">Your Balances</div>
                <div className="flex flex-col space-y-1">
                  {balances
                    ?.filter((val) => tokensList.some((t) => t.denom === val.denom))
                    .map((val) => {
                      const token = tokensList.find((t) => t.denom === val.denom)
                      const amount = convertDenomToReadable(val.amount).toFixed(2)
                      return (
                        <span key={`balance-${val.denom}`} className="text-left text-gray-300">
                          <span className="font-semibold text-plumbus">{amount}</span> {token?.displayName}
                        </span>
                      )
                    })}
                </div>
              </div>
              <WalletPanelButton Icon={FaCopy} onClick={() => void copy(address)}>
                Copy wallet address
              </WalletPanelButton>
              <WalletPanelButton Icon={FaRedo} onClick={() => void connect()}>
                Reconnect
              </WalletPanelButton>
              <WalletPanelButton Icon={FaPowerOff} onClick={() => [disconnect(), close()]}>
                Disconnect
              </WalletPanelButton>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
