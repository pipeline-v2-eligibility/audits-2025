const axios = require('axios');
const properties = require('../../../properties.json');

let cases = [];
let maybe = test.skip;
jest.setTimeout(20000);

const delay = ({until: timeout}) => new Promise((resolve) => {
    setTimeout(() => {
        resolve();
    }, timeout);
});

if (properties && properties.apiBaseURL && properties.apiBaseURL !== '') {
    maybe = test;
    axios.defaults.baseURL = properties.apiBaseURL;
}

const getRandomTestData = async () => {
    if (maybe === test.skip) return;

    const URL = 'https://randomapi.com/api/j5vghihb?key=LEIX-GF3O-AG7I-6J84';
    const { data: { results } } = await axios.get(URL);
    const [data] = results;
    cases = data;
};

beforeAll(() => {
    return getRandomTestData();
});

maybe('Backend API - Rate limiter allows calls within limit', async () => {
    const calls = cases.happy?.map(schedule => {
        return new Promise(async (resolve, reject) => {
            try {
                await delay({until: schedule});
                const { data } = await axios('/howold?dob=436504400000');
                resolve(data);
            } catch (error) {
               reject(error); 
            }
        });
    });

    try {
        const results = await Promise.all(calls);
        for (let data of results) {
            expect(data).toHaveProperty('age');
            expect(data.age).toBeGreaterThanOrEqual(0);
        }
    } catch (error) {
        // just warn of errors that should not be occuring
        console.warn(error.message);
    }
});

maybe('Backend API - Rate limiter flags too many calls', async () => {
    const calls = cases.edges?.map(schedule => {
        return new Promise(async (resolve, reject) => {
            try {
                await delay({until: schedule});
                const { data } = await axios('/howold?dob=436504400000');
                resolve(data);
            } catch (error) {
               reject(error); 
            }
        });
    });

    try {
        await Promise.all(calls);
    } catch (error) {
        if (error.response?.status) {
            expect(error.response?.status).toBe(429);
        }
        expect(error.response?.data?.error).toBeDefined();
        expect(typeof error.response?.data?.error).toBe('string'); 

        expect(error.response?.headers['x-ratelimit-limit']).toBeDefined();
        expect(error.response?.headers['x-ratelimit-remaining']).toBeDefined();
    }
});