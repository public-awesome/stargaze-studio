import clsx from 'clsx'
import { Anchor } from 'components/Anchor'
import { useWallet } from 'contexts/wallet'
import { useRouter } from 'next/router'

import { NavbarLayout } from './NavbarLayout'
import { WalletLoader } from './WalletLoader'

const routes = [
  { text: 'Launchpad', href: `/launchpad/` },
  { text: 'Marketplace beta', href: `/marketplace/` },
  { text: 'Collections', href: `/collections/` },
  { text: 'Stake', href: `/stake/` },
  { text: 'Governance', href: `/governance/` },
  { text: 'Swap', href: `/swap/` },
]

export const Navbar = () => {
  const router = useRouter()
  const wallet = useWallet()

  return (
    <NavbarLayout>
      {/* Stargaze brand as home button */}
      <Anchor href="/" onContextMenu={(e) => [e.preventDefault(), router.push('/brand')]}>
        <img alt="Brand Text" className="-mt-1 h-6" src="/stargaze_logo_800.svg" />
      </Anchor>

      {/* main navigation routes */}
      {routes.map(({ text, href }) => (
        <Anchor
          key={href}
          className={clsx(
            'py-2 px-4 mx-1 uppercase rounded-lg', // styling
            'hover:bg-white/5 transition-colors', // hover styling
            { 'font-bold bg-plumbus hover:bg-plumbus': router.asPath === href }, // active route styling
            // { 'text-gray-500 pointer-events-none': disabled }, // disabled route styling
          )}
          href={href}
        >
          {text}
        </Anchor>
      ))}

      {/* wallet button */}
      <WalletLoader />
    </NavbarLayout>
  )
}
