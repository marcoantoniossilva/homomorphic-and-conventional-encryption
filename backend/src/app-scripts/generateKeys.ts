const paillierBigint = require('paillier-bigint')
import fs from 'fs';


async function generateKeys() {
    const { publicKey, privateKey } = await paillierBigint.generateRandomKeys(512);

    // Salva em arquivo
    fs.writeFileSync('publicKey.json', JSON.stringify({
        n: publicKey.n.toString(),
        g: publicKey.g.toString()
    }));

    fs.writeFileSync('privateKey.json', JSON.stringify({
        lambda: privateKey.lambda.toString(),
        mu: privateKey.mu.toString(),
        publicKey: {
            n: privateKey.publicKey.n.toString(),
            g: privateKey.publicKey.g.toString()
        }
    }));

    console.log('Chaves geradas e salvas em publicKey.json e privateKey.json, atualize /frontend/privateKey.ts e exclua privateKey.json');
}

generateKeys();
