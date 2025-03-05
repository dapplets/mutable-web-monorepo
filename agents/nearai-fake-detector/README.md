## Run

```sh
nearai agent task dapplets.near/nearai-fake-detector/0.0.1 "{'context':{'namespace':'dapplets.near/parser/twitter','contextType':'post','id':'1234567890123456789','parsedContext':{'text':'This is a sample post containing some text for demonstration purposes.','authorFullname':'John Doe','authorUsername':'john_doe','authorImg':'https://example.com/image.png','createdAt':'2025-02-19T20:33:29.000Z','url':'https://twitter.com/john_doe/status/1234567890123456789'}}}" --local

nearai agent interactive dapplets.near/nearai-fake-detector/0.0.1  --local

nearai registry upload dapplets.near/nearai-fake-detector/0.0.1     
```