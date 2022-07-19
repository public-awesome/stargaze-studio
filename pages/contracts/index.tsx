import { HomeCard } from 'components/HomeCard'
import type { NextPage } from 'next'
// import Brand from 'public/brand/brand.svg'
import { withMetadata } from 'utils/layout'

const HomePage: NextPage = () => {
  return (
    <section className="px-8 pt-4 pb-16 mx-auto space-y-8 max-w-4xl">
      <div className="flex justify-center items-center py-8 max-w-xl">
        {/* <Brand className="w-full text-plumbus" /> */}
      </div>
      <h1 className="font-heading text-4xl font-bold">Smart Contracts</h1>
      <p className="text-xl">
        Here you can invoke and query different smart contracts and see the results.
        <br />
      </p>

      <br />

      <br />

      <div className="grid gap-8 md:grid-cols-2">
        <HomeCard className="p-4 -m-4 hover:bg-gray-500/10 rounded" link="/contracts/minter" title="Minter contract">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </HomeCard>
        <HomeCard className="p-4 -m-4 hover:bg-gray-500/10 rounded" link="/contracts/sg721" title="Sg721 Contract">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </HomeCard>
        <HomeCard
          className="p-4 -m-4 hover:bg-gray-500/10 rounded"
          link="/contracts/whitelist"
          title="Whitelist Contract"
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </HomeCard>
      </div>
    </section>
  )
}

export default withMetadata(HomePage, { center: false })
