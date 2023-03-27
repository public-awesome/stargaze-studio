import { Conditional } from 'components/Conditional'
import { HomeCard } from 'components/HomeCard'
import type { NextPage } from 'next'
// import Brand from 'public/brand/brand.svg'
import { withMetadata } from 'utils/layout'

import { BADGE_HUB_ADDRESS, BASE_FACTORY_ADDRESS } from '../../utils/constants'

const HomePage: NextPage = () => {
  return (
    <section className="px-8 pt-4 pb-16 mx-auto space-y-8 max-w-4xl">
      <div className="flex justify-center items-center py-8 max-w-xl">
        {/* <Brand className="w-full text-plumbus" /> */}
      </div>
      <h1 className="font-heading text-4xl font-bold">Smart Contract Dashboards</h1>
      <p className="text-xl">
        Here you can execute actions and queries on different smart contracts and see the results.
        <br />
      </p>

      <br />

      <br />

      <div className="grid gap-8 md:grid-cols-2">
        <Conditional test={BASE_FACTORY_ADDRESS !== undefined}>
          <HomeCard
            className="p-4 -m-4 hover:bg-gray-500/10 rounded"
            link="/contracts/baseMinter"
            title="Base Minter Contract"
          >
            Execute messages and run queries on Stargaze&apos;s Base Minter contract.
          </HomeCard>
        </Conditional>
        <HomeCard
          className="p-4 -m-4 hover:bg-gray-500/10 rounded"
          link="/contracts/vendingMinter"
          title="Vending Minter Contract"
        >
          Execute messages and run queries on Stargaze&apos;s Vending Minter contract.
        </HomeCard>
        <HomeCard className="p-4 -m-4 hover:bg-gray-500/10 rounded" link="/contracts/sg721" title="Sg721 Contract">
          Execute messages and run queries on Stargaze&apos;s SG721 contract.
        </HomeCard>
        <HomeCard
          className="p-4 -m-4 hover:bg-gray-500/10 rounded"
          link="/contracts/whitelist"
          title="Whitelist Contract"
        >
          Execute messages and run queries on Stargaze&apos;s Whitelist contract.
        </HomeCard>
        <Conditional test={BADGE_HUB_ADDRESS !== undefined}>
          <HomeCard
            className="p-4 -m-4 hover:bg-gray-500/10 rounded"
            link="/contracts/badgeHub"
            title="Badge Hub Contract"
          >
            Execute messages and run queries on the Badge Hub contract designed for event organizers.
          </HomeCard>
        </Conditional>
      </div>
    </section>
  )
}

export default withMetadata(HomePage, { center: false })
