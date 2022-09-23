/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios from 'axios'
import { Alert } from 'components/Alert'
import { Anchor } from 'components/Anchor'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useCallback, useEffect, useState } from 'react'
import { FaRocket, FaSlidersH } from 'react-icons/fa'
import { API_URL, STARGAZE_URL } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const CollectionList: NextPage = () => {
  const wallet = useWallet()
  const [myCollections, setMyCollections] = useState<any[]>([])

  useEffect(() => {
    const fetchCollections = async () => {
      await axios
        .get(`${API_URL}/api/v1beta/collections/${wallet.address}`)
        .then((response) => {
          const collectionData = response.data
          setMyCollections(collectionData)
        })
        .catch(console.error)
    }
    fetchCollections().catch(console.error)
  }, [wallet.address])

  const renderTable = useCallback(() => {
    return (
      <div className="overflow-x-auto w-full">
        {myCollections.length > 0 && (
          <table className="table w-full">
            <thead>
              <tr>
                <th className="pl-36 text-lg font-bold text-left bg-black">Collection Name</th>
                <th className="text-lg font-bold bg-black">Contract Address</th>
                <th className="bg-black" />
              </tr>
            </thead>
            <tbody>
              {myCollections.map((collection: any, index: any) => {
                return (
                  <tr key={index}>
                    <td className="w-[55%] bg-black">
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="w-28 h-28 mask mask-squircle">
                            <img
                              alt="Cover"
                              src={`https://ipfs.stargaze.zone/ipfs/${(collection.image as string).substring(7)}`}
                            />
                          </div>
                        </div>
                        <div className="pl-2">
                          <p className="overflow-auto max-w-xs font-bold no-scrollbar ">{collection.name}</p>
                          <p className="max-w-xs text-sm truncate opacity-50">{collection.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="w-[35%] bg-black">
                      {collection.contractAddress}
                      {/* <br /> */}
                      {/* <span className="badge badge-ghost badge-sm"></span> */}
                    </td>
                    <th className="bg-black">
                      <div className="flex items-center space-x-8">
                        <Anchor
                          className="text-xl text-plumbus"
                          href={`/collections/actions?sg721ContractAddress=${collection.contractAddress}&minterContractAddress=${collection.minter}`}
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
  }, [myCollections, wallet.address])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="My Collections" />
      <ContractPageHeader description="A list of your collections." link={links.Documentation} title="My Collections" />
      <hr />
      <div>{renderTable()}</div>
      <br />

      <Conditional test={myCollections.length === 0}>
        <Alert type="info">You haven&apos;t created any collections so far.</Alert>
      </Conditional>
    </section>
  )
}
export default withMetadata(CollectionList, { center: false })
