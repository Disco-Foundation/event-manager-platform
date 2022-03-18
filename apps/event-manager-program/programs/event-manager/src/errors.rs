use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
  #[msg("Ticket quantity exceeded")]
  TicketQuantityExceeded,
  #[msg("Invalid certifier")]
  InvalidCertifier,
  #[msg("Insufficient funds")]
  InsufficientFunds,
}
