/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import axios from 'axios'
import { Button } from 'components/Button'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import Lister from 'components/Lister'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

interface ConfigResponse {
  num_tokens: number
  base_token_uri: string
}

const CollectionQueriesPage: NextPage = () => {
  const [client, setClient] = useState<CosmWasmClient>()
  const [baseUri, SetBaseUri] = useState('')
  const [doneList, setDoneList] = useState<number[]>([])
  const [processList, setProcessList] = useState<number[]>([])
  const [errorList, setErrorList] = useState<number[]>([])
  const [numTokens, setNumTokens] = useState(0)
  const [percentage, setPercentage] = useState('0.00')
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
    async function init() {
      setClient(await CosmWasmClient.connect('https://rpc.elgafar-1.stargaze-apis.com/')) //'https://rpc.stargaze-apis.com/'))
    }
    void init()
  }, [])

  useEffect(() => {
    async function get() {
      if (client && minterContractAddress) {
        const res: ConfigResponse = await client.queryContractSmart(minterContractAddress, {
          config: {},
        })
        setNumTokens(res.num_tokens)
        SetBaseUri(res.base_token_uri)
        setPercentage('0.00')
        setDoneList([])
        setProcessList([])
        setErrorList([])
      }
    }
    void get()
  }, [minterContractAddress, client])

  useEffect(() => {
    if (minterContractAddress.length > 0) {
      void router.replace({ query: { minterContractAddress } })
    }
  }, [minterContractAddress])

  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('minterContractAddress')
    if (initial && initial.length > 0) minterContractState.onChange(initial)
  }, [])

  useEffect(() => {
    if (numTokens !== 0) setPercentage((((Math.round(100 * doneList.length) / numTokens) * 100) / 100).toFixed(2))
    else setPercentage('0')
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
        for (let i = 1; i <= numTokens; i++) {
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
          <div className="flex flex-row mt-2 w-full text-center">
            <div className="w-1/3">Total</div>
            <div className="w-1/3">Warmed</div>
            <div className="w-1/3">Percentage</div>
          </div>
          <div className="flex flex-row w-full text-center">
            <div className="w-1/3">{numTokens}</div>
            <div className="w-1/3">{doneList.length}</div>
            <div className="w-1/3">{percentage}%</div>
          </div>
          <div className="flex justify-center w-full">
            <progress className="my-5 mx-2 w-4/5 h-2 progress" max="100" value={percentage} />
          </div>
        </div>
        <div className="content-center">
          <Button
            isDisabled={baseUri === ''}
            onClick={() => {
              setDoneList([])
              setProcessList([])
              setErrorList([])
              void warmingProcess(baseUri, 0)
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
