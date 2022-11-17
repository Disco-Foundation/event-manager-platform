export type EventManager = {
  version: '0.1.0';
  name: 'event_manager';
  instructions: [
    {
      name: 'createEvent';
      accounts: [
        {
          name: 'event';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'event';
              },
              {
                kind: 'arg';
                type: 'string';
                path: 'event_id';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'authority';
              }
            ];
          };
        },
        {
          name: 'acceptedMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'eventMint';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'event_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'ticketMint';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'ticket_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'attendanceMint';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'attendance_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'temporalVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'temporal_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'gainVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'gain_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'certifier';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'eventId';
          type: 'string';
        },
        {
          name: 'name';
          type: 'string';
        },
        {
          name: 'description';
          type: 'string';
        },
        {
          name: 'banner';
          type: 'string';
        },
        {
          name: 'location';
          type: 'string';
        },
        {
          name: 'eventStartDate';
          type: 'i64';
        },
        {
          name: 'eventEndDate';
          type: 'i64';
        },
        {
          name: 'ticketPrice';
          type: 'u64';
        },
        {
          name: 'ticketQuantity';
          type: 'u32';
        }
      ];
    },
    {
      name: 'buyTickets';
      accounts: [
        {
          name: 'event';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ticketMint';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'ticket_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'ticketVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'ticket_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Mint';
                path: 'ticket_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'authority';
              }
            ];
          };
        },
        {
          name: 'temporalVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'temporal_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'quantity';
          type: 'u32';
        }
      ];
    },
    {
      name: 'checkIn';
      accounts: [
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'event';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'eventMint';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'event_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'ticketMint';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'ticket_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'attendanceMint';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'attendance_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'wearable';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'wearable';
              },
              {
                kind: 'arg';
                type: 'u64';
                path: 'wearable_id';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'attendanceVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'attendance_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Mint';
                path: 'attendance_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'authority';
              }
            ];
          };
        },
        {
          name: 'wearableVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'wearable_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Mint';
                path: 'event_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Wearable';
                path: 'wearable';
              }
            ];
          };
        },
        {
          name: 'ticketVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'ticket_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Mint';
                path: 'ticket_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'authority';
              }
            ];
          };
        },
        {
          name: 'temporalVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'temporal_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'gainVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'gain_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'wearableId';
          type: 'u64';
        }
      ];
    },
    {
      name: 'recharge';
      accounts: [
        {
          name: 'event';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'eventMint';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'event_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'wearable';
          isMut: false;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'wearable';
              },
              {
                kind: 'arg';
                type: 'u64';
                path: 'wearable_id';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'wearableVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'wearable_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Mint';
                path: 'event_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Wearable';
                path: 'wearable';
              }
            ];
          };
        },
        {
          name: 'temporalVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'temporal_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'wearableId';
          type: 'u64';
        },
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'purchase';
      accounts: [
        {
          name: 'event';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'eventMint';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'event_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'wearable';
          isMut: false;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'wearable';
              },
              {
                kind: 'arg';
                type: 'u64';
                path: 'wearable_id';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'wearableVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'wearable_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Mint';
                path: 'event_mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Wearable';
                path: 'wearable';
              }
            ];
          };
        },
        {
          name: 'temporalVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'temporal_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'gainVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'gain_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Event';
                path: 'event';
              }
            ];
          };
        },
        {
          name: 'certifier';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'wearableId';
          type: 'u64';
        },
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    }
  ];
  accounts: [
    {
      name: 'event';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'certifier';
            type: 'publicKey';
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'description';
            type: 'string';
          },
          {
            name: 'banner';
            type: 'string';
          },
          {
            name: 'location';
            type: 'string';
          },
          {
            name: 'eventStartDate';
            type: 'i64';
          },
          {
            name: 'eventEndDate';
            type: 'i64';
          },
          {
            name: 'ticketQuantity';
            type: 'u32';
          },
          {
            name: 'ticketsSold';
            type: 'u32';
          },
          {
            name: 'ticketPrice';
            type: 'u64';
          },
          {
            name: 'totalValueLocked';
            type: 'u64';
          },
          {
            name: 'totalValueLockedInTickets';
            type: 'u64';
          },
          {
            name: 'totalValueLockedInRecharges';
            type: 'u64';
          },
          {
            name: 'totalDeposited';
            type: 'u64';
          },
          {
            name: 'totalProfit';
            type: 'u64';
          },
          {
            name: 'totalProfitInTickets';
            type: 'u64';
          },
          {
            name: 'totalProfitInPurchases';
            type: 'u64';
          },
          {
            name: 'acceptedMint';
            type: 'publicKey';
          },
          {
            name: 'eventMint';
            type: 'publicKey';
          },
          {
            name: 'ticketMint';
            type: 'publicKey';
          },
          {
            name: 'attendanceMint';
            type: 'publicKey';
          },
          {
            name: 'gainVault';
            type: 'publicKey';
          },
          {
            name: 'temporalVault';
            type: 'publicKey';
          },
          {
            name: 'eventId';
            type: 'string';
          },
          {
            name: 'eventBump';
            type: 'u8';
          },
          {
            name: 'eventMintBump';
            type: 'u8';
          },
          {
            name: 'ticketMintBump';
            type: 'u8';
          },
          {
            name: 'attendanceMintBump';
            type: 'u8';
          },
          {
            name: 'temporalVaultBump';
            type: 'u8';
          },
          {
            name: 'gainVaultBump';
            type: 'u8';
          }
        ];
      };
    },
    {
      name: 'wearable';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'wearableId';
            type: 'u64';
          },
          {
            name: 'wearableVault';
            type: 'publicKey';
          },
          {
            name: 'wearableBump';
            type: 'u8';
          },
          {
            name: 'wearableVaultBump';
            type: 'u8';
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: 'TicketQuantityExceeded';
      msg: 'Ticket quantity exceeded';
    },
    {
      code: 6001;
      name: 'InvalidCertifier';
      msg: 'Invalid certifier';
    },
    {
      code: 6002;
      name: 'InsufficientFunds';
      msg: 'Insufficient funds';
    }
  ];
};

