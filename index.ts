import algosdk, { Algodv2, Transaction } from 'algosdk';
import { ethers, getDefaultProvider } from 'ethers';


// Constants
const BASE_WALLET_PRIVATE_KEY = '0x2f1c4c549237a81ff7522155d16bddc0b77f6f241758c32718b26f4fb3711ef4';
const NEW_WALLET_PRIVATE_KEY = ''; // The new wallet's private key will be generated
const RECEIVER_ADDRESS = "VHWZ6IZRIBJR7VU35GXHTBAWMOUAZREIJXCJTW777RHN4RMPWE7G2ZC4B4";
const FUND_AMOUNT = 1; // ALGO to fund the new wallet
const TRANSACTION_AMOUNT = 0.2; // ALGO to send to the receiver

// Algorand network configuration
const ALGOD_API_ADDR = "https://testnet-api.algonode.cloud"; // Replace with the proper API endpoint
const ALGOD_API_TOKEN = { 'X-API-Key': 'Your-API-Key' }; // Replace with your API key

// Initialize Algod client
const algodClient = new algosdk.Algodv2('', ALGOD_API_ADDR, '443');

// Step 1: Recover the base wallet
const ethereumSecretKey = BASE_WALLET_PRIVATE_KEY.slice(2); // Remove the '0x' prefix
const ethereumSecretKeyBuffer = Buffer.from(ethereumSecretKey, 'hex');
const baseAlgorandSecretKey = ethereumSecretKeyBuffer.slice(0, 32);
const baseAccount = algosdk.mnemonicToSecretKey(algosdk.secretKeyToMnemonic(baseAlgorandSecretKey));

console.log("Base Algorand Wallet Address:", baseAccount.addr);

// Step 2: Create the new Base Wallet
const provider = getDefaultProvider('https://sepolia.base.org');
const wallet = ethers.Wallet.createRandom(); // Create a random wallet
console.log("Ethereum Wallet New Address:", wallet.address);
console.log("Ethereum Secret New Key:", wallet.privateKey);

const ethereumSecretKeyNew = wallet.privateKey.slice(2); // Remove the '0x' prefix
const ethereumSecretKeyBufferNew = Buffer.from(ethereumSecretKeyNew, 'hex');

// Algorand wallets typically require a 32-byte secret key, so use only the first 32 bytes
const algorandSecretKey = ethereumSecretKeyBufferNew.slice(0, 32);
const newAccountRecovery = algosdk.mnemonicToSecretKey(algosdk.secretKeyToMnemonic(algorandSecretKey));
console.log("New Algorand Wallet Address:", newAccountRecovery.addr);

// Step 3: Fund the new wallet with 0.2 ALGO from the base wallet
const fundNewWallet = async () => {
    const params = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: baseAccount.addr,
        to: newAccountRecovery.addr,
        amount: algosdk.algosToMicroalgos(FUND_AMOUNT),
        suggestedParams: params
    });

    const signedTxn = txn.signTxn(baseAccount.sk);
    const txId = await algodClient.sendRawTransaction(signedTxn).do();
    console.log("Funding Transaction ID:", txId);
};

// Step 4: Transfer 0.19 ALGO from the new wallet to the specified address
const sendAlgos = async () => {
    // wait just 8 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));

    // check the balance of the new wallet
    const accountInfo = await algodClient.accountInformation(newAccountRecovery.addr).do();
    console.log("New Wallet Balance:", algosdk.microalgosToAlgos(accountInfo.amount));

    const params = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: newAccountRecovery.addr,
        to: RECEIVER_ADDRESS,
        amount: algosdk.algosToMicroalgos(TRANSACTION_AMOUNT),
        suggestedParams: params
    });

    const signedTxn = txn.signTxn(newAccountRecovery.sk);

     // check the balance of the new wallet
     const accountInfo2 = await algodClient.accountInformation(newAccountRecovery.addr).do();
     console.log("New Wallet Balance:", algosdk.microalgosToAlgos(accountInfo2.amount));

    const txId = await algodClient.sendRawTransaction(signedTxn).do();
    console.log("Transfer Transaction ID:", txId);

    // wait just 8 seconds
    await new Promise(resolve => setTimeout(resolve, 8000));
};

// Execute the funding and transfer transactions
(async () => {
    await fundNewWallet();
    await sendAlgos();
})();
