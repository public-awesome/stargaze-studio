/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios from 'axios'
import { Button } from 'components/Button'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import Lister from 'components/Lister'
import { useContracts } from 'contexts/contracts'
import { dispatchQuery } from 'contracts/vendingMinter/messages/query'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useQuery } from 'react-query'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

import { useWallet } from '../../contexts/wallet'

const CollectionQueriesPage: NextPage = () => {
  const { vendingMinter: vendingMinterContract } = useContracts()
  const wallet = useWallet()

  const [doneList, setDoneList] = useState<number[]>([])
  const [processList, setProcessList] = useState<number[]>([])
  const [errorList, setErrorList] = useState<number[]>([])
  const [numTokens, setNumTokens] = useState(0)
  const [percentage, setPercentage] = useState(0)
  const minterContractState = useInputState({
    id: 'minter-contract-address',
    name: 'minter-contract-address',
    title: 'Minter Contract Address',
    defaultValue: '',
    placeholder: 'stars1...',
  })
  const minterContractAddress = minterContractState.value

  const router = useRouter()

  useEffect(() => {
    if (minterContractAddress.length > 0) {
      void router.replace({ query: { minterContractAddress } })
    }
  }, [minterContractAddress])

  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('minterContractAddress')
    if (initial && initial.length > 0) minterContractState.onChange(initial)
  }, [])

  const { data: response } = useQuery(
    [minterContractAddress, vendingMinterContract, wallet] as const,
    async () => {
      const messages = vendingMinterContract?.use(minterContractAddress)
      const result = await dispatchQuery({
        address: '',
        messages,
        type: 'config',
      })
      return result
    },
    {
      placeholderData: null,
      onError: (error: any) => {
        toast.error(error.message, { style: { maxWidth: 'none' } })
      },
      enabled: Boolean(minterContractAddress && vendingMinterContract),
    },
  )

  useEffect(() => {
    if (response) {
      setNumTokens(response['num_tokens'])
      setPercentage(0)
      setDoneList([])
      setProcessList([])
      setErrorList([])
    } else setNumTokens(0)
  }, [response])

  useEffect(() => {
    if (numTokens !== 0) setPercentage((100 * doneList.length) / numTokens)
    else setPercentage(0)
  }, [doneList.length, numTokens])

  function chooseAlternate(url: string, attempt: number) {
    let alternate
    switch (attempt) {
      case 1: {
        alternate = url.replace('ipfs://', 'https://cf-ipfs.com/ipfs/')
        break
      }
      case 2: {
        alternate = url.replace('ipfs://', 'https://ipfs.io/ipfs/')
        break
      }
      case 3: {
        alternate = url.replace('ipfs://', 'https://ipfs-gw.stargaze-apis.com/ipfs/')
        break
      }
      default: {
        alternate = url.replace('ipfs://', 'https://ipfs.stargaze.zone/ipfs/')
        break
      }
    }
    return alternate
  }

  async function warmOne(i: number, image: string, attempt: number, totalAttempt: number) {
    setProcessList((existingItems) => {
      return [i, ...existingItems]
    })
    const link = image.replace('1', i.toString())

    try {
      const result = await axios.get(chooseAlternate(link, attempt))

      if (result.status === 200) {
        setDoneList((existingItems) => {
          return [i, ...existingItems]
        })
        setProcessList((existingItems) => {
          const index = existingItems.indexOf(i, 0)
          if (index > -1) {
            existingItems.splice(index, 1)
          }
          return existingItems
        })
        return
      }
    } catch (e) {
      console.log('error: ', i, e)
    }
    if (totalAttempt !== 4) {
      void warmOne(i, image, attempt === 3 ? 0 : attempt + 1, attempt === 3 ? totalAttempt + 1 : totalAttempt)
    } else {
      setErrorList((existingItems) => {
        return [i, ...existingItems]
      })
      setProcessList((existingItems) => {
        const index = existingItems.indexOf(i, 0)
        if (index > -1) {
          existingItems.splice(index, 1)
        }
        return existingItems
      })
    }
  }

  async function warmingProcess(url: string, attempt: number) {
    const link = `${chooseAlternate(url, attempt)}/1`
    try {
      const { data, status } = await axios.get(link)
      if (status === 200) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        for (let i = 1; i <= response['num_tokens']; i++) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          void warmOne(i, data.image, 0, 0)
        }
      } else if (attempt < 3) {
        void warmingProcess(url, attempt + 1)
      } else toast.error('File can not be reachable at the moment! Please try again later...')
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Collection Warm Up" />
      <ContractPageHeader
        description="Here you can pre-warm your collection for improved IPFS performance."
        link={links.Documentation}
        title="Collection Warm Up"
      />
      <div className="space-y-8">
        <AddressInput {...minterContractState} />
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col mr-20 w-4/5 text-xl border border-stargaze">
          <div className="flex flex-row w-full text-center">
            <div className="w-1/3">Total</div>
            <div className="w-1/3">Warmed</div>
            <div className="w-1/3">Percentage</div>
          </div>
          <div className="flex flex-row w-full text-center">
            <div className="w-1/3">{numTokens}</div>
            <div className="w-1/3">{doneList.length}</div>
            <div className="w-1/3">{(Math.round(percentage * 100) / 100).toFixed(2)}%</div>
          </div>
        </div>
        <div>
          <Button
            isDisabled={!response}
            onClick={() => {
              setDoneList([])
              setProcessList([])
              setErrorList([])
              void warmingProcess(response['base_token_uri'], 0)
            }}
          >
            Start
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 p-4 space-x-8">
        {errorList.map((value: number, index: number) => {
          return <Lister key={index.toString()} data={value.toString()} />
        })}
      </div>
    </section>
  )
}

export default withMetadata(CollectionQueriesPage, { center: false })
