export type Entity<T = unknown> = T & { id: string };

export type EventDto = Entity<{
  owner: string;
  name: string;
  description: string;
  location: string;
  banner: string;
  startDate: Date;
  endDate: Date;
  tickets: [
    {
      ticketPrice: number;
      ticketQuantity: number;
      ticketsSold: number;
      ticketMint: string | null;
    }
  ];
  treasury: {
    acceptedMint: string | null;
    valueLocked: number;
    valueDeposited: number;
    profit: number;
  };
  certifierFunds: number;
  published: boolean;
}>;
