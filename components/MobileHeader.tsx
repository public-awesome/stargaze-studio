import clsx from 'clsx'
import Link from 'next/link'
import { FaBars, FaTimes } from 'react-icons/fa'

export interface MobileHeaderProps {
  isMenuOpen: boolean
  onMenuToggle: () => void
}

export const MobileHeader = ({ isMenuOpen, onMenuToggle }: MobileHeaderProps) => {
  return (
    <header
      className={clsx(
        'fixed top-0 right-0 left-0 z-50',
        'px-4 h-16',
        'flex justify-between items-center',
        'bg-black/80 backdrop-blur-xl',
        'border-b border-white/[0.08]',
        'shadow-[0_4px_24px_rgba(0,0,0,0.5)]',
      )}
    >
      {/* Logo */}
      <Link href="/">
        <img alt="Stargaze Studio" className="h-8 drop-shadow-[0_0_8px_rgba(219,38,118,0.3)]" src="/studio-logo.png" />
      </Link>

      {/* Hamburger Menu Button */}
      <button
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        className={clsx(
          'p-3 rounded-xl',
          'bg-white/[0.05] backdrop-blur-sm',
          'border border-white/[0.1]',
          'hover:bg-plumbus/20 hover:border-plumbus/50',
          'hover:shadow-[0_0_15px_rgba(219,38,118,0.3)]',
          'active:scale-95',
          'transition-all duration-300',
        )}
        onClick={onMenuToggle}
        type="button"
      >
        {isMenuOpen ? <FaTimes className="text-plumbus" size={20} /> : <FaBars className="text-plumbus" size={20} />}
      </button>
    </header>
  )
}
