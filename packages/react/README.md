# @uni-store/react [![npm](https://badgen.net/npm/v/@uni-store/react)](https://www.npmjs.com/package/@uni-store/react) [![build status](https://github.com/dolymood/uni-store/workflows/test/badge.svg)](https://github.com/dolymood/uni-store/actions/workflows/test.yml) [![coverage](https://badgen.net/codecov/c/github/dolymood/uni-store)](https://codecov.io/github/dolymood/uni-store)

Unified Store for React.

## Installation

```bash
pnpm add @uni-store/core @uni-store/react
# or with yarn
yarn add @uni-store/core @uni-store/react
# or with npm
npm install @uni-store/core @uni-store/react
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

### With React

```tsx
import { reactiveReact } from '@uni-store/react'

const ReactiveView = reactiveReact(function () {
  const { n, computedN, increment } = useCounter()
  return (
    <div>
      <p>You clicked {n} times</p>
      <p>The computed times {computedN}</p>
      <button onClick={() => increment()}>
        Click me
      </button>
    </div>
  )
})

ReactDOM.render(<ReactiveView />, document.body)
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

### With React

#### reactiveReact

```tsx
import { reactiveReact } from '@uni-store/react'

const ReactiveView = reactiveReact(function () {
  const { n } = useStore()
  return <p>You clicked {n} times</p>
})

ReactDOM.render(<ReactiveView />, document.body)
```

You can get a Reactive React Component by `const ReactiveComponent = reactiveReact(Component: React.FunctionComponent)`.

#### useSetup & defineSetup

- After `v0.3.0` you can use `useSetup` and `defineSetup`:

```tsx
import { reactiveReact, useSetup, defineSetup } from '@uni-store/react'
type P = {
  base: number
}

const useTimer = (reactiveProps: P) => {
  const s = ref(1)
  const timer = computed(() => {
    return s.value + reactiveProps.base
  })
  const increment = (amount = 1) => {
    s.value += amount
  }
  return {
    timer,
    increment
  }
}
// use `defineSetup`
const useCustomTimer = defineSetup(useTimer)

const LocalTimerView = reactiveReact<P>(function (props) {
  const { timer, increment: timerIncrement } = useCustomTimer(props)
  // or useSetup with plain useTimer
  const { timer, increment: timerIncrement } = useSetup(useTimer, props)
  return (
    <div>
      <p>timer {timer}</p>
      <button onClick={() => timerIncrement()}>
        Click me
      </button>
    </div>
  )
})

// just use `useSetup`
const LocalReactiveView = reactiveReact<P>(function (props) {
  // you can also use useCustomTimer here
  const { n, increment } = useSetup((reactiveProps) => {
    setupCalledTimes++
    const s = ref(0)
    const n = computed(() => {
      return s.value + reactiveProps.base
    })
    const increment = (amount = 1) => {
      s.value += amount
    }

    return {
      n,
      increment
    }
  }, props)
  return (
    <div>
      <p>You clicked {n} times</p>
      <button onClick={() => increment()}>
        Click me
      </button>
    </div>
  )
})

const App = () => {
  const [base, setBase] = useState(0)
  return (
    <div>
      <LocalReactiveView base={base} />
      <LocalTimerView base={base} />
      <button data-testid="setBaseEle" onClick={() => setBase(base + 2)}>setBaseEle</button>
    </div>
  )
}
```

- After `v0.2.0`, you can use `useSetup<S, DependencyList>(() => S, DependencyList)`, but this API is **deprecated** after `v0.3.0`.

```tsx
import { ref, computed } from '@uni-store/core'
import { reactiveReact, useSetup } from '@uni-store/react'

const LocalReactiveView = reactiveReact(function () {
  const { num, computedNum, ins } = useSetup(() => {
    const num = ref(0)
    const computedNum = computed(() => {
      return num.value + 10
    })
    const ins = () => {
      num.value += 2
    }
    return {
      num,
      computedNum,
      ins
    }
  }, [])
  return (
    <div>
      <p>Num { num }</p>
      <p>ComNum { computedNum }</p>
      <button onClick={ () => ins() }>Ins</button>
    </div>
  )
})
```


## License

[MIT](http://opensource.org/licenses/MIT)
