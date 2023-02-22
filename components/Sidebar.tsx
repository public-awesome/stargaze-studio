/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-nested-ternary */
import clsx from 'clsx'
import { Anchor } from 'components/Anchor'
import { useWallet } from 'contexts/wallet'
import { useRouter } from 'next/router'
// import BrandText from 'public/brand/brand-text.svg'
import { footerLinks, socialsLinks } from 'utils/links'

import { BASE_FACTORY_ADDRESS, NETWORK } from '../utils/constants'
import { IncomeDashboardDisclaimer } from './IncomeDashboardDisclaimer'
import { SidebarLayout } from './SidebarLayout'
import { WalletLoader } from './WalletLoader'

const routes = [
  { text: 'Collections', href: `/collections/`, isChild: false },
  { text: 'Create a Collection', href: `/collections/create/`, isChild: true },
  { text: 'My Collections', href: `/collections/myCollections/`, isChild: true },
  { text: 'Collection Actions', href: `/collections/actions/`, isChild: true },
  { text: 'Creator Income Dashboard', href: `/`, isChild: true },
  { text: 'Contract Dashboards', href: `/contracts/`, isChild: false },
  { text: 'Base Minter Contract', href: `/contracts/baseMinter/`, isChild: true },
  { text: 'Vending Minter Contract', href: `/contracts/vendingMinter/`, isChild: true },
  { text: 'SG721 Contract', href: `/contracts/sg721/`, isChild: true },
  { text: 'Whitelist Contract', href: `/contracts/whitelist/`, isChild: true },
]

export const Sidebar = () => {
  const router = useRouter()
  const wallet = useWallet()

  let tempRoutes = routes
  if (BASE_FACTORY_ADDRESS === undefined) {
    tempRoutes = routes.filter((route) => route.href !== '/contracts/baseMinter/')
  }

  return (
    <SidebarLayout>
      {/* Stargaze brand as home button */}
      <Anchor href="/" onContextMenu={(e) => [e.preventDefault(), router.push('/brand')]}>
        <img alt="Brand Text" className="w-full" src="/stargaze_logo_800.svg" />
      </Anchor>

      {/* wallet button */}
      <WalletLoader />
      {/* main navigation routes */}
      {tempRoutes.map(({ text, href, isChild }) =>
        text !== 'Creator Income Dashboard' ? (
          <Anchor
            key={href}
            className={clsx(
              'px-2 -mx-5 font-extrabold uppercase rounded-lg', // styling
              'hover:bg-white/5 transition-colors', // hover styling
              { 'py-0 -ml-2 text-sm font-bold': isChild },
              {
                'text-gray hover:text-white':
                  !router.asPath.substring(0, router.asPath.lastIndexOf('/') + 1).includes(href) && isChild,
              },
              {
                'text-stargaze':
                  router.asPath.substring(0, router.asPath.lastIndexOf('/') + 1).includes(href) && isChild,
              }, // active route styling
              // { 'text-gray-500 pointer-events-none': disabled }, // disabled route styling
            )}
            href={href}
          >
            {text}
          </Anchor>
        ) : NETWORK === 'mainnet' ? (
          <button
            className={clsx(
              'font-extrabold uppercase bg-clip-text border-none', // styling
              'text-gray hover:text-white hover:bg-white/5 transition-colors', // hover styling
              'py-0 -mt-3 -ml-11 text-sm font-bold',
            )}
            type="button"
          >
            <label
              className="w-full h-full text-gray hover:text-white bg-clip-text bg-transparent hover:bg-white/5 border-none btn modal-button"
              htmlFor="my-modal-1"
            >
              Income Dashboard
            </label>
          </button>
        ) : null,
      )}

      <IncomeDashboardDisclaimer creatorAddress={wallet.address ? wallet.address : ''} />

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
