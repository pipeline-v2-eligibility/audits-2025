import axios from 'axios';
import { test } from 'vitest';
// @ts-ignore
import about from '../about.json' with { type: 'json' };

type DelayOptions = {
    until: number;
};

const deployedAppUrlIsSet = about && about.deployedAppURL && about.deployedAppURL !== '';

export const delay = (args: DelayOptions): Promise<void> => new Promise((resolve) => {
    setTimeout(() => {
        resolve();
    }, args.until);
});

export const maybe = deployedAppUrlIsSet ? test : test.skip;

export const httpClient = () => {
    const defaultAPIArgs = {
        baseURL: 'https://httpbin.org',
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    };

    let http = axios.create(defaultAPIArgs);
    if (deployedAppUrlIsSet) {
        http = axios.create({
            ...defaultAPIArgs, ...{ baseURL: about.deployedAppURL }
        });
    }

    return http;
};
