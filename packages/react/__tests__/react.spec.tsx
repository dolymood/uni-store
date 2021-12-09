import React, {
  FunctionComponent,
  useState
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
  defineStore,
  nextTick
} from '@uni-store/core'
import {
  defineSetup,
  reactiveReact,
  useSetup
} from '../src'

afterEach(cleanup)

describe('Test React', () => {
  const useCounter = () => {
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
  }
  const useCounterStore = defineStore(useCounter)

  const actAsync = async (handler: Function) => {
    await act(async () => {
      await handler()
      await nextTick()
    })
  }

  const actClickEvent = async (ele: Element) => {
    await actAsync(async () => {
      fireEvent.click(ele)
    })
  }

  it('should work correctly with props', async () => {
    const CounterView: FunctionComponent<{ counter: ReturnType<typeof useCounterStore> }> = function ({ counter }) {
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
      const counter = useCounterStore()
      return (
        <ReactiveView counter={counter} />
      )
    }

    const rendered = render(<App />)

    await nextTick()

    expect(rendered.getAllByText('You clicked 0 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 100')).toHaveLength(1)

    await actAsync(() => {
      const counter = useCounterStore()
      counter.increment()
    })

    expect(rendered.getAllByText('You clicked 1 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 101')).toHaveLength(1)

    // button click
    await actClickEvent(rendered.getByTestId('clickableEle'))

    expect(rendered.getAllByText('You clicked 2 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 102')).toHaveLength(1)
  })

  it('should work correctly with local use', async () => {
    // new another store
    // hack
    useCounterStore(true)

    const ReactiveView = reactiveReact(function () {
      const { n, computedN, increment } = useCounterStore()
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

    await nextTick()

    expect(rendered.getAllByText('You clicked 0 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 100')).toHaveLength(1)

    await actAsync(() => {
      const counter = useCounterStore()
      counter.increment()
    })

    expect(rendered.getAllByText('You clicked 1 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 101')).toHaveLength(1)

    // button click
    await actClickEvent(rendered.getByTestId('clickableEle'))

    expect(rendered.getAllByText('You clicked 2 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 102')).toHaveLength(1)
  })

  it('shoule work correctly when forwardRef is true', () => {
    interface IMethods {
      focus(): void
    }

    interface IProps {
      value: string
    }

    const FancyInput = reactiveReact(
      (props: IProps, ref: React.Ref<IMethods>) => {
        const inputRef = React.useRef<HTMLInputElement>(null)
        React.useImperativeHandle(
          ref,
          () => ({
            focus: () => {
              inputRef.current!.focus()
            }
          }),
          []
        )
        return <input ref={inputRef} defaultValue={props.value} />
      },
      { forwardRef: true }
    )

    const cr = React.createRef<IMethods>()
    render(<FancyInput ref={cr} value="" />)
    expect(cr).toBeTruthy()
    expect(cr.current).toBeTruthy()
    expect(typeof cr.current!.focus).toBe('function')
  })

  it('should work correctly - useSetup(fn)', async () => {
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
    await nextTick()

    expect(rendered.getAllByText('You clicked 0 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 100')).toHaveLength(1)

    // button click
    await actClickEvent(rendered.getByTestId('clickableEle'))

    expect(rendered.getAllByText('You clicked 1 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 101')).toHaveLength(1)

    // button click again
    await actClickEvent(rendered.getByTestId('clickableEle'))

    expect(rendered.getAllByText('You clicked 2 times')).toHaveLength(1)
    expect(rendered.getAllByText('The computed times 102')).toHaveLength(1)
  })

  it('should work correctly - useSetup(fn, deps)', async () => {
    type P = {
      base: number
    }
    let calledTimes = 0
    let setupCalledTimes = 0
    const LocalReactiveView = reactiveReact<P>(function ({ base }) {
      calledTimes++
      const { n, increment } = useSetup(() => {
        setupCalledTimes++
        const s = ref(0)
        const n = computed(() => {
          return s.value + base
        })
        const increment = (amount = 1) => {
          s.value += amount
        }

        return {
          n,
          increment
        }
      }, [base])
      return (
        <div>
          <p>You clicked {n} times</p>
          <button data-testid="clickableEle" onClick={() => increment()}>
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
          <button data-testid="setBaseEle" onClick={() => setBase(base + 2)}>setBaseEle</button>
        </div>
      )
    }

    const rendered = render(<App />)

    await nextTick()

    expect(calledTimes).toBe(1)
    expect(setupCalledTimes).toBe(1)
    expect(rendered.getAllByText('You clicked 0 times')).toHaveLength(1)

    // button click
    await actClickEvent(rendered.getByTestId('clickableEle'))
    expect(calledTimes).toBe(2)
    expect(setupCalledTimes).toBe(1)
    expect(rendered.getAllByText('You clicked 1 times')).toHaveLength(1)

    // setBase button click
    await actClickEvent(rendered.getByTestId('setBaseEle'))

    expect(calledTimes).toBe(3)
    expect(setupCalledTimes).toBe(2)
    expect(rendered.getAllByText('You clicked 2 times')).toHaveLength(1)

    // button click again
    await actClickEvent(rendered.getByTestId('clickableEle'))
    expect(calledTimes).toBe(4)
    expect(setupCalledTimes).toBe(2)
    expect(rendered.getAllByText('You clicked 3 times')).toHaveLength(1)
  })
  it('should work correctly - useSetup(fn, props)', async () => {
    type P = {
      base: number
    }
    let timerUseCalledTimes = 0
    // plain useXxx
    const useTimer = (props: P) => {
      timerUseCalledTimes++
      const s = ref(1)
      const timer = computed(() => {
        return s.value + props.base
      })
      const increment = (amount = 1) => {
        s.value += amount
      }
      return {
        timer,
        increment
      }
    }
    const useTimer2 = defineSetup(useTimer)
    let timerCalledTimes = 0
    const LocalTimerView = reactiveReact<P>(function (props) {
      timerCalledTimes++
      // just normal
      const { timer, increment } = useSetup(useTimer, props)
      const { timer: timer2, increment: increment2 } = useTimer2(props)
      return (
        <div>
          <div>
            <p>timer {timer}</p>
            <button data-testid="timerEle" onClick={() => increment()}>
              Click me
            </button>
          </div>
          <div>
            <p>timer2 {timer2}</p>
            <button data-testid="timer2Ele" onClick={() => increment2()}>
              Click me 2
            </button>
          </div>
        </div>
      )
    })
    let calledTimes = 0
    let setupCalledTimes = 0
    const LocalReactiveView = reactiveReact<P>(function (props) {
      calledTimes++
      const { n, increment } = useSetup((props) => {
        setupCalledTimes++
        const s = ref(0)
        const n = computed(() => {
          return s.value + props.base
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
          <button data-testid="clickableEle" onClick={() => increment()}>
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

    const rendered = render(<App />)

    await nextTick()

    expect(calledTimes).toBe(1)
    expect(setupCalledTimes).toBe(1)
    expect(timerCalledTimes).toBe(1)
    // we use useTimer twice in LocalTimerView
    expect(timerUseCalledTimes).toBe(2)
    expect(rendered.getAllByText('You clicked 0 times')).toHaveLength(1)
    // 1 + 0
    expect(rendered.getAllByText('timer 1')).toHaveLength(1)
    expect(rendered.getAllByText('timer2 1')).toHaveLength(1)

    // button click
    await actClickEvent(rendered.getByTestId('clickableEle'))
    expect(calledTimes).toBe(2)
    expect(setupCalledTimes).toBe(1)
    expect(rendered.getAllByText('You clicked 1 times')).toHaveLength(1)
    await actClickEvent(rendered.getByTestId('timerEle'))
    expect(timerCalledTimes).toBe(2)
    expect(timerUseCalledTimes).toBe(2)
    // 2 + 0
    expect(rendered.getAllByText('timer 2')).toHaveLength(1)
    expect(rendered.getAllByText('timer2 1')).toHaveLength(1)
    await actClickEvent(rendered.getByTestId('timer2Ele'))
    expect(timerCalledTimes).toBe(3)
    expect(timerUseCalledTimes).toBe(2)
    // 2 + 0
    expect(rendered.getAllByText('timer 2')).toHaveLength(1)
    expect(rendered.getAllByText('timer2 2')).toHaveLength(1)

    // setBase button click
    await actClickEvent(rendered.getByTestId('setBaseEle'))

    expect(calledTimes).toBe(3)
    // only once
    expect(setupCalledTimes).toBe(1)
    expect(timerCalledTimes).toBe(4)
    expect(timerUseCalledTimes).toBe(2)
    // 3 times 2 + 1
    expect(rendered.getAllByText('You clicked 3 times')).toHaveLength(1)
    // 2 + 2
    expect(rendered.getAllByText('timer 4')).toHaveLength(1)
    expect(rendered.getAllByText('timer2 4')).toHaveLength(1)

    // button click again
    await actClickEvent(rendered.getByTestId('clickableEle'))
    expect(calledTimes).toBe(4)
    // only once
    expect(setupCalledTimes).toBe(1)
    expect(rendered.getAllByText('You clicked 4 times')).toHaveLength(1)
    await actClickEvent(rendered.getByTestId('timerEle'))
    expect(timerCalledTimes).toBe(5)
    expect(timerUseCalledTimes).toBe(2)
    // 3 + 2
    expect(rendered.getAllByText('timer 5')).toHaveLength(1)
    expect(rendered.getAllByText('timer2 4')).toHaveLength(1)
  })
})
