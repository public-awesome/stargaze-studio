import { Conditional } from 'components/Conditional'
import { HomeCard } from 'components/HomeCard'
import type { NextPage } from 'next'
import { BADGE_HUB_ADDRESS } from 'utils/constants'
import { withMetadata } from 'utils/layout'

const HomePage: NextPage = () => {
  return (
    <section className="px-8 pt-4 pb-16 mx-auto space-y-8 max-w-4xl">
      <div className="flex justify-center items-center py-8 max-w-xl">
        <img alt="Brand Text" className="ml-[50%] w-full" src="/stargaze_logo_800.svg" />
      </div>
      <h1 className="font-heading text-4xl font-bold">Welcome!</h1>
      <p className="text-xl">
        Looking for a fast and efficient way to build an NFT collection? Stargaze Studio is the solution.
        <br />
        <br />
        Stargaze Studio is built to provide useful smart contract interfaces that helps you build and deploy your own
        NFT collections in no time.
      </p>

      <br />

      <br />

      <div className="grid gap-8 md:grid-cols-2">
        <HomeCard className="p-4 -m-4 hover:bg-gray-500/10 rounded" link="/collections/" title="Collections">
          Create a collection, view a list of your collections or execute collection actions and queries.
        </HomeCard>
        <Conditional test={BADGE_HUB_ADDRESS !== undefined}>
          <HomeCard className="p-4 -m-4 hover:bg-gray-500/10 rounded" link="/badges" title="Badges">
            Create badges, view a list of them or execute badge related actions and queries.
          </HomeCard>
        </Conditional>
        <HomeCard className="p-4 -m-4 hover:bg-gray-500/10 rounded" link="/contracts" title="Contract Dashboards">
          Execute actions and queries for a variety of contracts.
        </HomeCard>
      </div>
    </section>
  )
}

export default withMetadata(HomePage, { center: false })
