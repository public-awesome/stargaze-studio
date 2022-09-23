import { Alert } from 'components/Alert'
import { Anchor } from 'components/Anchor'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useCallback, useState } from 'react'
import { FaRocket, FaSlidersH } from 'react-icons/fa'
import { STARGAZE_URL } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

import type { CollectionData } from './create'

const CollectionList: NextPage = () => {
  const wallet = useWallet()
  const [clearFlag, setClearFlag] = useState(false)
  let allCollections: Record<string, CollectionData[]>[] = []
  let myCollections: Record<string, CollectionData[]> | undefined
  let myCollectionList: CollectionData[] = []

  if (typeof localStorage !== 'undefined') {
    allCollections = localStorage['collections'] ? JSON.parse(localStorage['collections']) : []
    myCollections = allCollections.find((c) => Object.keys(c)[0] === wallet.address)
    myCollectionList = myCollections ? Object.values(myCollections)[0] : []
    console.log(localStorage['collections'])
  }

  const renderTable = useCallback(() => {
    return (
      <div className="overflow-x-auto w-full">
        {myCollectionList.length > 0 && (
          <table className="table w-full">
            <thead>
              <tr>
                <th className="pl-20 text-lg font-bold text-left bg-black">Collection Name</th>
                <th className="text-lg font-bold bg-black">Contract Address</th>
                <th className="text-lg font-bold bg-black">Creation Time</th>
                <th className="bg-black" />
              </tr>
            </thead>
            <tbody>
              {myCollectionList.map((collection, index) => {
                return (
                  <tr key={index}>
                    <td className="bg-black">
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="w-12 h-12 mask mask-squircle">
                            <img alt="Cover" src={collection.imageURL} />
                          </div>
                        </div>
                        <div>
                          <div className="ml-2 font-bold">{collection.name}</div>
                          <div className="text-sm opacity-50" />
                        </div>
                      </div>
                    </td>
                    <td className="bg-black">
                      {collection.address}
                      {/* <br /> */}
                      {/* <span className="badge badge-ghost badge-sm"></span> */}
                    </td>
                    <td className="bg-black">{new Date(collection.time).toDateString()}</td>
                    <th className="bg-black">
                      <div className="flex items-center space-x-8">
                        <Anchor
                          className="text-xl text-plumbus"
                          href={`/collections/actions?sg721ContractAddress=${collection.address}&minterContractAddress=${collection.minter}`}
                        >
                          <FaSlidersH />
                        </Anchor>

                        <Anchor
                          className="text-xl text-plumbus"
                          external
                          href={`${STARGAZE_URL}/launchpad/${collection.minter}`}
                        >
                          <FaRocket />
                        </Anchor>
                      </div>
                    </th>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    )
  }, [clearFlag, wallet.address])

  const clearMyCollections = () => {
    console.log('Cleared!')
    if (typeof localStorage !== 'undefined') {
      localStorage['collections'] = JSON.stringify(allCollections.filter((c) => Object.keys(c)[0] !== wallet.address))
      myCollectionList = []
      setClearFlag(!clearFlag)
    }
  }

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="My Collections" />
      <ContractPageHeader description="A list of your collections." link={links.Documentation} title="My Collections" />
      <hr />
      <div>{renderTable()}</div>
      <br />
      {myCollectionList.length > 0 && <Button onClick={clearMyCollections}>Clear Collection List</Button>}
      <Conditional test={myCollectionList.length === 0}>
        <Alert type="info">You haven&apos;t created any collections so far.</Alert>
      </Conditional>
    </section>
  )
}
export default withMetadata(CollectionList, { center: false })
