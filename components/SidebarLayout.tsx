import clsx from 'clsx'
import { toggleSidebar, useSidebarStore } from 'contexts/sidebar'
import type { ReactNode } from 'react'
import { FaChevronLeft } from 'react-icons/fa'

export interface SidebarLayoutProps {
  children: ReactNode
}

export const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  const { isOpen } = useSidebarStore()

  return (
    <div className={clsx(isOpen ? 'min-w-[250px] max-w-[250px]' : 'min-w-[20px] max-w-[20px]', 'relative z-10')}>
      {/* Fixed glassmorphism sidebar container */}
      <div
        className={clsx(
          'overflow-x-visible fixed top-0 left-0 min-w-[250px] max-w-[250px] no-scrollbar',
          // Glass effect styles
          'glass-sidebar',
          // Transition for collapse
          'transition-transform duration-300 ease-in-out',
          { 'translate-x-[-230px]': !isOpen },
        )}
      >
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        {/* Inner content container */}
        <div
          className={clsx('flex relative flex-col gap-y-4 p-8 min-h-screen', 'transition-opacity duration-200', {
            'invisible opacity-0': !isOpen,
            'visible opacity-100': isOpen,
          })}
        >
          {children}
        </div>
      </div>

      {/* Glassmorphism sidebar toggle button */}
      <button
        className={clsx(
          'absolute top-[32px] right-[-12px] p-1 w-[26px] h-[26px]',
          // Glass button styling
          'bg-plumbus/90 rounded-full backdrop-blur-sm',
          'border border-plumbus-light/50',
          'shadow-lg shadow-plumbus/30',
          // Hover effects with glow
          'hover:bg-plumbus hover:shadow-glow-plumbus hover:scale-110',
          'active:scale-95',
          // Transition
          'transition-all duration-200 ease-out',
        )}
        onClick={toggleSidebar}
        type="button"
      >
        <FaChevronLeft
          className={clsx('mx-auto text-white', 'transition-transform duration-300', { 'rotate-180': !isOpen })}
          size={12}
        />
      </button>
    </div>
  )
}
