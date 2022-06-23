use anchor_lang::prelude::*;

#[account]
pub struct Event {
  pub authority: Pubkey,                    // 32
  pub certifier: Pubkey,                    // 32
  pub name: String,                         // (40 + 4)
  pub description: String,                  // (500 + 4)
  pub banner: String,                       // (40 + 4)
  pub location: String,                     // (40 + 4)
  pub event_start_date: i64,                // 16
  pub event_end_date: i64,                  // 16
  pub ticket_quantity: u32,                 // 4
  pub ticket_price: u64,                    // 8
  pub total_value_locked: u64,              // 8
  pub total_value_locked_in_tickets: u64,   // 8
  pub total_value_locked_in_recharges: u64, // 8
  pub total_deposited: u64,                 // 8
  pub total_profit: u64,                    // 8
  pub total_profit_in_tickets: u64,         // 8
  pub total_profit_in_purchases: u64,       // 8
  pub accepted_mint: Pubkey,                // 32
  pub event_mint: Pubkey,                   // 32
  pub ticket_mint: Pubkey,                  // 32
  pub attendance_mint: Pubkey,              // 32
  pub gain_vault: Pubkey,                   // 32
  pub temporal_vault: Pubkey,               // 32
  pub event_id: u64,                        // 8
  pub event_bump: u8,                       // 1
  pub event_mint_bump: u8,                  // 1
  pub ticket_mint_bump: u8,                 // 1
  pub attendance_mint_bump: u8,             // 1
  pub temporal_vault_bump: u8,              // 1
  pub gain_vault_bump: u8,                  // 1
}

impl Event {
  // authority + name + acceptedMint + eventMint
  // gainVault + temporalVault + maxTickets
  pub const SPACE_MAX_SIZE: usize = 32
    + 32
    + (40 + 4)
    + (40 + 4)
    + (40 + 4)
    + (500 + 4)
    + 16
    + 4
    + 8
    + 32
    + 32
    + 32
    + 32
    + 32
    + 32
    + 8
    + 8
    + 8
    + 8
    + 8
    + 8
    + 8
    + 8
    + 1
    + 1
    + 1
    + 1
    + 1
    + 1;
  pub const BUMP_NAME: &'static str = "event";
  pub const BUMP_EVENT_MINT_NAME: &'static str = "event_mint";
  pub const BUMP_TICKET_MINT_NAME: &'static str = "ticket_mint";
  pub const BUMP_ATTENDANCE_MINT_NAME: &'static str = "attendance_mint";
  pub const BUMP_TEMPORAL_VAULT_NAME: &'static str = "temporal_vault";
  pub const BUMP_GAIN_VAULT_NAME: &'static str = "gain_vault";

  pub const TEST: &'static [u8; 5] = b"event";
}
