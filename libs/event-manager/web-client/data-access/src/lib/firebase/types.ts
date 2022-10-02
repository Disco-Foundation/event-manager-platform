export type Entity<T = unknown> = T & { id: string };

export type EventDto = Entity<{
  owner: string;
  name: string;
  description: string;
  location: string;
  banner: string;
  startDate: Date;
  endDate: Date;
}>;
