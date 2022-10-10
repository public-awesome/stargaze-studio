import clsx from 'clsx'
import React from 'react'
import { toast } from 'react-hot-toast'
import { csvToArray } from 'utils/csvToArray'
import type { AirdropAllocation } from 'utils/isValidAccountsFile'
import { isValidAccountsFile } from 'utils/isValidAccountsFile'

interface AirdropUploadProps {
  onChange: (data: AirdropAllocation[]) => void
}

export const AirdropUpload = ({ onChange }: AirdropUploadProps) => {
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return toast.error('Error opening file')
    if (!event.target.files[0].name.endsWith('.csv')) {
      toast.error('Please select a .csv file!')
      return onChange([])
    }
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target?.result) return toast.error('Error parsing file.')
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const accountsData = csvToArray(e.target.result.toString())
        if (!isValidAccountsFile(accountsData)) {
          event.target.value = ''
          return onChange([])
        }
        return onChange(accountsData)
      } catch (error: any) {
        toast.error(error.message)
      }
    }
    reader.readAsText(event.target.files[0])
  }

  return (
    <div
      className={clsx(
        'flex relative justify-center items-center mt-2 space-y-4 w-full h-32',
        'rounded border-2 border-white/20 border-dashed',
      )}
    >
      <input
        accept=".csv"
        className={clsx(
          'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
          'before:absolute before:inset-0 before:hover:bg-white/5 before:transition',
        )}
        id="airdrop-file"
        multiple
        onChange={onFileChange}
        type="file"
      />
    </div>
  )
}
