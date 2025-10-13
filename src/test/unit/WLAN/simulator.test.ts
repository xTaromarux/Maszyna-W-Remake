import { describe, it, expect, beforeEach } from 'vitest'
import { 
  initStore, 
  applySignals, 
  stepMicro, 
  exportStore,
  importStore, 
  evalFlag,
  DEFAULT_VECTOR_BASE 
} from '@/WLAN/simulator'
import type { Store } from '@/WLAN/model'

// Helper function to create a store with a basic microprogram
function createStoreWithProgram(): Store {
  const store = initStore()
  store.program = [{
    pc: 0,
    asmLine: 'test',
    phases: [
      { czyt: true } as any,
      { wei: true } as any
    ],
    meta: { kind: 'NONE' }
  }]
  store.L = 0  // Set L to point to first instruction
  store.phaseIdx = 0
  return store
}

describe('WLAN Simulator', () => {
  let store: Store

  beforeEach(() => {
    store = initStore()
  })

  describe('Store Initialization', () => {
    it('should initialize store with default values', () => {
      expect(store).toBeDefined()
      expect(store.A).toBe(0)
      expect(store.S).toBe(0)
      expect(store.L).toBe(0)
      expect(store.I).toBe(0)
      expect(store.phaseIdx).toBe(0)
    })

    it('should have correct default vector base', () => {
      expect(store.vectorBase).toBe(DEFAULT_VECTOR_BASE)
    })

    it('should initialize registers', () => {
      expect(store.A).toBe(0)
      expect(store.S).toBe(0)
      expect(store.L).toBe(0)
      expect(store.I).toBe(0)
      expect(store.Ak).toBe(0)
    })

    it('should initialize memory', () => {
      expect(store.mem).toBeInstanceOf(Uint8Array)
      expect(store.mem.length).toBeGreaterThan(0)
    })

    it('should initialize flags', () => {
      expect(store.flags).toBeDefined()
      expect(store.flags.Z).toBe(false)
      expect(store.flags.N).toBe(false)
      expect(store.flags.IE).toBe(false)
      expect(store.flags.IR).toBe(false)
    })

    it('should initialize stacks', () => {
      expect(Array.isArray(store.dataStack)).toBe(true)
      expect(Array.isArray(store.callStack)).toBe(true)
      expect(store.dataStack.length).toBe(0)
      expect(store.callStack.length).toBe(0)
    })
  })

  describe('Signal Application', () => {
    it('should apply basic signals to store', () => {
      const phase = { czyt: true, wei: true }
      
      expect(() => applySignals(phase, store)).not.toThrow()
    })

    it('should handle empty phase', () => {
      const phase = {}
      
      expect(() => applySignals(phase, store)).not.toThrow()
    })

    it('should handle register signals', () => {
      const phase = { wea: true, wes: true }
      
      expect(() => applySignals(phase, store)).not.toThrow()
    })

    it('should handle memory signals', () => {
      const phase = { czyt: true, pisz: true }
      
      expect(() => applySignals(phase, store)).not.toThrow()
    })
  })

  describe('Microprogram Execution', () => {
    it('should step through microprogram', () => {
      const store = createStoreWithProgram()
      
      expect(() => stepMicro(store)).not.toThrow()
      expect(store.phaseIdx).toBe(1)
    })

    it('should handle multiple steps', () => {
      const store = createStoreWithProgram()
      store.program[0].phases = [{ czyt: true } as any, { wei: true } as any]
      
      expect(() => stepMicro(store)).not.toThrow()
      expect(() => stepMicro(store)).not.toThrow()
    })

    it('should update phase index', () => {
      const store = createStoreWithProgram()
      
      stepMicro(store)
      expect(store.phaseIdx).toBe(1)
    })
  })

  describe('Register Operations', () => {
    it('should modify accumulator register', () => {
      store.A = 10
      store.magA = 20
      
      applySignals({ wea: true }, store)
      expect(store.A).toBe(20)
    })

    it('should modify stack register', () => {
      store.S = 5
      expect(store.S).toBe(5)
    })

    it('should modify length register', () => {
      store.L = 15
      expect(store.L).toBe(15)
    })

    it('should modify index register', () => {
      store.I = 25
      expect(store.I).toBe(25)
    })

    it('should handle auxiliary accumulator', () => {
      store.Ak = 100
      expect(store.Ak).toBe(100)
    })

    it('should handle magnitude registers', () => {
      store.magA = 128
      store.magS = 64
      expect(store.magA).toBe(128)
      expect(store.magS).toBe(64)
    })
  })

  describe('Memory Operations', () => {
    it('should read and write memory', () => {
      const address = 10
      const value = 42
      
      store.mem[address] = value
      expect(store.mem[address]).toBe(value)
    })

    it('should handle memory boundaries', () => {
      const maxAddress = store.mem.length - 1
      
      store.mem[0] = 10
      expect(store.mem[0]).toBe(10)
      
      store.mem[maxAddress] = 20
      expect(store.mem[maxAddress]).toBe(20)
    })

    it('should preserve memory state across operations', () => {
      const store = createStoreWithProgram()
      store.mem[5] = 100
      store.mem[10] = 200
      
      stepMicro(store)
      
      expect(store.mem[5]).toBe(100)
      expect(store.mem[10]).toBe(200)
    })

    it('should handle Uint8Array constraints', () => {
      store.mem[0] = 255
      expect(store.mem[0]).toBe(255)
      
      store.mem[1] = 256 // Should wrap to 0
      expect(store.mem[1]).toBe(0)
    })
  })

  describe('Flag Operations', () => {
    it('should evaluate zero flag', () => {
      store.Ak = 0  // evalFlag checks Ak, not A
      expect(evalFlag(store, 'Z')).toBe(true)
      
      store.Ak = 1
      expect(evalFlag(store, 'Z')).toBe(false)
    })

    it('should evaluate negative flag', () => {
      store.Ak = 0x80  // evalFlag checks Ak bit 7
      expect(evalFlag(store, 'N')).toBe(true)
      
      store.Ak = 1
      expect(evalFlag(store, 'N')).toBe(false)
    })

    it('should evaluate carry flag', () => {
      store.flags.C = true
      expect(evalFlag(store, 'C')).toBe(true)
      
      store.flags.C = false
      expect(evalFlag(store, 'C')).toBe(false)
    })

    it('should evaluate overflow flag', () => {
      store.flags.V = true
      expect(evalFlag(store, 'V')).toBe(true)
    })

    it('should handle interrupt flags', () => {
      store.flags.IE = true
      store.flags.IR = false
      expect(store.flags.IE).toBe(true)
      expect(store.flags.IR).toBe(false)
    })
  })

  describe('Stack Operations', () => {
    it('should handle data stack', () => {
      store.dataStack.push(10)
      store.dataStack.push(20)
      
      expect(store.dataStack.length).toBe(2)
      expect(store.dataStack.pop()).toBe(20)
      expect(store.dataStack.pop()).toBe(10)
    })

    it('should handle call stack', () => {
      store.callStack.push({ L: 5, phaseIdx: 2 })
      
      expect(store.callStack.length).toBe(1)
      const ctx = store.callStack.pop()
      expect(ctx?.L).toBe(5)
      expect(ctx?.phaseIdx).toBe(2)
    })

    it('should handle stack overflow protection', () => {
      // Fill stack to capacity
      for (let i = 0; i < 1000; i++) {
        store.dataStack.push(i)
      }
      
      expect(store.dataStack.length).toBe(1000)
    })
  })

  describe('IO Operations', () => {
    it('should handle input operations', () => {
      store.ioIn = [10, 20, 30]
      
      applySignals({ wyrb: true }, store)
      expect(store.magS).toBe(10)
      expect(store.ioIn.length).toBe(2)
    })

    it('should handle output operations', () => {
      store.Ak = 42
      
      applySignals({ werb: true }, store)
      expect(store.ioOut[0]).toBe(42)
    })

    it('should handle port operations', () => {
      store.portIn = 100
      store.portOut = 200
      
      expect(store.portIn).toBe(100)
      expect(store.portOut).toBe(200)
    })
  })

  describe('Store Serialization', () => {
    it('should export store to string', () => {
      store.A = 10
      store.S = 20
      
      const exported = exportStore(store)
      expect(typeof exported).toBe('string')
      expect(exported.length).toBeGreaterThan(0)
    })

    it('should handle roundtrip serialization', () => {
      store.A = 100
      store.S = 200
      store.L = 50
      store.I = 75
      store.mem[0] = 123
      store.mem[10] = 45
      
      const exported = exportStore(store)
      const newStore = importStore(exported)  // Use importStore function instead
      
      expect(newStore.A).toBe(100)
      expect(newStore.S).toBe(200)
      expect(newStore.L).toBe(50)
      expect(newStore.I).toBe(75)
    })
  })

  describe('Complex Operations', () => {
    it('should handle arithmetic operations via signals', () => {
      store.Ak = 10
      store._aluIn = 5
      
      applySignals({ dod: true }, store)
      expect(store._aluOut).toBe(15)
      
      applySignals({ ode: true }, store)
      expect(store._aluOut).toBe(5)
    })

    it('should handle memory transfer operations', () => {
      store.magA = 10
      store.mem[10] = 42
      
      applySignals({ czyt: true }, store)
      expect(store.S).toBe(42)
      
      store.S = 100
      applySignals({ pisz: true }, store)
      expect(store.mem[10]).toBe(100)
    })

    it('should handle conditional operations', () => {
      store.Ak = 0  // Set Ak to 0 to make Z flag true
      expect(evalFlag(store, 'Z')).toBe(true)
      
      store.Ak = 1  // Set Ak to non-zero to make Z flag false
      expect(evalFlag(store, 'Z')).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid signals gracefully', () => {
      const phase = { invalidSignal: true }
      
      expect(() => applySignals(phase, store)).not.toThrow()
    })

    it('should handle corrupted store gracefully', () => {
      // Test with partial data
      const phase = { czyt: true }
      
      expect(() => applySignals(phase, store)).not.toThrow()
    })
  })
})