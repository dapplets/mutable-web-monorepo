export function filterAndDiscriminate<T>(arr: T[], filterCallback: (item: T) => boolean) {
  const res: [T[], T[]] = [[], []]

  for (var item of arr) {
    res[~~filterCallback(item)].push(item)
  }

  return res
}
