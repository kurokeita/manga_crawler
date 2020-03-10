const got = require('got')
const htmlparser2 = require('htmlparser2')

async function test(req, res) {
    try {
        const { name } = req.body
        const result = await got(`https://google.com`)
        res.json(result.body)
    } catch (err) {
        res.json(err)
    }
}

async function curl(req, res) {
    try {
        const { name } = req.body
        const keyword = name.replace(/[ ]+/g, '+')
        const pos = req.body.pos ? parseInt(req.body.pos) : 1

        let list = []

        for (let i = pos; i <= pos + 2; i++) {
            response = await got(
                `https://www.mangahere.cc/search?page=${i}&title=${keyword}`,
                {
                    responseType: 'text',
                    resolveBodyOnly: true
                }
            )
            let resultDiv = response.match(/(?<=(<div class="manga-list-4 mt15"> ))[\s\S]*<\/ul>/g)
            if (resultDiv) {
                let listDiv = resultDiv[0]
                let listDOM = htmlparser2.parseDOM(listDiv)
                let li = listDOM[0].children
                let href = lastChapter = {}
                let cover = ''
                for (let j = 1; j < li.length; j += 2) {
                    href = li[j].children[1].attribs
                    cover = li[j].children[1].children[0].attribs.src
                    lastChapter = li[j].children[9].children[1]
                    list = [
                        ...list,
                        {
                            link: `https://www.mangahere.cc${href.href}`,
                            title: href.title,
                            cover: cover,
                            lastChapter: lastChapter.children[0].data,
                            lastChapterLink: `https://www.mangahere.cc${lastChapter.attribs.href}`
                        }
                    ]
                }
            } else {
                break
            }         
        }        
        res.json([
            {
                total: list.length,
                position: pos + 2
            },
            ...list
        ])
    } catch (err) {
        res.json(err)
    }
}

module.exports = {
    test: (req, res) => test(req, res),
    curl: (req, res) => curl(req, res),
}