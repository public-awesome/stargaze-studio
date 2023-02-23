import { useRef, useState } from 'react'

import { Button } from './Button'

export interface IncomeDashboardDisclaimerProps {
  creatorAddress: string
}
export const IncomeDashboardDisclaimer = (props: IncomeDashboardDisclaimerProps) => {
  const [isChecked, setIsChecked] = useState(false)
  const checkBoxRef = useRef<HTMLInputElement>(null)

  const handleCheckBox = () => {
    checkBoxRef.current?.click()
  }

  return (
    <div>
      <input className="modal-toggle" defaultChecked={false} id="my-modal-1" ref={checkBoxRef} type="checkbox" />
      <label className="cursor-pointer modal" htmlFor="my-modal-1">
        <label
          className="absolute top-[25%] bottom-5 left-1/3 max-w-[600px] max-h-[450px] border-2 no-scrollbar modal-box"
          htmlFor="temp"
        >
          {/* <Alert type="warning"></Alert> */}
          <div className="text-xl font-bold">
            <div className="text-sm font-thin">
              The tool provided on this website is for informational purposes only and does not constitute tax, legal or
              financial advice. The information provided by the tool is not intended to be used for tax planning, tax
              avoidance, promoting, marketing or related purposes. Users should consult their own tax, legal or
              financial advisors prior to acting on any information provided by the tool. By clicking accept below, you
              agree that neither Stargaze Foundation or Public Awesome, LLC or any of its directors, officers,
              employees, or advisors shall be responsible for any errors, omissions, or inaccuracies in the information
              provided by the tool, and shall not be liable for any damages, losses, or expenses arising out of or in
              connection with the use of the tool. Furthermore, you agree to indemnify Stargaze Foundation, Public
              Awesome, LLC and any of its directors, officers, employees and advisors against any claims, suits, or
              actions related to your use of the tool.
            </div>
            <br />
            <div className="flex flex-row pb-4">
              <label className="flex flex-col space-y-1" htmlFor="terms">
                <span className="text-sm font-light text-white">I agree with the terms above.</span>
              </label>
              <input
                checked={isChecked}
                className="p-2 mb-1 ml-2"
                id="terms"
                name="terms"
                onClick={() => setIsChecked(!isChecked)}
                type="checkbox"
              />
            </div>
            <br />
            Are you sure to proceed to the Creator Revenue Dashboard?
          </div>
          <div className="flex justify-end w-full">
            <Button className="px-0 mt-4 mr-5 mb-4 max-h-12 bg-gray-600 hover:bg-gray-700">
              <label
                className="w-full h-full text-white bg-gray-600 hover:bg-gray-700 rounded border-0 btn modal-button"
                htmlFor="my-modal-1"
              >
                Go Back
              </label>
            </Button>
            <a
              className="my-4"
              href={
                isChecked
                  ? `https://metabase.constellations.zone/public/dashboard/4d751721-51ab-46ff-ad27-075ec8d47a17?creator_address=${props.creatorAddress}&chart_granularity_(day%252Fweek%252Fmonth)=week`
                  : undefined
              }
              rel="noopener"
              target="_blank"
            >
              <Button className="px-5 w-full h-full" isDisabled={!isChecked} onClick={() => handleCheckBox()}>
                Confirm
              </Button>
            </a>
          </div>
        </label>
      </label>
    </div>
  )
}
