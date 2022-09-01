import { Button } from './Button'

export interface ConfirmationModalProps {
  confirm: () => void
}
export const ConfirmationModal = (props: ConfirmationModalProps) => {
  return (
    <div>
      <input className="modal-toggle" id="my-modal-2" type="checkbox" />
      <label className="cursor-pointer modal" htmlFor="my-modal-2">
        <label
          className="absolute top-[40%] bottom-5 left-1/3 max-w-xl max-h-40 border-2 no-scrollbar modal-box"
          htmlFor="temp"
        >
          {/* <Alert type="warning"></Alert> */}
          <div className="text-xl font-bold">
            Are you sure to create a collection with the specified assets, metadata and parameters?
          </div>
          <div className="flex justify-end w-full">
            <Button className="px-0 mt-4 mr-5 mb-4 max-h-12 bg-gray-600 hover:bg-gray-600">
              <label
                className="w-full h-full text-white bg-gray-600 hover:bg-gray-600 border-0 btn modal-button"
                htmlFor="my-modal-2"
              >
                Go Back
              </label>
            </Button>
            <Button className="px-0 mt-4 mb-4 max-h-12" onClick={props.confirm}>
              <label
                className="w-full h-full text-white bg-plumbus-light hover:bg-plumbus-light border-0 btn modal-button"
                htmlFor="my-modal-2"
              >
                Confirm
              </label>
            </Button>
          </div>
        </label>
      </label>
    </div>
  )
}
