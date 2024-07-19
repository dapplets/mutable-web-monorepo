type MemoizedFunction<T, R> = (arg: T) => R

export const memoize =
  <T, R>(fn: MemoizedFunction<T, R>, map = new Map<T, R | MemoizedFunction<T, R>>()) =>
  (arg: T): R | MemoizedFunction<T, R> => {
    const inCache = map.has(arg)

    if (!inCache) {
      map.set(arg, fn(arg))
    }

    return map.get(arg) as R | MemoizedFunction<T, R>
  }
