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
      <h1 className="font-heading text-4xl font-bold">Collections</h1>
      <p className="text-xl">
        Here you can create a collection, execute actions and query the results.
        <br />
      </p>

      <br />

      <br />

      <div className="grid gap-8 md:grid-cols-2">
        <HomeCard
          className="p-4 -m-4 hover:bg-gray-500/10 rounded"
          link="/collections/create"
          title="Create a Collection"
        >
          Upload your assets, enter collection metadata and deploy your collection.
        </HomeCard>
        <HomeCard
          className="p-4 -m-4 hover:bg-gray-500/10 rounded"
          link="/collections/actions"
          title="Collection Actions"
        >
          Execute messages on a collection.
        </HomeCard>
        <HomeCard
          className="p-4 -m-4 hover:bg-gray-500/10 rounded"
          link="/collections/queries"
          title="Collection Queries"
        >
          Query data from a collection.
        </HomeCard>
      </div>
    </section>
  )
}

export default withMetadata(HomePage, { center: false })
