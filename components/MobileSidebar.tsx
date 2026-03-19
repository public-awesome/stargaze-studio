/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable no-nested-ternary */
/* eslint-disable tailwindcss/classnames-order */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-floating-promises */
import clsx from 'clsx'
import { Anchor } from 'components/Anchor'
import { WalletLoader } from 'components/WalletLoader'
import { useRouter } from 'next/router'
import { useState } from 'react'
import {
  FaChevronDown,
  FaChevronUp,
  FaCog,
  FaCoins,
  FaFileContract,
  FaLayerGroup,
  FaList,
  FaMedal,
  FaShieldAlt,
} from 'react-icons/fa'
import { footerLinks, socialsLinks } from 'utils/links'
import { useWallet } from 'utils/wallet'

import { BADGE_HUB_ADDRESS, BASE_FACTORY_ADDRESS, NETWORK, OPEN_EDITION_FACTORY_ADDRESS } from '../utils/constants'

export interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavSection {
  id: string
  label: string
  icon: typeof FaLayerGroup
  href: string
  children?: { label: string; href: string; disabled?: boolean }[]
  condition?: boolean
}

export const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const router = useRouter()
  const wallet = useWallet()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const navSections: NavSection[] = [
    {
      id: 'collections',
      label: 'Collections',
      icon: FaLayerGroup,
      href: '/collections/',
      children: [
        { label: 'Create a Collection', href: '/collections/create/' },
        { label: 'My Collections', href: '/collections/myCollections/' },
        { label: 'Collection Actions', href: '/collections/actions/' },
        { label: 'Snapshots', href: '/snapshots' },
        ...(NETWORK === 'mainnet' ? [{ label: 'Revenue Dashboard', href: '#revenue-dashboard' }] : []),
      ],
    },
    {
      id: 'badges',
      label: 'Badges',
      icon: FaMedal,
      href: '/badges/',
      condition: BADGE_HUB_ADDRESS !== undefined,
      children: [
        { label: 'Create a Badge', href: '/badges/create/' },
        { label: 'My Badges', href: '/badges/myBadges/' },
        { label: 'Badge Actions', href: '/badges/actions/' },
      ],
    },
    {
      id: 'tokens',
      label: 'Tokens',
      icon: FaCoins,
      href: '/tokenfactory/',
      children: [
        { label: 'Token Factory', href: '/tokenfactory/' },
        { label: 'Airdrop Tokens', href: '/', disabled: true },
      ],
    },
    {
      id: 'contracts',
      label: 'Contract Dashboards',
      icon: FaFileContract,
      href: '/contracts/',
      children: [
        ...(BASE_FACTORY_ADDRESS !== undefined
          ? [{ label: 'Base Minter Contract', href: '/contracts/baseMinter/' }]
          : []),
        { label: 'Vending Minter Contract', href: '/contracts/vendingMinter/' },
        ...(OPEN_EDITION_FACTORY_ADDRESS !== undefined
          ? [{ label: 'Open Edition Minter', href: '/contracts/openEditionMinter/' }]
          : []),
        { label: 'SG721 Contract', href: '/contracts/sg721/' },
        { label: 'Whitelist Contract', href: '/contracts/whitelist/' },
        ...(BADGE_HUB_ADDRESS !== undefined ? [{ label: 'Badge Hub Contract', href: '/contracts/badgeHub/' }] : []),
        { label: 'Splits Contract', href: '/contracts/splits/' },
        { label: 'Royalty Registry', href: '/contracts/royaltyRegistry/' },
        { label: 'Upload Contract', href: '/contracts/upload/' },
      ],
    },
    {
      id: 'authz',
      label: 'Authz',
      icon: FaShieldAlt,
      href: '/authz/',
    },
  ]

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      // Handle modal triggers like revenue dashboard
      document.getElementById('my-modal-1')?.click()
    } else {
      router.push(href)
    }
    onClose()
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm',
          'transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={clsx(
          'fixed top-16 bottom-0 left-0 z-50 w-[85%] max-w-[320px]',
          'bg-black/95 backdrop-blur-xl',
          'border-r border-white/[0.08]',
          'shadow-[4px_0_32px_rgba(0,0,0,0.6)]',
          'overflow-y-auto no-scrollbar',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex flex-col p-4 space-y-4 min-h-full">
          {/* Wallet */}
          <div className="pb-4 border-b border-white/[0.08]">
            <WalletLoader />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navSections.map((section) => {
              if (section.condition === false) return null

              const isActive = router.asPath.includes(section.href.replace(/\/$/, ''))
              const isExpanded = expandedSection === section.id
              const Icon = section.icon

              return (
                <div key={section.id}>
                  {/* Section Header */}
                  <button
                    className={clsx(
                      'flex gap-3 justify-between items-center py-3 px-4 w-full rounded-xl',
                      'transition-all duration-300',
                      isActive
                        ? 'text-white border-l-2 border-plumbus shadow-[0_0_15px_rgba(219,38,118,0.15)] bg-plumbus/15'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.05]',
                    )}
                    onClick={() => (section.children ? toggleSection(section.id) : handleNavClick(section.href))}
                    type="button"
                  >
                    <div className="flex gap-3 items-center">
                      <Icon
                        className={clsx('transition-colors duration-300', isActive ? 'text-plumbus' : 'text-gray-500')}
                        size={18}
                      />
                      <span className="text-base font-bold">{section.label}</span>
                    </div>
                    {section.children &&
                      (isExpanded ? (
                        <FaChevronUp className="text-gray-500" size={12} />
                      ) : (
                        <FaChevronDown className="text-gray-500" size={12} />
                      ))}
                  </button>

                  {/* Children */}
                  {section.children && isExpanded && (
                    <div className="pl-4 mt-1 ml-4 space-y-1 border-l border-white/[0.08]">
                      {section.children.map((child) => (
                        <button
                          key={child.href}
                          className={clsx(
                            'w-full text-left px-3 py-2 rounded-lg text-sm',
                            'transition-all duration-200',
                            child.disabled
                              ? 'text-gray-500 opacity-50 cursor-not-allowed'
                              : router.asPath.includes(child.href)
                              ? 'text-white bg-plumbus/10'
                              : 'text-gray-400 hover:text-white hover:bg-white/[0.05]',
                          )}
                          disabled={child.disabled}
                          onClick={() => !child.disabled && handleNavClick(child.href)}
                          type="button"
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Settings & Logs */}
          <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
            <label
              className={clsx(
                'flex justify-center items-center w-12 h-12 rounded-xl cursor-pointer',
                'bg-white/[0.05] backdrop-blur-sm',
                'border border-white/[0.1]',
                'hover:bg-white/[0.1]',
                'transition-all duration-300',
              )}
              htmlFor="my-modal-9"
              onClick={onClose}
            >
              <FaCog className="text-gray-400" size={18} />
            </label>

            <label
              className={clsx(
                'flex flex-1 gap-2 justify-center items-center h-12 rounded-xl cursor-pointer',
                'bg-blue-500/20 backdrop-blur-sm',
                'border border-blue-400/30',
                'hover:bg-blue-500/30',
                'transition-all duration-300',
                'text-sm font-bold text-blue-300',
              )}
              htmlFor="my-modal-8"
              onClick={onClose}
            >
              <FaList size={12} />
              View Logs
            </label>
          </div>

          {/* Network Status */}
          <div className="py-2 px-3 text-sm text-center text-gray-400 bg-white/[0.03] rounded-lg">
            Network: <span className="text-white">{wallet.chain.pretty_name}</span>
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap gap-3 justify-center text-xs">
            {footerLinks.map(({ href, text }) => (
              <Anchor
                key={href}
                className="text-gray-400 hover:text-plumbus transition-colors duration-200"
                href={href}
              >
                {text}
              </Anchor>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex gap-4 justify-center pt-2">
            {socialsLinks.map(({ Icon, href, text }) => (
              <Anchor
                key={href}
                className={clsx(
                  'p-2 text-gray-400 rounded-lg',
                  'hover:text-plumbus hover:bg-white/[0.05]',
                  'transition-all duration-300',
                )}
                href={href}
              >
                <Icon aria-label={text} size={16} />
              </Anchor>
            ))}
          </div>

          {/* Attribution */}
          <div className="pb-4 text-xs text-center text-white/40">Stargaze Studio {process.env.APP_VERSION}</div>
        </div>
      </div>
    </>
  )
}
