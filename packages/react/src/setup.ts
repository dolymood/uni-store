import { reactive } from '@uni-store/core'
import type { UnwrapNestedRefs } from '@uni-store/core'
import { useMemo, useRef } from 'react'
import type { DependencyList } from 'react'

/**
 * useSetup with deps
 * @deprecated Use `useSetup(setup: (props: Props) => SS, props: Props)`
 * @param setup - function that defines the setup state
 */
export function useSetup<SS extends object, Deps extends DependencyList> (setup: () => SS, deps: Deps): UnwrapNestedRefs<SS>
/**
 * useSetup
 * @param setup - function that defines the setup state
 */
export function useSetup<SS extends object> (setup: () => SS): UnwrapNestedRefs<SS>
/**
 * useSetup with props
 * @param setup - function that defines the setup state
 * @param props - Props
 */
export function useSetup<SS extends object, Props extends object> (setup: (props: UnwrapNestedRefs<Props>) => SS, props: Props): UnwrapNestedRefs<SS>
export function useSetup (setup: (props?: object) => object, props?: object | DependencyList) {
  if (Array.isArray(props)) {
    // props is DependencyList
    return useMemo(() => reactive(setup()), props)
  }

  let propsRef = useRef<object>()
  let resultRef = useRef<object>()

  const setupState = useMemo(() => {
    if (!resultRef.current) {
      // first in
      propsRef.current = reactive(Object.assign({}, props || {}))
      resultRef.current = reactive(setup(propsRef.current))
    } else {
      // keep same refer, just update propsRef.current
      Object.assign(propsRef.current, props)
    }
    return resultRef.current!
  }, [props])

  return setupState
}

/**
 * Create a `useSetup` function that defines setup state
 * @param setup - function that defines the setup state
 */
export function defineSetup<SS extends object> (setup: () => SS): () => UnwrapNestedRefs<SS>
/**
 * Create a `useSetup` function that defines setup state
 * @param setup - function that defines the setup state
 * @param props - Props
 */
export function defineSetup<SS extends object, Props> (setup: (props: UnwrapNestedRefs<Props>) => SS): (props: Props) => UnwrapNestedRefs<SS>
export function defineSetup (setup: (props?: object) => object) {
  return (props?: object) => {
    if (props) {
      return useSetup(setup, props)
    } else {
      return useSetup(setup)
    }
  }
}
