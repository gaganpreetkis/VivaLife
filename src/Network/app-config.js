/*
 * @file: app-config.js
 * @description: It Contain app configration keys and environment path's.
 * @date: 11.04.2020
 * @author: Pushker Tiwari
 */
import { apiUrl } from './apiUrl';
export const environment = {
    API_URLS: {
        stag: `${apiUrl}`,
        
    }
};

export const getEnv = (env = 'stag') => environment.API_URLS[env];