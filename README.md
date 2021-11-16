# @uni-store/core

Unified Store.

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

## Documentation

> TODO

## License

[MIT](http://opensource.org/licenses/MIT)
