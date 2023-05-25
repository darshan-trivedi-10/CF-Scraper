import puppeteer from 'puppeteer';
import fs from 'fs';

const browser = await puppeteer.launch({
    "headless": false
});

const page = await browser.newPage();

var contestIDS = [];

async function scrapeContestIDs() {


    // Navigate to the contest page on Codeforces
    await page.goto('https://codeforces.com/contests');

    // Wait for the contest list to load
    await page.waitForSelector('.datatable');

    // Extract the contest IDs
    contestIDS = await page.evaluate(() => {
        const contestElements = document.querySelectorAll('.datatable tr[data-contestid]');
        const contestIDList = [];

        for (const element of contestElements) {
            const contestID = element.getAttribute('data-contestid');
            contestIDList.push(contestID);
        }

        return contestIDList;
    });

    // Print the contest IDs
    console.log(contestIDS);

}

async function scrapeProblem(contestId) {
    try {
        console.log(contestId)
        await page.goto(`https://codeforces.com/contest/${contestId}`);
    } catch (error) {
        console.log(error);
    }
}

// scrapeContestIDs();


async function scrapeContestProblems(contestId) {
    try {
        console.log(contestId);
        await page.goto(`https://codeforces.com/contest/${contestId}`);

        // Extract the problems
        let problems = await page.evaluate(() => {
            const problemLinks = document.querySelectorAll('a[href*="/problem"]');
            const problemList = [];

            for (const problemLink of problemLinks) {
                const problemLinkHref = problemLink.href;
                problemList.push({ link: problemLinkHref });
            }

            return problemList;
        });

        console.log("problem ", problems)


        // Print the problems

        const trimmedProblem = problems.filter(item => item.link.includes('/problem/')).filter((item, index, self) => self.findIndex(i => i.link === item.link) === index);

        let existingData = {};
        try {
            const existingDataStr = fs.readFileSync('contest_data.json', 'utf8');
            existingData = JSON.parse(existingDataStr);
        } catch (error) {
            console.log('An error occurred while reading the file:', error);
        }

        // Merge the existing data with the new data
        const mergedData = {
            ...existingData,
            [contestId]: trimmedProblem
        };

        // Convert the merged data object to JSON string
        const jsonData = JSON.stringify(mergedData, null, 2);
        // Write the updated JSON data back to the file
        try {
            fs.writeFile('contest_data.json', jsonData, 'utf8', (err) => {
                if (err) {
                    console.error('An error occurred while writing the file:', err);
                    return;
                }
                console.log('The file has been saved successfully!');
            });
        } catch (error) {
            console.error('An error occurred while writing the file:', error);
        }


    } catch (error) {
        console.log(error);
    }
}

// scrapeContestProblems(1823);
// scrapeContestProblems(1833);
// scrapeContestProblems(1827);

// Usage: Pass the contest ID as an argument

let idx = 0;

setInterval(() => {
    // scrapeContestProblems(contestIDS[idx++]);
}, 1000 * 5);