import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { assert, expect } from "chai";

describe("vault", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.vault as Program<Vault>;

  const signer = anchor.getProvider().wallet;

  it("Is initialized!", async () => {
    // Add your test here.
    const [vaultStatePda, vaultStateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_state"), signer.publicKey.toBuffer()],
      program.programId
    );
    const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_account"), signer.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .initialize()
      .accountsPartial({
        signer: signer.publicKey,
        vaultState: vaultStatePda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Initialized Vault", tx);
    const vaultInfo = await anchor
      .getProvider()
      .connection.getAccountInfo(vaultPda);

    assert.ok(vaultInfo !== null && vaultInfo.lamports > 0);
  });

  it("Deposits some amount!", async () => {
    const [vaultStatePda, vaultStateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_state"), signer.publicKey.toBuffer()],
      program.programId
    );
    const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_account"), signer.publicKey.toBuffer()],
      program.programId
    );

    const depositAmount = 2 * LAMPORTS_PER_SOL;

    const amount = new anchor.BN(depositAmount);

    const tx = await program.methods
      .deposit(amount)
      .accountsPartial({
        signer: signer.publicKey,
        vaultState: vaultStatePda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Deposited 2 SOL in the vault", tx);
    const vaultInfo = await anchor
      .getProvider()
      .connection.getAccountInfo(vaultPda);

    assert.ok(vaultInfo!.lamports > depositAmount);
  });

  it("Withdraws some amount!", async () => {
    const [vaultStatePda, vaultStateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_state"), signer.publicKey.toBuffer()],
      program.programId
    );
    const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_account"), signer.publicKey.toBuffer()],
      program.programId
    );

    const depositAmount = 1 * LAMPORTS_PER_SOL;
    const amount = new anchor.BN(depositAmount);

    const tx = await program.methods
      .withdraw(amount)
      .accountsPartial({
        signer: signer.publicKey,
        vaultState: vaultStatePda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Withdrew 1 SOL in the vault", tx);
    const vaultInfo = await anchor
      .getProvider()
      .connection.getAccountInfo(vaultPda);

    assert.ok(vaultInfo!.lamports > 0);
  });
  it("Fails to withdraw more than allowed", async () => {
    const [vaultStatePda, vaultStateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_state"), signer.publicKey.toBuffer()],
      program.programId
    );
    const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_account"), signer.publicKey.toBuffer()],
      program.programId
    );

    const vaultBal = await anchor
      .getProvider()
      .connection.getAccountInfo(vaultPda);

    const withdrawAmount = vaultBal.lamports ?? 0;

    try {
      const tx = await program.methods
        .withdraw(new anchor.BN(withdrawAmount))
        .accountsPartial({
          signer: signer.publicKey,
          vaultState: vaultStatePda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      expect.fail("Expected transaction to fail, but it succeeded");
    } catch (error) {
      const errString = error.toString();
      console.log("Withdrawal failed as expected:", errString);

      expect(errString).to.include("InsufficentBalance");
    }
  });
  it("Closes the account!", async () => {
    const [vaultStatePda, vaultStateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_state"), signer.publicKey.toBuffer()],
      program.programId
    );
    const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_account"), signer.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .close()
      .accountsPartial({
        signer: signer.publicKey,
        vaultState: vaultStatePda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log("Closed the account successfully", tx);
    try {
      await program.account.vaultState.fetch(vaultStatePda);
      assert.fail("VaultState account still exists after close");
    } catch (e) {
      assert.include(e.toString(), "Account does not exist");
    }
  });
});
