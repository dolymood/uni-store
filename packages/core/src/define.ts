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

export type Store<SS extends object, S = UnwrapNestedRefs<SS>> = {
  $dispose: () => void
  $subscribe: (callback: SubscriptionCallback<S>, options?: object) => () => void
  readonly $state: S
} & S

function createStore<SS extends object, S = UnwrapNestedRefs<SS>> (setup: () => SS): Store<SS, S> {
  const scope = effectScope()

  const store = reactive({
    $dispose,
    $subscribe
  }) as Store<SS, S>

  let isListening = false
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
          if (isListening) {
            callback(newStore.$state)
          }
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

  const setupState = scope.run(() => {
    const setupResult = setup()
    return setupResult
  })!

  Object.defineProperty(store, '$state', {
    get () {
      return setupState
    }
  })

  Object.assign(store, setupState)

  isListening = true

  return store
}

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
