import {Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction} from '@solana/web3.js';
import * as spltoken from "@solana/spl-token";

const connection = new Connection(clusterApiUrl('devnet', 'confirmed'));

const fromKeypair = Keypair.fromSecretKey(Uint8Array.from([205,32,84,254,22,46,60,4,63,165,95,114,84,155,234,168,220,42,66,196,34,61,42,14,162,241,14,184,162,174,177,184,128,185,166,0,119,198,16,171,51,149,118,99,249,139,28,76,239,177,56,254,63,98,65,80,129,93,115,178,79,139,185,145]))
const toWallet = new PublicKey("HtUaVzWiSNrrY2NSVKroE3883vnBfn8SMrLM2UxA2vDy")

const airdrop = async(address, amount) => {
    const fromAddress = new PublicKey(address);
    const signature = await connection.requestAirdrop(fromAddress, amount*LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature);
    console.log(signature)
}

const initiateTransfer = async(fromKeypair, toWallet, amount) => { 
    const amount_lamports = amount * LAMPORTS_PER_SOL
    const transaction = new Transaction().add(
            SystemProgram.transfer(
                {
                fromPubkey: fromKeypair.publicKey,
                toPubkey:toWallet,
                lamports: amount_lamports
                }
            )
        )
    const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);
    console.log(signature)
}

const mintTokens = async(amount_tokens_to_mint) => {
    
    // const tokenAddress = await spltoken.createMint(
    //     connection,
    //     fromKeypair,
    //     fromKeypair.publicKey,
    //     null,
    //     9
    // )

    const tokenAddress = new PublicKey("AtxzWB55oMgnvkqApQiabpNteTJSoH3WPauJprWFoU28");

    const fromATA = await spltoken.getOrCreateAssociatedTokenAccount(
        connection,
        fromKeypair,
        tokenAddress,
        fromKeypair.publicKey
      );
      
    const amountLamports = amount_tokens_to_mint*LAMPORTS_PER_SOL;
    // const mintSign = await spltoken.mintTo(connection, fromKeypair, tokenAddress, fromATA.address, fromKeypair, amountLamports);
    // console.log(mintSign);
    return {fromATA:fromATA, tokenAddress:tokenAddress}
}   

const transferTokens = async(tokenAddress, fromATA, fromKeypair, toWallet, amount) => {
    const toATA = await spltoken.getOrCreateAssociatedTokenAccount(
        connection,
        fromKeypair,
        tokenAddress,
        toWallet
    )
    const amountLamports = amount*LAMPORTS_PER_SOL;
    const transferSign = await spltoken.transfer(connection, fromKeypair, fromATA, toATA.address, fromKeypair.publicKey, amountLamports)
    console.log(transferSign);
}

// airdrop("9fVNgFxuosakW8GHad17gL25eF3uqRUjFa4dgy8kFRig", 1);
// initiateTransfer(fromKeypair, toWallet, 1);
const data = await mintTokens(100);
transferTokens(data.tokenAddress, data.fromATA.address, fromKeypair, toWallet, 1);
