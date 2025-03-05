import express from 'express'
import bodyParser from 'body-parser'
import { handler } from './handler'

const app = express()
const port = 8080

app.use(bodyParser.json())

app.post('/', async (req, res) => {
  try {
    const result = await handler(req.body)
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).send(error)
  }
})

app.get('/_/health', (_, res) => {
  res.send('OK')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
