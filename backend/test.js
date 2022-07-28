const axios = require('axios');
const properties = process.CI === true ? require('../../properties.json') : {};

const maybe = properties && properties.apiBaseURL !== "" ? test : test.skip;

maybe('Backend - what are we testing here', async () => {
    const URL = `${properties.apiBaseURL}/howold`;

    expect(5).toBe(5);
});