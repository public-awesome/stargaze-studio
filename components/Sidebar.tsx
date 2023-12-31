/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */

import clsx from 'clsx'
import { Anchor } from 'components/Anchor'
import type { Timezone } from 'contexts/globalSettings'
import { setTimezone } from 'contexts/globalSettings'
import { setLogItemList, useLogStore } from 'contexts/log'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FaCog } from 'react-icons/fa'
// import BrandText from 'public/brand/brand-text.svg'
import { footerLinks, socialsLinks } from 'utils/links'
import { useWallet } from 'utils/wallet'

import { BADGE_HUB_ADDRESS, BASE_FACTORY_ADDRESS, NETWORK, OPEN_EDITION_FACTORY_ADDRESS } from '../utils/constants'
import { Conditional } from './Conditional'
import { IncomeDashboardDisclaimer } from './IncomeDashboardDisclaimer'
import { LogModal } from './LogModal'
import { SettingsModal } from './SettingsModal'
import { SidebarLayout } from './SidebarLayout'
import { WalletLoader } from './WalletLoader'

export const Sidebar = () => {
  const router = useRouter()
  const wallet = useWallet()
  const logs = useLogStore()
  const [isTallWindow, setIsTallWindow] = useState(false)

  useEffect(() => {
    if (logs.itemList.length === 0) return
    console.log('Stringified log item list: ', JSON.stringify(logs.itemList))
    window.localStorage.setItem('logs', JSON.stringify(logs.itemList))
  }, [logs])

  useEffect(() => {
    console.log(window.localStorage.getItem('logs'))
    setLogItemList(JSON.parse(window.localStorage.getItem('logs') || '[]'))
    setTimezone(
      (window.localStorage.getItem('timezone') as Timezone)
        ? (window.localStorage.getItem('timezone') as Timezone)
        : 'UTC',
    )
  }, [])

  const handleResize = () => {
    setIsTallWindow(window.innerHeight > 640)
  }

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    // return () => {
    //   window.removeEventListener('resize', handleResize)
    // }
  }, [])

  return (
    <SidebarLayout>
      {/* Stargaze brand as home button */}
      <Anchor href="/" onContextMenu={(e) => [e.preventDefault(), router.push('/brand')]}>
        <img alt="Brand Text" className="ml-6 w-3/4" src="/studio-logo.png" />
      </Anchor>
      {/* wallet button */}
      <WalletLoader />
      {/* main navigation routes */}

      <div className={clsx('absolute left-[5%] mt-2', isTallWindow ? 'top-[20%]' : 'top-[30%]')}>
        <ul className="group p-2 w-full bg-transparent menu rounded-box">
          <li tabIndex={0}>
            <div
              className={clsx(
                'z-40 text-xl font-bold group-hover:text-white bg-transparent rounded-lg small-caps',
                'hover:bg-white/5 transition-colors',
                router.asPath.includes('/collections/') ? 'text-white' : 'text-gray',
              )}
            >
              <Link href="/collections/" passHref>
                Collections
              </Link>
            </div>
            <ul className="z-50 p-2 bg-base-200">
              <li
                className={clsx(
                  'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                  router.asPath.includes('/collections/create') ? 'text-white' : 'text-gray',
                )}
                tabIndex={-1}
              >
                <Link href="/collections/create/">Create a Collection</Link>
              </li>
              <li
                className={clsx(
                  'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                  router.asPath.includes('/collections/myCollections/') ? 'text-white' : 'text-gray',
                )}
                tabIndex={-1}
              >
                <Link href="/collections/myCollections/">My Collections</Link>
              </li>
              <li
                className={clsx(
                  'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                  router.asPath.includes('/collections/actions/') ? 'text-white' : 'text-gray',
                )}
                tabIndex={-1}
              >
                <Link href="/collections/actions/">Collection Actions</Link>
              </li>
              <li
                className={clsx(
                  'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                  router.asPath.includes('/snapshots') ? 'text-white' : 'text-gray',
                )}
                tabIndex={-1}
              >
                <Link href="/snapshots/">Snapshots</Link>
              </li>
              <Conditional test={NETWORK === 'mainnet'}>
                <li className={clsx('text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded')} tabIndex={-1}>
                  <label
                    className="w-full h-full text-lg font-bold text-gray hover:text-white normal-case bg-clip-text bg-transparent border-none animate-none btn modal-button"
                    htmlFor="my-modal-1"
                  >
                    Revenue Dashboard
                  </label>
                </li>
              </Conditional>
            </ul>
          </li>
        </ul>
        <Conditional test={BADGE_HUB_ADDRESS !== undefined}>
          <ul className="group p-2 w-full bg-transparent menu rounded-box">
            <li tabIndex={0}>
              <span
                className={clsx(
                  'z-40 text-xl font-bold group-hover:text-white bg-transparent rounded-lg small-caps',
                  'hover:bg-white/5 transition-colors',
                  router.asPath.includes('/badges/') ? 'text-white' : 'text-gray',
                )}
              >
                <Link href="/badges/"> Badges </Link>
              </span>
              <ul className="z-50 p-2 rounded-box bg-base-200">
                <li
                  className={clsx(
                    'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                    router.asPath.includes('/badges/create/') ? 'text-white' : 'text-gray',
                  )}
                  tabIndex={-1}
                >
                  <Link href="/badges/create/">Create a Badge</Link>
                </li>
                <li
                  className={clsx(
                    'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                    router.asPath.includes('/badges/myBadges/') ? 'text-white' : 'text-gray',
                  )}
                  tabIndex={-1}
                >
                  <Link href="/badges/myBadges/">My Badges</Link>
                </li>
                <li
                  className={clsx(
                    'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                    router.asPath.includes('/badges/actions/') ? 'text-white' : 'text-gray',
                  )}
                  tabIndex={-1}
                >
                  <Link href="/badges/actions/">Badge Actions</Link>
                </li>
              </ul>
            </li>
          </ul>
        </Conditional>
        <ul className="group p-2 w-full bg-transparent menu rounded-box">
          <li tabIndex={0}>
            <span
              className={clsx(
                'z-40 text-xl font-bold group-hover:text-white bg-transparent rounded-lg small-caps',
                'hover:bg-white/5 transition-colors',
                router.asPath.includes('/contracts/') ? 'text-white' : 'text-gray',
              )}
            >
              <Link href="/contracts/"> Contract Dashboards </Link>
            </span>
            <ul className="z-50 p-2 bg-base-200">
              <Conditional test={BASE_FACTORY_ADDRESS !== undefined}>
                <li
                  className={clsx(
                    'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                    router.asPath.includes('/contracts/baseMinter/') ? 'text-white' : 'text-gray',
                  )}
                  tabIndex={-1}
                >
                  <Link href="/contracts/baseMinter/">Base Minter Contract</Link>
                </li>
              </Conditional>
              <li
                className={clsx(
                  'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                  router.asPath.includes('/contracts/vendingMinter/') ? 'text-white' : 'text-gray',
                )}
                tabIndex={-1}
              >
                <Link href="/contracts/vendingMinter/">Vending Minter Contract</Link>
              </li>
              <Conditional test={OPEN_EDITION_FACTORY_ADDRESS !== undefined}>
                <li
                  className={clsx(
                    'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                    router.asPath.includes('/contracts/openEditionMinter/') ? 'text-white' : 'text-gray',
                  )}
                  tabIndex={-1}
                >
                  <Link href="/contracts/openEditionMinter/">Open Edition Minter Contract</Link>
                </li>
              </Conditional>
              <li
                className={clsx(
                  'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                  router.asPath.includes('/contracts/sg721/') ? 'text-white' : 'text-gray',
                )}
                tabIndex={-1}
              >
                <Link href="/contracts/sg721/">SG721 Contract</Link>
              </li>
              <li
                className={clsx(
                  'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                  router.asPath.includes('/contracts/whitelist/') ? 'text-white' : 'text-gray',
                )}
                tabIndex={-1}
              >
                <Link href="/contracts/whitelist/">Whitelist Contract</Link>
              </li>
              <Conditional test={BADGE_HUB_ADDRESS !== undefined}>
                <li
                  className={clsx(
                    'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                    router.asPath.includes('/contracts/badgeHub/') ? 'text-white' : 'text-gray',
                  )}
                  tabIndex={-1}
                >
                  <Link href="/contracts/badgeHub/">Badge Hub Contract</Link>
                </li>
              </Conditional>
              <li
                className={clsx(
                  'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                  router.asPath.includes('/contracts/splits/') ? 'text-white' : 'text-gray',
                )}
                tabIndex={-1}
              >
                <Link href="/contracts/splits/">Splits Contract</Link>
              </li>
              <li
                className={clsx(
                  'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                  router.asPath.includes('/contracts/royaltyRegistry/') ? 'text-white' : 'text-gray',
                )}
                tabIndex={-1}
              >
                <Link href="/contracts/royaltyRegistry/">Royalty Registry</Link>
              </li>
              <Conditional test={NETWORK === 'testnet'}>
                <li
                  className={clsx(
                    'text-lg font-bold hover:text-white hover:bg-stargaze-80 rounded',
                    router.asPath.includes('/contracts/upload/') ? 'text-white' : 'text-gray',
                  )}
                  tabIndex={-1}
                >
                  <Link href="/contracts/upload/">Upload Contract</Link>
                </li>
              </Conditional>
            </ul>
          </li>
        </ul>
      </div>

      <IncomeDashboardDisclaimer creatorAddress={wallet.address ? wallet.address : ''} />
      <LogModal />
      <SettingsModal />

      <div className="flex-grow" />
      {isTallWindow && (
        <div className="flex-row w-full h-full">
          <label
            className="absolute mb-8 w-[25%] text-lg font-bold text-white normal-case bg-zinc-500 hover:bg-zinc-600 border-none animate-none btn modal-button"
            htmlFor="my-modal-9"
          >
            <FaCog className="justify-center align-bottom" size={20} />
          </label>

          <label
            className="ml-16 w-[65%] text-lg font-bold text-white normal-case bg-blue-500 hover:bg-blue-600 border-none animate-none btn modal-button"
            htmlFor="my-modal-8"
          >
            View Logs
          </label>
        </div>
      )}
      {/* Stargaze network status */}
      {isTallWindow && <div className="text-sm capitalize">Network: {wallet.chain.pretty_name}</div>}

      {/* footer reference links */}
      <ul className="text-sm list-disc list-inside">
        {isTallWindow &&
          footerLinks.map(({ href, text }) => (
            <li key={href}>
              <Anchor className="hover:text-plumbus hover:underline" href={href}>
                {text}
              </Anchor>
            </li>
          ))}
      </ul>

      {/* footer attribution */}
      <div className="text-xs text-white/50">
        Stargaze Studio {process.env.APP_VERSION} <br />
        Powered by{' '}
        <Anchor className="text-plumbus hover:underline" href="https://stargaze.zone">
          Stargaze
        </Anchor>
      </div>

      {/* footer social links */}

      <div className="flex gap-x-6 items-center text-white/75">
        {socialsLinks.map(({ Icon, href, text }) => (
          <Anchor key={href} className="hover:text-plumbus" href={href}>
            <Icon aria-label={text} size={20} />
          </Anchor>
        ))}
      </div>
    </SidebarLayout>
  )
}
