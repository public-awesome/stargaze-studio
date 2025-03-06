import { toUtf8 } from '@cosmjs/encoding'
import converter from 'bech32-converting'
import clsx from 'clsx'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { SG721_NAME_ADDRESS } from 'utils/constants'
import { csvToFlexList } from 'utils/csvToFlexList'
import { isValidAddress } from 'utils/isValidAddress'
import { isValidFlexListFile } from 'utils/isValidFlexListFile'
import { useWallet } from 'utils/wallet'

export interface WhitelistFlexMember {
  address: string
  mint_count: number
}

interface WhitelistFlexUploadProps {
  onChange: (data: WhitelistFlexMember[]) => void
}

export const WhitelistFlexUpload = ({ onChange }: WhitelistFlexUploadProps) => {
  const wallet = useWallet()
  const [resolvedMemberData, setResolvedMemberData] = useState<WhitelistFlexMember[]>([])

  const resolveMemberData = async (memberData: WhitelistFlexMember[]) => {
    if (!memberData.length) return []
    await new Promise((resolve) => {
      let i = 0
      memberData.map(async (data) => {
        if (!wallet.isWalletConnected) throw new Error('Wallet not connected')
        await (
          await wallet.getCosmWasmClient()
        )
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
              resolvedMemberData.push({ address: tokenUri, mint_count: Number(data.mint_count) })
            else toast.error(`Resolved address is empty or invalid for the name: ${data.address}`)
          })
          .catch((e) => {
            console.log(e)
            toast.error(`Error resolving address for the name: ${data.address}`)
          })

        i++
        if (i === memberData.length) resolve(resolvedMemberData)
      })
    })
    return resolvedMemberData
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResolvedMemberData([])
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
        const memberData = csvToFlexList(e.target.result.toString())
        console.log(memberData)
        if (!isValidFlexListFile(memberData)) {
          event.target.value = ''
          return onChange([])
        }
        await resolveMemberData(memberData.filter((data) => data.address.trim().endsWith('.stars'))).finally(() => {
          return onChange(
            memberData
              .map((line) => {
                if (line.address.trim().startsWith('0x')) {
                  return {
                    address: converter('init').toBech32(line.address.trim()),
                    mint_count: Number(line.mint_count),
                  }
                }
                return line
              })
              .filter((data) => data.address.startsWith('init') && !data.address.endsWith('.stars'))
              .map((data) => ({
                address: data.address.trim(),
                mint_count: Number(data.mint_count),
              }))
              .concat(resolvedMemberData),
          )
        })
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
        id="whitelist-flex-file"
        onChange={onFileChange}
        type="file"
      />
    </div>
  )
}
