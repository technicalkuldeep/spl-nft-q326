import {
  appendTransactionMessageInstruction,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";

import {
  getInitializeMintInstruction,
  getMintSize,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

import { getCreateAccountInstruction } from "@solana-program/system";

import wallet from "../../devnet-wallet.json";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

(async () => {
  try {
    // Load your wallet
    const signer = await createKeyPairSignerFromBytes(
      new Uint8Array(wallet),
    );

    // Generate a new keypair for our SPL token mint
    const mint = await generateKeyPairSigner();

    console.log("Your wallet:", signer.address);
    console.log("Mint address:", mint.address);

    // Number of decimals for our token
    const decimals = 6;

    // Get the size required for an SPL Mint account
    const mintSize = getMintSize();

    // Get the minimum SOL needed for rent exemption.
    // The RPC expects the account size as bigint.
    const lamports =
      await rpc
        .getMinimumBalanceForRentExemption(BigInt(mintSize))
        .send();

    // Create the mint account
    const createMintAccountIx = getCreateAccountInstruction({
      payer: signer,
      newAccount: mint,
      lamports,
      space: BigInt(mintSize),
      programAddress: TOKEN_PROGRAM_ADDRESS,
    });

    // Initialize the mint
    const initializeMintIx = getInitializeMintInstruction({
      mint: mint.address,
      decimals,
      mintAuthority: signer.address,
      freezeAuthority: signer.address,
    });

    // Get the latest blockhash
    const { value: latestBlockhash } =
      await rpc.getLatestBlockhash().send();

    // Create the transaction message
    const transactionMessage = createTransactionMessage({
      version: 0,
    });

    // Set wallet as fee payer
    const messageWithPayer = setTransactionMessageFeePayerSigner(
      signer,
      transactionMessage,
    );

    // Set transaction lifetime
    const messageWithLifetime =
      setTransactionMessageLifetimeUsingBlockhash(
        latestBlockhash,
        messageWithPayer,
      );

    // Add mint account creation instruction
    const txMessage = appendTransactionMessageInstruction(
      createMintAccountIx,
      messageWithLifetime,
    );

    // Add mint initialization instruction
    const finalTxMessage = appendTransactionMessageInstruction(
      initializeMintIx,
      txMessage,
    );

    // Sign the transaction
    const signedTx =
      await signTransactionMessageWithSigners(finalTxMessage);

    assertIsTransactionWithBlockhashLifetime(signedTx);

    // Get transaction signature
    const signature = getSignatureFromTransaction(signedTx);

    // Send and confirm the transaction
    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    await sendAndConfirm(signedTx, {
      commitment: "confirmed",
    });

    console.log("SPL token created successfully!");
    console.log("Mint address:", mint.address);
    console.log("Decimals:", decimals);
    console.log("Signature:", signature);
  } catch (error) {
    console.log("Error creating SPL token:", error);
  }
})();