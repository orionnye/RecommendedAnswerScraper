const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

// Questions that can be appended to the url
let questionList = [
    "Who is the Director of Engineering at *?",
    "Who is the CEO of *?"
]
let badResponseList = [
    "People also ask",
    "More to ask",
    "Others want to know",
    "Related questions",
    "Images"
]
const answerRegExp = new RegExp(/<span class="FCUp0c rQMQod">(.*?)<\/span>/g)
// URL of the page we want to scrape
const urlBase = "https://www.google.com/search?q="
var getURL = (question, uni) => { return urlBase + question.replace("*", uni) }

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// We've got the read function working
async function getUniList() {
    return new Promise(resolved => {
        let list = []
        fs.readFile('Unis.txt', 'utf8', function(err, data) {
            if (err) throw err;
            list = data.split("\n").map(value => {
                return value
            })
            resolved(list)
        });
    })
}

async function retrieveUniData(question, uni) {
    let uniURL = getURL(question, uni)
    const { data } = await axios.get(uniURL)
    const $ = cheerio.load(data)
    // we have the urls to query google, next step is to filter the google response for our answer
    
    return new Promise(resolved => {
        let all = $("*")
        //just use string functions to find first span containing our answer,
        //in browser it's a bold div but cheerio converts it to "span"
        let spanAnswers = Array.from(all.toString().matchAll(answerRegExp)).values()
        let answer
        if (spanAnswers != null) {
            for (let match of spanAnswers) {
                response = match[0].slice(28, match[0].length-7 )
                if (!badResponseList.includes(response)) {
                    answer = response
                    break
                }
            }
            // if (spanAnswer.endsWith(".") | spanAnswer.endsWith(" ")) {
            //     spanAnswer += spanAnswers[1][0]
            // }
        }
        //Slice off the span since we know the size of span start and end
        // let answer = spanAnswer.slice(28, spanAnswer.length-7 )
        
        // resolved(answer)
        resolved(answer)
    });
}
// cycle through each university to test all questions

async function scrapeData() {
    let uniList = await getUniList()
    // cycle each of the universities
    let uniAnswers = []
    for (let uni of uniList) {
        await timeout(1000)
        const answer = await retrieveUniData(questionList[0], uni)
        if (answer != null && answer != undefined) {
            console.log(uni,":", answer)
            uniAnswers.push(answer)
        }
    }
    // const answer = await retrieveUniData(questionList[0], uniList[0])
    // console.log(answer)
}
scrapeData()