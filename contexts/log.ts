import { create } from 'zustand'

export interface LogItem {
  id: string
  message: string
  type?: string
  timestamp?: Date
  code?: number
  source?: string
  connectedWallet?: string
}

export const useLogStore = create(() => ({
  itemList: [] as LogItem[],
}))

export const setLogItemList = (list: LogItem[]) => {
  useLogStore.setState({ itemList: list })
}

export const addLogItem = (item: LogItem) => {
  useLogStore.setState((prev) => ({ itemList: [...prev.itemList, item] }))
}

export const removeLogItem = (id: string) => {
  useLogStore.setState((prev) => ({ itemList: prev.itemList.filter((item) => item.id !== id) }))
}
