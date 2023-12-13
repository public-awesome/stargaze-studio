import type { Coin } from '@cosmjs/proto-signing'
import { Popover, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { tokensList } from 'config/token'
import { Fragment, useEffect, useState } from 'react'
import { FaCopy, FaPowerOff, FaRedo } from 'react-icons/fa'
import { copy } from 'utils/clipboard'
import { convertDenomToReadable } from 'utils/convertDenomToReadable'
import { getShortAddress } from 'utils/getShortAddress'
import { truncateMiddle } from 'utils/text'
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
          <div className="grid -mx-4">
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
                'bg-stone-800/80 rounded shadow-lg shadow-black/90 backdrop-blur-sm',
                'flex flex-col items-stretch text-sm divide-y divide-white/10',
              )}
            >
              <div className="flex flex-col items-center py-2 px-4 space-y-1 text-center">
                <span className="py-px px-2 mb-2 font-mono text-xs text-white/50 rounded-full border border-white/25">
                  {getShortAddress(address)}
                </span>
                <div className="font-bold">Your Balances</div>
                {balances?.map((val) => (
                  <span key={`balance-${val.denom}`}>
                    {convertDenomToReadable(val.amount)}{' '}
                    {tokensList.find((t) => t.denom === val.denom)?.displayName
                      ? tokensList.find((t) => t.denom === val.denom)?.displayName
                      : truncateMiddle(val.denom ? val.denom : '', 28)}
                  </span>
                ))}
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
