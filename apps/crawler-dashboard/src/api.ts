const apiUrl = process.env.REACT_APP_API_URL ?? 'http://localhost:3001'

export function getGraph() {
  return fetch(`${apiUrl}/context`).then((res) => res.json())
}
