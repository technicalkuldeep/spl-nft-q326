import {
  address,
  appendTransactionMessageInstructions,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";

import wallet from "../../devnet-wallet.json";

import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenInstructionAsync,
  getTransferCheckedInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

// Your SPL token mint
const mint = address(
  "D9WXV9wtsELdTZcCQKCaRGgrBESQjcESZ5dq5EUPe3MK",
);

// Recipient wallet
const to = address(
  "9EUd4VNcjMAysd7zQk3Q1a4tb28BYndLNBAQDiYnHJ64",
);

// Transfer 100 SRIN
const transferAmount = 100n * 1_000_000n;

// Token decimals
const decimals = 6;

(async () => {
  try {
    // Load your wallet
    const signer = await createKeyPairSignerFromBytes(
      new Uint8Array(wallet),
    );

    console.log("Sender:", signer.address);
    console.log("Recipient:", to);

    // Find sender's associated token account
    const [fromAta] = await findAssociatedTokenPda({
      mint,
      owner: signer.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    console.log("Your fromAta:", fromAta);

    // Find recipient's associated token account
    const [toAta] = await findAssociatedTokenPda({
      mint,
      owner: to,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    console.log("Recipient toAta:", toAta);

    // Create recipient ATA if it doesn't exist
    const createAtaIx =
      await getCreateAssociatedTokenInstructionAsync({
        payer: signer,
        owner: to,
        mint,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
      });

    // Transfer tokens
    const transferTx = getTransferCheckedInstruction({
      source: fromAta,
      mint,
      destination: toAta,
      authority: signer,
      amount: transferAmount,
      decimals,
    });

    // Get latest blockhash
    const { value: latestBlockhash } =
      await rpc.getLatestBlockhash().send();

    // Create transaction message
    const msg = createTransactionMessage({
      version: 0,
    });

    // Set sender as fee payer
    const msgWithPayer = setTransactionMessageFeePayerSigner(
      signer,
      msg,
    );

    // Set transaction lifetime
    const msgWithLifetime =
      setTransactionMessageLifetimeUsingBlockhash(
        latestBlockhash,
        msgWithPayer,
      );

    // Add ATA creation + token transfer instructions
    const txMessage = appendTransactionMessageInstructions(
      [createAtaIx, transferTx],
      msgWithLifetime,
    );

    // Sign transaction
    const signedTx =
      await signTransactionMessageWithSigners(txMessage);

    assertIsTransactionWithBlockhashLifetime(signedTx);

    // Get signature
    const signature = getSignatureFromTransaction(signedTx);

    // Send and confirm
    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    await sendAndConfirm(signedTx, {
      commitment: "confirmed",
    });

    console.log("Tokens transferred successfully!");
    console.log("Amount transferred: 100 SRIN");
    console.log("From:", fromAta);
    console.log("To:", toAta);
    console.log("Signature:", signature);
  } catch (error) {
    console.log("Error transferring tokens:", error);
  }
})();