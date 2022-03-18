use {
  anchor_lang::prelude::*,
  anchor_spl::token::{burn, transfer, Burn, Mint, Token, TokenAccount, Transfer},
  
  crate::collections::{Event, Wearable},
  crate::errors::ErrorCode,
  crate::utils::get_tokens_amounts,
};

#[derive(Accounts)]
#[instruction(
  wearable_id: u64,
  amount: u64
)]
pub struct Purchase<'info> {
  #[account(
    mut,
    has_one = certifier @ ErrorCode::InvalidCertifier,
  )]
  pub event: Box<Account<'info, Event>>,
  #[account(
    mut,
    seeds = [b"event_mint".as_ref(), event.key().as_ref()],
    bump = event.event_mint_bump,
  )]
  pub event_mint: Box<Account<'info, Mint>>,
  #[account(
    seeds = [
      b"wearable".as_ref(), 
      wearable_id.to_le_bytes().as_ref(), 
      event.key().as_ref()
    ],
    bump = wearable.wearable_bump,
  )]
  pub wearable: Box<Account<'info, Wearable>>,
  #[account(
    mut,
    seeds = [
      b"wearable_vault".as_ref(),
      event_mint.key().as_ref(), 
      wearable.key().as_ref()
    ],
    bump = wearable.wearable_vault_bump,
  )]
  pub wearable_vault: Box<Account<'info, TokenAccount>>,
  #[account(
    mut,
    seeds = [b"temporal_vault".as_ref(), event.key().as_ref()],
    bump = event.temporal_vault_bump,
  )]
  pub temporal_vault: Box<Account<'info, TokenAccount>>,
  #[account(
    mut,
    seeds = [b"gain_vault".as_ref(), event.key().as_ref()],
    bump = event.gain_vault_bump,
  )]
  pub gain_vault: Box<Account<'info, TokenAccount>>,
  pub certifier: Signer<'info>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
}

pub fn validate(ctx: &Context<Purchase>, amount: &u64) -> Result<()> {
  if ctx.accounts.wearable_vault.amount < *amount {
    return err!(ErrorCode::InsufficientFunds)
  }
  
  Ok(())
}

pub fn handle(ctx: Context<Purchase>, amount: u64) -> Result<()> {
  let (amount_to_charge, amount_to_transfer) = get_tokens_amounts(amount, 1);
  let event_id = ctx.accounts.event.event_id.to_le_bytes();

  let seeds = &[
    "event".as_bytes(),
    event_id.as_ref(),
    ctx.accounts.event.authority.as_ref(),
    &[ctx.accounts.event.event_bump],
  ];
  let signer = &[&seeds[..]];

  // First, we burn X amount of event token from the wearable_vault
  burn(
    CpiContext::new_with_signer(
      ctx.accounts.token_program.to_account_info(),
      Burn {
        mint: ctx.accounts.event_mint.to_account_info(), // should be ctx.accounts.wearable.wearable_vault and avoid pass the vault
        to: ctx.accounts.wearable_vault.to_account_info(),
        authority: ctx.accounts.event.to_account_info(),
      },
      signer,
    ),
    amount_to_charge,
  )?;

  // Then we transfer the same X amount from temporal_vault to gain_vault.
  transfer(
    CpiContext::new_with_signer(
      ctx.accounts.token_program.to_account_info(),
      Transfer {
        from: ctx.accounts.temporal_vault.to_account_info(), // should be ctx.accounts.event.temporal_vault and avoid pass the vaults
        to: ctx.accounts.gain_vault.to_account_info(), // should be ctx.accounts.event.gain_vault and avoid pass the vaults
        authority: ctx.accounts.event.to_account_info(),
      },
      signer,
    ),
    amount_to_transfer,
  )?;

  let total_value_locked = ctx
    .accounts
    .event
    .total_value_locked
    .checked_sub(amount_to_transfer)
    .unwrap();
  ctx.accounts.event.total_value_locked = total_value_locked;
  let total_value_locked_in_recharges = ctx
    .accounts
    .event
    .total_value_locked_in_recharges
    .checked_sub(amount_to_transfer)
    .unwrap();
  ctx.accounts.event.total_value_locked_in_recharges = total_value_locked_in_recharges;
  let total_profit = ctx
    .accounts
    .event
    .total_profit
    .checked_add(amount_to_transfer)
    .unwrap();
  ctx.accounts.event.total_profit = total_profit;
  let total_profit_in_purchases = ctx
    .accounts
    .event
    .total_profit_in_purchases
    .checked_add(amount_to_transfer)
    .unwrap();
  ctx.accounts.event.total_profit_in_purchases = total_profit_in_purchases;

  Ok(())
}
