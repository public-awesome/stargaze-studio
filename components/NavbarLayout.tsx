import clsx from 'clsx'
import type { ReactNode } from 'react'

export interface NavbarLayoutProps {
  children: ReactNode
}

export const NavbarLayout = ({ children }: NavbarLayoutProps) => {
  return (
    <div
      className={clsx(
        'hidden fixed top-0 z-50 ml-1 w-full max-w-full h-24',
        'bg-black border-white/10',
        'lg:flex lg:flex-row lg:justify-between lg:items-center',
      )}
    >
      {/* fixed component */}
      <div className={clsx('flex flex-row pl-8')}>
        {/* inner component */}
        <div className={clsx('flex flex-shrink-0 items-center mt-1 mr-4')}>{children}</div>
      </div>
    </div>
  )
}
