const axios = require('axios');
const fileExists = require('fs.promises.exists');
const properties = require('../../../properties.json');

let repo;
let owner;
let octokit;
let cases = {};
let maybe = test.skip;
jest.setTimeout(75000);

const delay = ({ until: timeout }) => new Promise((resolve) => {
    setTimeout(() => {
        resolve();
    }, timeout);
});

if (properties && properties.deployedAppURL && properties.deployedAppURL !== '' && properties.githubUsername && properties.githubUsername !== '') {
    maybe = test;

    repo = properties.deployedAppURL;
    owner = properties.githubUsername;
    octokit = new Octokit({
        auth: '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'
    });
}

const getRandomTestData = async () => {
    if (maybe === test.skip) return;

    const URL = 'https://randomapi.com/api/0zse1e20?key=LEIX-GF3O-AG7I-6J84';
    const { data: { results } } = await axios.get(URL);
    const [data] = results;
    cases = data;
};

beforeAll(() => {
    return getRandomTestData();
});

maybe('GitHub Workflow - Scan identifies safe images', async () => {
    
    await octokit.request(`POST /repos/{${owner}}/{${repo}}/issues`, {
        owner: owner,
        repo: repo,
        title: `Scan @ ${(new Date()).toUTCString()}`,
        body: JSON.stringify(cases.safe)
    });

    // wait 45 seconds
    await delay({until: 45000});

    // scanned.json
    const filePath = '../scanned.json';
    const outputExists = await fileExists(filePath);
    expect(outputExists).toBe(true);

    const output = require(filePath);
    const expected = cases.safe.map(c => ({'image': c, 'status': 'SAFE'}));
    expect(output).toStrictEqual(expected);
});

maybe('GitHub Workflow - Scan identifies unsafe images', async () => {
    
    await octokit.request(`POST /repos/{${owner}}/{${repo}}/issues`, {
        owner: owner,
        repo: repo,
        title: `Scan @ ${(new Date()).toUTCString()}`,
        body: JSON.stringify(cases.unsafe)
    });

    // wait 45 seconds
    await delay({until: 45000});

    // scanned.json
    const filePath = '../scanned.json';
    const outputExists = await fileExists(filePath);
    expect(outputExists).toBe(true);

    const output = require(filePath);
    const expected = cases.unsafe.map(c => ({'image': c, 'status': 'SAFE'}));
    expect(output).toStrictEqual(expected);
});

// maybe('GitHub Workflow - Scan identifies safe and unsafe images', async () => {
    
//     await octokit.request(`POST /repos/{${owner}}/{${repo}}/issues`, {
//         owner: owner,
//         repo: repo,
//         title: `Scan @ ${(new Date()).toUTCString()}`,
//         body: [...cases.safe, ...cases.unsafe]
//     });

//     // wait 45 seconds
//     await delay({until: 45000});

//     // scanned.json
//     const filePath = '../scanned.json';
//     const outputExists = await fileExists(filePath);
//     expect(outputExists).toBe(true);

//     const output = require(filePath);
//     const expected = cases.unsafe.map(c => ({'image': c, 'status': 'SAFE'}));
//     expect(output).toStrictEqual(expected);
// });