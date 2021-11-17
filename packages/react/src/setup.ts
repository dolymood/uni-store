import { reactive } from '@uni-store/core'
import { useMemo, DependencyList } from 'react'

export function useSetup<SS extends object> (setup: () => SS, deps: DependencyList = []) {
  const setupState = useMemo(setup, deps)
  return reactive(setupState)
}
