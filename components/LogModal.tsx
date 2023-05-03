import { useLogStore } from 'contexts/log'
import { useRef, useState } from 'react'
import { FaCopy, FaEraser } from 'react-icons/fa'
import { copy } from 'utils/clipboard'

import type { LogItem } from '../contexts/log'
import { removeLogItem, setLogItemList } from '../contexts/log'
import { Button } from './Button'
import { Tooltip } from './Tooltip'

export interface LogModalProps {
  tempLogItem?: LogItem
}
export const LogModal = (props: LogModalProps) => {
  const logs = useLogStore()
  const [isChecked, setIsChecked] = useState(false)

  const checkBoxRef = useRef<HTMLInputElement>(null)

  const handleCheckBox = () => {
    checkBoxRef.current?.click()
  }

  return (
    <div>
      <input className="modal-toggle" defaultChecked={false} id="my-modal-8" ref={checkBoxRef} type="checkbox" />
      <label className="cursor-pointer modal" htmlFor="my-modal-8">
        <label
          className={`absolute top-[15%] bottom-5 left-[21.5%] lg:max-w-[70%] ${
            logs.itemList.length > 4 ? 'max-h-[750px]' : 'max-h-[500px]'
          } border-2 no-scrollbar modal-box`}
          htmlFor="temp"
        >
          <div className="text-xl font-bold">
            <table className="table w-full h-1/2">
              <thead className="sticky inset-x-0 top-0 bg-blue-400/20 backdrop-blur-sm">
                <tr>
                  <th className="text-lg font-bold bg-transparent">#</th>
                  <th className="text-lg font-bold bg-transparent">Type</th>
                  <th className="text-lg font-bold bg-transparent">Message</th>
                  <th className="text-lg font-bold bg-transparent">
                    Time (UTC +{-new Date().getTimezoneOffset() / 60}){' '}
                  </th>
                  <th className="bg-transparent" />
                </tr>
              </thead>
              <tbody>
                {logs.itemList.length > 0 &&
                  logs.itemList.map((logItem, index) => (
                    <tr key={logItem.id} className="p-0 border-b-2 border-teal-200/10 border-collapse">
                      <td className="ml-8 w-[5%] font-mono text-base font-bold bg-transparent">{index + 1}</td>
                      <td
                        className={`w-[5%] font-mono text-base font-bold bg-transparent ${
                          logItem.type === 'Error' ? 'text-red-400' : ''
                        }`}
                      >
                        {logItem.type || 'Info'}
                      </td>
                      <td className="w-[70%] text-sm font-bold bg-transparent">
                        <Tooltip backgroundColor="bg-transparent" label="" placement="bottom">
                          <button
                            className="group flex overflow-auto space-x-2 max-w-xl font-mono text-base text-white/80 hover:underline no-scrollbar"
                            onClick={() => void copy(logItem.message)}
                            type="button"
                          >
                            <span>{logItem.message}</span>
                            <FaCopy className="opacity-0 group-hover:opacity-100" />
                          </button>
                        </Tooltip>
                      </td>
                      <td className="w-[20%] font-mono text-base bg-transparent">
                        {logItem.timestamp ? new Date(logItem.timestamp).toLocaleString() : ''}
                      </td>
                      <th className="bg-transparent">
                        <div className="flex items-center space-x-8">
                          <Button
                            className="bg-clip-text border-blue-200"
                            onClick={(e) => {
                              e.preventDefault()
                              removeLogItem(logItem.id)
                            }}
                            variant="outline"
                          >
                            <FaEraser />
                          </Button>
                        </div>
                      </th>
                    </tr>
                    //line break
                  ))}
              </tbody>
            </table>
            <br />
          </div>
          <div className="flex flex-row">
            <div className="flex justify-start ml-4 w-full">
              <Button className="px-0 mt-4 mr-5 mb-4 max-h-12 bg-gray-600 hover:bg-gray-700">
                <label
                  className="w-full h-full text-white bg-gray-600 hover:bg-gray-700 rounded border-0 btn modal-button"
                  htmlFor="my-modal-8"
                >
                  Go Back
                </label>
              </Button>
              <Button
                className="px-0 mt-4 mr-5 mb-4 max-h-12 bg-gray-600 hover:bg-gray-700"
                onClick={() => {
                  window.localStorage.setItem('error_list', '')
                  setLogItemList([])
                }}
              >
                <label
                  className="w-full h-full text-white bg-blue-400 hover:bg-blue-500 rounded border-0 btn modal-button"
                  htmlFor="my-modal-8"
                >
                  Clear
                </label>
              </Button>
            </div>
            <div className="flex justify-end w-full">
              <Button
                className="px-0 mt-4 mr-5 mb-4 max-h-12 bg-gray-600 hover:bg-gray-700"
                onClick={() => {
                  const csv = logs.itemList
                    .map((logItem) => {
                      return `${logItem.type as string},${logItem.message},${
                        logItem.timestamp ? new Date(logItem.timestamp).toUTCString().replace(',', '') : ''
                      }`
                    })
                    .join('\n')
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.setAttribute('hidden', '')
                  a.setAttribute('href', url)
                  a.setAttribute('download', 'studio_logs.csv')
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                }}
              >
                <label
                  className="w-full h-full text-white bg-stargaze hover:bg-stargaze/80 rounded border-0 btn modal-button"
                  htmlFor="my-modal-8"
                >
                  Download
                </label>
              </Button>
            </div>
          </div>
        </label>
      </label>
    </div>
  )
}
