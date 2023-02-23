import { useState } from 'react'

import type { QueryListItem } from './query'

export const useQueryComboboxState = () => {
  const [value, setValue] = useState<QueryListItem | null>(null)
  return { value, onChange: (item: QueryListItem) => setValue(item) }
}
