const axios = require('axios');
const properties = require('../../../properties.json');

let cases = {};
let maybe = test.skip;
jest.setTimeout(20000);

const delay = ({until: timeout}) => new Promise((resolve) => {
    setTimeout(() => {
        resolve();
    }, timeout);
});

if (properties && properties.deployedAppURL && properties.deployedAppURL !== '') {
    maybe = test;
    axios.defaults.baseURL = properties.deployedAppURL;
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

maybe('GitHub Workflow - Scans for vulnerabilities', async () => {
    
});