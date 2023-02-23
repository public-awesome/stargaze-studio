/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */

import clsx from 'clsx'
import { Anchor } from 'components/Anchor'
import { useWallet } from 'contexts/wallet'
import Link from 'next/link'
import { useRouter } from 'next/router'
// import BrandText from 'public/brand/brand-text.svg'
import { footerLinks, socialsLinks } from 'utils/links'


import { BADGE_HUB_ADDRESS, BASE_FACTORY_ADDRESS } from '../utils/constants'
import { Conditional } from './Conditional'
import { SidebarLayout } from './SidebarLayout'
import { WalletLoader } from './WalletLoader'

export const Sidebar = () => {
  const router = useRouter()
  const wallet = useWallet()

  return (
    <SidebarLayout>
      {/* Stargaze brand as home button */}
      <Anchor href="/" onContextMenu={(e) => [e.preventDefault(), router.push('/brand')]}>
        <img alt="Brand Text" className="w-full" src="/stargaze_logo_800.svg" />
      </Anchor>

      {/* wallet button */}
      <WalletLoader />
      {/* main navigation routes */}

      <div className="absolute top-[20%] left-[5%]">
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
            </ul>
          </li>
        </ul>
      </div>

      <div className="flex-grow" />

      {/* Stargaze network status */}
      <div className="text-sm capitalize">Network: {wallet.network}</div>

      {/* footer reference links */}
      <ul className="text-sm list-disc list-inside">
        {footerLinks.map(({ href, text }) => (
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
        Made by{' '}
        <Anchor className="text-plumbus hover:underline" href="https://deuslabs.fi">
          deus labs
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
