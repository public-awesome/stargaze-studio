import { Alert } from 'components/Alert'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useCallback } from 'react'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const CollectionList: NextPage = () => {
  const wallet = useWallet()

  const renderImages = useCallback(() => {
    return (
      <div className="overflow-x-auto w-full">
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
            <tr>
              <td className="bg-black">
                <div className="flex items-center space-x-3">
                  <div className="avatar">
                    <div className="w-12 h-12 mask mask-squircle">
                      <img alt="Avatar Tailwind CSS Component" src="/pixel.png" />
                    </div>
                  </div>
                  <div>
                    <div className="ml-2 font-bold">My Collection</div>
                    <div className="text-sm opacity-50" />
                  </div>
                </div>
              </td>
              <td className="bg-black">
                stars1v9fj6mrump74zut0tse65hn4nfzvfdfh4nue0y
                {/* <br /> */}
                {/* <span className="badge badge-ghost badge-sm"></span> */}
              </td>
              <td className="bg-black">{new Date().toDateString()}</td>
              <th className="bg-black">
                <button className="text-lg font-bold text-plumbus btn btn-ghost btn-xs">Details</button>
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }, [wallet.address])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="My Collections" />
      <ContractPageHeader description="A list of your collections." link={links.Documentation} title="My Collections" />
      <hr />
      <br />
      <div>{renderImages()}</div>
      <br />
      <Conditional test={false}>
        <Alert type="info">You haven&apos;t created any collections so far.</Alert>
      </Conditional>
    </section>
  )
}
export default withMetadata(CollectionList, { center: false })
