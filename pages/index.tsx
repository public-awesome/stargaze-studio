import { HomeCard } from 'components/HomeCard'
import type { NextPage } from 'next'
import { withMetadata } from 'utils/layout'

const HomePage: NextPage = () => {
  return (
    <section className="pt-4 pb-16 mt-28 ml-[25%] w-3/5">
      <div className="grid grid-cols-1 gap-10">
        <HomeCard
          className="p-8 -m-4 hover:bg-gray-500/10 rounded"
          link="/collections/"
          linkText="Collections"
          title="Collections"
        >
          Create a collection, view a list of your collections or execute collection actions and queries.
        </HomeCard>
        {/* <Conditional test={BADGE_HUB_ADDRESS !== undefined}>
          <HomeCard className="p-8 -m-4 hover:bg-gray-500/10 rounded" link="/badges" linkText="Badges" title="Badges">
            Create badges, view a list of them or execute badge related actions and queries.
          </HomeCard>
        </Conditional> */}
        <HomeCard
          className="p-8 -m-4 hover:bg-gray-500/10 rounded"
          link="/contracts"
          linkText="Dashboards"
          title="Contract Dashboards"
        >
          Execute actions and queries for a variety of contracts.
        </HomeCard>
      </div>
    </section>
  )
}

export default withMetadata(HomePage, { center: false })
