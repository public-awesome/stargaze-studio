/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable jsx-a11y/img-redundant-alt */
import { truncateAddress } from 'utils/wallet'

export interface ClickableCollection {
  contractAddress: string
  name: string
  media: string
  onClick: () => void
}

export default function CollectionsTable({ collections }: { collections: ClickableCollection[] }) {
  return (
    <table className="w-full divide-y divide-zinc-800 table-fixed">
      <thead>
        <tr>
          <th className="py-3.5 pr-3 pl-4 text-sm text-left sm:pl-0 text-infinity-blue" scope="col">
            Name
          </th>
          <th className="py-3.5 px-3 text-sm text-left text-infinity-blue" scope="col">
            Address
          </th>
        </tr>
      </thead>
      <tbody className=" bg-black">
        {collections.map((collection) => (
          <tr
            key={collection.contractAddress}
            className="hover:bg-zinc-900 cursor-pointer"
            onClick={collection.onClick}
          >
            <td className="py-2 pr-3 pl-4 whitespace-nowrap sm:pl-0">
              <div className="flex items-center">
                <div className="shrink-0 w-11 h-11">
                  <img alt="Collection Image" src={collection.media} />
                </div>
                <div className="ml-4 font-medium text-white truncate">{collection.name}</div>
              </div>
            </td>

            <td className="py-5 px-3 text-zinc-400 whitespace-nowrap">
              <div className="text-left text-white">
                {collection.contractAddress.startsWith('stars')
                  ? truncateAddress(collection.contractAddress)
                  : collection.contractAddress}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
