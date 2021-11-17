import React, {
  FunctionComponent
} from 'react'
import {
  act,
  cleanup,
  fireEvent,
  render
} from '@testing-library/react'
import {
  computed,
  ref,
  defineStore
} from '@uni-store/core'
import {
  reactiveReact,
  useSetup
} from '../src'

afterEach(cleanup)

describe('Test React', () => {
  const useCounter = defineStore(() => {
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

  it('should work correctly with props', () => {
    const CounterView: FunctionComponent<{ counter: ReturnType<typeof useCounter> }> = function  ({ counter }) {
      const { n, computedN, increment } = counter
      return (
        <div>
          <p>You clicked {n} times</p>
          <p>The computed times {computedN}</p>
          <button data-testid="clickableEle" onClick={() => increment()}>
            Click me
          </button>
        </div>
      )
    }

    const ReactiveView = reactiveReact(CounterView)

    const App = () => {
      const counter = useCounter()
      return (
        <ReactiveView counter={counter} />
      )
    }

    const rendered = render(<App />)

    expect(rendered.getAllByText('You clicked 0 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 100')).toHaveLength(1)

    act(() => {
      const counter = useCounter()
      counter.increment()
    })

    expect(rendered.getAllByText('You clicked 1 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 101')).toHaveLength(1)

    // button click
    fireEvent.click(rendered.getByTestId('clickableEle'))

    expect(rendered.getAllByText('You clicked 2 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 102')).toHaveLength(1)
  })

  it('should work correctly with local use', () => {
    // new another store
    // hack
    useCounter(true)

    const ReactiveView = reactiveReact(function () {
      const { n, computedN, increment } = useCounter()
      return (
        <div>
          <p>You clicked {n} times</p>
          <p>The computed times {computedN}</p>
          <button data-testid="clickableEle" onClick={() => increment()}>
            Click me
          </button>
        </div>
      )
    })

    const App = () => {
      return (
        <ReactiveView />
      )
    }

    const rendered = render(<App />)

    expect(rendered.getAllByText('You clicked 0 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 100')).toHaveLength(1)

    act(() => {
      const counter = useCounter()
      counter.increment()
    })

    expect(rendered.getAllByText('You clicked 1 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 101')).toHaveLength(1)

    // button click
    fireEvent.click(rendered.getByTestId('clickableEle'))

    expect(rendered.getAllByText('You clicked 2 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 102')).toHaveLength(1)
  })

  it('should work correctly - useSetup', () => {
    const LocalReactiveView = reactiveReact(function () {
      const { n, computedN, increment } = useSetup(() => {
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
      return (
        <div>
          <p>You clicked {n} times</p>
          <p>The computed times {computedN}</p>
          <button data-testid="clickableEle" onClick={() => increment()}>
            Click me
          </button>
        </div>
      )
    })

    const App = () => {
      return (
        <LocalReactiveView />
      )
    }

    const rendered = render(<App />)

    expect(rendered.getAllByText('You clicked 0 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 100')).toHaveLength(1)

    // button click
    fireEvent.click(rendered.getByTestId('clickableEle'))

    expect(rendered.getAllByText('You clicked 1 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 101')).toHaveLength(1)

    // button click again
    fireEvent.click(rendered.getByTestId('clickableEle'))

    expect(rendered.getAllByText('You clicked 2 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 102')).toHaveLength(1)
  })
})
