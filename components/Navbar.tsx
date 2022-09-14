import clsx from 'clsx'
import { Anchor } from 'components/Anchor'
import { useWallet } from 'contexts/wallet'
import { useRouter } from 'next/router'

import { NavbarLayout } from './NavbarLayout'
import { WalletLoader } from './WalletLoader'

const routes = [
  { text: 'Launchpad', href: `https://www.stargaze.zone/launchpad` },
  {
    text: 'Marketplace',
    href: `https://www.stargaze.zone/marketplace`,
    special: <span className="py-0.5 px-2 ml-2 text-xs rounded-md border">BETA</span>,
  },
  { text: 'My Collections', href: `/collections/` },
  { text: 'Stake', href: `https://www.stargaze.zone/stake` },
  {
    text: 'Governance',
    special: (
      <svg
        aria-hidden="true"
        className="-mr-1 ml-2 w-5 h-5 text-violet-200 hover:text-violet-100"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clipRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          fillRule="evenodd"
        />
      </svg>
    ),
  },
  {
    text: 'Swap',
    href: `https://app.osmosis.zone/?from=ATOM&to=STARS`,
    special: (
      <svg
        aria-hidden="true"
        className="pb-1 ml-2 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export const Navbar = () => {
  const router = useRouter()
  const wallet = useWallet()

  return (
    <NavbarLayout>
      <div className="flex flex-row w-full">
        {/* Stargaze brand as home button */}
        <Anchor href="https://stargaze.zone" onContextMenu={(e) => [e.preventDefault(), router.push('/brand')]}>
          <img alt="Brand Text" className="mt-2 h-6" src="/stargaze_logo_800.svg" />
        </Anchor>

        {/* main navigation routes */}
        {routes.map(({ text, href, special }) => (
          <Anchor
            key={href}
            className={clsx(
              'py-2 px-4 mx-1 rounded-lg', // styling
              'hover:bg-white/5 transition-colors', // hover styling
              { 'font-bold bg-plumbus hover:bg-plumbus': router.asPath === href }, // active route styling
              // { 'text-gray-500 pointer-events-none': disabled }, // disabled route styling
            )}
            href={href}
          >
            <span className="flex flex-row">
              {text} {special}
            </span>
          </Anchor>
        ))}
      </div>
      {/* wallet button */}
      <WalletLoader />
    </NavbarLayout>
  )
}
