export function getGraph() {
  return fetch('http://localhost:3001/context').then((res) => res.json())
}
