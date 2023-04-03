/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { toUtf8 } from '@cosmjs/encoding'
import axios from 'axios'
import { Alert } from 'components/Alert'
import { Anchor } from 'components/Anchor'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { Tooltip } from 'components/Tooltip'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useCallback, useEffect, useState } from 'react'
import { FaCopy, FaRocket, FaSlidersH, FaStore } from 'react-icons/fa'
import { copy } from 'utils/clipboard'
import { API_URL, STARGAZE_URL } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const CollectionList: NextPage = () => {
  const wallet = useWallet()
  const [myCollections, setMyCollections] = useState<any[]>([])
  const [myOneOfOneCollections, setMyOneOfOneCollections] = useState<any[]>([])
  const [myStandardCollections, setMyStandardCollections] = useState<any[]>([])

  async function getMinterContractType(minterContractAddress: string) {
    if (wallet.client && minterContractAddress.length > 0) {
      const client = wallet.client
      const data = await client.queryContractRaw(
        minterContractAddress,
        toUtf8(Buffer.from(Buffer.from('contract_info').toString('hex'), 'hex').toString()),
      )
      const contractType: string = JSON.parse(new TextDecoder().decode(data as Uint8Array)).contract
      return contractType
    }
  }

  const filterMyCollections = () => {
    setMyOneOfOneCollections([])
    setMyStandardCollections([])
    if (myCollections.length > 0) {
      myCollections.map(async (collection: any) => {
        await getMinterContractType(collection.minter)
          .then((contractType) => {
            if (contractType?.includes('sg-base-minter')) {
              setMyOneOfOneCollections((prevState) => [...prevState, collection])
            } else if (contractType?.includes('sg-minter')) {
              setMyStandardCollections((prevState) => [...prevState, collection])
            }
          })
          .catch((err) => {
            console.log(err)
            console.log('Unable to retrieve contract type')
          })
      })
    }
  }

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

  useEffect(() => {
    filterMyCollections()
  }, [myCollections])

  const renderTable = useCallback(() => {
    return (
      <div className="overflow-x-auto w-full no-scrollbar">
        {myCollections.length > 0 && (
          <div>
            {myStandardCollections.length > 0 && (
              <div className="bg-transparent">
                <span className="text-2xl font-bold text-blue-300">Standard Collections</span>
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th className="pl-36 text-lg font-bold text-left bg-transparent">Collection Name</th>
                      <th className="text-lg font-bold bg-transparent">Contract Address</th>
                      <th className="bg-transparent" />
                    </tr>
                  </thead>
                  <tbody>
                    {myStandardCollections.map((collection: any, index: any) => {
                      return (
                        <tr key={index}>
                          <td className="w-[55%] bg-black">
                            <div className="flex items-center space-x-3">
                              <div className="avatar">
                                <div className="w-28 h-28 mask mask-squircle">
                                  <img
                                    alt="Cover"
                                    src={
                                      (collection?.image as string).startsWith('ipfs')
                                        ? `https://ipfs-gw.stargaze-apis.com/ipfs/${(
                                            collection?.image as string
                                          ).substring(7)}`
                                        : collection?.image
                                    }
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
                            <div className="flex flex-row items-center space-x-3">
                              Minter:
                              <span className="ml-2">
                                <Tooltip
                                  backgroundColor="bg-blue-500"
                                  label="Click to copy the Vending Minter contract address"
                                >
                                  <button
                                    className="group flex space-x-2 font-mono text-base text-white/80 hover:underline"
                                    onClick={() => void copy(collection.minter as string)}
                                    type="button"
                                  >
                                    <span>{collection.minter}</span>
                                    <FaCopy className="opacity-0 group-hover:opacity-100" />
                                  </button>
                                </Tooltip>
                              </span>
                            </div>
                            <div className="flex flex-row items-center space-x-3">
                              SG721:
                              <span className="ml-2">
                                <Tooltip backgroundColor="bg-blue-500" label="Click to copy the SG721 contract address">
                                  <button
                                    className="group flex space-x-2 font-mono text-base text-white/80 hover:underline"
                                    onClick={() => void copy(collection.contractAddress as string)}
                                    type="button"
                                  >
                                    <span>{collection.contractAddress}</span>
                                    <FaCopy className="opacity-0 group-hover:opacity-100" />
                                  </button>
                                </Tooltip>
                              </span>
                            </div>
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
              </div>
            )}
            {myOneOfOneCollections.length > 0 && (
              <div className="mt-4">
                <span className="text-2xl font-bold text-blue-300">1/1 Collections</span>
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th className="pl-36 text-lg font-bold text-left bg-transparent">Collection Name</th>
                      <th className="text-lg font-bold bg-transparent">Contract Address</th>
                      <th className="bg-transparent" />
                    </tr>
                  </thead>
                  <tbody>
                    {myOneOfOneCollections.map((collection: any, index: any) => {
                      return (
                        <tr key={index}>
                          <td className="w-[55%] bg-black">
                            <div className="flex items-center space-x-3">
                              <div className="avatar">
                                <div className="w-28 h-28 mask mask-squircle">
                                  <img
                                    alt="Cover"
                                    src={
                                      (collection?.image as string).startsWith('ipfs')
                                        ? `https://ipfs-gw.stargaze-apis.com/ipfs/${(
                                            collection?.image as string
                                          ).substring(7)}`
                                        : collection?.image
                                    }
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
                            <div className="flex flex-row items-center space-x-3">
                              Minter:
                              <span className="ml-2">
                                <Tooltip
                                  backgroundColor="bg-blue-500"
                                  label="Click to copy the Base Minter contract address"
                                >
                                  <button
                                    className="group flex space-x-2 font-mono text-base text-white/80 hover:underline"
                                    onClick={() => void copy(collection.minter as string)}
                                    type="button"
                                  >
                                    <span>{collection.minter}</span>
                                    <FaCopy className="opacity-0 group-hover:opacity-100" />
                                  </button>
                                </Tooltip>
                              </span>
                            </div>
                            <div className="flex flex-row items-center space-x-3">
                              SG721:
                              <span className="ml-2">
                                <Tooltip backgroundColor="bg-blue-500" label="Click to copy the SG721 contract address">
                                  <button
                                    className="group flex space-x-2 font-mono text-base text-white/80 hover:underline"
                                    onClick={() => void copy(collection.contractAddress as string)}
                                    type="button"
                                  >
                                    <span>{collection.contractAddress}</span>
                                    <FaCopy className="opacity-0 group-hover:opacity-100" />
                                  </button>
                                </Tooltip>
                              </span>
                            </div>
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
                                href={`${STARGAZE_URL}/marketplace/${collection.contractAddress}?sort=price_asc`}
                              >
                                <FaStore />
                              </Anchor>
                            </div>
                          </th>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }, [myCollections, myStandardCollections, myOneOfOneCollections, wallet.address])

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
