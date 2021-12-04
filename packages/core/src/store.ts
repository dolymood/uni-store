import {
  markRaw,
  effectScope,
  reactive
} from '@vue/reactivity'
import type { UnwrapNestedRefs } from '@vue/reactivity'
import { watch } from '@vue/runtime-core'
import type { WatchOptions } from '@vue/runtime-core'
import { addSubscription } from './subscriptions'
import type { SubscriptionCallback } from './subscriptions'

/**
 * Store type. With state and functions.
 */
export type Store<SS extends object, S = UnwrapNestedRefs<SS>> = {
  /**
   * State of the Store
   */
  readonly $state: S
  /**
   * Stops the associated effect scope of the store.
   */
  $dispose: () => void
  /**
   * Setups a callback to be called whenever the state changes. It also returns
   * a function to remove the callback.
   *
   * @param callback - callback passed to the watcher
   * @param options - `watch` options
   * @returns function that removes the watcher
   */
  $subscribe: (callback: SubscriptionCallback<S>, options?: object) => () => void
} & S

function createStore<SS extends object, S = UnwrapNestedRefs<SS>> (setup: () => SS): Store<SS, S> {
  const scope = effectScope(true)

  const store = reactive({
    $dispose,
    $subscribe
  }) as Store<SS, S>

  // watcher options for $subscribe
  const subscribeOptions: WatchOptions = {
    deep: true,
    flush: 'post'
  }
  let subscriptions: SubscriptionCallback<S>[] = markRaw([])
  function $subscribe(callback: SubscriptionCallback<S>, options = {}) {
    const _removeSubscription = addSubscription(subscriptions, callback)
    const stopWatcher = scope.run(() =>
      watch(
        () => store,
        (newStore) => {
          callback(newStore.$state)
        },
        Object.assign({}, subscribeOptions, options)
      )
    )!

    const removeSubscription = () => {
      stopWatcher()
      _removeSubscription()
    }

    return removeSubscription
  }

  function $dispose() {
    scope.stop()
    subscriptions = []
  }

  const setupState = scope.run(() => setup())!

  Object.defineProperty(store, '$state', {
    get () {
      return setupState
    }
  })

  Object.assign(store, setupState)

  return store
}

/**
 * Create a `useStore` function that retrieves the store instance
 *
 * @param setup - function that creates the store
 * @returns `useStore` function with `reset` param that determines whether create a new store instance
 */
export function defineStore<SS extends object, S = UnwrapNestedRefs<SS>> (setup: () => SS) {
  let store: Store<SS, S>
  return function useStore (reset: boolean = false) {
    if (!store || reset) {
      store && store.$dispose()
      store = createStore(setup)
    }
    return store
  }
}
