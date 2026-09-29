/**
 * A tiny, safe arithmetic evaluator for the calculate tool (no eval).
 * Supports + - * / % ^, parentheses, unary minus, constants (pi, e), common functions,
 * "18% of 2450" and thousands separators like "2,450".
 */
const FUNCTIONS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp
}

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E }

export function evaluateExpression(input: string): number {
  const source = input
    .toLowerCase()
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\*\*/g, '^')
    .replace(/(\d),(?=\d{3}(?!\d))/g, '$1') // 2,450 -> 2450
    .replace(/(\d+(?:\.\d+)?)\s*%\s*of\s*/g, '($1/100)*') // 18% of x -> (18/100)*x
  let pos = 0

  const peek = () => source[pos]
  const skipSpaces = () => {
    while (peek() === ' ') pos++
  }
  const fail = (message: string): never => {
    throw new Error(`${message} at position ${pos + 1}`)
  }

  // expression := term (('+' | '-') term)*
  function expression(): number {
    let value = term()
    for (;;) {
      skipSpaces()
      if (peek() === '+') {
        pos++
        value += term()
      } else if (peek() === '-') {
        pos++
        value -= term()
      } else return value
    }
  }

  // term := unary (('*' | '/' | '%') unary)*
  function term(): number {
    let value = unary()
    for (;;) {
      skipSpaces()
      const op = peek()
      if (op === '*' || op === '/' || op === '%') {
        pos++
        const right = unary()
        value = op === '*' ? value * right : op === '/' ? value / right : value % right
      } else return value
    }
  }

  // unary := ('-' | '+') unary | power   (so -2^2 is -(2^2))
  function unary(): number {
    skipSpaces()
    if (peek() === '-') {
      pos++
      return -unary()
    }
    if (peek() === '+') {
      pos++
      return unary()
    }
    return power()
  }

  // power := primary ('^' unary)?   (right associative)
  function power(): number {
    const base = primary()
    skipSpaces()
    if (peek() === '^') {
      pos++
      return base ** unary()
    }
    return base
  }

  function primary(): number {
    skipSpaces()
    const char = peek()

    if (char === '(') {
      pos++
      const value = expression()
      skipSpaces()
      if (peek() !== ')') fail('Expected ")"')
      pos++
      return value
    }

    const number = /^\d*\.?\d+(?:e[+-]?\d+)?/.exec(source.slice(pos))
    if (number) {
      pos += number[0].length
      return Number(number[0])
    }

    const name = /^[a-z]+/.exec(source.slice(pos))
    if (name) {
      pos += name[0].length
      const constant = CONSTANTS[name[0]]
      if (constant !== undefined) return constant
      const fn = FUNCTIONS[name[0]]
      if (!fn) fail(`Unknown name "${name[0]}"`)
      return fn!(primary())
    }

    return fail(char === undefined ? 'Unexpected end of expression' : `Unexpected "${char}"`)
  }

  const value = expression()
  skipSpaces()
  if (pos < source.length) fail(`Unexpected "${peek()}"`)
  if (!Number.isFinite(value)) throw new Error('The result is not a finite number')
  return value
}
