
#[allow(unexpected_cfgs)]
#[allow(deprecated)]
use anchor_lang::prelude::*;
use anchor_lang::{ system_program::{transfer, Transfer}};
declare_id!("H2hDEw84RLsBouSx84DL5yokaoKKzraVQ2BsEUt1miRs");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.initialize(&ctx.bumps)
    }

    pub fn deposit(ctx: Context<Payments>, amount: u64) -> Result<()>{
        ctx.accounts.deposit(amount)
    }
    pub fn withdraw(ctx: Context<Payments>, amount: u64) -> Result<()>{
        ctx.accounts.withdraw(amount)
    }
    pub fn close(ctx: Context<Close>) -> Result<()>{
        ctx.accounts.close()
    }
}

#[account]
pub struct VaultState{
    pub state_bump: u8,
    pub vault_bump: u8,
}

impl VaultState{
     const SPACE: usize = 8 + 1 * 2;
}

#[derive(Accounts)]
pub struct Initialize<'info> {

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account{
        init, 
        payer = signer,
        seeds = [b"vault_state", signer.key().as_ref()],
        bump,
        space = VaultState::SPACE
    }]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [b"vault_account", signer.key().as_ref()],
        bump, 
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl <'info> Initialize<'info>{
    fn initialize(&mut self, bumps: &InitializeBumps) -> Result <()>{

        self.vault_state.state_bump = bumps.vault_state;
        self.vault_state.vault_bump = bumps.vault;

        let rent_exempt = Rent::get()?.minimum_balance(VaultState::SPACE);
        
        let from  = self.signer.to_account_info();

        let to = self.vault.to_account_info();

        let program_id = self.system_program.to_account_info();

        let cpi_context = CpiContext::new(program_id,
            Transfer{
            from: from,
            to: to,
        } );

        transfer( cpi_context, rent_exempt )?;
        Ok(())

    }
}


#[derive(Accounts)]
pub struct Payments<'info>{
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut, 
        seeds = [b"vault_account", signer.key().as_ref()],
        bump
    ) ]
    pub vault: SystemAccount<'info>,

    #[account(
        seeds = [b"vault_state", signer.key().as_ref()],
        bump
    )]
    pub vault_state: Account<'info, VaultState>,

    pub system_program: Program<'info, System>
}

impl <'info> Payments <'info>{

    fn deposit(&mut self, amount: u64) -> Result<()>{
        let from = self.signer.to_account_info();
        let to = self.vault.to_account_info();
        let program_id = self.system_program.to_account_info();

        let cpi_context = CpiContext::new(program_id, Transfer{
            from: from,
            to: to,
        });

        transfer(cpi_context, amount)?;
        
        Ok(())
    }

    fn withdraw(&mut self, amount: u64) -> Result<()>{

        let rent_exempt = Rent::get()?.minimum_balance(VaultState::SPACE);
        let account_lamports = self.vault.to_account_info().lamports();

        require!(amount < account_lamports - rent_exempt, ErrorCode::InsufficentBalance);

        let to = self.signer.to_account_info();
        let from = self.vault.to_account_info();
        let program_id = self.system_program.to_account_info();

        let seeds = &[
            b"vault_account",
            self.signer.to_account_info().key.as_ref(),
            &[self.vault_state.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(program_id, Transfer{
            from: from,
            to: to,
        }, signer_seeds);

        transfer(cpi_context, amount)?;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Close<'info>{
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault_account", signer.key().as_ref() ],
        bump
    )]
    pub vault: SystemAccount<'info>,

    #[account(
        mut,
        close = signer, 
        seeds = [b"vault_state", signer.key().as_ref()],
        bump
    )]
    pub vault_state: Account<'info, VaultState>,

    pub system_program: Program<'info, System>,
}

impl <'info> Close <'info>{
    fn close(&mut self) -> Result <()> {
        let to = self.signer.to_account_info();
        let from = self.vault.to_account_info();
        let program_id = self.system_program.to_account_info();

        let vault_balance = self.vault.lamports();

        let seeds = &[b"vault_account", self.signer.to_account_info().key.as_ref(), &[self.vault_state.vault_bump]];
        let signer_seeds = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(program_id, Transfer{
            from: from,
            to: to,
        }, signer_seeds);

        transfer(cpi_context, vault_balance)?;
        Ok(())

    }
}

#[error_code]
pub enum ErrorCode{
    #[msg("Not enought Lamports to withdraw")]
    InsufficentBalance,
}
