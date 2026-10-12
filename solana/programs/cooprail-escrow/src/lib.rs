use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Token, TokenAccount, Transfer};

declare_id!("CoopEscrow1111111111111111111111111111111111");

#[program]
pub mod cooprail_escrow {
    use super::*;

    /// 1. Inicializa o Smart Escrow e deposita os fundos da Ordem de Compra (PO)
    pub fn initialize_order_escrow(
        ctx: Context<InitializeOrderEscrow>,
        po_code: String,
        amount: u64,
    ) -> Result<()> {
        require!(po_code.len() <= 32, EscrowError::PoCodeTooLong);
        require!(amount > 0, EscrowError::InvalidAmount);

        let escrow_account = &mut ctx.accounts.escrow_account;
        escrow_account.buyer = ctx.accounts.buyer.key();
        escrow_account.supplier = ctx.accounts.supplier.key();
        escrow_account.po_code = po_code;
        escrow_account.amount = amount;
        escrow_account.bump = ctx.bumps.escrow_account;
        escrow_account.is_settled = false;
        escrow_account.created_at = Clock::get()?.unix_timestamp;

        // Transfere o valor do comprador para o cofre PDA de custódia
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        msg!("Ordem {} custodiada com sucesso: {} unidades", escrow_account.po_code, amount);
        Ok(())
    }

    /// 2. Confirma a entrega e libera os fundos ao fornecedor
    pub fn release_funds_to_supplier(ctx: Context<ReleaseFundsToSupplier>) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        require!(!escrow_account.is_settled, EscrowError::AlreadySettled);

        let po_code = escrow_account.po_code.clone();
        let bump = escrow_account.bump;
        let seeds = &[
            b"purchase_order".as_ref(),
            po_code.as_bytes(),
            &[bump],
        ];
        let signer = &[&seeds[..]];

        // Transfere os fundos custodiados para a conta do fornecedor
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.supplier_token_account.to_account_info(),
            authority: escrow_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, escrow_account.amount)?;

        escrow_account.is_settled = true;

        msg!("Fundos da Ordem {} liberados ao fornecedor", escrow_account.po_code);
        Ok(())
    }

    /// 3. Cancela a ordem e reembolsa o comprador (caso não cumprida)
    pub fn cancel_and_refund(ctx: Context<CancelAndRefund>) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        require!(!escrow_account.is_settled, EscrowError::AlreadySettled);

        let po_code = escrow_account.po_code.clone();
        let bump = escrow_account.bump;
        let seeds = &[
            b"purchase_order".as_ref(),
            po_code.as_bytes(),
            &[bump],
        ];
        let signer = &[&seeds[..]];

        // Devolve os fundos ao comprador
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: escrow_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, escrow_account.amount)?;

        escrow_account.is_settled = true;

        msg!("Ordem {} cancelada e reembolsada ao comprador", escrow_account.po_code);
        Ok(())
    }
}

// ----------------------------------------------------------------------------
// ESTRUTURAS DE CONTAS
// ----------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(po_code: String)]
pub struct InitializeOrderEscrow<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Validado no fluxo de negócio
    pub supplier: AccountInfo<'info>,

    #[account(
        init,
        payer = buyer,
        space = 8 + EscrowRecord::INIT_SPACE,
        seeds = [b"purchase_order", po_code.as_bytes()],
        bump
    )]
    pub escrow_account: Account<'info, EscrowRecord>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = buyer,
        token::mint = mint,
        token::authority = escrow_account,
        seeds = [b"vault", po_code.as_bytes()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// CHECK: Token mint (ex: USDC)
    pub mint: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ReleaseFundsToSupplier<'info> {
    #[account(
        mut,
        constraint = buyer.key() == escrow_account.buyer @ EscrowError::UnauthorizedSigner
    )]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"purchase_order", escrow_account.po_code.as_bytes()],
        bump = escrow_account.bump
    )]
    pub escrow_account: Account<'info, EscrowRecord>,

    #[account(
        mut,
        seeds = [b"vault", escrow_account.po_code.as_bytes()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = supplier_token_account.owner == escrow_account.supplier @ EscrowError::InvalidSupplierAccount
    )]
    pub supplier_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelAndRefund<'info> {
    #[account(
        mut,
        constraint = buyer.key() == escrow_account.buyer @ EscrowError::UnauthorizedSigner
    )]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"purchase_order", escrow_account.po_code.as_bytes()],
        bump = escrow_account.bump
    )]
    pub escrow_account: Account<'info, EscrowRecord>,

    #[account(
        mut,
        seeds = [b"vault", escrow_account.po_code.as_bytes()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = buyer_token_account.owner == escrow_account.buyer @ EscrowError::InvalidBuyerAccount
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

// ----------------------------------------------------------------------------
// ESTADO ON-CHAIN
// ----------------------------------------------------------------------------

#[account]
#[derive(InitSpace)]
pub struct EscrowRecord {
    pub buyer: Pubkey,
    pub supplier: Pubkey,
    #[max_len(32)]
    pub po_code: String,
    pub amount: u64,
    pub bump: u8,
    pub is_settled: bool,
    pub created_at: i64,
}

// ----------------------------------------------------------------------------
// ERROS CUSTOMIZADOS
// ----------------------------------------------------------------------------

#[error_code]
pub enum EscrowError {
    #[msg("O código do Pedido de Compra não pode exceder 32 caracteres")]
    PoCodeTooLong,
    #[msg("O valor do pedido deve ser maior que zero")]
    InvalidAmount,
    #[msg("A ordem já foi liquidada ou encerrada")]
    AlreadySettled,
    #[msg("Apenas o comprador emissor da ordem pode autorizar a liberação")]
    UnauthorizedSigner,
    #[msg("A conta de token do fornecedor não corresponde ao titular da ordem")]
    InvalidSupplierAccount,
    #[msg("A conta de token do comprador não corresponde ao titular da ordem")]
    InvalidBuyerAccount,
}
