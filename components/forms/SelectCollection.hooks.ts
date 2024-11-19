import { useMemo, useState } from 'react'
import { uid } from 'utils/random'

import type { SelectedCollection } from './SelectCollection'

export function useSelectCollectionState() {
  const [record, setRecord] = useState<Record<string, SelectedCollection>>(() => ({}))

  const entries = useMemo(() => Object.entries(record), [record])
  const values = useMemo(() => Object.values(record), [record])

  function add(selectedCollection: SelectedCollection = { address: '', amount: 0 }) {
    setRecord((prev) => ({ ...prev, [uid()]: selectedCollection }))
  }

  function update(key: string, selectedCollection = record[key]) {
    setRecord((prev) => ({ ...prev, [key]: selectedCollection }))
  }

  function remove(key: string) {
    return setRecord((prev) => {
      const latest = { ...prev }
      delete latest[key]
      return latest
    })
  }

  function reset() {
    setRecord({})
  }

  return { entries, values, add, update, remove, reset }
}
