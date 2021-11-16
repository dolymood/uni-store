export type Method = (...args: any[]) => any

export type SubscriptionCallback<S> = (state: S) => void

export function addSubscription<T extends Method>(
  subscriptions: T[],
  callback: T
) {
  subscriptions.push(callback)

  const removeSubscription = () => {
    const idx = subscriptions.indexOf(callback)
    if (idx > -1) {
      subscriptions.splice(idx, 1)
    }
  }

  return removeSubscription
}

// todo
// use in next $patch feat
export function triggerSubscriptions<T extends Method>(
  subscriptions: T[],
  ...args: Parameters<T>
) {
  subscriptions.forEach((callback) => {
    callback(...args)
  })
}
