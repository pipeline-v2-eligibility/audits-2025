const axios = require('axios');
const dotenv = require('dotenv');
const { Octokit } = require("@octokit/rest");
const about = require('../../../about.json');

dotenv.config();

let repo;
let owner;
let octokit;
let cases = {};
let maybe = test.skip;

// 3 mins
jest.setTimeout(300000);

const delay = ({ until: timeout }) => new Promise((resolve) => {
    setTimeout(() => {
        resolve();
    }, timeout);
});

if (about && about.deployedAppURL && about.deployedAppURL !== '' && about.githubUsername && about.githubUsername !== '') {
    maybe = test;

    repo = about.deployedAppURL;
    owner = about.githubUsername;
    octokit = new Octokit({
        auth: process.env.GH_TOKEN
    });
}

const getRandomTestData = async () => {
    if (maybe === test.skip) return;

    const URL = 'https://randomapi.com/api/t6jiajps?key=LEIX-GF3O-AG7I-6J84';
    const { data: { results } } = await axios.get(URL);
    const [data] = results;
    cases = data;
};

beforeAll(() => {
    return getRandomTestData();
});

const listIssues = async () => {
    return await octokit.rest.issues.listForRepo({
        repo,
        owner,
        state: 'open'
    });
};

const testTheScanner = async (data) => {
    try {
        await octokit.rest.issues.create({
            repo,
            owner,
            body: `${JSON.stringify(data)}`,
            title: `${(new Date()).toUTCString()}`
        });
    
        // wait 45 seconds
        console.log('Created an issue. Lets wait and see how you handle listed container images ..');
        await delay({until: 45000});
        let { data: issuesData } = await listIssues();
        let [lastestIssue] = issuesData;
        if (!lastestIssue.comments || lastestIssue.comments <= 0) {
            // wait another 30 seconds
            console.log('Looks like your scan is taking long to get completed. Lets wait some more ...');
            await delay({until: 30000});
            const { data } = await listIssues();
            issuesData = data;
            lastestIssue = issuesData[0];

            expect(lastestIssue.comments && lastestIssue.comments >= 1).toBe(true);
        }

        const { data: commentData } = await octokit.rest.issues.listComments({
            repo,
            owner,
            issue_number: lastestIssue.number
        });
        const [scanResultComment] = commentData; 

        return scanResultComment;
    } catch (e) {
        console.error('Test failed to run');
        console.error(e);
    }
};

maybe('GitHub Workflow - Scan identifies safe images', async () => {
    const data = cases.safe;
    const scanResultComment = await testTheScanner(data);
    expect(scanResultComment).toBeDefined();
    expect(scanResultComment.body).toBeDefined();

    const actual = JSON.parse(scanResultComment.body);
    const expected = data.map(image => ({image, 'status': 'SAFE'}));
    expected.forEach(given => {
        for (const [key, value] of Object.entries(given)) {
            if (key === 'image') {
                const found = actual.find(a => a.image === value);
                expect( found).toBeDefined();
                expect( found.status ).toEqual('SAFE');
            }
        }
    });
});

maybe('GitHub Workflow - Scan identifies unsafe images', async () => {
    const data = cases.unsafe;
    const scanResultComment = await testTheScanner(data);
    expect(scanResultComment).toBeDefined();
    expect(scanResultComment.body).toBeDefined();

    const actual = JSON.parse(scanResultComment.body);
    const expected = data.map(image => ({image, 'status': 'UNSAFE'}));
    expected.forEach(given => {
        for (const [key, value] of Object.entries(given)) {
            if (key === 'image') {
                const found = actual.find(a => a.image === value);
                expect( found).toBeDefined();
                expect( found.status ).toEqual('UNSAFE');
            }
        }
    });
});