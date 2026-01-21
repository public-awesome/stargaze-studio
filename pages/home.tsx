import clsx from 'clsx'
import { Conditional } from 'components/Conditional'
import { HomeCard } from 'components/HomeCard'
import type { NextPage } from 'next'
import { BADGE_HUB_ADDRESS } from 'utils/constants'
import { withMetadata } from 'utils/layout'

const glassCardClasses = clsx(
  'group p-6 rounded-2xl',
  // Glass card effect
  'bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
  'backdrop-blur-md',
  'border border-white/[0.1]',
  'shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]',
  // Hover effects
  'hover:bg-gradient-to-br hover:from-white/[0.1] hover:to-white/[0.04]',
  'hover:border-white/[0.15]',
  'hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(219,38,118,0.15),inset_0_1px_0_rgba(255,255,255,0.15)]',
  'transition-all duration-300 ease-out',
)

const HomePage: NextPage = () => {
  return (
    <section className="px-4 pt-4 pb-16 mx-auto space-y-6 w-full max-w-4xl sm:px-8 sm:space-y-8">
      {/* Logo section with glow effect */}
      <div className="flex relative justify-center items-center py-4 mx-auto max-w-xl sm:py-8">
        <div
          className={clsx(
            'absolute inset-0 rounded-3xl',
            'bg-gradient-to-r from-plumbus/10 via-transparent to-purple/10',
            'opacity-50 blur-3xl',
          )}
        />
        <img
          alt="Brand Text"
          className="relative w-3/4 drop-shadow-[0_0_20px_rgba(219,38,118,0.3)] sm:ml-[50%] sm:w-1/2"
          src="/studio-logo.png"
        />
      </div>

      {/* Welcome section with glass panel */}
      <div
        className={clsx(
          'p-5 rounded-2xl sm:p-8',
          'bg-white/[0.03] backdrop-blur-sm',
          'border border-white/[0.05]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.2)]',
        )}
      >
        <h1 className="mb-3 font-heading text-2xl font-bold text-white sm:mb-4 sm:text-4xl">Welcome!</h1>
        <p className="text-base leading-relaxed text-gray-300 sm:text-lg">
          Looking for a fast and efficient way to build an NFT collection? Stargaze Studio is the solution.
        </p>
        <p className="mt-3 text-base leading-relaxed text-gray-300 sm:mt-4 sm:text-lg">
          Stargaze Studio is built to provide useful smart contract interfaces that help you build and deploy your own
          NFT collections in no time.
        </p>
      </div>

      {/* Glass cards grid */}
      <div className="grid grid-cols-1 gap-4 mt-6 sm:gap-6 sm:mt-8 md:grid-cols-2">
        <HomeCard className={glassCardClasses} link="/collections/" linkText="Collections" title="Collections">
          Create a collection, view a list of your collections or execute collection actions and queries.
        </HomeCard>
        <Conditional test={BADGE_HUB_ADDRESS !== undefined}>
          <HomeCard className={glassCardClasses} link="/badges" linkText="Badges" title="Badges">
            Create badges, view a list of them or execute badge related actions and queries.
          </HomeCard>
        </Conditional>
        <HomeCard className={glassCardClasses} link="/contracts" linkText="Dashboards" title="Contract Dashboards">
          Execute actions and queries for a variety of contracts.
        </HomeCard>
      </div>
    </section>
  )
}

export default withMetadata(HomePage, { center: false })
