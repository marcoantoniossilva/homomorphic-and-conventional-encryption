import { Injectable } from '@angular/core';
import { PrivateKey, PublicKey } from 'paillier-bigint';
import { privateKeyJson } from '../../../privateKey';
import { Answer } from '../models/answer.model';

@Injectable({
    providedIn: 'root'
})
export class CryptographyService {
    publicKey: any;
    privateKey: any;

    constructor() { }

    async loadPublicKey(): Promise<void> {
        this.publicKey = new PublicKey(
            BigInt(privateKeyJson.publicKey.n),
            BigInt(privateKeyJson.publicKey.g)
        );
    }

    async loadPrivateKey(): Promise<void> {
        this.publicKey = new PublicKey(
            BigInt(privateKeyJson.publicKey.n),
            BigInt(privateKeyJson.publicKey.g)
        );

        this.privateKey = new PrivateKey(
            BigInt(privateKeyJson.lambda),
            BigInt(privateKeyJson.mu),
            this.publicKey
        );
    }

    async encryptAnswer(value: number) {
        await this.loadPublicKey();
        return this.publicKey.encrypt(BigInt(value)).toString();
    }

    async decryptSum(encryptedValue: string): Promise<bigint> {
        await this.loadPrivateKey();
        return this.privateKey.decrypt(BigInt(encryptedValue));
    }
}