import type { Timezone } from 'contexts/globalSettings'
import { useGlobalSettings } from 'contexts/globalSettings'
import { useRef, useState } from 'react'

import { setTimezone } from '../contexts/globalSettings'
import { Button } from './Button'

export interface SettingsModalProps {
  timezone?: Timezone
}
export const SettingsModal = (props: SettingsModalProps) => {
  const globalSettings = useGlobalSettings()
  const [isChecked, setIsChecked] = useState(false)

  const checkBoxRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <input className="modal-toggle" defaultChecked={false} id="my-modal-9" ref={checkBoxRef} type="checkbox" />
      <label className="cursor-pointer modal" htmlFor="my-modal-9">
        <label
          className={`absolute top-[30%] bottom-5 left-[13.5%] lg:max-w-[30%] max-h-[350px]
          border-[1px] no-scrollbar modal-box`}
          htmlFor="temp"
        >
          <div className="flex flex-col justify-between h-full">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold underline underline-offset-2">Settings</h1>
              <div className="flex justify-start w-full">
                <div className="flex-row mt-2 w-full form-control">
                  <h1 className="mt-[5px] text-lg font-bold">Time Input: </h1>
                  <label className="justify-start ml-6 cursor-pointer label">
                    <span className="mr-2 font-bold">Local</span>
                    <input
                      checked={globalSettings.timezone === 'Local'}
                      className={`${globalSettings.timezone === 'Local' ? `bg-stargaze` : `bg-gray-600`} checkbox`}
                      onClick={() => {
                        setTimezone('Local' as Timezone)
                        window.localStorage.setItem('timezone', 'Local')
                      }}
                      type="checkbox"
                    />
                  </label>
                  <label className="justify-start ml-4 cursor-pointer label">
                    <span className="mr-2 font-bold">UTC</span>
                    <input
                      checked={globalSettings.timezone === 'UTC'}
                      className={`${globalSettings.timezone === 'UTC' ? `bg-stargaze` : `bg-gray-600`} checkbox`}
                      onClick={() => {
                        setTimezone('UTC' as Timezone)
                        window.localStorage.setItem('timezone', 'UTC')
                      }}
                      type="checkbox"
                    />
                  </label>
                </div>
              </div>
            </div>
            <Button
              className="w-[30%] max-h-12 bg-blue-500 hover:bg-blue-600"
              isWide
              onClick={() => {
                setTimezone('UTC' as Timezone)
                window.localStorage.setItem('timezone', 'UTC')
              }}
            >
              Use Defaults
            </Button>
          </div>
        </label>
      </label>
    </div>
  )
}
