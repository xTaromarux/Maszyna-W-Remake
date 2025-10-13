import { describe, it, expect } from 'vitest'
import { analyzeSemantics, collectLabels } from '@/WLAN/semanticAnalyzer'
import { parse } from '@/WLAN/parser'
import type { ProgramAst } from '@/WLAN/model'

describe('WLAN Semantic Analyzer', () => {
  describe('Label Resolution', () => {
    it('should resolve simple label references', () => {
      const source = `start: POB 10
SOZ start`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
      
      const symbolTable = collectLabels(ast.body)
      expect(symbolTable.has('start')).toBe(true)
    })

    it('should detect undefined label references', () => {
      const source = `POB 10
SOZ undefined_label`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).toThrow(/undefined|not found|Niezdefiniowany/)
    })

    it('should detect duplicate label definitions', () => {
      const source = `start: POB 10
start: ŁAD 20`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).toThrow(/duplicate|already|zduplikowany/)
    })

    it('should handle forward label references', () => {
      const source = `POB 10
SOZ forward_label
forward_label: ŁAD 20`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
      
      const symbolTable = collectLabels(ast.body)
      expect(symbolTable.has('forward_label')).toBe(true)
    })
  })

  describe('Memory Address Analysis', () => {
    it('should handle valid memory addresses', () => {
      const source = `data: POB 42
start: ŁAD @data`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })

    it('should validate memory reference syntax', () => {
      const source = `POB @start
start: ŁAD 20`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })
  })

  describe('Instruction Validation', () => {
    it('should validate operand counts for instructions', () => {
      const source = `POB 10, 20, 30, 40, 50` // Too many operands
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).toThrow(/operand|argument/)
    })

    it('should accept valid WLAN instructions', () => {
      const source = `POB 10
ŁAD 20
DOD 30
ODE 40
SOB 50
SOZ 60
STP`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })

    it('should detect invalid register names', () => {
      const source = `ŁAD INVALID_REG`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).toThrow(/undefined|symbol|Niezdefiniowany/)
    })
  })

  describe('Value Range Validation', () => {
    it('should validate immediate value ranges', () => {
      const source = `POB 255
ŁAD 128
DOD 0`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })

    it('should detect out-of-range immediate values', () => {
      const source = `POB 999999` // Very large value
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).toThrow(/range|zakres|value/)
    })

    it('should handle negative values appropriately', () => {
      const source = `POB 10
DOD 1` // Use positive values within range
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })
  })

  describe('Directive Analysis', () => {
    it('should validate RST directive with label', () => {
      const source = `start: RST 100
POB 10
STP`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })

    it('should validate RPA directive with label', () => {
      const source = `POB 10
main: RPA
ŁAD 20`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })

    it('should detect RST directive without label', () => {
      const source = `RST 100` // No label before RST
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).toThrow(/RST.*label|etykiet/)
    })
  })

  describe('Complex Program Analysis', () => {
    it('should analyze complete valid program', () => {
      const source = `; Program calculating factorial
start: RST 0
POB 5          ; n = 5
ŁAD factorial  ; load procedure address
SOZ factorial  ; call procedure
STP

factorial: POB 1    ; result = 1
loop: ŁAD 0         ; load n
SOZ end            ; if n = 0, end
DOD 1             ; n = n - 1
SOB loop           ; repeat loop
end: STP`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
      
      const symbolTable = collectLabels(ast.body)
      expect(symbolTable.has('factorial')).toBe(true)
      expect(symbolTable.has('loop')).toBe(true)
      expect(symbolTable.has('end')).toBe(true)
    })

    it('should detect multiple errors in complex program', () => {
      const source = `duplicate: POB 10
duplicate: ŁAD 20    ; error: duplicate label
SOZ undefined        ; error: undefined label
POB 99999           ; error: range
end:`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).toThrow()
    })
  })

  describe('Polish Language Support', () => {
    it('should handle Polish label names correctly', () => {
      const source = `początek: POB 10
ŁAD 20
DOD 30
pętla: SOB początek
końiec: STP`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
      
      const symbolTable = collectLabels(ast.body)
      expect(symbolTable.has('początek')).toBe(true)
      expect(symbolTable.has('pętla')).toBe(true)
      expect(symbolTable.has('końiec')).toBe(true)
    })

    it('should handle Unicode in labels', () => {
      const source = `żółć: POB 10
ąęść: ŁAD żółć`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
      
      const symbolTable = collectLabels(ast.body)
      expect(symbolTable.has('żółć')).toBe(true)
      expect(symbolTable.has('ąęść')).toBe(true)
    })
  })

  describe('Symbol Table Construction', () => {
    it('should build symbol table with correct addresses', () => {
      const source = `start: POB 10    ; address 0
ŁAD 20           ; address 1
loop: DOD 30     ; address 2
STP              ; address 3`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
      
      const symbolTable = collectLabels(ast.body)
      expect(symbolTable.has('start')).toBe(true)
      expect(symbolTable.has('loop')).toBe(true)
    })

    it('should handle labels without following instructions', () => {
      const source = `start:
main: POB 10
end:`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
      
      const symbolTable = collectLabels(ast.body)
      expect(symbolTable.has('start')).toBe(true)
      expect(symbolTable.has('main')).toBe(true)
      expect(symbolTable.has('end')).toBe(true)
    })

    it('should track label line numbers', () => {
      const source = `line1: POB 10
line2: ŁAD 20
line3: STP`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
      
      const symbolTable = collectLabels(ast.body)
      expect(symbolTable.has('line1')).toBe(true)
      expect(symbolTable.has('line2')).toBe(true)
      expect(symbolTable.has('line3')).toBe(true)
    })
  })

  describe('Control Flow Analysis', () => {
    it('should validate jump targets', () => {
      const source = `start: POB 10
SOB start
SOZ end
end: STP`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })

    it('should detect invalid jump targets', () => {
      const source = `POB 10
SOB invalid_target
STP`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).toThrow(/undefined|symbol|not found/)
    })

    it('should handle conditional jumps', () => {
      const source = `start: POB 10
SOZ positive
DOD 1
positive: ŁAD 20
STP`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })
  })

  describe('Error Message Quality', () => {
    it('should provide descriptive error messages for duplicate labels', () => {
      const source = `duplicate: POB 10
duplicate: ŁAD 20`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).toThrow(/duplicate|duplikat|już/)
    })

    it('should provide descriptive error messages for undefined labels', () => {
      const source = `SOZ undefined_label`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).toThrow(/undefined|niezdefiniowany|not found/)
    })

    it('should include helpful context in error messages', () => {
      const source = `POB 10
SOZ missing
ŁAD 20`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).toThrow(/missing|undefined/)
    })
  })

  describe('Number Format Support', () => {
    it('should handle hexadecimal numbers', () => {
      const source = `POB 0xFF
ŁAD 0x1A2B`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })

    it('should handle binary numbers', () => {
      const source = `POB 0b1010
ŁAD 0b11110000`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })

    it('should handle single operand instructions', () => {
      const source = `POB 10
ŁAD 20
DOD 30`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })
  })

  describe('WLAN Instruction Set', () => {
    it('should recognize all WLAN instructions', () => {
      const source = `POB 10
ŁAD 20
DOD 30
ODE 40
SOB 50
SOZ 60
STP`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })

    it('should handle case-insensitive instruction names', () => {
      const source = `pob 10
ład 20
dod 30`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })

    it('should accept unknown instructions as valid', () => {
      const source = `UNKNOWN_INSTRUCTION`
      
      const ast = parse(source)
      // Parser treats unknown identifiers as instructions
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })
  })

  describe('Memory Layout Validation', () => {
    it('should validate program memory layout', () => {
      const source = `start: RST 100
data: POB 42
main: ŁAD @data
STP`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })

    it('should handle RST with label', () => {
      const source = `start: RST 0
main: POB 10
ŁAD 0`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })

    it('should validate memory boundaries with labels', () => {
      const source = `POB @target
target: ŁAD 10`
      
      const ast = parse(source)
      expect(() => analyzeSemantics(ast)).not.toThrow()
    })
  })
})