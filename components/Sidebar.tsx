import clsx from 'clsx'
import { Anchor } from 'components/Anchor'
import { useWallet } from 'contexts/wallet'
import { useRouter } from 'next/router'
// import BrandText from 'public/brand/brand-text.svg'
import { footerLinks, socialsLinks } from 'utils/links'

import { SidebarLayout } from './SidebarLayout'
import { WalletLoader } from './WalletLoader'

const routes = [
  { text: 'Collections', href: `/collections/`, isChild: false },
  { text: 'Create a Collection', href: `/collections/create/`, isChild: true },
  { text: 'My Collections', href: `/collections/myCollections/`, isChild: true },
  { text: 'Collection Actions', href: `/collections/actions/`, isChild: true },
  { text: 'Contract Dashboards', href: `/contracts/`, isChild: false },
]

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
      {routes.map(({ text, href, isChild }) => (
        <Anchor
          key={href}
          className={clsx(
            'px-4 -mx-5 font-extrabold uppercase rounded-lg', // styling
            'hover:bg-white/5 transition-colors', // hover styling
            { 'py-0 ml-2 text-sm font-bold': isChild },
            { 'text-gray hover:text-white': router.asPath !== href && isChild },
            { 'text-plumbus': router.asPath === href && isChild }, // active route styling
            // { 'text-gray-500 pointer-events-none': disabled }, // disabled route styling
          )}
          href={href}
        >
          {text}
        </Anchor>
      ))}

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
