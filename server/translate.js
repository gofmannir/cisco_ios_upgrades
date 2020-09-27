
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const { json } = require('body-parser');


var browser = ''


async function launch(){
	console.log("Opening browser..")
	browser = await puppeteer.launch({headless: true, args: ["--no-sandbox"]})
}

const translate = async (text) => {
	let page = await browser.newPage()
	await page.goto('https://translate.google.co.il/?hl=iw&tab=wT')
	var text1 = `${text}`

	let html = await page.content()
	var $ = cheerio.load(html, {decodeEntities: false})

	await page.waitForSelector('#source')
	const bodyHandle = await page.$('body');
	await page.evaluate((d) => {
		return document.querySelector('#source').value = d
	}, text1)

	let txt = ''
	let timer = setInterval(async () => {
		html = await page.content()
		$ = cheerio.load(html, {decodeEntities: false})
		txt = $('span.translation span').text()
		if(txt != ''){
			console.log("Translation:", txt)
			clearInterval(timer)
			fs.appendFileSync('translations.txt', `${text1}---${txt}\n`)
			process.exit(0)
		}
	}, 500)
}

var myArgs = process.argv.slice(2);

(async () => {
	await launch()
	await translate(myArgs[0])
})()