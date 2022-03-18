use anchor_lang::prelude::*;

#[account]
pub struct Wearable {
  pub authority: Pubkey,       // 32
  pub wearable_id: u64,        // 8
  pub wearable_vault: Pubkey,  // 32
  pub wearable_bump: u8,       // 1
  pub wearable_vault_bump: u8, // 1
}

impl Wearable {
  // authority + user_owner + pin + eventMint
  // gainVault + temporalVault + maxTickets
  pub const SPACE_MAX_SIZE: usize = 32 + 8 + 32 + 1 + 1;
  pub const BUMP_NAME: &'static str = "wearable";
  pub const BUMP_VAULT_NAME: &'static str = "wearable_vault";
}
