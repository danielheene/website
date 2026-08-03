import { FieldHook } from 'payload'

import { isArray, isString } from 'lodash-es'

const isFlagOperator = (value: unknown): value is string => isString(value) && /^[+|-]/.test(value)

export const processIncomingFlags: FieldHook = async ({
  previousValue,
  value,
}: {
  previousValue?: string[]
  value?: string[]
}): Promise<string[]> => {
  const incomingFlagOperators = isArray(value) && value.filter(isFlagOperator) ? value : []
  const currentFlags = isArray(previousValue) && previousValue.every(isString) ? previousValue : []

  return incomingFlagOperators
    .reduce((prev, curr) => {
      const op = curr.substring(0, 1)
      const flag = curr.substring(1)

      if (op === '+') return prev.concat(flag)
      if (op === '-') return prev.filter((f) => f !== flag)
      return prev
    }, currentFlags)
    .filter((flag, index, array) => array.indexOf(flag) === index)
}
