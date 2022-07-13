import clsx from 'clsx'
import { Button } from 'components/Button'
import { Radio } from 'components/Radio'
import { useEffect, useState } from 'react'
import { FaAsterisk } from 'react-icons/fa'

export const Modal = () => {
  const [showModal, setShowModal] = useState(true)
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('disclaimer')) {
      setShowModal(false)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('disclaimer', '1')
    setShowModal(false)
  }

  return (
    <>
      {showModal ? (
        <div className="flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 justify-center items-center outline-none focus:outline-none">
          <div className="relative my-6 mx-auto w-auto max-w-3xl">
            <div className="flex relative flex-col w-full bg-stone-800 rounded-lg border-[1px] border-slate-200/20 border-solid outline-none focus:outline-none shadow-lg">
              <div className="flex justify-between items-start p-5 rounded-t border-b border-slate-200/20 border-solid">
                <h3 className="text-3xl font-bold">Before using StargazeTools...</h3>
              </div>
              <div className="relative flex-auto p-6 my-4">
              <p className="text-lg leading-relaxed">
                    StargazeTools is a decentralized application where
                    individuals or communities can use smart contract dashboards
                    to create, mint and manage NFT collections.
                    <br />
                    StargazeTools is made up of free, public, and open-source
                    software that is built on top of Stargaze Network.
                    StargazeTools only provides tools for any of the mentioned
                    functionalities above and inside the dApp. Anyone can create
                    or mint NFT collections on StargazeTools and StargazeTools
                    does not audit or have any discretion on how these
                    collections are put to use. <br />
                    <br />
                    AS DESCRIBED IN THE DISCLAIMER, STARGAZETOOLS IS PROVIDED
                    “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY
                    KIND. No developer or entity involved in creating the
                    StargazeTools will be liable for any claims or damages
                    whatsoever associated with your use, inability to use, or
                    your interaction with other users of the StargazeTools,
                    including any direct, indirect, incidental, special,
                    exemplary, punitive or consequential damages, or loss of
                    profits, tokens, or anything else.
                  </p>
              </div>
              <div className="flex justify-center">
                <Radio
                  checked={!isButtonDisabled}
                  htmlFor="disclaimer-accept"
                  id="disclaimer-accept"
                  onChange={() => setIsButtonDisabled(false)}
                  subtitle=""
                  title="I've read the disclaimer and I understand the risks of using StargazeTools."
                />
              </div>
              <div className="flex justify-end items-center p-6 mt-1">
                <Button
                  className={clsx({ 'opacity-50': isButtonDisabled })}
                  disabled={isButtonDisabled}
                  isWide
                  leftIcon={<FaAsterisk />}
                  onClick={accept}
                >
                  Enter StargazeTools
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
