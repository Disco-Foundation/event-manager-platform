export interface PurchaseWearableData {
  userPin: string;
  amount: number;
  wearableId: number;
  eventId: string;
}

export interface BuyTicketsData {
  ticketsAmount: number;
  eventId: string;
}
