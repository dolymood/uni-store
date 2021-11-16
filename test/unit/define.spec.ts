import {
  computed,
  ref,
  nextTick,
  defineStore
} from '../../src'

describe('Testing', () => {
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

  it('useStore should be same one', () => {
    const counter = useCounter()
    const counter2 = useCounter()

    expect(counter === counter2).toBeTruthy()
  })

  it('should work correctly', () => {
    const counter = useCounter(true)

    expect(counter.n).toEqual(0)
    expect(counter.computedN).toEqual(100)
    counter.increment()
    expect(counter.n).toEqual(1)
    expect(counter.computedN).toEqual(101)
    counter.increment(5)
    expect(counter.n).toEqual(6)
    expect(counter.computedN).toEqual(106)
  })

  it('should dispatch subscriptions', (done) => {
    const counter = useCounter(true)
    const stateN = computed(() => {
      return counter.n
    })

    let calledTimes = 0
    // subscribe state change
    const removeSubscribe = counter.$subscribe((newState) => {
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
      // remove subscribe
      removeSubscribe()
      counter.increment(10)
      expect(counter.n).toEqual(11)
      expect(counter.computedN).toEqual(111)
      expect(stateN.value).toEqual(11)
      expect(calledTimes).toEqual(1)
      nextTick(() => {
        expect(calledTimes).toEqual(1)
        done()
      })
    })
  })
})
