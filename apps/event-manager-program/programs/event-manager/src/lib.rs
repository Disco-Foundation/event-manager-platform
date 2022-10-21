use anchor_lang::prelude::*;

mod collections;
mod errors;
mod instructions;
mod utils;

use instructions::*;

declare_id!("5eAvRjnhVvnRWLjgProwQACmB6FofBQJ58WsjYKvkXR");

#[program]
pub mod event_manager {
    use super::*;

    pub fn create_event(
        ctx: Context<CreateEvent>,
        event_id: String,
        name: String,
        description: String,
        banner: String,
        location: String,
        event_start_date: i64,
        event_end_date: i64,
        ticket_price: u64,
        ticket_quantity: u32
    ) -> Result<()> {
        instructions::event::create_event::handle(
            ctx,
            event_id,
            name,
            description,
            banner,
            location,
            event_start_date,
            event_end_date,
            ticket_price,
            ticket_quantity
        )
    }

    #[access_control(instructions::buy_tickets::validate(&ctx, &quantity))]
    pub fn buy_tickets(ctx: Context<BuyTickets>, quantity: u32) -> Result<()> {
        instructions::event::buy_tickets::handle(ctx, quantity)
    }

    pub fn check_in(ctx: Context<CheckIn>, wearable_id: u64) -> Result<()> {
        instructions::event::check_in::handle(ctx, wearable_id)
    }

    pub fn recharge(ctx: Context<Recharge>, wearable_id: u64, amount: u64) -> Result<()> {
        instructions::event::recharge::handle(ctx, wearable_id, amount)
    }

    #[access_control(instructions::purchase::validate(&ctx, &amount))]
    pub fn purchase(ctx: Context<Purchase>, _wearable_id: u64, amount: u64) -> Result<()> {
        instructions::event::purchase::handle(ctx, amount)
    }
}
