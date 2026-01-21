import clsx from 'clsx'
import Head from 'next/head'
import type { ReactNode } from 'react'
import { useState } from 'react'
import type { PageMetadata } from 'utils/layout'

import { DefaultAppSeo } from './DefaultAppSeo'
import { LogModal } from './LogModal'
import { MobileHeader } from './MobileHeader'
import { MobileSidebar } from './MobileSidebar'
import { SettingsModal } from './SettingsModal'
import { Sidebar } from './Sidebar'

export interface LayoutProps {
  metadata?: PageMetadata
  children: ReactNode
}

export const Layout = ({ children, metadata = {} }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="overflow-hidden relative min-h-screen bg-black">
      <Head>
        <meta content="minimum-scale=1, initial-scale=1, width=device-width" name="viewport" />
      </Head>

      <DefaultAppSeo />

      {/* Subtle animated background gradient */}
      <div
        className={clsx(
          'fixed inset-0 -z-10 opacity-30 pointer-events-none',
          'bg-gradient-to-br from-plumbus/10 via-transparent to-purple/10',
        )}
      />

      {/* Desktop layout with glass sidebar */}
      <div className="hidden bg-transparent sm:flex">
        <Sidebar />
        <div
          className={clsx(
            'overflow-auto relative flex-grow h-screen no-scrollbar',
            'shadow-[inset_4px_0_24px_rgba(0,0,0,0.3)]',
          )}
        >
          <main
            className={clsx('py-8 mx-auto max-w-7xl', {
              'flex flex-col justify-center items-center':
                typeof metadata.center === 'boolean' ? metadata.center : true,
            })}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden">
        <MobileHeader isMenuOpen={isMobileMenuOpen} onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main
          className={clsx('overflow-auto px-4 pt-20 pb-8 min-h-screen', {
            'flex flex-col justify-center items-center': typeof metadata.center === 'boolean' ? metadata.center : true,
          })}
        >
          {children}
        </main>
      </div>

      {/* Modals - rendered outside sidebar to avoid backdrop-filter containment */}
      <LogModal />
      <SettingsModal />
    </div>
  )
}
