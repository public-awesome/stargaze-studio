import { toUtf8 } from '@cosmjs/encoding'
import clsx from 'clsx'
import { useWallet } from 'contexts/wallet'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { SG721_NAME_ADDRESS } from 'utils/constants'
import { csvToArray } from 'utils/csvToArray'
import type { AirdropAllocation } from 'utils/isValidAccountsFile'
import { isValidAccountsFile } from 'utils/isValidAccountsFile'
import { isValidAddress } from 'utils/isValidAddress'

interface AirdropUploadProps {
  onChange: (data: AirdropAllocation[]) => void
}

export const AirdropUpload = ({ onChange }: AirdropUploadProps) => {
  const wallet = useWallet()
  const [resolvedAllocationData, setResolvedAllocationData] = useState<AirdropAllocation[]>([])

  const resolveAllocationData = async (allocationData: AirdropAllocation[]) => {
    if (!allocationData.length) return []
    await new Promise((resolve) => {
      let i = 0
      allocationData.map(async (data) => {
        if (!wallet.client) throw new Error('Wallet not connected')
        await wallet.client
          .queryContractRaw(
            SG721_NAME_ADDRESS,
            toUtf8(
              Buffer.from(
                `0006${Buffer.from('tokens').toString('hex')}${Buffer.from(
                  data.address.trim().substring(0, data.address.lastIndexOf('.stars')),
                ).toString('hex')}`,
                'hex',
              ).toString(),
            ),
          )
          .then((res) => {
            const tokenUri = JSON.parse(new TextDecoder().decode(res as Uint8Array)).token_uri
            if (tokenUri && isValidAddress(tokenUri))
              resolvedAllocationData.push({ address: tokenUri, amount: data.amount, tokenId: data.tokenId })
            else toast.error(`Resolved address is empty or invalid for the name: ${data.address}`)
          })
          .catch((e) => {
            console.log(e)
            toast.error(`Error resolving address for the name: ${data.address}`)
          })

        i++
        if (i === allocationData.length) resolve(resolvedAllocationData)
      })
    })
    return resolvedAllocationData
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResolvedAllocationData([])
    if (!event.target.files) return toast.error('Error opening file')
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!event.target.files[0]?.name.endsWith('.csv')) {
      toast.error('Please select a .csv file!')
      return onChange([])
    }
    const reader = new FileReader()
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target?.result) return toast.error('Error parsing file.')
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const accountsData = csvToArray(e.target.result.toString())
        console.log(accountsData)
        if (!isValidAccountsFile(accountsData)) {
          event.target.value = ''
          return onChange([])
        }
        await resolveAllocationData(accountsData.filter((data) => data.address.trim().endsWith('.stars'))).finally(
          () => {
            return onChange(
              accountsData
                .filter((data) => data.address.startsWith('stars') && !data.address.endsWith('.stars'))
                .map((data) => ({
                  address: data.address.trim(),
                  amount: data.amount,
                  tokenId: data.tokenId,
                }))
                .concat(
                  resolvedAllocationData.map((data) => ({
                    address: data.address,
                    amount: data.amount,
                    tokenId: data.tokenId,
                  })),
                ),
            )
          },
        )
      } catch (error: any) {
        toast.error(error.message, { style: { maxWidth: 'none' } })
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
