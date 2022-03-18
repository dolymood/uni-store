// clone from https://github.com/mobxjs/mobx/blob/HEAD/packages/mobx-react-lite/src/observer.ts
// modified by dolymood

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  memo
} from 'react'
import type {
  FunctionComponent,
  RefForwardingComponent,
  ForwardRefRenderFunction,
  MemoExoticComponent,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  Ref
} from 'react'
import {
  effectScope,
  watchSyncEffect,
  nextTick
} from '@uni-store/core'
import type {
  EffectScope,
  WatchStopHandle
} from '@uni-store/core'

export * from './setup'

/**
 * ReactiveReactOptions
 */
export interface ReactiveReactOptions {
  forwardRef?: boolean
}
/**
 * Reactive React function component
 * @param baseComponent - the original function component
 * @param options - ReactiveReactOptions
 */
export function reactiveReact<P extends object, TRef = {}>(
  baseComponent: RefForwardingComponent<TRef, P>,
  options: ReactiveReactOptions & { forwardRef: true }
): MemoExoticComponent<
  ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<TRef>>
>
export function reactiveReact<P extends object, TRef = {}>(
  baseComponent: ForwardRefRenderFunction<TRef, P>,
  options: ReactiveReactOptions & { forwardRef: true }
): MemoExoticComponent<
  ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<TRef>>
>
export function reactiveReact<P extends object>(
  baseComponent: FunctionComponent<P>,
  options?: ReactiveReactOptions
): FunctionComponent<P>
export function reactiveReact<
  C extends FunctionComponent<any> | RefForwardingComponent<any> | ForwardRefRenderFunction<any>,
  Options extends ReactiveReactOptions
>(
  baseComponent: C,
  options?: Options
): Options extends { forwardRef: true }
  ? C extends ForwardRefRenderFunction<infer TRef, infer P>
    ? C &
      MemoExoticComponent<
        ForwardRefExoticComponent<
          PropsWithoutRef<P> & RefAttributes<TRef>
        >
      >
    : never /* forwardRef set for a non forwarding component */
  : C & { displayName: string }

export function reactiveReact<
  P extends object,
  TRef = {}
>(
  baseComponent: FunctionComponent<P> | RefForwardingComponent<TRef, P> | ForwardRefRenderFunction<TRef, P>,
  options?: ReactiveReactOptions
) {
  const realOptions = {
    forwardRef: false,
    ...options
  }
  const baseComponentName = baseComponent.displayName || baseComponent.name
  const wrappedComponent = (props: P, ref: Ref<TRef>) => {
    return useReactive(() => baseComponent(props, ref))
  }
  wrappedComponent.displayName = baseComponentName

  // Support legacy context: `contextTypes` must be applied before `memo`       
  if ((baseComponent as any).contextTypes) {
    wrappedComponent.contextTypes = (baseComponent as any).contextTypes
  }

  // todo memo, check props.children change for better performance
  // fornow props.children always be unequal
  // because react only do shallowly compare

  // memo; we are not interested in deep updates
  // in props; we assume that if deep objects are changed,
  // this is in observables, which would have been tracked anyway
  let memoComponent
  if (realOptions.forwardRef) {
    // we have to use forwardRef here because:
    // 1. it cannot go before memo, only after it
    // 2. forwardRef converts the function into an actual component, so we can't let the baseComponent do it
    //    since it wouldn't be a callable function anymore
    memoComponent = memo(forwardRef(wrappedComponent))
  } else {
    memoComponent = memo(wrappedComponent)
  }

  copyStaticProperties(baseComponent, memoComponent)
  memoComponent.displayName = baseComponentName

  return memoComponent
}

// based on https://github.com/mridgway/hoist-non-react-statics/blob/master/src/index.js
const hoistBlackList: any = {
  $$typeof: true,
  render: true,
  compare: true,
  type: true
}

function copyStaticProperties(base: any, target: any) {
  Object.keys(base).forEach(key => {
    if (!hoistBlackList[key]) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(base, key)!)
    }
  })
}

// todo use latest observer, support react StrictMode/ConcurrentMode/Suspense modes
// https://github.com/mobxjs/mobx/blob/3fa1f4d48c4b9b306ddec40e14c07ed183fb0c18/packages/mobx-react-lite/src/useObserver.ts

const NO_RENDERED: any = {}
const RENDERING: any = {}

function useReactive<T>(fn: () => T): T {
  // todo: necessary ?
  const scopeRef = useRef<EffectScope | null>(null)
  const stopWatchRef = useRef<WatchStopHandle | null>(null)
  const updatedRef = useRef(false)
  const forceUpdate = useForceUpdate()

  let rendering: T = NO_RENDERED
  if (!scopeRef.current) {
    scopeRef.current = effectScope(true)
  }
  const scope = scopeRef.current
  // clear effects, re collect deps
  scope.effects.length = 0
  scope.run(() => {
    stopWatchRef.current && stopWatchRef.current()
    stopWatchRef.current = watchSyncEffect(() => {
      if (rendering !== NO_RENDERED) {
        // deps change trigger rerender
        // just forceUpdate
        if (rendering === RENDERING) {
          // triggered value change in render
          // should not happen, do nothing
        } else {
          updatedRef.current && nextTick(() => {
            !updatedRef.current && forceUpdate()
          })
          updatedRef.current = false
        }
        // no deps now
      } else {
        // new render
        // collect deps
        updatedRef.current = true
        rendering = RENDERING
        rendering = fn()
      }
    })
  })

  useEffect(() => () => {
    if (stopWatchRef.current) {
      stopWatchRef.current()
      stopWatchRef.current = null
    }
    scope.stop()
    scopeRef.current = null
    updatedRef.current = true
  }, [])

  return rendering
}

function useForceUpdate () {
  const [, setState] = useState()
  const forceUpdate = () => setState([] as any)
  return forceUpdate
}
