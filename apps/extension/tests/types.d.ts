declare global {
  namespace NodeJS {
    interface ProcessEnv {
      IMAP_AUTH_HOST: string
      IMAP_AUTH_USER: string
      IMAP_AUTH_PASS: string
      SECRET_PHRASE: string
    }
  }
}

export {}
