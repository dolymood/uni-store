import { reactive } from '@uni-store/core'
import type { UnwrapNestedRefs } from '@uni-store/core'
import { useMemo, useRef } from 'react'
import type { DependencyList } from 'react'

/**
 * useSetup with deps
 * @deprecated Use `useSetup(setup: (props: Props) => SS, props: Props)`
 * @param setup - function that defines the setup state
 */
function useSetup<SS extends object, Deps extends DependencyList> (setup: () => SS, deps: Deps): UnwrapNestedRefs<SS>
/**
 * useSetup
 * @param setup - function that defines the setup state
 */
function useSetup<SS extends object> (setup: () => SS): UnwrapNestedRefs<SS>
/**
 * useSetup with props
 * @param setup - function that defines the setup state
 * @param props - Props
 */
function useSetup<SS extends object, Props> (setup: (props: UnwrapNestedRefs<Props>) => SS, props: Props): UnwrapNestedRefs<SS>
function useSetup<SS extends object, Props, Deps> (setup: (props?: UnwrapNestedRefs<Props | {}>) => SS, props?: Props | Deps) {
  if (Array.isArray(props)) {
    // props is DependencyList
    return reactive(useMemo(setup, props))
  }
  let propsRef = useRef<UnwrapNestedRefs<Props | {}>>()
  let resultRef = useRef<SS>()
  const setupState = useMemo(() => {
    if (!resultRef.current) {
      // first in
      propsRef.current = reactive(props ? props : {})
      const setupResult = setup(propsRef.current)
      resultRef.current = setupResult
    } else {
      // keep same refer, just update propsRef.current
      Object.assign(propsRef.current, props)
    }
    return resultRef.current!
  }, [props])
  return reactive(setupState)
}

/**
 * Create a `useSetup` function that defines setup state
 * @param setup - function that defines the setup state
 */
function defineSetup<SS extends object> (setup: () => SS): () => UnwrapNestedRefs<SS>
/**
 * Create a `useSetup` function that defines setup state
 * @param setup - function that defines the setup state
 * @param props - Props
 */
function defineSetup<SS extends object, Props> (setup: (props: UnwrapNestedRefs<Props>) => SS): (props: Props) => UnwrapNestedRefs<SS>
function defineSetup<SS extends object, Props> (setup: (props?: UnwrapNestedRefs<Props | {}>) => SS) {
  return (props?: Props) => {
    return useSetup(setup, props)
  }
}

export {
  defineSetup,
  useSetup
}
