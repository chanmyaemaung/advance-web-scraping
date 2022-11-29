const puppeteer = require('puppeteer')
import { writeFileSync } from 'fs'
import { Browser } from 'puppeteer'

const url = 'https://books.toscrape.com/'

const main = async () => {
	const browser: Browser = await puppeteer.launch()
	const page = await browser.newPage()
	await page.goto(url)
	await page.screenshot({ path: 'book.png' })

	const bookData = await page.evaluate((url) => {
		const bookPods = Array.from(document.querySelectorAll('.product_pod'))

		const convertPrice = (price: string) => {
			return parseFloat(price.replace('£', ''))
		}

		const convertRating = (rating: string) => {
			switch (rating) {
				case 'One':
					return 1
				case 'Two':
					return 2
				case 'Three':
					return 3
				case 'Four':
					return 4
				case 'Five':
					return 5
				default:
					return 0
			}
		}

		const data = bookPods.map((book: any) => ({
			title: book.querySelector('h3 > a').getAttribute('title'),
			price: convertPrice(book.querySelector('.price_color').innerText),
			imgSrc: url + book.querySelector('img').getAttribute('src'),
			rating: convertRating(book.querySelector('.star-rating').classList[1]),
		}))

		return data
	}, url)

	console.log(bookData)

	await browser.close()

	writeFileSync('data.json', JSON.stringify(bookData, null, 2))
}

main()
