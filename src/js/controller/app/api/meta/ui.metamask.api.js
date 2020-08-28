export async function isInstalled() {
    if (typeof web3 !== 'undefined'){
        console.log('MetaMask is installed');
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        let wallet_address = web3.eth.coinbase;
        console.log(wallet_address);
        return wallet_address;
    }
    else{
        console.log('MetaMask is not installed');
        return false
    }
}

export async function isLocked() {
    await web3.eth.getAccounts(function(err, accounts){
        if (err != null) {
            console.log(err)
        }
        else if (accounts.length === 0) {
            console.log('MetaMask is locked')
        }
        else {
            console.log('MetaMask is unlocked')
        }
    });
}


export async function getBalanceOfEth() {
    await web3.eth.getBalance('0xc06e9C50F7cFFc978dB82D85ef45353aA2B57484', (error, balance) => {
        console.log(balance);
        let _balance = web3.fromWei(balance, "ether");
        console.log(_balance.toString());
    })
}

export async function getTransactionOfEth() {
    let txHash = '0x6951e9d070c5d7815e3134bb5ef0ddb2c4397386328b655a87f18474e75548f6';
    await web3.eth.getTransaction(txHash, ((error, transaction) => {
        console.log(transaction);
    }));
}

export async function sendTransactionETH(toWallet, value) {
 await web3.eth.sendTransaction({
     to: toWallet,
     value: web3.toWei(value, "ether")
 },(error, hash) => {
     if (error != null) {
         console.log(error);
     }
     else {
         console.log(hash);
     }
 })
}

