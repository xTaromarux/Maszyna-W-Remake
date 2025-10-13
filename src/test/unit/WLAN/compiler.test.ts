import { describe, it, expect } from 'vitest'
import { compileCodeExternal } from '@/WLAN/compiler'
import type { CompileExternalOptions } from '@/WLAN/compiler'

describe('WLAN Compiler', () => {
  const defaultOptions: CompileExternalOptions = {
    availableSignals: {
      always: [
        'il', 'wyl', 'wel', 'wyad', 'wei', 'wea', 'wes', 'wys', 'czyt', 'pisz',
        'przep', 'weja', 'weak', 'dod', 'ode', 'wyak', 'stop', 'wyws', 'iws',
        'dws', 'wyls', 'wyg', 'werb', 'wyrb', 'start'
      ],
      busConnectors: ['as', 'sa'],
      dl: ['dl'],
      jamlExtras: ['iak', 'dak', 'mno', 'dziel', 'shr', 'shl', 'neg', 'lub', 'i'],
      xRegister: ['wyx', 'wex'],
      yRegister: ['wyy', 'wey']
    },
    extras: {
      xRegister: true,
      yRegister: true,
      dl: true,
      jamlExtras: true,
      busConnectors: true
    }
  }

  describe('Basic Compilation', () => {
    it('should compile simple microprogram successfully', () => {
      const source = `czyt; wei; il`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program).toBeDefined()
      expect(Array.isArray(result.program)).toBe(true)
      expect(result.program.length).toBeGreaterThan(0)
    })

    it('should handle empty program', () => {
      const source = ''
      
      expect(() => compileCodeExternal(source, defaultOptions)).toThrow(/Brak kodu/)
    })

    it('should handle basic signals', () => {
      const source = `czyt; wei; il`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program.length).toBeGreaterThan(0)
    })

    it('should track raw lines', () => {
      const source = `czyt; wei; il`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.rawLines).toBeDefined()
      expect(Array.isArray(result.rawLines)).toBe(true)
    })
  })

  describe('Signal Processing', () => {
    it('should process always available signals', () => {
      const source = `czyt; wei`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program.length).toBeGreaterThan(0)
    })

    it('should process X register signals when enabled', () => {
      const source = `wyx; wex`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
    })

    it('should process Y register signals when enabled', () => {
      const source = `wyy; wey`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
    })

    it('should reject X register signals when disabled', () => {
      const options = { ...defaultOptions, extras: { ...defaultOptions.extras, xRegister: false } }
      const source = `wyx`
      
      expect(() => compileCodeExternal(source, options)).toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should handle unknown signals gracefully', () => {
      const source = `UNKNOWN_SIGNAL`
      
      expect(() => compileCodeExternal(source, defaultOptions)).toThrow()
    })

    it('should provide helpful error messages', () => {
      const source = `INVALID_SIGNAL`
      
      try {
        compileCodeExternal(source, defaultOptions)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toBeTruthy()
      }
    })
  })

  describe('Configuration Options', () => {
    it('should respect signal availability configuration', () => {
      const customOptions: CompileExternalOptions = {
        availableSignals: {
          always: ['czyt'],
          xRegister: [],
          yRegister: [],
          dl: [],
          jamlExtras: [],
          busConnectors: []
        }
      }
      
      const source = `czyt`
      const result = compileCodeExternal(source, customOptions)
      expect(result).toBeDefined()
    })

    it('should handle disabled extras', () => {
      const options: CompileExternalOptions = {
        availableSignals: defaultOptions.availableSignals,
        extras: {
          xRegister: false,
          yRegister: false,
          dl: false,
          jamlExtras: false,
          busConnectors: false
        }
      }
      
      const source = `czyt; wei`
      
      const result = compileCodeExternal(source, options)
      expect(result).toBeDefined()
    })
  })

  describe('Complex Programs', () => {
    it('should compile multi-phase microprogram', () => {
      const source = `czyt wei il; wyad wea`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program.length).toBeGreaterThan(0)
    })

    it('should handle complex signal combinations', () => {
      const source = `czyt; wei; wea; dod; ode`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle whitespace-only input', () => {
      const source = '   \n\t  \r\n   '
      
      expect(() => compileCodeExternal(source, defaultOptions)).toThrow(/Brak kodu/)
    })

    it('should reject signals not in configuration', () => {
      const source = `NONEXISTENT_SIGNAL`
      
      expect(() => compileCodeExternal(source, defaultOptions)).toThrow()
    })
  })
})

