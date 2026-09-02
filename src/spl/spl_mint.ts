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
  getMintToInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

// Your SPL token mint address
const mint = address(
  "D9WXV9wtsELdTZcCQKCaRGgrBESQjcESZ5dq5EUPe3MK",
);

// We want to mint 1000 tokens.
// The token has 6 decimals, so 1000 tokens = 1000 * 10^6 base units.
const tokenAmount = 1000n * 1_000_000n;

(async () => {
  try {
    // Load your wallet
    const signer = await createKeyPairSignerFromBytes(
      new Uint8Array(wallet),
    );

    // Find your associated token account
    const [ata] = await findAssociatedTokenPda({
      mint,
      owner: signer.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    console.log("Your wallet:", signer.address);
    console.log("Your ATA:", ata);

    // Create the associated token account
    const createAtaIx =
      await getCreateAssociatedTokenInstructionAsync({
        payer: signer,
        owner: signer.address,
        mint,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
      });

    // Mint tokens to your associated token account
    const mintToIx = getMintToInstruction({
      mint,
      token: ata,
      mintAuthority: signer,
      amount: tokenAmount,
    });

    // Get the latest blockhash
    const { value: latestBlockhash } =
      await rpc.getLatestBlockhash().send();

    // Create transaction message
    const msg = createTransactionMessage({
      version: 0,
    });

    // Set wallet as fee payer
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

    // Add both instructions to the transaction
    const txMessage = appendTransactionMessageInstructions(
      [createAtaIx, mintToIx],
      msgWithLifetime,
    );

    // Sign the transaction
    const signedTx =
      await signTransactionMessageWithSigners(txMessage);

    assertIsTransactionWithBlockhashLifetime(signedTx);

    // Get transaction signature
    const signature = getSignatureFromTransaction(signedTx);

    // Send and confirm transaction
    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    await sendAndConfirm(signedTx, {
      commitment: "confirmed",
    });

    console.log("Tokens minted successfully!");
    console.log("Amount minted: 1000 SRIN");
    console.log("Mint address:", mint);
    console.log("ATA:", ata);
    console.log("Signature:", signature);
  } catch (error) {
    console.log("Error minting tokens:", error);
  }
})();