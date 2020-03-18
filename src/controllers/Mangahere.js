const got = require('got')
const cheerio = require('cheerio')
const axios = require('axios')

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
                nextPos: list.length ? parseInt(page) + 1 : null
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

        const html = await got(`https://mangahere.cc${link}`)
        let cookies = html.headers['set-cookie']
        const $ = await cheerio.load(html.body)
        const count = html.body.match(/(?<=(var imagecount=))[\d]+(?=\;)/)[0]
        const cid = html.body.match(/(?<=(var chapterid =))[\d]+(?=\;)/)[0]
        const url = link.match(/^.+\/(?=(\d+\.html))/)[0]
        const key = html.body.match(/(eval\(function).+(\}\)\))/)[0]
        const dmkey = eval(key)[0].attribs.value
        const apiURL1 = `https://mangahere.cc${url}chapterfun.ashx?cid=${cid}&page=1&key=`
        const apiURL2 = `https://mangahere.cc${url}chapterfun.ashx?cid=${cid}&page=2&key=${dmkey}`
        const apiURLTest = 'http://api-nodejs.ddns.net/testapi'

        const apiResponse = await got(
            apiURL1,
            {
                headers: {
                    referer: `https://mangahere.cc${link}`,
                }
            }
        )
        apiResponse.headers['set-cookie'].forEach((e) => {
            if (e.match(/^(image_time_cookie|dm5imgpag)/)) {
                cookies.push(e)
            }
        })
        eval(apiResponse.body)
        let links = [...d]
        let cookie = ''
        cookies.forEach((e) => {
            cookie += `${e.split('; ')[0]};`
        })
        let _res = {}
        await new Promise((resolve) => setTimeout(async function() {
            _res = await getResponse(apiURL2, link, cookie)
            resolve()
        }, 3000))
        eval(_res.data)
        d.shift()
        links.push(...d)
        return {
            count,
            // cid,
            // url,
            // dmkey,
            // referer: `https://mangahere.cc${link}`,
            // apiURL2,
            // cookies,
            // cookie,
            // apiResponse: apiResponse.body,
            // _res: _res.data,
            links: links
        }
    } catch (err) {
        return err
    }
}

async function getResponse(apiURL, link, cookie) {
    const apiResponse = await axios.get(
        apiURL,
        {
            headers: {
                referer: `https://mangahere.cc${link}`,
                Cookie: cookie
            },
        }
    )
    return apiResponse
}

module.exports = {
    search: (name, page) => search(name, page),
    getInfo: link => getInfo(link),
    getPages: link => getPages(link)
}