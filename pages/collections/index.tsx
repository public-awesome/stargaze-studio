import { CollectionActions } from 'components/CollectionsActions'
import { Conditional } from 'components/Conditional'
import { HomeCard } from 'components/HomeCard'
import type { NextPage } from 'next'
import { useState } from 'react'
// import Brand from 'public/brand/brand.svg'
import { withMetadata } from 'utils/layout'

export type ColCon = 'collections' | 'contracts'

const HomePage: NextPage = () => {
  const [colcon, setcolcon] = useState<ColCon>('collections')

  return (
    <section className="px-8 pt-4 pb-16 mx-auto mt-24 space-y-8">
      <div className="flex">
        <div className="float-right mt-3 ml-4 font-bold form-check form-check-inline">
          <button className="inline-block py-1 px-2 text-white bg-plumbus hover:bg-plumbus-light rounded-lg border border-plumbus-light cursor-pointer form-check-label">
            Create Collection +
          </button>
        </div>
        <div className="float-right mt-3 ml-4 font-bold form-check form-check-inline">
          <input
            checked={colcon === 'collections'}
            className="peer sr-only"
            id="inlineRadio1"
            name="inlineRadioOptions1"
            onClick={() => {
              setcolcon('collections')
            }}
            type="radio"
            value="Collections"
          />
          <label
            className="inline-block py-1 px-2 text-plumbus-light peer-checked:text-white hover:text-white peer-checked:bg-plumbus peer-checked:hover:bg-plumbus-light hover:bg-plumbus rounded-lg border border-plumbus-light cursor-pointer form-check-label"
            htmlFor="inlineRadio1"
          >
            Collections
          </label>
        </div>

        <div className="float-right mt-3 ml-4 font-bold form-check form-check-inline">
          <input
            checked={colcon === 'contracts'}
            className="peer sr-only"
            id="inlineRadio2"
            name="inlineRadioOptions2"
            onClick={() => {
              setcolcon('contracts')
            }}
            type="radio"
            value="Contracts"
          />
          <label
            className="inline-block py-1 px-2 text-plumbus-light peer-checked:text-white hover:text-white peer-checked:bg-plumbus peer-checked:hover:bg-plumbus-light hover:bg-plumbus rounded-lg border border-plumbus-light cursor-pointer form-check-label"
            htmlFor="inlineRadio2"
          >
            Contracts
          </label>
        </div>
      </div>
      <div className="">
        <Conditional test={colcon === 'collections'}>
          <CollectionActions />
        </Conditional>
        <Conditional test={colcon === 'contracts'}>
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
              <HomeCard
                className="p-4 -m-4 hover:bg-gray-500/10 rounded"
                link="/contracts/minter"
                title="Minter contract"
              >
                Execute messages and run queries on Stargaze&apos;s minter contract.
              </HomeCard>
              <HomeCard
                className="p-4 -m-4 hover:bg-gray-500/10 rounded"
                link="/contracts/sg721"
                title="Sg721 Contract"
              >
                Execute messages and run queries on Stargaze&apos;s sg721 contract.
              </HomeCard>
              <HomeCard
                className="p-4 -m-4 hover:bg-gray-500/10 rounded"
                link="/contracts/whitelist"
                title="Whitelist Contract"
              >
                Execute messages and run queries on Stargaze&apos;s whitelist contract.
              </HomeCard>
            </div>
          </section>
        </Conditional>
      </div>
    </section>
  )
}

export default withMetadata(HomePage, { center: false })
