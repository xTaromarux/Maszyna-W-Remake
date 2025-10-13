import { lex } from './src/WLAN/lexer.ts'

console.log('=== Test tokenizacji: "10; -5; 0xFF;" ===')
const result = lex('10; -5; 0xFF;')
console.log('Liczba tokenów:', result.length)
result.forEach((token, i) => {
  console.log(`Token ${i}:`, JSON.stringify(token, null, 2))
})

console.log('\n=== Test tokenizacji: "start: 10;" ===')
const result2 = lex('start: 10;')
console.log('Liczba tokenów:', result2.length)
result2.forEach((token, i) => {
  console.log(`Token ${i}:`, JSON.stringify(token, null, 2))
})

console.log('\n=== Test tokenizacji: ": ; , @" ===')
const result3 = lex(': ; , @')
console.log('Liczba tokenów:', result3.length)
result3.forEach((token, i) => {
  console.log(`Token ${i}:`, JSON.stringify(token, null, 2))
})