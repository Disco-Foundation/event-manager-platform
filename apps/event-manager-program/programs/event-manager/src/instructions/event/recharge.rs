use {
  anchor_lang::prelude::*,
  anchor_spl::token::*,
  crate::collections::{Event, Wearable},
  crate::utils::get_tokens_amounts,
};

#[derive(Accounts)]
#[instruction(
  wearable_id: u64,
  amount: u64
)]
pub struct Recharge<'info> {
  #[account(mut)]
  pub event: Box<Account<'info, Event>>,
  #[account(
    mut,
    seeds = [b"event_mint".as_ref(), event.key().as_ref()],
    bump = event.event_mint_bump,
  )]
  pub event_mint: Box<Account<'info, Mint>>,
  #[account(mut)]
  pub payer: Box<Account<'info, TokenAccount>>,
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
  pub authority: Signer<'info>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
}

// the swap_ratio is used to calculate the Event Tokens (ET) amount based on the Accepted Tokens (AT) and the
// business case. For example, if your relation is 1:1, for each AT you'll mint one ET, then the swap_ratio is = 1
// If the AT is stronger than ET, lets say for 1 AT you will mint 10 ET, then the swap_ratio is  = 10 . Finally, if
// the case is you need 150 AT to mint 1 ET, then the swap ratio will.
//
// In other order, yoy could give the amount of ET and get the AT, just invert the ratios. Using one above case, for each
// 1 AT you will mint 10 ET, and you want to get the accepted token of 182 ET, the ratio wont be 10, instead will be 1/10 = 0,1.

pub fn handle(ctx: Context<Recharge>, _wearable_id: u64, amount: u64) -> Result<()> {
  let (accepted_token_amount_to_transfer, event_token_amount_to_transfer) = get_tokens_amounts(amount, 1);
  let event_id = ctx.accounts.event.event_id.to_le_bytes();
  let seeds = [
    "event".as_bytes(),
    event_id.as_ref(),
    ctx.accounts.event.authority.as_ref(),
    &[ctx.accounts.event.event_bump],
  ];
  let signer = &[&seeds[..]];

  // Charge the accepted_token amount from payer
  transfer(
    CpiContext::new(
      ctx.accounts.token_program.to_account_info(),
      Transfer {
        from: ctx.accounts.payer.to_account_info(),
        to: ctx.accounts.temporal_vault.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
      },
    ),
    accepted_token_amount_to_transfer,
  )?;

  // Transfer the equivalent event_token to wearable_vault (1 accepted Token == 1 event Token )
  mint_to(
    CpiContext::new_with_signer(
      ctx.accounts.token_program.to_account_info(),
      MintTo {
        mint: ctx.accounts.event_mint.to_account_info(),
        to: ctx.accounts.wearable_vault.to_account_info(),
        authority: ctx.accounts.event.to_account_info(),
      },
      signer,
    ),
    event_token_amount_to_transfer,
  )?;

  let total_value_locked = ctx
    .accounts
    .event
    .total_value_locked
    .checked_add(accepted_token_amount_to_transfer)
    .unwrap();
  (*ctx.accounts.event).total_value_locked = total_value_locked;
  let total_value_locked_in_recharges = ctx
    .accounts
    .event
    .total_value_locked_in_recharges
    .checked_add(accepted_token_amount_to_transfer)
    .unwrap();
  (*ctx.accounts.event).total_value_locked_in_recharges = total_value_locked_in_recharges;
  let total_deposited = ctx
    .accounts
    .event
    .total_deposited
    .checked_add(accepted_token_amount_to_transfer)
    .unwrap();
  (*ctx.accounts.event).total_deposited = total_deposited;

  Ok(())
}
