import { HomeCard } from 'components/HomeCard'
import type { NextPage } from 'next'
import { withMetadata } from 'utils/layout'

const HomePage: NextPage = () => {
  return (
    <section className="px-8 pt-4 pb-16 mx-auto space-y-8 max-w-4xl">
      <div className="flex justify-center items-center py-8 max-w-xl">
        <img alt="Brand Text" className="w-full" src="/stargaze-text.png" />
      </div>
      <h1 className="font-heading text-4xl font-bold">Welcome!</h1>
      <p className="text-xl">
        Looking for a fast and efficient way to build an NFT collection? Stargaze Tools is the solution.
        <br />
        <br />
        Stargaze Tools is built to provide useful smart contract interfaces that helps you build and deploy your own NFT
        collection in no time.
      </p>

      <br />

      <br />

      <div className="grid gap-8 md:grid-cols-2">
        <HomeCard className="p-4 -m-4 hover:bg-gray-500/10 rounded" link="/collections/create" title="Create">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </HomeCard>
        <HomeCard className="p-4 -m-4 hover:bg-gray-500/10 rounded" link="/collections" title="My Collections">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </HomeCard>
        {/*
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Smart Contract Dashboard</h2>
          <p className="text-white/75">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta
            asperiores quis soluta recusandae sequi adipisci quod tempora modi,
            debitis beatae tempore accusantium, esse itaque quaerat obcaecati
            quia totam necessitatibus voluptas!
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Something Cool</h2>
          <p className="text-white/75">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga
            accusantium distinctio dignissimos maxime vero illum explicabo
            officiis. Pariatur magni, enim qui itaque atque quibusdam debitis
            iste delectus deserunt dolores quisquam?
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Adding Value</h2>
          <p className="text-white/75">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quasi enim
            minus voluptates dicta, eum debitis iusto commodi delectus itaque
            qui, unde adipisci. Esse eveniet dolorem consequatur tempore at
            voluptates aut?
          </p>
        </div>
        */}
      </div>
    </section>
  )
}

export default withMetadata(HomePage, { center: false })
