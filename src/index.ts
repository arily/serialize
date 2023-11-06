import { $$i, $$propsOfType, $$kindof, $$text, $$escape, $$decompose, $$slice, $$ts, $$length, $$typeToString, } from 'ts-macros'
import ts from 'typescript';

type Gym<T, K extends keyof T = keyof T> = NonNullable<T[K]> extends object
  ? NonNullable<T[K]> extends readonly any[]
  ? Pick<T, K>
  : ({ [P in keyof Flatten<NonNullable<T[K]>> as `${Extract<K, string | number>}.${Extract<P, string | number>}`]: Flatten<NonNullable<T[K]>>[P] })
  : Pick<T, K>

type Flatten<T extends object> = object extends T
  ? object
  : { [K in keyof T]-?: (x: Gym<T, K>) => void } extends Record<keyof T, (x: infer O) => void>
  ? { [K in keyof O]: O[K] }
  : never


function $serialize<T extends Record<string, any>>(val: T | {}) {
  return +['[]', [$$propsOfType!<T>()], (key: T[keyof T]) => $$ts!($$text!(val) + "." + key)] as unknown as T
}
function $deepSerialize<T extends Record<string, any>>(val: T) {
  type Ret = Flatten<T>
  return +['[]', [$$propsOfType!<Ret>()], (key: Ret[keyof Ret]) => $$ts!($$text!(val) + "." + key)] as unknown as Ret
}

function $deserialize<T extends Record<string, any>>(val: readonly T[keyof T][]) {
  return +['{}', [$$propsOfType!<T>()], (some: T[keyof T]) => ["'" + some + "'", val[$$i!()]]] as unknown as T
}

function $stringify(value: any, root: any): string {
  // Store the array literal in a macro variable
  const $decomposed = $$decompose!(value);
  if ($$kindof!(value) === ts.SyntaxKind.PropertyAccessExpression)
    return $$text!(root) === $$text!($decomposed[0]) ? $stringify!($decomposed[1], null) : $stringify!($decomposed[0], root) + "." + $stringify!($decomposed[1], root);

  else if ($$kindof!(value) === ts.SyntaxKind.CallExpression)
    return $stringify!($decomposed[0], root) + "(" + (+["+", [$$slice!($decomposed, 1)], (part: any) => {
      const $len = $$length!($decomposed) - 2;
      return $stringify!(part, root) + ($$i!() === $len ? "" : ", ");
    }] || "") + ")";

  else if ($$kindof!(value) === ts.SyntaxKind.StringLiteral)
    return "\"" + value + "\"";

  else return $$text!(value);
}

function $offset<T extends Record<string, any>, TFlatten>(root: TFlatten, key: (input: T) => unknown) {
  return +['+', [$$propsOfType!<TFlatten>()], (k: string) => $stringify!($$escape!(key as () => unknown), root) === k ? $$i!() : 0] as unknown as keyof TFlatten
}

interface Extern {
  number: number,
  text: string,
  bool: boolean,
  something: {
    deep: boolean,
    very: {
      deep: string
    }
  }
}

const test: Extern = {
  something: {
    deep: true,
    very: {
      deep: 'very deep indeed'
    }
  },
  number: 12,
  bool: false,
  text: 'not true',
}

const sr1 = $serialize!(test)
const reverse = $deserialize!<typeof sr1>(sr1 as any)

console.log('text =', reverse.number)

const tNotWorking = $deepSerialize!(test)
console.log('t.something.very.deep =', tNotWorking[$offset!<Extern, Flatten<Extern>>(tNotWorking, (t) => t.something.very.deep)])

const t = $serialize!<Flatten<Extern>>(test)
console.log('t.something.very.deep =', t[$offset!<Extern, Flatten<Extern>>(t, (t) => t.something.very.deep)])
