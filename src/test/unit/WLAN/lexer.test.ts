import { describe, it, expect } from 'vitest'
import { lex as tokenize } from '@/WLAN/lexer'

describe('WLAN Lexer', () => {
  describe('Basic Tokenization', () => {
    it('should tokenize numbers correctly', () => {
      const source = `10\n-5\n0xFF`

      const tokens = tokenize(source)
      
      expect(tokens).toHaveLength(5) // num, newline, num, newline, num
      expect(tokens[0]).toMatchObject({
        type: 'NUMBER',
        text: '10',
        line: 1,
        col: 1
      })
      expect(tokens[1]).toMatchObject({
        type: 'NEWLINE',
        text: '\n',
        line: 1,
        col: 3
      })
      expect(tokens[2]).toMatchObject({
        type: 'NUMBER',
        text: '-5',
        line: 2,
        col: 1
      })
    })

    it('should handle whitespace and newlines correctly', () => {
      const source = `  10    \n  \n  20  `

      const tokens = tokenize(source)
      
      expect(tokens[0]).toMatchObject({
        type: 'NUMBER',
        line: 1,
        col: 3
      })
      expect(tokens[1]).toMatchObject({
        type: 'NEWLINE',
        line: 1
      })
      expect(tokens[2]).toMatchObject({
        type: 'NEWLINE',
        line: 2
      })
      expect(tokens[3]).toMatchObject({
        type: 'NUMBER',
        text: '20',
        line: 3,
        col: 3
      })
    })
  })

  describe('Numbers', () => {
    it('should tokenize positive integers', () => {
      const tokens = tokenize('123')
      expect(tokens[0]).toMatchObject({
        type: 'NUMBER',
        text: '123'
      })
    })

    it('should tokenize negative integers', () => {
      const tokens = tokenize('-456')
      expect(tokens[0]).toMatchObject({
        type: 'NUMBER',
        text: '-456'
      })
    })

    it('should tokenize hexadecimal numbers', () => {
      const tokens = tokenize('0xFF 0x1A2B')
      expect(tokens[0]).toMatchObject({
        type: 'NUMBER',
        text: '0xFF'
      })
      expect(tokens[1]).toMatchObject({
        type: 'NUMBER',
        text: '0x1A2B'
      })
    })

    it('should tokenize binary numbers', () => {
      const tokens = tokenize('0b1010 0b11110000')
      expect(tokens[0]).toMatchObject({
        type: 'NUMBER',
        text: '0b1010'
      })
      expect(tokens[1]).toMatchObject({
        type: 'NUMBER',
        text: '0b11110000'
      })
    })
  })

  describe('Identifiers', () => {
    it('should tokenize identifiers', () => {
      const tokens = tokenize('myVariable test123 _private')
      expect(tokens).toEqual([
        expect.objectContaining({ type: 'IDENT', text: 'myVariable' }),
        expect.objectContaining({ type: 'IDENT', text: 'test123' }),
        expect.objectContaining({ type: 'IDENT', text: '_private' })
      ])
    })

    it('should handle labels with colons', () => {
      const tokens = tokenize('start: 10')
      expect(tokens).toEqual([
        expect.objectContaining({ type: 'IDENT', text: 'start' }),
        expect.objectContaining({ type: 'COLON', text: ':' }),
        expect.objectContaining({ type: 'NUMBER', text: '10' })
      ])
    })

    it('should handle unicode identifiers', () => {
      const tokens = tokenize('zmienna1 ąę_test')
      expect(tokens).toEqual([
        expect.objectContaining({ type: 'IDENT', text: 'zmienna1' }),
        expect.objectContaining({ type: 'IDENT', text: 'ąę_test' })
      ])
    })
  })

  describe('Comments', () => {
    it('should skip line comments with //', () => {
      const source = `10 // this is a comment
20 // another comment`
      
      const tokens = tokenize(source)
      expect(tokens).toEqual([
        expect.objectContaining({ type: 'NUMBER', text: '10' }),
        expect.objectContaining({ type: 'NEWLINE' }),
        expect.objectContaining({ type: 'NUMBER', text: '20' })
      ])
    })

    it('should skip line comments with semicolon', () => {
      const source = `10 ; this is a comment
20`
      
      const tokens = tokenize(source)
      expect(tokens).toEqual([
        expect.objectContaining({ type: 'NUMBER', text: '10' }),
        expect.objectContaining({ type: 'NEWLINE' }),
        expect.objectContaining({ type: 'NUMBER', text: '20' })
      ])
    })
  })

  describe('Symbols', () => {
    it('should tokenize colons and commas', () => {
      const source = ': , @'
      const tokens = tokenize(source)

      expect(tokens).toEqual([
        expect.objectContaining({ type: 'COLON', text: ':' }),
        expect.objectContaining({ type: 'COMMA', text: ',' }),
        expect.objectContaining({ type: 'AT', text: '@' })
      ])
    })

    it('should recognize semicolon as comment starter', () => {
      const source = '10 ; comment'
      const tokens = tokenize(source)

      // Should only get the number, semicolon starts comment
      expect(tokens).toEqual([
        expect.objectContaining({ type: 'NUMBER', text: '10' })
      ])
    })
  })

  describe('Error Handling', () => {
    it('should handle unknown characters gracefully', () => {
      expect(() => tokenize('10 $ 20')).toThrow('Nieznany znak')
    })

    it('should handle empty source', () => {
      const tokens = tokenize('')
      expect(tokens).toEqual([])
    })

    it('should handle whitespace-only source', () => {
      const tokens = tokenize('   \n  \t  \n  ')
      expect(tokens).toEqual([
        expect.objectContaining({ type: 'NEWLINE' }),
        expect.objectContaining({ type: 'NEWLINE' })
      ])
    })
  })

  describe('Position Tracking', () => {
    it('should track line and column positions correctly', () => {
      const source = `start: 10
next: 20
end: 30`

      const tokens = tokenize(source)
      
      // Check specific positions
      const startToken = tokens.find(t => t.text === 'start')
      expect(startToken).toMatchObject({
        line: 1,
        col: 1
      })
      
      const nextToken = tokens.find(t => t.text === 'next')
      expect(nextToken).toMatchObject({
        line: 2,
        col: 1
      })
      
      const endToken = tokens.find(t => t.text === 'end')
      expect(endToken).toMatchObject({
        line: 3,
        col: 1
      })
    })

    it('should track position after unicode characters', () => {
      const source = 'ąę ść'
      const tokens = tokenize(source)
      
      expect(tokens[0]).toMatchObject({
        type: 'IDENT',
        text: 'ąę',
        line: 1,
        col: 1
      })
      expect(tokens[1]).toMatchObject({
        type: 'IDENT',
        text: 'ść',
        line: 1,
        col: 4
      })
    })
  })

  describe('Complex Expressions', () => {
    it('should tokenize memory addresses', () => {
      const source = '@100 @label'
      const tokens = tokenize(source)
      
      expect(tokens).toEqual([
        expect.objectContaining({ type: 'AT', text: '@' }),
        expect.objectContaining({ type: 'NUMBER', text: '100' }),
        expect.objectContaining({ type: 'AT', text: '@' }),
        expect.objectContaining({ type: 'IDENT', text: 'label' })
      ])
    })

    it('should handle complex program structure', () => {
      const source = `start: 10, 20
@100: -5
; comment line
end:`
      
      const tokens = tokenize(source)
      expect(tokens.length).toBeGreaterThan(8)
      expect(tokens).toContainEqual(expect.objectContaining({ type: 'IDENT', text: 'start' }))
      expect(tokens).toContainEqual(expect.objectContaining({ type: 'COMMA', text: ',' }))
      expect(tokens).toContainEqual(expect.objectContaining({ type: 'AT', text: '@' }))
      expect(tokens).toContainEqual(expect.objectContaining({ type: 'IDENT', text: 'end' }))
    })
  })

  describe('Instruction-like Patterns', () => {
    it('should tokenize WLAN instruction patterns', () => {
      const source = 'POB 10\nŁAD 20\nDOD -5'
      const tokens = tokenize(source)
      
      expect(tokens).toEqual([
        expect.objectContaining({ type: 'IDENT', text: 'POB' }),
        expect.objectContaining({ type: 'NUMBER', text: '10' }),
        expect.objectContaining({ type: 'NEWLINE' }),
        expect.objectContaining({ type: 'IDENT', text: 'ŁAD' }),
        expect.objectContaining({ type: 'NUMBER', text: '20' }),
        expect.objectContaining({ type: 'NEWLINE' }),
        expect.objectContaining({ type: 'IDENT', text: 'DOD' }),
        expect.objectContaining({ type: 'NUMBER', text: '-5' })
      ])
    })

    it('should handle labels in program structure', () => {
      const source = `początek: POB 10
pętla: ŁAD główny
skok: DOD końcowy`
      
      const tokens = tokenize(source)
      
      expect(tokens).toContainEqual(expect.objectContaining({ type: 'IDENT', text: 'początek' }))
      expect(tokens).toContainEqual(expect.objectContaining({ type: 'COLON', text: ':' }))
      expect(tokens).toContainEqual(expect.objectContaining({ type: 'IDENT', text: 'POB' }))
      expect(tokens).toContainEqual(expect.objectContaining({ type: 'IDENT', text: 'pętla' }))
      expect(tokens).toContainEqual(expect.objectContaining({ type: 'IDENT', text: 'główny' }))
    })
  })
})