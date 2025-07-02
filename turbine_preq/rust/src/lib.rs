use solana_client::rpc_client::RpcClient;
use solana_program::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    system_instruction,
    system_program,
};
use solana_sdk::{message:: Message,
    signature::{Keypair, Signer, read_keypair_file},
    transaction::Transaction,
};
use std::str::FromStr;

// CONSTANTS (UPDATED WITH YOUR INFO)
const TURBIN3_PUBKEY: &str = "njPxux8VEXbQ2yPCVfhMJgqqrci4QUmFgz35tDHPL4a";
const RPC_URL: &str = 
"https://turbine-solanad-4cde.devnet.rpcpool.com/9a9da9cf-6db1-47dc-839a-55aca5c9c80a";
const TURBIN3_PROGRAM_ID: &str = "TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM";
const COLLECTION_ADDRESS: &str = "5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2";
const MPL_CORE_PROGRAM: &str = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d";

// STEP 1: Keypair Generation
#[test]
fn keygen() {
    let kp = Keypair::new();
    println!("Generated wallet: {}", kp.pubkey());
    println!("Private key (save to dev-wallet.json):");
    println!("{:?}", kp.to_bytes());
}

// STEP 2: Airdrop Devnet SOL
#[test]
fn airdrop() {
    let keypair = read_keypair_file("dev-wallet.json").expect("Wallet not found");
    let client = RpcClient::new(RPC_URL);

    let balance = client.get_balance(&keypair.pubkey()).unwrap();

    println!("Generated wallet: {}", keypair.pubkey());
    println!("{:?}", balance);
    
    match client.request_airdrop(&keypair.pubkey(), 2_000_000_000) {
        Ok(sig) => println!("Airdrop TX: https://explorer.solana.com/tx/{}?cluster=devnet", sig),
        Err(err) => println!("Airdrop failed: {}", err),
    }

    let post_balance = client.get_balance(&keypair.pubkey()).unwrap();

    println!("{:?}", post_balance);
}

// STEP 3: Transfer 0.1 SOL to Turbin3 Wallet
#[test]
fn transfer_sol() {
    let keypair = read_keypair_file("dev-wallet.json").expect("Wallet not found");
    println!("Generated wallet: {}", keypair.pubkey());
    let rpc_client = RpcClient::new(RPC_URL);
    let to_pubkey = Pubkey::from_str(TURBIN3_PUBKEY).unwrap();
    let recent_blockhash = rpc_client.get_latest_blockhash().unwrap();

    let transaction = Transaction::new_signed_with_payer(
        &[system_instruction::transfer(
            &keypair.pubkey(),
            &to_pubkey,
            100_000_000, // 0.1 SOL
        )],
        Some(&keypair.pubkey()),
        &[&keypair],
        recent_blockhash,
    );

    let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .unwrap();
    
    println!("Transfer TX: https://explorer.solana.com/tx/{}?cluster=devnet", signature);
}

// STEP 4: Empty Wallet
#[test]
fn empty_wallet() {
    let keypair = read_keypair_file("dev-wallet.json").expect("Wallet not found");
    let rpc_client = RpcClient::new(RPC_URL);
    let to_pubkey = Pubkey::from_str(TURBIN3_PUBKEY).unwrap();
    let recent_blockhash = rpc_client.get_latest_blockhash().unwrap();
    let balance = rpc_client.get_balance(&keypair.pubkey()).unwrap();
    // Create fee estimation transaction
    
    let fee_msg = Message::new_with_blockhash( 
    &[system_instruction::transfer(&keypair.pubkey(), &to_pubkey, balance)], 
    Some(&keypair.pubkey()), 
    &recent_blockhash, 
    ); 

    let fee = rpc_client.get_fee_for_message(&fee_msg).unwrap();
    let final_balance = balance.saturating_sub(fee);
    println!("Fee for tx: {}", fee);
    println!("Final Balance to transfer: {}", final_balance);

    let second_recent_blockhash = rpc_client.get_latest_blockhash().unwrap();
    
    let transaction = Transaction::new_signed_with_payer(
        &[system_instruction::transfer(
            &keypair.pubkey(),
            &to_pubkey,
            final_balance,
        )],
        Some(&keypair.pubkey()),
        &[&keypair],
        second_recent_blockhash,
    );

    let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .unwrap();
    
    println!("Cleanup TX: https://explorer.solana.com/tx/{}?cluster=devnet", signature);
}

// STEP 5: Mint Completion NFT (UPDATED WITH IDL DATA)
#[test]
fn submit_completion() {
    let signer = read_keypair_file("Turbin3-wallet.json").unwrap();
    let rpc_client = RpcClient::new(RPC_URL);
    
    // 1. Load all public keys
    let turbin3_program_id = Pubkey::from_str(TURBIN3_PROGRAM_ID).unwrap();
    let collection = Pubkey::from_str(COLLECTION_ADDRESS).unwrap();
    let mpl_core_program = Pubkey::from_str(MPL_CORE_PROGRAM).unwrap();
    let mint = Keypair::new();
    let system_program = system_program::id();
    
    // 2. Find PDAs
    let (prereq_pda, _) = Pubkey::find_program_address(
        &[b"prereqs", signer.pubkey().as_ref()],
        &turbin3_program_id,
    );
    println!("The signer address is: {}", signer.pubkey());

    println!("The Prereq address is: {}", prereq_pda);
    
    let (authority, _) = Pubkey::find_program_address(
        &[b"collection", collection.as_ref()],
        &turbin3_program_id,
    );

    println!("The authority address is: {}", authority);

    // 3. Instruction data from IDL
    let data: Vec<u8> = vec![77, 124, 82, 163, 21, 133, 181, 206]; // submit_rs discriminator
    
    // 4. Account metas (corrected from IDL)
    let accounts = vec![
        AccountMeta::new(signer.pubkey(), true),          // user
        AccountMeta::new(prereq_pda, false),               // account (PDA)
        AccountMeta::new(mint.pubkey(), true),            // mint
        AccountMeta::new(collection, false),               // collection (WRITABLE)
        AccountMeta::new_readonly(authority, false),      // authority (PDA)
        AccountMeta::new_readonly(mpl_core_program, false), 
        AccountMeta::new_readonly(system_program, false),
    ];
    
    // 5. Build instruction
    let instruction = Instruction {
        program_id: turbin3_program_id,
        accounts,
        data,
    };
    
    // 6. Send transaction
    let blockhash = rpc_client.get_latest_blockhash().unwrap();
    let transaction = Transaction::new_signed_with_payer(
        &[instruction],
        Some(&signer.pubkey()),
        &[&signer, &mint], // Mint must sign!
        blockhash,
    );
    
    let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .unwrap();

    println!("NFT Minted! TX: https://explorer.solana.com/tx/{}?cluster=devnet", signature);
}
