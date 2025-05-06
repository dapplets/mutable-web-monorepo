import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const NEAR_NOMINATION_EXP = 24

// Pre-calculate offsets used for rounding to different number of digits
const ROUNDING_OFFSETS: bigint[] = []
const BN10 = 10n
for (let i = 0, offset = 5n; i < NEAR_NOMINATION_EXP; i++, offset = offset * BN10) {
  ROUNDING_OFFSETS[i] = offset
}

function trimTrailingZeroes(value: string): string {
  return value.replace(/\.?0*$/, '')
}

function formatWithCommas(value: string): string {
  const pattern = /(-?\d+)(\d{3})/
  while (pattern.test(value)) {
    value = value.replace(pattern, '$1,$2')
  }
  return value
}

export function formatNearAmount(
  balance: string,
  fracDigits: number = NEAR_NOMINATION_EXP
): string {
  let balanceBN = BigInt(balance)
  if (fracDigits !== NEAR_NOMINATION_EXP) {
    // Adjust balance for rounding at given number of digits
    const roundingExp = NEAR_NOMINATION_EXP - fracDigits - 1
    if (roundingExp > 0) {
      balanceBN += ROUNDING_OFFSETS[roundingExp]
    }
  }

  balance = balanceBN.toString()
  const wholeStr = balance.substring(0, balance.length - NEAR_NOMINATION_EXP) || '0'
  const fractionStr = balance
    .substring(balance.length - NEAR_NOMINATION_EXP)
    .padStart(NEAR_NOMINATION_EXP, '0')
    .substring(0, fracDigits)

  return trimTrailingZeroes(`${formatWithCommas(wholeStr)}.${fractionStr}`)
}
