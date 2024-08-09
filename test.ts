import algosdk from 'algosdk';

// recover from previous ethereum scret key
const wallet = {
    privateKey: '0x2f1c4c549237a81ff7522155d16bddc0b77f6f241758c32718b26f4fb3711ef4',
}
const ethereumSecretKey = wallet.privateKey.slice(2); // Remove the '0x' prefix
const ethereumSecretKeyBuffer = Buffer.from(ethereumSecretKey, 'hex');

const algorandSecretKey = ethereumSecretKeyBuffer.slice(0, 32);
const algorandAccount = algosdk.mnemonicToSecretKey(algosdk.secretKeyToMnemonic(algorandSecretKey));

console.log("Algorand Wallet Address:", algorandAccount.addr);
console.log("Algorand Secret Key:", algorandAccount.sk.toString());