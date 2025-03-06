import { Page } from 'puppeteer'

export async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      var totalHeight = 0
      var distance = 100
      var timer = setInterval(() => {
        // @ts-ignore
        var scrollHeight = document.body.scrollHeight
        // @ts-ignore
        window.scrollBy(0, distance)
        totalHeight += distance

        // @ts-ignore
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer)
          resolve()
        }
      }, 100)
    })
  })
}
