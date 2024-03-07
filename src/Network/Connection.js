import { getEnv } from './app-config';

const httpUrl = getEnv('stag');

class Connection {
    static getResturl(url) {

        return `${httpUrl}/${url}`;
    }
}

export default Connection;