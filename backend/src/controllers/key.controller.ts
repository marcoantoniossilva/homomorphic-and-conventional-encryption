import fs from 'fs';

export const getPublicKeyFromFile = () => {
    return JSON.parse(fs.readFileSync('publicKey.json', 'utf-8'));
};