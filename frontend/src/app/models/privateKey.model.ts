interface PrivateKeyFile {
    lambda: string;
    mu: string;
    publicKey: {
        n: string;
        g: string;
    };
}