const express = require('express');
const router = express.Router();
const got = require('got');
const { JSDOM } = require('jsdom');

router.get('/', async (req, res) => {
    const { question = "" } = req.query;
    console.log(question);
    try {
        const html = await got(process.env.URL_ANSWER, {
            searchParams: {
                kw: question,
            },
        });

        const dom = new JSDOM(html.body);
        const title = dom.window.document.querySelector("h3 b").innerHTML || "";
        const results = [];
        const wordList = dom.window.document.querySelectorAll("#wordlists .wp-widget-content tr.odd");
        wordList.forEach(row => {
            const starsElement = row.querySelector("td div.stars");
            if (!starsElement) return;
            const stars = starsElement.childNodes.length;

            const answerElement = row.querySelector("td a");
            const answer = {
                word: answerElement.innerHTML,
                link: answerElement.getAttribute("href")
            }

            const clue = row.querySelector("td.clue").innerHTML;

            results.push({
                stars, answer, clue
            })
        });
        res.json({
            title,
            total: results.length,
            data: results,
        })
    } catch (err) {
        throw new Error(err);
    }
});

module.exports = router;