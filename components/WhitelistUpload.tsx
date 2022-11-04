import clsx from 'clsx'
import React from 'react'
import { toast } from 'react-hot-toast'

import { isValidAddress } from '../utils/isValidAddress'

interface WhitelistUploadProps {
  onChange: (data: string[]) => void
}

export const WhitelistUpload = ({ onChange }: WhitelistUploadProps) => {
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return toast.error('Error opening file')
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (event.target.files[0]?.type !== 'text/plain') {
      toast.error('Invalid file type')
      return onChange([])
    }
    if (event.target.files.length === 0) {
      toast.error('No file selected')
      return onChange([])
    }
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const text = e.target?.result?.toString()
      let newline = '\n'
      if (text?.includes('\r')) newline = '\r'
      if (text?.includes('\r\n')) newline = '\r\n'

      const cleanText = text?.toLowerCase().replace(/,/g, '').replace(/"/g, '').replace(/'/g, '').replace(/ /g, '')
      const data = cleanText?.split(newline)

      return onChange([
        ...new Set(
          data?.filter((address) => address !== '' && isValidAddress(address) && address.startsWith('stars')) || [],
        ),
      ])
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
        accept=".txt"
        className={clsx(
          'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
          'before:absolute before:inset-0 before:hover:bg-white/5 before:transition',
        )}
        id="whitelist-file"
        multiple={false}
        onChange={onFileChange}
        type="file"
      />
    </div>
  )
}