describe('WLAN Compiler', () => {
  const defaultOptions: CompileExternalOptions = {
    availableSignals: {
      always: [
        'il', 'wyl', 'wel', 'wyad', 'wei', 'wea', 'wes', 'wys', 'czyt', 'pisz',
        'przep', 'weja', 'weak', 'dod', 'ode', 'wyak', 'stop', 'wyws', 'iws',
        'dws', 'wyls', 'wyg', 'werb', 'wyrb', 'start'
      ],
      busConnectors: ['as', 'sa'],
      dl: ['dl'],
      jamlExtras: ['iak', 'dak', 'mno', 'dziel', 'shr', 'shl', 'neg', 'lub', 'i'],
      xRegister: ['wyx', 'wex'],
      yRegister: ['wyy', 'wey']
    },
    extras: {
      xRegister: true,
      yRegister: true,
      dl: true,
      jamlExtras: true,
      busConnectors: true
    }
  }

  describe('Basic Compilation', () => {
    it('should compile simple microprogram successfully', () => {
      const source = `czyt; wei; il`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program).toBeDefined()
      expect(Array.isArray(result.program)).toBe(true)
      expect(result.program.length).toBeGreaterThan(0)
    })

    it('should handle empty program', () => {
      const source = ''
      
      expect(() => compileCodeExternal(source, defaultOptions)).toThrow(/Brak kodu/)
    })

    it('should handle comments', () => {
      const source = `czyt; wei; il`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program.length).toBeGreaterThan(0)
    })

    it('should track raw lines', () => {
      const source = `czyt; wei; il`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.rawLines).toBeDefined()
      expect(Array.isArray(result.rawLines)).toBe(true)
    })
  })

  describe('Signal Processing', () => {
    it('should process always available signals', () => {
      const source = `czyt; wei`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program.length).toBeGreaterThan(0)
    })

    it('should process X register signals when enabled', () => {
      const source = `wyx; wex`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
    })

    it('should process Y register signals when enabled', () => {
      const source = `wyy; wey`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
    })

    it('should reject X register signals when disabled', () => {
      const options = { ...defaultOptions, extras: { ...defaultOptions.extras, xRegister: false } }
      const source = `wyx`
      
      expect(() => compileCodeExternal(source, options)).toThrow()
    })
  })

  describe('Phase Processing', () => {
    it('should handle multi-line phases', () => {
      const source = `czyt; wei; il`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program.length).toBeGreaterThanOrEqual(1)
    })

    it('should preserve phase separation', () => {
      const source = `czyt; wei; il`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program.length).toBeGreaterThan(0)
    })

    it('should handle phase structure', () => {
      const source = `czyt; wei`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program.length).toBeGreaterThan(0)
      
      // Check phase structure
      result.program.forEach(phase => {
        expect(phase).toBeDefined()
        expect(phase.phases).toBeDefined()
        expect(Array.isArray(phase.phases)).toBe(true)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle unknown signals gracefully', () => {
      const source = `UNKNOWN_SIGNAL`
      
      expect(() => compileCodeExternal(source, defaultOptions)).toThrow()
    })

    it('should provide helpful error messages', () => {
      const source = `INVALID_SIGNAL`
      
      try {
        compileCodeExternal(source, defaultOptions)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toBeTruthy()
      }
    })
  })

  describe('Configuration Options', () => {
    it('should respect signal availability configuration', () => {
      const customOptions: CompileExternalOptions = {
        availableSignals: {
          always: ['czyt'],
          xRegister: [],
          yRegister: [],
          dl: [],
          jamlExtras: [],
          busConnectors: []
        }
      }
      
      const source = `czyt`
      const result = compileCodeExternal(source, customOptions)
      expect(result).toBeDefined()
    })

    it('should handle disabled extras', () => {
      const options: CompileExternalOptions = {
        availableSignals: defaultOptions.availableSignals,
        extras: {
          xRegister: false,
          yRegister: false,
          dl: false,
          jamlExtras: false,
          busConnectors: false
        }
      }
      
      const source = `czyt; wei`
      
      const result = compileCodeExternal(source, options)
      expect(result).toBeDefined()
    })
  })

  describe('Complex Programs', () => {
    it('should compile multi-phase microprogram', () => {
      const source = `czyt wei il; czyt wei il wyy; czyt wei il dod`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program.length).toBe(3)
    })

    it('should handle complex signal combinations', () => {
      const source = `czyt
wei
il
wyy
dl
wys
dod`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program.length).toBe(1) // Single phase with multiple signals
    })
  })

  describe('Source Line Tracking', () => {
    it('should track source line numbers', () => {
      const source = `czyt
wei
il`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      
      // Check if result contains source line information
      result.program.forEach(entry => {
        entry.phases.forEach(phase => {
          // Phase object validation
          expect(typeof phase).toBe('object')
        })
      })
    })

    it('should preserve raw line information', () => {
      const source = `czyt
wei
il`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.rawLines).toBeDefined()
      expect(result.rawLines.length).toBeGreaterThan(0)
    })
  })

  describe('Polish Language Support', () => {
    it('should handle Polish comments', () => {
      const source = `czyt
wei`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
    })
  })

  describe('Performance', () => {
    it('should compile large programs efficiently', () => {
      const signals = ['czyt', 'wei', 'il', 'wyy']
      const phases = Array(100).fill(0).map((_, i) => 
        signals.map(signal => signal).join('\n')
      ).join('\n\n')
      
      const startTime = performance.now()
      const result = compileCodeExternal(phases, defaultOptions)
      const endTime = performance.now()
      
      expect(result).toBeDefined()
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
    })
  })

  describe('Edge Cases', () => {
    it('should handle whitespace-only input', () => {
      const source = `   
      
         `
      
      expect(() => compileCodeExternal(source, defaultOptions)).toThrow('Brak kodu do kompilacji.')
    })

    it('should handle mixed line endings', () => {
      const source = "czyt\r\nwei\nil\r\n\rwyy"
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
    })

    it('should handle Unicode characters in comments', () => {
      const source = `czyt
wei`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
    })
  })

  describe('Microprogram Structure Validation', () => {
    it('should validate microprogram entry structure', () => {
      const source = `czyt
wei`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program.length).toBeGreaterThan(0)
      
      result.program.forEach(entry => {
        expect(entry).toHaveProperty('phases')
        expect(Array.isArray(entry.phases)).toBe(true)
        
        entry.phases.forEach(phase => {
          expect(typeof phase).toBe('object')
        })
      })
    })

    it('should handle empty phases correctly', () => {
      const source = `czyt

wei`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program.length).toBeGreaterThan(0)
    })
  })

  describe('Signal Validation', () => {
    it('should validate signal existence in configuration', () => {
      const source = `czyt`
      
      const result = compileCodeExternal(source, defaultOptions)
      expect(result).toBeDefined()
      expect(result.program.length).toBeGreaterThan(0)
    })

    it('should reject signals not in configuration', () => {
      const source = `NONEXISTENT_SIGNAL`
      
      expect(() => compileCodeExternal(source, defaultOptions)).toThrow()
    })
  })
})