use {
    crate::collections::Event, crate::errors::ErrorCode, crate::utils::get_tokens_amounts,
    anchor_lang::prelude::*, anchor_spl::token::*,
};

#[derive(Accounts)]
#[instruction(quantity: u32)]
pub struct BuyTickets<'info> {
    #[account(mut)]
    pub event: Box<Account<'info, Event>>,
    #[account(
      mut,
      seeds = [b"ticket_mint".as_ref(), event.key().as_ref()],
      bump = event.ticket_mint_bump,
    )]
    pub ticket_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub payer: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        seeds = [
            b"ticket_vault".as_ref(),
            ticket_mint.key().as_ref(),
            authority.key().as_ref()
        ],
        bump,
        payer = authority,
        token::mint = ticket_mint,
        token::authority = authority,
    )]
    pub ticket_vault: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        seeds = [b"temporal_vault".as_ref(), event.key().as_ref()],
        bump = event.temporal_vault_bump,
      )]
    pub temporal_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn validate(ctx: &Context<BuyTickets>, quantity: &u32) -> Result<()> {
    if (ctx.accounts.event.ticket_quantity as u64)
        < ctx
            .accounts
            .ticket_mint
            .supply
            .checked_add(*quantity as u64)
            .unwrap()
    {
        return err!(ErrorCode::TicketQuantityExceeded);
    }
    Ok(())
}

pub fn handle(ctx: Context<BuyTickets>, quantity: u32) -> Result<()> {
    let amount = ctx
        .accounts
        .event
        .ticket_price
        .checked_mul(quantity as u64)
        .unwrap();
    let (accepted_token_amount_to_transfer, _) = get_tokens_amounts(amount, 1);
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
    // Transfer the equivalent ticket_token to ticket_vault (1 accepted Token == 1 event Token )
    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.ticket_mint.to_account_info(),
                to: ctx.accounts.ticket_vault.to_account_info(),
                authority: ctx.accounts.event.to_account_info(),
            },
            signer,
        ),
        quantity as u64,
    )?;
    let total_value_locked = ctx
        .accounts
        .event
        .total_value_locked
        .checked_add(accepted_token_amount_to_transfer)
        .unwrap();
    (*ctx.accounts.event).total_value_locked = total_value_locked;
    let total_value_locked_in_tickets = ctx
        .accounts
        .event
        .total_value_locked_in_tickets
        .checked_add(accepted_token_amount_to_transfer)
        .unwrap();
    (*ctx.accounts.event).total_value_locked_in_tickets = total_value_locked_in_tickets;
    let total_deposited = ctx
        .accounts
        .event
        .total_deposited
        .checked_add(accepted_token_amount_to_transfer)
        .unwrap();
    (*ctx.accounts.event).total_deposited = total_deposited;
    let tickets_sold = ctx
        .accounts
        .event
        .tickets_sold
        .checked_add(quantity)
        .unwrap();
    (*ctx.accounts.event).tickets_sold = tickets_sold;
    Ok(())
}
