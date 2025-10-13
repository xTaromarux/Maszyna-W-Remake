import { describe, it, expect } from 'vitest'
import { parse } from '@/WLAN/parser'
import type { ProgramAst, InstructionNode, LabelDefinitionNode, DirectiveNode } from '@/WLAN/model'

describe('WLAN Parser', () => {
  describe('Basic Program Parsing', () => {
    it('should parse empty program', () => {
      const source = ''
      const ast = parse(source)
      
      expect(ast).toMatchObject({
        type: 'Program',
        body: []
      })
    })

    it('should parse simple instructions', () => {
      const source = `POB 10
ŁAD 20
DOD -5`
      
      const ast = parse(source)
      expect(ast.body).toHaveLength(3)
      expect(ast.body[0]).toMatchObject({
        type: 'Instruction',
        name: 'POB',
        operands: [{ type: 'Immediate', value: 10 }]
      })
      expect(ast.body[1]).toMatchObject({
        type: 'Instruction',
        name: 'ŁAD',
        operands: [{ type: 'Immediate', value: 20 }]
      })
      expect(ast.body[2]).toMatchObject({
        type: 'Instruction',
        name: 'DOD',
        operands: [{ type: 'Immediate', value: -5 }]
      })
    })
  })

  describe('Label Definitions', () => {
    it('should parse label definitions', () => {
      const source = `start: POB 10
loop: ŁAD 20
end:`
      
      const ast = parse(source)
      expect(ast.body).toHaveLength(5) // label + instruction + label + instruction + label
      
      const startLabel = ast.body[0] as LabelDefinitionNode
      expect(startLabel).toMatchObject({
        type: 'LabelDefinition',
        name: 'start',
        line: 1
      })
      
      const loopLabel = ast.body[2] as LabelDefinitionNode
      expect(loopLabel).toMatchObject({
        type: 'LabelDefinition',
        name: 'loop',
        line: 2
      })
    })

    it('should parse labels with unicode names', () => {
      const source = `początek: POB 10
pętla: ŁAD 20`
      
      const ast = parse(source)
      expect(ast.body[0]).toMatchObject({
        type: 'LabelDefinition',
        name: 'początek'
      })
      expect(ast.body[2]).toMatchObject({
        type: 'LabelDefinition',
        name: 'pętla'
      })
    })
  })

  describe('Instructions with Operands', () => {
    it('should parse immediate operands', () => {
      const source = `POB 10, 20, -5`
      
      const ast = parse(source)
      const instruction = ast.body[0] as InstructionNode
      
      expect(instruction.operands).toHaveLength(3)
      expect(instruction.operands[0]).toMatchObject({
        type: 'Immediate',
        value: 10
      })
      expect(instruction.operands[1]).toMatchObject({
        type: 'Immediate',
        value: 20
      })
      expect(instruction.operands[2]).toMatchObject({
        type: 'Immediate',
        value: -5
      })
    })

    it('should parse label references', () => {
      const source = `JMP start, loop, end`
      
      const ast = parse(source)
      const instruction = ast.body[0] as InstructionNode
      
      expect(instruction.operands).toHaveLength(3)
      expect(instruction.operands[0]).toMatchObject({
        type: 'LabelRef',
        name: 'start'
      })
      expect(instruction.operands[1]).toMatchObject({
        type: 'LabelRef',
        name: 'loop'
      })
      expect(instruction.operands[2]).toMatchObject({
        type: 'LabelRef',
        name: 'end'
      })
    })

    it('should parse register operands', () => {
      const source = `MOV A, S, L`
      
      const ast = parse(source)
      const instruction = ast.body[0] as InstructionNode
      
      expect(instruction.operands).toEqual([
        expect.objectContaining({ type: 'Register', name: 'A' }),
        expect.objectContaining({ type: 'Register', name: 'S' }),
        expect.objectContaining({ type: 'Register', name: 'L' })
      ])
    })

    it('should parse mixed operand types', () => {
      const source = `INST 10, start, A, -5`
      
      const ast = parse(source)
      const instruction = ast.body[0] as InstructionNode
      
      expect(instruction.operands).toEqual([
        expect.objectContaining({ type: 'Immediate', value: 10 }),
        expect.objectContaining({ type: 'LabelRef', name: 'start' }),
        expect.objectContaining({ type: 'Register', name: 'A' }),
        expect.objectContaining({ type: 'Immediate', value: -5 })
      ])
    })
  })

  describe('Memory Address References', () => {
    it('should parse memory address references with @', () => {
      const source = `POB @memory, @start`
      
      const ast = parse(source)
      const instruction = ast.body[0] as InstructionNode
      
      expect(instruction.operands).toEqual([
        expect.objectContaining({ type: 'LabelRef', name: 'memory' }),
        expect.objectContaining({ type: 'LabelRef', name: 'start' })
      ])
    })

    it('should parse memory references in complex expressions', () => {
      const source = `ŁAD @start, 42, @end`
      
      const ast = parse(source)
      const instruction = ast.body[0] as InstructionNode
      
      expect(instruction.operands).toEqual([
        expect.objectContaining({ type: 'LabelRef', name: 'start' }),
        expect.objectContaining({ type: 'Immediate', value: 42 }),
        expect.objectContaining({ type: 'LabelRef', name: 'end' })
      ])
    })
  })

  describe('Directives', () => {
    it('should parse RST directive', () => {
      const source = `RST 100`
      
      const ast = parse(source)
      const directive = ast.body[0] as DirectiveNode
      
      expect(directive).toMatchObject({
        type: 'Directive',
        name: 'RST',
        operands: [{ type: 'Immediate', value: 100 }]
      })
    })

    it('should parse RPA directive', () => {
      const source = `RPA`
      
      const ast = parse(source)
      const directive = ast.body[0] as DirectiveNode
      
      expect(directive).toMatchObject({
        type: 'Directive',
        name: 'RPA',
        operands: []
      })
    })
  })

  describe('Number Formats', () => {
    it('should parse decimal numbers', () => {
      const source = `POB 123, -456, 0`
      
      const ast = parse(source)
      const instruction = ast.body[0] as InstructionNode
      
      expect(instruction.operands).toEqual([
        expect.objectContaining({ type: 'Immediate', value: 123 }),
        expect.objectContaining({ type: 'Immediate', value: -456 }),
        expect.objectContaining({ type: 'Immediate', value: 0 })
      ])
    })

    it('should parse hexadecimal numbers', () => {
      const source = `POB 0xFF, 0x1A2B, 0x0`
      
      const ast = parse(source)
      const instruction = ast.body[0] as InstructionNode
      
      expect(instruction.operands).toEqual([
        expect.objectContaining({ type: 'Immediate', value: 255 }),
        expect.objectContaining({ type: 'Immediate', value: 0x1A2B }),
        expect.objectContaining({ type: 'Immediate', value: 0 })
      ])
    })

    it('should parse binary numbers', () => {
      const source = `POB 0b1010, 0b11110000, 0b0`
      
      const ast = parse(source)
      const instruction = ast.body[0] as InstructionNode
      
      expect(instruction.operands).toEqual([
        expect.objectContaining({ type: 'Immediate', value: 10 }),
        expect.objectContaining({ type: 'Immediate', value: 240 }),
        expect.objectContaining({ type: 'Immediate', value: 0 })
      ])
    })
  })

  describe('Complex Programs', () => {
    it('should parse program with labels and instructions', () => {
      const source = `start: POB 10
loop: ŁAD 20, start
end:`
      
      const ast = parse(source)
      expect(ast.body).toHaveLength(5) // label + instruction + label + instruction + label
      
      expect(ast.body[0]).toMatchObject({ type: 'LabelDefinition', name: 'start' })
      expect(ast.body[1]).toMatchObject({ type: 'Instruction', name: 'POB' })
      expect(ast.body[2]).toMatchObject({ type: 'LabelDefinition', name: 'loop' })
      expect(ast.body[3]).toMatchObject({ type: 'Instruction', name: 'ŁAD' })
      expect(ast.body[4]).toMatchObject({ type: 'LabelDefinition', name: 'end' })
    })

    it('should parse program with mixed content', () => {
      const source = `; komentarz
start: POB 10, 20
RST 0xFF
loop: ŁAD start, @memory
RPA
end:`
      
      const ast = parse(source)
      expect(ast.body.length).toBeGreaterThan(4)
      
      // Sprawdź różne typy węzłów
      const labelNodes = ast.body.filter(node => node.type === 'LabelDefinition')
      const instructionNodes = ast.body.filter(node => node.type === 'Instruction')
      const directiveNodes = ast.body.filter(node => node.type === 'Directive')
      
      expect(labelNodes.length).toBeGreaterThanOrEqual(2)
      expect(instructionNodes.length).toBeGreaterThanOrEqual(1)
      expect(directiveNodes.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Error Handling', () => {
    it('should handle syntax errors gracefully', () => {
      const invalidSources = [
        'POB 10 20', // missing comma
        ':', // empty label
        '@incomplete @invalid', // malformed @ references
      ]

      for (const source of invalidSources) {
        expect(() => parse(source)).toThrow()
      }
    })

    it('should provide meaningful error messages', () => {
      expect(() => parse('POB 10 20')).toThrow(/unexpected|token|przecinek/)
      expect(() => parse('@incomplete')).toThrow(/Nieoczekiwany|token/)
    })

    it('should handle unexpected tokens', () => {
      expect(() => parse('123')).toThrow(/Nieoczekiwany token/)
      expect(() => parse('$invalid')).toThrow(/Nieznany znak/)
    })
  })

  describe('Comments and Whitespace', () => {
    it('should ignore comments in parsing', () => {
      const source = `; this is a comment
start: POB 10 // another comment
; yet another comment
ŁAD 20`
      
      const ast = parse(source)
      
      // Comments should be ignored, only actual instructions parsed
      expect(ast.body.length).toBe(3) // label, instruction, instruction
      expect(ast.body[0]).toMatchObject({ type: 'LabelDefinition', name: 'start' })
    })

    it('should handle multiple newlines and whitespace', () => {
      const source = `

      start:    POB   10   ,   20


      end:

      `
      
      const ast = parse(source)
      expect(ast.body).toHaveLength(3) // label, instruction, label
    })
  })

  describe('Line Number Tracking', () => {
    it('should track line numbers correctly', () => {
      const source = `start: POB 10
loop: ŁAD 20
end: DOD 30`
      
      const ast = parse(source)
      
      expect(ast.body[0]).toMatchObject({ line: 1 }) // start label
      expect(ast.body[1]).toMatchObject({ line: 1 }) // first instruction
      expect(ast.body[2]).toMatchObject({ line: 2 }) // loop label
      expect(ast.body[3]).toMatchObject({ line: 2 }) // second instruction
      expect(ast.body[4]).toMatchObject({ line: 3 }) // end label
      expect(ast.body[5]).toMatchObject({ line: 3 }) // third instruction
    })

    it('should track line numbers with comments', () => {
      const source = `; comment line 1
start: POB 10 // comment
; comment line 3
end: ŁAD 20`
      
      const ast = parse(source)
      
      const startLabel = ast.body.find(node => 
        node.type === 'LabelDefinition' && node.name === 'start'
      )
      const endLabel = ast.body.find(node => 
        node.type === 'LabelDefinition' && node.name === 'end'
      )
      
      expect(startLabel).toMatchObject({ line: 2 })
      expect(endLabel).toMatchObject({ line: 4 })
    })
  })

  describe('Instruction Name Normalization', () => {
    it('should normalize instruction names to uppercase', () => {
      const source = `pob 10
ład 20
dod 30`
      
      const ast = parse(source)
      
      expect(ast.body[0]).toMatchObject({ name: 'POB' })
      expect(ast.body[1]).toMatchObject({ name: 'ŁAD' })
      expect(ast.body[2]).toMatchObject({ name: 'DOD' })
    })

    it('should handle mixed case instructions', () => {
      const source = `PoB 10
ŁaD 20
DoD 30`
      
      const ast = parse(source)
      
      expect(ast.body[0]).toMatchObject({ name: 'POB' })
      expect(ast.body[1]).toMatchObject({ name: 'ŁAD' })
      expect(ast.body[2]).toMatchObject({ name: 'DOD' })
    })
  })

  describe('Register Recognition', () => {
    it('should recognize all valid registers', () => {
      const source = `MOV A, S, L, I, AK, PC, IR`
      
      const ast = parse(source)
      const instruction = ast.body[0] as InstructionNode
      
      expect(instruction.operands).toEqual([
        expect.objectContaining({ type: 'Register', name: 'A' }),
        expect.objectContaining({ type: 'Register', name: 'S' }),
        expect.objectContaining({ type: 'Register', name: 'L' }),
        expect.objectContaining({ type: 'Register', name: 'I' }),
        expect.objectContaining({ type: 'Register', name: 'AK' }),
        expect.objectContaining({ type: 'Register', name: 'PC' }),
        expect.objectContaining({ type: 'Register', name: 'IR' })
      ])
    })

    it('should handle case-insensitive register names', () => {
      const source = `MOV a, s, ak, pc`
      
      const ast = parse(source)
      const instruction = ast.body[0] as InstructionNode
      
      expect(instruction.operands).toEqual([
        expect.objectContaining({ type: 'Register', name: 'A' }),
        expect.objectContaining({ type: 'Register', name: 'S' }),
        expect.objectContaining({ type: 'Register', name: 'AK' }),
        expect.objectContaining({ type: 'Register', name: 'PC' })
      ])
    })
  })

  describe('WLAN Specific Instructions', () => {
    it('should parse all common WLAN instructions', () => {
      const source = `POB 10
ŁAD 20
DOD 30
ODE 40
SOB 50
SOZ 60
STP`
      
      const ast = parse(source)
      
      expect(ast.body[0]).toMatchObject({ type: 'Instruction', name: 'POB' })
      expect(ast.body[1]).toMatchObject({ type: 'Instruction', name: 'ŁAD' })
      expect(ast.body[2]).toMatchObject({ type: 'Instruction', name: 'DOD' })
      expect(ast.body[3]).toMatchObject({ type: 'Instruction', name: 'ODE' })
      expect(ast.body[4]).toMatchObject({ type: 'Instruction', name: 'SOB' })
      expect(ast.body[5]).toMatchObject({ type: 'Instruction', name: 'SOZ' })
      expect(ast.body[6]).toMatchObject({ type: 'Instruction', name: 'STP' })
    })

    it('should parse instructions without operands', () => {
      const source = `STP
RPA`
      
      const ast = parse(source)
      
      expect(ast.body[0]).toMatchObject({ 
        type: 'Instruction', 
        name: 'STP',
        operands: []
      })
      expect(ast.body[1]).toMatchObject({ 
        type: 'Directive', 
        name: 'RPA',
        operands: []
      })
    })
  })
})