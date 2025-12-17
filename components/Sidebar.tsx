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
import { FaCog, FaCoins, FaFileContract, FaLayerGroup, FaList, FaMedal, FaShieldAlt } from 'react-icons/fa'
// import BrandText from 'public/brand/brand-text.svg'
import { footerLinks, socialsLinks } from 'utils/links'
import { useWallet } from 'utils/wallet'

import { BADGE_HUB_ADDRESS, BASE_FACTORY_ADDRESS, NETWORK, OPEN_EDITION_FACTORY_ADDRESS } from '../utils/constants'
import { Conditional } from './Conditional'
import { IncomeDashboardDisclaimer } from './IncomeDashboardDisclaimer'
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
    setIsTallWindow(window.innerHeight > 768)
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
      <Anchor className="group" href="/" onContextMenu={(e) => [e.preventDefault(), router.push('/brand')]}>
        <img
          alt="Brand Text"
          className="ml-6 w-3/4 group-hover:drop-shadow-[0_0_12px_rgba(219,38,118,0.4)] transition-all duration-300"
          src="/studio-logo.png"
        />
      </Anchor>
      {/* wallet button */}
      <WalletLoader />
      {/* main navigation routes */}

      <div className={clsx('absolute left-[5%] mt-2', isTallWindow ? 'top-[20%]' : 'top-[30%]')}>
        <ul className="group py-1 px-2 w-full bg-transparent menu rounded-box">
          <li tabIndex={0}>
            <div
              className={clsx(
                'flex z-40 gap-3 items-center py-2 px-3 text-xl font-bold rounded-xl small-caps',
                'transition-all duration-300',
                'hover:bg-white/[0.05] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
                router.asPath.includes('/collections/')
                  ? 'text-white bg-plumbus/10 border-l-2 border-plumbus shadow-[0_0_15px_rgba(219,38,118,0.15)]'
                  : 'text-gray-400 group-hover:text-white',
              )}
            >
              <FaLayerGroup
                className={clsx(
                  'transition-all duration-300',
                  router.asPath.includes('/collections/')
                    ? 'text-plumbus'
                    : 'text-gray-500 group-hover:text-plumbus group-hover:scale-110',
                )}
                size={18}
              />
              <Link href="/collections/" passHref>
                Collections
              </Link>
            </div>
            <ul className="z-50 p-3 mt-1 dropdown-glass">
              <li
                className={clsx(
                  'text-lg font-bold rounded-lg transition-all duration-200',
                  'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                  router.asPath.includes('/collections/create') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                )}
                tabIndex={-1}
              >
                <Link href="/collections/create/">Create a Collection</Link>
              </li>
              <li
                className={clsx(
                  'text-lg font-bold rounded-lg transition-all duration-200',
                  'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                  router.asPath.includes('/collections/myCollections/') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                )}
                tabIndex={-1}
              >
                <Link href="/collections/myCollections/">My Collections</Link>
              </li>
              <li
                className={clsx(
                  'text-lg font-bold rounded-lg transition-all duration-200',
                  'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                  router.asPath.includes('/collections/actions/') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                )}
                tabIndex={-1}
              >
                <Link href="/collections/actions/">Collection Actions</Link>
              </li>
              <li
                className={clsx(
                  'text-lg font-bold rounded-lg transition-all duration-200',
                  'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                  router.asPath.includes('/snapshots') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                )}
                tabIndex={-1}
              >
                <Link href="/snapshots">Snapshots</Link>
              </li>
              <Conditional test={NETWORK === 'mainnet'}>
                <li
                  className={clsx('text-lg font-bold hover:bg-white/[0.05] rounded-lg transition-all duration-200')}
                  tabIndex={-1}
                >
                  <label
                    className="w-full h-full text-lg font-bold text-gray-400 hover:text-white normal-case bg-transparent border-none animate-none btn modal-button"
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
          <ul className="group py-1 px-2 w-full bg-transparent menu rounded-box">
            <li tabIndex={0}>
              <span
                className={clsx(
                  'flex z-40 gap-3 items-center py-2 px-3 text-xl font-bold rounded-xl small-caps',
                  'transition-all duration-300',
                  'hover:bg-white/[0.05] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
                  router.asPath.includes('/badges/')
                    ? 'text-white bg-plumbus/10 border-l-2 border-plumbus shadow-[0_0_15px_rgba(219,38,118,0.15)]'
                    : 'text-gray-400 group-hover:text-white',
                )}
              >
                <FaMedal
                  className={clsx(
                    'transition-all duration-300',
                    router.asPath.includes('/badges/')
                      ? 'text-plumbus'
                      : 'text-gray-500 group-hover:text-plumbus group-hover:scale-110',
                  )}
                  size={18}
                />
                <Link href="/badges/">Badges</Link>
              </span>
              <ul className="z-50 p-3 mt-1 dropdown-glass">
                <li
                  className={clsx(
                    'text-lg font-bold rounded-lg transition-all duration-200',
                    'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                    router.asPath.includes('/badges/create/') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                  )}
                  tabIndex={-1}
                >
                  <Link href="/badges/create/">Create a Badge</Link>
                </li>
                <li
                  className={clsx(
                    'text-lg font-bold rounded-lg transition-all duration-200',
                    'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                    router.asPath.includes('/badges/myBadges/') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                  )}
                  tabIndex={-1}
                >
                  <Link href="/badges/myBadges/">My Badges</Link>
                </li>
                <li
                  className={clsx(
                    'text-lg font-bold rounded-lg transition-all duration-200',
                    'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                    router.asPath.includes('/badges/actions/') ? 'text-white bg-plumbus/10' : 'text-gray-400',
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
                'flex z-40 gap-3 items-center py-2 px-3 text-xl font-bold rounded-xl small-caps',
                'transition-all duration-300',
                'hover:bg-white/[0.05] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
                router.asPath.includes('/tokenfactory')
                  ? 'text-white bg-plumbus/10 border-l-2 border-plumbus shadow-[0_0_15px_rgba(219,38,118,0.15)]'
                  : 'text-gray-400 group-hover:text-white',
              )}
            >
              <FaCoins
                className={clsx(
                  'transition-all duration-300',
                  router.asPath.includes('/tokenfactory')
                    ? 'text-plumbus'
                    : 'text-gray-500 group-hover:text-plumbus group-hover:scale-110',
                )}
                size={18}
              />
              <Link href="/tokenfactory/">Tokens</Link>
            </span>
            <ul className="z-50 p-3 mt-1 dropdown-glass">
              <li
                className={clsx(
                  'text-lg font-bold rounded-lg transition-all duration-200',
                  'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                  router.asPath.includes('/tokenfactory/') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                )}
                tabIndex={-1}
              >
                <Link href="/tokenfactory/">Token Factory</Link>
              </li>
              <li
                className={clsx('opacity-50 disabled', 'text-lg font-bold rounded-lg', 'text-gray-500')}
                tabIndex={-1}
              >
                <Link href="/">Airdrop Tokens</Link>
              </li>
            </ul>
          </li>
        </ul>
        <ul className="group py-1 px-2 w-full bg-transparent menu rounded-box">
          <li tabIndex={0}>
            <span
              className={clsx(
                'flex z-40 gap-3 items-center py-2 px-3 text-xl font-bold rounded-xl small-caps',
                'transition-all duration-300',
                'hover:bg-white/[0.05] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
                router.asPath.includes('/contracts/')
                  ? 'text-white bg-plumbus/10 border-l-2 border-plumbus shadow-[0_0_15px_rgba(219,38,118,0.15)]'
                  : 'text-gray-400 group-hover:text-white',
              )}
            >
              <FaFileContract
                className={clsx(
                  'transition-all duration-300',
                  router.asPath.includes('/contracts/')
                    ? 'text-plumbus'
                    : 'text-gray-500 group-hover:text-plumbus group-hover:scale-110',
                )}
                size={18}
              />
              <Link href="/contracts/">Contract Dashboards</Link>
            </span>
            <ul className="z-50 p-3 mt-1 dropdown-glass">
              <Conditional test={BASE_FACTORY_ADDRESS !== undefined}>
                <li
                  className={clsx(
                    'text-lg font-bold rounded-lg transition-all duration-200',
                    'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                    router.asPath.includes('/contracts/baseMinter/') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                  )}
                  tabIndex={-1}
                >
                  <Link href="/contracts/baseMinter/">Base Minter Contract</Link>
                </li>
              </Conditional>
              <li
                className={clsx(
                  'text-lg font-bold rounded-lg transition-all duration-200',
                  'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                  router.asPath.includes('/contracts/vendingMinter/') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                )}
                tabIndex={-1}
              >
                <Link href="/contracts/vendingMinter/">Vending Minter Contract</Link>
              </li>
              <Conditional test={OPEN_EDITION_FACTORY_ADDRESS !== undefined}>
                <li
                  className={clsx(
                    'text-lg font-bold rounded-lg transition-all duration-200',
                    'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                    router.asPath.includes('/contracts/openEditionMinter/')
                      ? 'text-white bg-plumbus/10'
                      : 'text-gray-400',
                  )}
                  tabIndex={-1}
                >
                  <Link href="/contracts/openEditionMinter/">Open Edition Minter Contract</Link>
                </li>
              </Conditional>
              <li
                className={clsx(
                  'text-lg font-bold rounded-lg transition-all duration-200',
                  'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                  router.asPath.includes('/contracts/sg721/') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                )}
                tabIndex={-1}
              >
                <Link href="/contracts/sg721/">SG721 Contract</Link>
              </li>
              <li
                className={clsx(
                  'text-lg font-bold rounded-lg transition-all duration-200',
                  'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                  router.asPath.includes('/contracts/whitelist/') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                )}
                tabIndex={-1}
              >
                <Link href="/contracts/whitelist/">Whitelist Contract</Link>
              </li>
              <Conditional test={BADGE_HUB_ADDRESS !== undefined}>
                <li
                  className={clsx(
                    'text-lg font-bold rounded-lg transition-all duration-200',
                    'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                    router.asPath.includes('/contracts/badgeHub/') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                  )}
                  tabIndex={-1}
                >
                  <Link href="/contracts/badgeHub/">Badge Hub Contract</Link>
                </li>
              </Conditional>
              <li
                className={clsx(
                  'text-lg font-bold rounded-lg transition-all duration-200',
                  'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                  router.asPath.includes('/contracts/splits/') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                )}
                tabIndex={-1}
              >
                <Link href="/contracts/splits/">Splits Contract</Link>
              </li>
              <li
                className={clsx(
                  'text-lg font-bold rounded-lg transition-all duration-200',
                  'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                  router.asPath.includes('/contracts/royaltyRegistry/') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                )}
                tabIndex={-1}
              >
                <Link href="/contracts/royaltyRegistry/">Royalty Registry</Link>
              </li>
              <li
                className={clsx(
                  'text-lg font-bold rounded-lg transition-all duration-200',
                  'hover:pl-1 hover:text-white hover:bg-white/[0.05]',
                  router.asPath.includes('/contracts/upload/') ? 'text-white bg-plumbus/10' : 'text-gray-400',
                )}
                tabIndex={-1}
              >
                <Link href="/contracts/upload/">Upload Contract</Link>
              </li>
            </ul>
          </li>
        </ul>
        <ul className="group py-1 px-2 w-full bg-transparent menu rounded-box">
          <li tabIndex={0}>
            <span
              className={clsx(
                'flex z-40 gap-3 items-center py-2 px-3 text-xl font-bold rounded-xl small-caps',
                'transition-all duration-300',
                'hover:bg-white/[0.05] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
                router.asPath.includes('/authz/')
                  ? 'text-white bg-plumbus/10 border-l-2 border-plumbus shadow-[0_0_15px_rgba(219,38,118,0.15)]'
                  : 'text-gray-400 group-hover:text-white',
              )}
            >
              <FaShieldAlt
                className={clsx(
                  'transition-all duration-300',
                  router.asPath.includes('/authz/')
                    ? 'text-plumbus'
                    : 'text-gray-500 group-hover:text-plumbus group-hover:scale-110',
                )}
                size={18}
              />
              <Link href="/authz/">Authz</Link>
            </span>
          </li>
        </ul>
      </div>

      <IncomeDashboardDisclaimer creatorAddress={wallet.address ? wallet.address : ''} />

      <div className="flex-grow" />
      {isTallWindow && (
        <div className="flex gap-3 w-full">
          <label
            className={clsx(
              'flex justify-center items-center w-12 h-12 rounded-xl cursor-pointer',
              'glass-button',
              'group/settings',
            )}
            htmlFor="my-modal-9"
          >
            <FaCog
              className="text-gray-400 group-hover/settings:text-white transition-all duration-300 group-hover/settings:rotate-90"
              size={20}
            />
          </label>

          <label
            className={clsx(
              'flex flex-1 gap-2 justify-center items-center h-12 rounded-xl cursor-pointer',
              'bg-blue-500/20 backdrop-blur-sm',
              'border border-blue-400/30',
              'hover:bg-blue-500/30 hover:border-blue-400/50',
              'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
              'transition-all duration-300',
              'font-bold text-blue-300',
            )}
            htmlFor="my-modal-8"
          >
            <FaList size={14} />
            View Logs
          </label>
        </div>
      )}
      {/* Stargaze network status */}
      {isTallWindow && (
        <div className="py-1 px-2 text-sm text-gray-400 capitalize bg-white/[0.03] rounded-lg">
          Network: <span className="text-white">{wallet.chain.pretty_name}</span>
        </div>
      )}

      {/* footer reference links */}
      <ul className="space-y-1 text-sm">
        {isTallWindow &&
          footerLinks.map(({ href, text }) => (
            <li key={href}>
              <Anchor
                className="block py-1 px-2 text-gray-400 hover:text-plumbus hover:bg-white/[0.03] rounded-md transition-all duration-200"
                href={href}
              >
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
      <div className="flex gap-x-4 items-center">
        {socialsLinks.map(({ Icon, href, text }) => (
          <Anchor
            key={href}
            className={clsx(
              'p-2 text-gray-400 rounded-lg',
              'hover:text-plumbus hover:bg-white/[0.05]',
              'hover:drop-shadow-[0_0_8px_rgba(219,38,118,0.5)] hover:scale-110',
              'transition-all duration-300',
            )}
            href={href}
          >
            <Icon aria-label={text} size={18} />
          </Anchor>
        ))}
      </div>
    </SidebarLayout>
  )
}