export const IDL: EventManager = {
  version: '0.1.0',
  name: 'event_manager',
  instructions: [
    {
      name: 'createEvent',
      accounts: [
        {
          name: 'event',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'event',
              },
              {
                kind: 'arg',
                type: 'string',
                path: 'event_id',
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'authority',
              },
            ],
          },
        },
        {
          name: 'acceptedMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'eventMint',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'event_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'ticketMint',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'ticket_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'attendanceMint',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'attendance_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'temporalVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'temporal_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'gainVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'gain_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'certifier',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'eventId',
          type: 'string',
        },
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'description',
          type: 'string',
        },
        {
          name: 'banner',
          type: 'string',
        },
        {
          name: 'location',
          type: 'string',
        },
        {
          name: 'eventStartDate',
          type: 'i64',
        },
        {
          name: 'eventEndDate',
          type: 'i64',
        },
        {
          name: 'ticketPrice',
          type: 'u64',
        },
        {
          name: 'ticketQuantity',
          type: 'u32',
        },
      ],
    },
    {
      name: 'buyTickets',
      accounts: [
        {
          name: 'event',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ticketMint',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'ticket_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'ticketVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'ticket_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Mint',
                path: 'ticket_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'authority',
              },
            ],
          },
        },
        {
          name: 'temporalVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'temporal_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'quantity',
          type: 'u32',
        },
      ],
    },
    {
      name: 'checkIn',
      accounts: [
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'event',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'eventMint',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'event_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'ticketMint',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'ticket_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'attendanceMint',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'attendance_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'wearable',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'wearable',
              },
              {
                kind: 'arg',
                type: 'u64',
                path: 'wearable_id',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'attendanceVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'attendance_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Mint',
                path: 'attendance_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'authority',
              },
            ],
          },
        },
        {
          name: 'wearableVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'wearable_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Mint',
                path: 'event_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Wearable',
                path: 'wearable',
              },
            ],
          },
        },
        {
          name: 'ticketVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'ticket_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Mint',
                path: 'ticket_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'authority',
              },
            ],
          },
        },
        {
          name: 'temporalVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'temporal_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'gainVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'gain_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'wearableId',
          type: 'u64',
        },
      ],
    },
    {
      name: 'recharge',
      accounts: [
        {
          name: 'event',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'eventMint',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'event_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'wearable',
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'wearable',
              },
              {
                kind: 'arg',
                type: 'u64',
                path: 'wearable_id',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'wearableVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'wearable_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Mint',
                path: 'event_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Wearable',
                path: 'wearable',
              },
            ],
          },
        },
        {
          name: 'temporalVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'temporal_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'wearableId',
          type: 'u64',
        },
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'purchase',
      accounts: [
        {
          name: 'event',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'eventMint',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'event_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'wearable',
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'wearable',
              },
              {
                kind: 'arg',
                type: 'u64',
                path: 'wearable_id',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'wearableVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'wearable_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Mint',
                path: 'event_mint',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Wearable',
                path: 'wearable',
              },
            ],
          },
        },
        {
          name: 'temporalVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'temporal_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'gainVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'gain_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Event',
                path: 'event',
              },
            ],
          },
        },
        {
          name: 'certifier',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'wearableId',
          type: 'u64',
        },
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'event',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'certifier',
            type: 'publicKey',
          },
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'description',
            type: 'string',
          },
          {
            name: 'banner',
            type: 'string',
          },
          {
            name: 'location',
            type: 'string',
          },
          {
            name: 'eventStartDate',
            type: 'i64',
          },
          {
            name: 'eventEndDate',
            type: 'i64',
          },
          {
            name: 'ticketQuantity',
            type: 'u32',
          },
          {
            name: 'ticketsSold',
            type: 'u32',
          },
          {
            name: 'ticketPrice',
            type: 'u64',
          },
          {
            name: 'totalValueLocked',
            type: 'u64',
          },
          {
            name: 'totalValueLockedInTickets',
            type: 'u64',
          },
          {
            name: 'totalValueLockedInRecharges',
            type: 'u64',
          },
          {
            name: 'totalDeposited',
            type: 'u64',
          },
          {
            name: 'totalProfit',
            type: 'u64',
          },
          {
            name: 'totalProfitInTickets',
            type: 'u64',
          },
          {
            name: 'totalProfitInPurchases',
            type: 'u64',
          },
          {
            name: 'acceptedMint',
            type: 'publicKey',
          },
          {
            name: 'eventMint',
            type: 'publicKey',
          },
          {
            name: 'ticketMint',
            type: 'publicKey',
          },
          {
            name: 'attendanceMint',
            type: 'publicKey',
          },
          {
            name: 'gainVault',
            type: 'publicKey',
          },
          {
            name: 'temporalVault',
            type: 'publicKey',
          },
          {
            name: 'eventId',
            type: 'string',
          },
          {
            name: 'eventBump',
            type: 'u8',
          },
          {
            name: 'eventMintBump',
            type: 'u8',
          },
          {
            name: 'ticketMintBump',
            type: 'u8',
          },
          {
            name: 'attendanceMintBump',
            type: 'u8',
          },
          {
            name: 'temporalVaultBump',
            type: 'u8',
          },
          {
            name: 'gainVaultBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'wearable',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'wearableId',
            type: 'u64',
          },
          {
            name: 'wearableVault',
            type: 'publicKey',
          },
          {
            name: 'wearableBump',
            type: 'u8',
          },
          {
            name: 'wearableVaultBump',
            type: 'u8',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'TicketQuantityExceeded',
      msg: 'Ticket quantity exceeded',
    },
    {
      code: 6001,
      name: 'InvalidCertifier',
      msg: 'Invalid certifier',
    },
    {
      code: 6002,
      name: 'InsufficientFunds',
      msg: 'Insufficient funds',
    },
  ],
};
