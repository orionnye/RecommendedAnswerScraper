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
    "Others want to know"
]
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
        const answerRegExp = new RegExp(/<span class="FCUp0c rQMQod">(.*?)<\/span>/g)
        let spanAnswers = all.toString().match(answerRegExp)
        let spanAnswer = "Nothing Found"
        if (spanAnswers != null) {
            spanAnswer = spanAnswers.shift()
            if (spanAnswer.endsWith(".")) {
                spanAnswer += spanAnswers.shift()
            }
        }
        //Slice off the span since we know the size of span start and end
        let answer = spanAnswer.slice(28, spanAnswer.length-7 )
        
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
        const answer = await retrieveUniData(questionList[1], uni)
        console.log(uni,":", answer)
        uniAnswers.push(answer)
    }
    // const answer = await retrieveUniData(questionList[0], uniList[0])
    // console.log(answer)
}
scrapeData()
// console.log(scrapeData())
// Async function which scrapes the data
// async function scrapeData() {
//   try {
//     // Fetch HTML of the page we want to scrape
//     const { data } = await axios.get(url);
//     // Load HTML we fetched in the previous line
//     const $ = cheerio.load(data);
//     const parentClass = "div.mdl-grid";
//     const cellClass = "mdl-cell mdl-cell--6-col";
//     const nestedCell = "div.launch a6936 mdl-card mdl-shadow--6dp"
//     const abcCell = "div.mdl-card__supporting-text"

//     let client = ""
    // const list = $(parentClass);
    // let list = []
    // let rockets = []
    // list = $(parentClass).children().map( (i, element) => {
    //     let rocket = { a: "", b: "", c: "", d: "", e: "", f: "", g: ""}
    //     if (element.type ==='tag') {
    //         let date = $(element).find(abcCell).text().trim().split("\n")[0].replace(",", "").split(" ")
    //         switch (date.length) {
    //             case(3): {
    //                 rocket.a = date[2];
    //                 rocket.b = date[1];
    //                 break;
    //             }
    //             case(4 || 6): {
    //                 rocket.a = date[3]
    //                 rocket.b = date[1]
    //                 rocket.c = date[2]
    //                 break;
    //             }
    //             default: {
    //                 break;
    //             }
    //         }
    //         let title = $(element).find("h5:first").text().trim().split(" | ");
    //         let origin = $(element).find("span:first").text().trim();
    //         let details = $(element).find("div.mdl-card__supporting-text:first").text().trim().split("\n");
    //         details.splice(0, 2);
    //         let location = details[0].trim()
    //         // console.log(details);
    //         rocket.d = title[1];
    //         rocket.e = origin;
    //         rocket.f = title[0];
    //         rocket.g = location;
    //         // console.log(rocket);
    //         rockets.push(rocket);
    //         return rocket

        // }
    // })
    // console.log(rockets)
//     fs.writeFile("Clients.json", JSON.stringify(rockets, null, 2), (err) => {
//       if (err) {
//         console.error(err);
//         return;
//       }
//       console.log("Successfully written data to file");
//     });
//     console.log("list:", list);
//   } catch (err) {
//     console.error(err);
//   }
// }
// Invoke the above function
// scrapeData();