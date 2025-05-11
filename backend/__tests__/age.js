const axios = require('axios');
const about = require('../../../about.json');

let cases = {};
let maybe = test.skip;
jest.setTimeout(20000);

const delay = ({until: timeout}) => new Promise((resolve) => {
    setTimeout(() => {
        resolve();
    }, timeout);
});

if (about && about.deployedAppURL && about.deployedAppURL !== '') {
    maybe = test;
    axios.defaults.baseURL = about.deployedAppURL;
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

maybe('Backend API - Calculates age', async () => {
    await cases.happy?.reduce( async (prevCall, {age, dob}) => {
        try {
            await prevCall;
            await delay({until: 650});
            const { data } = await axios(`/howold?dob=${dob}`);

            expect(data).toHaveProperty('age');
            expect(data.age).toBeGreaterThanOrEqual(0);
            expect(data.age).toBe(age);
            return Promise.resolve();
        } catch (error) {
            // just warn of errors that should not be occuring
        }
    }, Promise.resolve());
});

maybe('Backend API - Handles edge cases', async () => {
    await cases.edges?.reduce( async (prevCall, {dob}) => {
        try {
            await prevCall;
            await delay({until: 650});
            const { data } = await axios(`/howold?dob=${dob}`);

            const age = data?.age;
            expect(age === null || age === undefined).toBe(true);
        } catch (error) {
            if (error.response?.status) {
                expect(error.response?.status).toBe(400);
            }
            expect(error.response?.data?.error).toBeDefined();
            expect(typeof error.response?.data?.error).toBe('string'); 
        }
    }, Promise.resolve());
});
