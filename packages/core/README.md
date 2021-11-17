# @uni-store/core

Unified Store. You can use `@uni-store/core` with Vue or React fornow.

Based on [@vue/reactivity](https://github.com/vuejs/vue-next/tree/master/packages/reactivity) and `watch` with [@vue/runtime-core](https://github.com/vuejs/vue-next/tree/master/packages/runtime-core).

Inspired by [Pinia](https://github.com/posva/pinia).

## Installation

```bash
pnpm add @uni-store/core
# or with yarn
yarn add @uni-store/core
# or with npm
npm install @uni-store/core
```

## Usage

### Create a Store

You can create as many stores as you want:

```ts
// src/stores/counter
import { defineStore, ref, computed } from '@uni-store/core'

export const useCounter = defineStore(() => {
  const n = ref(0)
  const increment = (amount = 1) => {
    n.value += amount
  }

  const computedN = computed(() => {
    return n.value + 100
  })

  return {
    n,
    increment,
    computedN
  }
})
```

`defineStore` returns a function that has to be called to get access to the store:

```ts
import { nextTick, computed } from '@uni-store/core'
import { useCounter } from '@/stores/counter'

const counter = useCounter()
const stateN = computed(() => {
  return counter.n
})

let calledTimes = 0
// subscribe state change
counter.$subscribe((newState) => {
  calledTimes += 1
  expect(newState.n).toEqual(stateN.value)
})

expect(counter.n).toEqual(0)
expect(counter.computedN).toEqual(100)
expect(stateN.value).toEqual(0)
expect(calledTimes).toEqual(0)

counter.increment()
expect(counter.n).toEqual(1)
expect(counter.computedN).toEqual(101)
expect(stateN.value).toEqual(1)

nextTick(() => {
  expect(calledTimes).toEqual(1)
  counter.increment(10)
  expect(counter.n).toEqual(11)
  expect(counter.computedN).toEqual(111)
  expect(stateN.value).toEqual(11)
  nextTick(() => {
    expect(calledTimes).toEqual(2)
  })
})
```

### With Vue 3

```ts
import { defineComponent } from 'vue'
export default defineComponent({
  setup () {
    const counter = useCounter()
    // but you can not do like this:
    // const { n } = counter
    // it breaks reactivity
    return {
      counter
    }
  }
})
```

## Documentation

First of all, you need to read:

- Vue [Composition API/setup section](https://v3.vuejs.org/guide/composition-api-setup.html)
- Vue [Reactivity Fundamentals](https://v3.vuejs.org/guide/reactivity-fundamentals.html)

`@uni-store/core` export all [@vue/reactivity](https://www.npmjs.com/package/@vue/reactivity) API by default.

You can use all Vue [reactivity API](https://v3.vuejs.org/api/reactivity-api.html). Includes the following API from [@vue/runtime-core](https://www.npmjs.com/package/@vue/runtime-core):

- [nextTick](https://v3.vuejs.org/api/global-api.html#nexttick)
- [watch](https://v3.vuejs.org/api/computed-watch-api.html#watch)
- [watchEffect](https://v3.vuejs.org/api/computed-watch-api.html#watcheffect)
- [watchPostEffect](https://v3.vuejs.org/api/computed-watch-api.html#watchposteffect)
- [watchSyncEffect](https://v3.vuejs.org/api/computed-watch-api.html#watchsynceffect)

### Define Store

A Store is defined using `defineStore()` API, just like [Vue setup]((https://v3.vuejs.org/guide/composition-api-setup.html)):

```ts
// @/stores/counter
import { defineStore, ref } from '@uni-store/core'

export const useStore = defineStore(() => {
  const n = ref(1)
  const increment = (amount = 1) => {
    n.value += amount
  }

  return {
    n,
    increment
  }
})
```

Now you can get a custum `useStore`. Also you can rename it to other variable name, like `useCounter`.

#### Use Store

The store won't be created until `useStore()` is called:

```ts
import { useStore } from '@/stores/counter'

const store = useStore()

// you can use the states:
console.log(store.n) // should log 1

// increment n, amount = 10
store.increment(10)

console.log(store.n) // should log 11
```

You can even get another store instance in some special cases:

```ts
const anotherStore = useStore(true)

console.log(anotherStore.n) // should log 1
```

##### Subscribing state

```ts
// subscribe state change
store.$subscribe((state) => {
  // keep the whole state to local storage whenever it changes
  localStorage.setItem('cart', JSON.stringify(state))
})
```

## License

[MIT](http://opensource.org/licenses/MIT)
