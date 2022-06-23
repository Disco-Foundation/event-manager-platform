use {
  anchor_lang::prelude::*,
  anchor_spl::token::*,
  crate::collections::{Event, Wearable},
}; 

#[derive(Accounts)]
#[instruction(wearable_id: u64)]
pub struct CheckIn<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(mut)]
  pub event: Box<Account<'info, Event>>,
  #[account(
    mut,
    seeds = [b"event_mint".as_ref(), event.key().as_ref()],
    bump = event.event_mint_bump,
  )]
  pub event_mint: Box<Account<'info, Mint>>,
  #[account(
    mut,
    seeds = [b"ticket_mint".as_ref(), event.key().as_ref()],
    bump = event.ticket_mint_bump,
  )]
  pub ticket_mint: Box<Account<'info, Mint>>,
  #[account(
    mut,
    seeds = [b"attendance_mint".as_ref(), event.key().as_ref()],
    bump = event.attendance_mint_bump,
  )]
  pub attendance_mint: Box<Account<'info, Mint>>,
  #[account(
    init,
    payer = authority,
    seeds = [
      b"wearable".as_ref(), 
      wearable_id.to_le_bytes().as_ref(), 
      event.key().as_ref()
    ],
    bump,
    space = 8 + Wearable::SPACE_MAX_SIZE
  )]
  pub wearable: Box<Account<'info, Wearable>>,
  #[account(
    init_if_needed,
    seeds = [
      b"attendance_vault".as_ref(),
      attendance_mint.key().as_ref(),
      authority.key().as_ref()
    ],
    bump,
    payer = authority,
    token::mint = attendance_mint,
    token::authority = authority,
  )]
  pub attendance_vault: Box<Account<'info, TokenAccount>>,
  #[account(
    init,
    payer = authority,
    seeds = [
      b"wearable_vault".as_ref(),
      event_mint.key().as_ref(), 
      wearable.key().as_ref()
    ],
    bump,
    token::mint = event_mint,
    token::authority = event,
  )]
  pub wearable_vault: Box<Account<'info, TokenAccount>>,
  #[account(
    mut,
    seeds = [
        b"ticket_vault".as_ref(),
        ticket_mint.key().as_ref(),
        authority.key().as_ref()
    ],
    bump,
  )]
  pub ticket_vault: Box<Account<'info, TokenAccount>>,
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
  pub rent: Sysvar<'info, Rent>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<CheckIn>, wearable_id: u64) -> Result<()> {
  ctx.accounts.wearable.authority = ctx.accounts.authority.key();
  ctx.accounts.wearable.wearable_id = wearable_id;
  ctx.accounts.wearable.wearable_vault = ctx.accounts.wearable_vault.key();
  ctx.accounts.wearable.wearable_bump = *ctx.bumps.get(Wearable::BUMP_NAME).unwrap();
  ctx.accounts.wearable.wearable_vault_bump = *ctx.bumps.get(Wearable::BUMP_VAULT_NAME).unwrap();

  let event_id = ctx.accounts.event.event_id.to_le_bytes();

  let seeds = &[
    "event".as_bytes(),
    event_id.as_ref(),
    ctx.accounts.event.authority.as_ref(),
    &[ctx.accounts.event.event_bump],
  ];
  let signer = &[&seeds[..]];

  // First, we burn a ticket token from the ticket_vault
  burn(
    CpiContext::new(
      ctx.accounts.token_program.to_account_info(),
      Burn {
        mint: ctx.accounts.ticket_mint.to_account_info(), // should be ctx.accounts.wearable.wearable_vault and avoid pass the vault
        from: ctx.accounts.ticket_vault.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
      },
    ),
    1,
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
    ctx.accounts.event.ticket_price,
  )?;

  // Finally, we send an attendance token to the authority
  mint_to(
    CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.attendance_mint.to_account_info(),
            to: ctx.accounts.attendance_vault.to_account_info(),
            authority: ctx.accounts.event.to_account_info(),
        },
        signer,
    ),
    1,
  )?;

  let total_profit = ctx
    .accounts
    .event
    .total_profit
    .checked_add(ctx.accounts.event.ticket_price)
    .unwrap();
  ctx.accounts.event.total_profit = total_profit;
  let total_profit_in_tickets = ctx
    .accounts
    .event
    .total_profit_in_tickets
    .checked_add(ctx.accounts.event.ticket_price)
    .unwrap();
  ctx.accounts.event.total_profit_in_tickets = total_profit_in_tickets;
  let total_value_locked = ctx
    .accounts
    .event
    .total_value_locked
    .checked_sub(ctx.accounts.event.ticket_price)
    .unwrap();
  ctx.accounts.event.total_value_locked = total_value_locked;
  let total_value_locked_in_tickets = ctx
    .accounts
    .event
    .total_value_locked_in_tickets
    .checked_sub(ctx.accounts.event.ticket_price)
    .unwrap();
  ctx.accounts.event.total_value_locked_in_tickets = total_value_locked_in_tickets;

  Ok(())
}
