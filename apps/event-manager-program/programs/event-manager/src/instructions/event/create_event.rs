use {crate::collections::Event, anchor_lang::prelude::*, anchor_spl::token::*};

#[derive(Accounts)]
#[instruction(
  event_id: u64, 
  name: String,
  description: String,
  banner: String,
  location: String,
  event_start_date: i64, 
  ticket_price: u64, 
  ticket_quantity: u32
)]
pub struct CreateEvent<'info> {
  #[account(
    init,
    seeds = [
      b"event".as_ref(),
      event_id.to_le_bytes().as_ref(),
      authority.key().as_ref(),
    ],
    bump,
    payer = authority,
    // 8 for Anchor discriminator
    space = 8 + Event::SPACE_MAX_SIZE
  )]
  pub event: Box<Account<'info, Event>>,
  pub accepted_mint: Box<Account<'info, Mint>>,
  #[account(
    init,
    seeds = [b"event_mint".as_ref(), event.key().as_ref()],
    bump,
    payer = authority,
    mint::decimals = accepted_mint.decimals,
    mint::authority = event,
  )]
  pub event_mint: Box<Account<'info, Mint>>,
  #[account(
    init,
    seeds = [b"ticket_mint".as_ref(), event.key().as_ref()],
    bump,
    payer = authority,
    mint::decimals = 0,
    mint::authority = event,
  )]
  pub ticket_mint: Box<Account<'info, Mint>>,
  #[account(
    init,
    seeds = [b"attendance_mint".as_ref(), event.key().as_ref()],
    bump,
    payer = authority,
    mint::decimals = 0,
    mint::authority = event,
  )]
  pub attendance_mint: Box<Account<'info, Mint>>,
  #[account(
    init,
    payer = authority,
    seeds = [b"temporal_vault".as_ref(), event.key().as_ref()],
    bump,
    token::mint = accepted_mint,
    token::authority = event,
  )]
  pub temporal_vault: Box<Account<'info, TokenAccount>>,
  #[account(
    init,
    payer = authority,
    seeds = [b"gain_vault".as_ref(), event.key().as_ref()],
    bump,
    token::mint = accepted_mint,
    token::authority = event,
  )]
  pub gain_vault: Box<Account<'info, TokenAccount>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub certifier: Signer<'info>,
  pub rent: Sysvar<'info, Rent>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
}

pub fn handle(
  ctx: Context<CreateEvent>, 
  event_id: u64, 
  name: String, 
  description: String,
  banner: String,
  location: String,
  event_start_date: i64,
  event_end_date: i64,
  ticket_price: u64, 
  ticket_quantity: u32
) -> Result<()> {
  msg!("Creating Event...");
  (*ctx.accounts.event).authority = ctx.accounts.authority.key();
  (*ctx.accounts.event).certifier = ctx.accounts.certifier.key();
  (*ctx.accounts.event).event_id = event_id;
  (*ctx.accounts.event).name = name;
  (*ctx.accounts.event).description = description;
  (*ctx.accounts.event).banner = banner;
  (*ctx.accounts.event).location = location;
  (*ctx.accounts.event).event_start_date = event_start_date;
  (*ctx.accounts.event).event_end_date = event_end_date;
  let ticket_price_multiplier = (10 as u32).checked_pow(ctx.accounts.accepted_mint.decimals as u32).unwrap();
  (*ctx.accounts.event).ticket_price = ticket_price.checked_mul(ticket_price_multiplier as u64).unwrap();
  (*ctx.accounts.event).ticket_quantity = ticket_quantity;
  (*ctx.accounts.event).tickets_sold = 0;
  (*ctx.accounts.event).total_value_locked = 0;
  (*ctx.accounts.event).total_value_locked_in_tickets = 0;
  (*ctx.accounts.event).total_value_locked_in_recharges = 0;
  (*ctx.accounts.event).total_deposited = 0;
  (*ctx.accounts.event).total_profit = 0;
  (*ctx.accounts.event).total_profit_in_tickets = 0;
  (*ctx.accounts.event).total_profit_in_purchases = 0;
  (*ctx.accounts.event).event_mint = ctx.accounts.event_mint.key();
  (*ctx.accounts.event).ticket_mint = ctx.accounts.ticket_mint.key();
  (*ctx.accounts.event).accepted_mint = ctx.accounts.accepted_mint.key();
  (*ctx.accounts.event).temporal_vault = ctx.accounts.temporal_vault.key();
  (*ctx.accounts.event).gain_vault = ctx.accounts.gain_vault.key();
  (*ctx.accounts.event).event_bump = *ctx.bumps.get(Event::BUMP_NAME).unwrap();
  (*ctx.accounts.event).event_mint_bump = *ctx.bumps.get(Event::BUMP_EVENT_MINT_NAME).unwrap();
  (*ctx.accounts.event).ticket_mint_bump = *ctx.bumps.get(Event::BUMP_TICKET_MINT_NAME).unwrap();
  (*ctx.accounts.event).attendance_mint_bump = *ctx.bumps.get(Event::BUMP_ATTENDANCE_MINT_NAME).unwrap();
  (*ctx.accounts.event).temporal_vault_bump = *ctx.bumps.get(Event::BUMP_TEMPORAL_VAULT_NAME).unwrap();
  (*ctx.accounts.event).gain_vault_bump = *ctx.bumps.get(Event::BUMP_GAIN_VAULT_NAME).unwrap();

  Ok(())
}
