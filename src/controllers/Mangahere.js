const got = require('got')
const cheerio = require('cheerio')
const puppeteer = require('puppeteer')

async function search(name, page = 1) {
    try {
        const keyword = name.replace(/[ ]+/g, '+')
        let list = []
        const response = await got(
            `https://www.mangahere.cc/search?page=${page}&title=${keyword}`,
            {
                responseType: 'text',
                resolveBodyOnly: true
            }
        )
        let resultDiv = response.match(/(?<=(<div class="manga-list-4 mt15"> ))[\s\S]*<\/ul>/g)
        if (resultDiv) {
            let listDiv = resultDiv[0]
            const $ = cheerio.load(listDiv)
            const li = $('li')
            let href = []
            let cover = ''
            let lastChapter = {}
            li.each((index, item) => {
                href = $(item).children('a').attr()
                cover = $(item).children('a').children('img').attr('src')
                lastChapter = $(item).children('.manga-list-4-item-tip').eq(1).children('a').attr()
                list.push({
                    link: `https://www.mangahere.cc${href.href}`,
                    title: href.title,
                    cover: cover,
                    lastChapter: lastChapter.title,
                    lastChapterLink: `https://www.mangahere.cc${lastChapter.href}`
                })
            })
        }
        return ([
            {
                total: list.length,
                nextPos: list.length ? page + 1 : null
            },
            ...list
        ])
    } catch (err) {
        return err
    }
}

async function getInfo(link) {
    try {
        const response = await got(link, {
            responseType: 'text',
            resolveBodyOnly: true
        })
        const $ = cheerio.load(response)
        const title = $('.detail-info-right-title-font').text()
        const author = $('.detail-info-right-say > a').text()
        const status = $('.detail-info-right-title-tip').text()
        const tags = $('.detail-info-right-tag-list > a')
                        .map((i, elm) => $(elm).attr('title'))
                        .get()
        const shortDetail = $('.detail-info-right-content').text()
        const fullDetail = $('.fullcontent').text()
        const chapters = $('.detail-main-list > li')
                            .map((i, elm) => {
                                return ({
                                    link: $(elm).children('a').attr('href'),
                                    title: $(elm).children('a').attr('title'),
                                    update: $(elm).children('a').find('.title2').text()
                                })
                            })
                            .get()
        return {
            title: title,
            author: author,
            status: status,
            tags: tags,
            shortDetail: shortDetail,
            fullDetail: fullDetail,
            chapters: chapters
        }
    } catch (err) {
        return err
    }
}

async function getPages(link) {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
        const page = await browser.newPage()
        await page.goto(link)
        const dom = await page.content()
        const $ = await cheerio.load(dom)
        const count = parseInt($('.pager-list-left > span').eq(0).children().eq(-2).text()) - 1
        const image = $('.reader-main-img').attr('src')
        let images = []
        const firstPage = parseInt(image.match(/[\d]+(?=(\.jpg))/)[0])
        for (let i = 0; i < count; i++) {
            let pageNo = `${firstPage + i}`.padStart(3, '0')
            let link = `https:${image.replace(/[\d]+(?=(\.jpg))/, pageNo)}`
            images.push(link)
        }
        await browser.close()
        return {
            count: count,
            images: images,
        }
    } catch (err) {
        return err
    }
}

module.exports = {
    search: (name, page) => search(name, page),
    getInfo: link => getInfo(link),
    getPages: link => getPages(link)
}