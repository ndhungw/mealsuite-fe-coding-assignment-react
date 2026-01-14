import { Injectable } from '@nestjs/common';
import { Ticket } from '@acme/shared-models';
import { UsersService } from '../users/users.service';

@Injectable()
export class TicketsService {
  /*
   * In-memory storage so data is lost on server restart.
   */
  private storedTickets: Ticket[] = [
    {
      id: 1,
      description: 'Install a monitor arm',
      assigneeId: 1,
      completed: false,
    },
    {
      id: 2,
      description: 'Move the desk to the new location',
      assigneeId: 1,
      completed: false,
    },
    {
      id: 3,
      description: 'Set up dual monitors',
      assigneeId: 2,
      completed: false,
    },
    {
      id: 4,
      description: 'Configure keyboard shortcuts',
      assigneeId: null,
      completed: false,
    },
    {
      id: 5,
      description: 'Install standing desk converter',
      assigneeId: 1,
      completed: true,
    },
    {
      id: 6,
      description: 'Replace office chair wheels',
      assigneeId: 2,
      completed: false,
    },
    {
      id: 7,
      description: 'Mount whiteboard on wall',
      assigneeId: null,
      completed: false,
    },
    {
      id: 8,
      description: 'Organize cable management',
      assigneeId: 1,
      completed: true,
    },
    {
      id: 9,
      description: 'Add task lighting to desk',
      assigneeId: 2,
      completed: false,
    },
    {
      id: 10,
      description: 'Install noise-canceling panels',
      assigneeId: null,
      completed: false,
    },
    {
      id: 11,
      description: 'Set up ergonomic mouse and pad',
      assigneeId: 1,
      completed: false,
    },
    {
      id: 12,
      description: 'Replace desk lamp bulb',
      assigneeId: 2,
      completed: true,
    },
    {
      id: 13,
      description: 'Install monitor privacy screen',
      assigneeId: null,
      completed: false,
    },
    {
      id: 14,
      description: 'Configure desk phone system',
      assigneeId: 1,
      completed: false,
    },
    {
      id: 15,
      description: 'Add plants to workspace',
      assigneeId: 2,
      completed: false,
    },
    {
      id: 16,
      description: 'Install under-desk power strip',
      assigneeId: null,
      completed: true,
    },
    {
      id: 17,
      description: 'Set up document organizer',
      assigneeId: 1,
      completed: false,
    },
    {
      id: 18,
      description: 'Replace office chair cushion',
      assigneeId: 2,
      completed: false,
    },
    {
      id: 19,
      description: 'Mount wall calendar',
      assigneeId: null,
      completed: false,
    },
    {
      id: 20,
      description: 'Install desk drawer organizers',
      assigneeId: 1,
      completed: true,
    },
  ];

  private nextId = this.storedTickets[this.storedTickets.length - 1].id + 1;

  constructor(private usersService: UsersService) {}

  async tickets(): Promise<Ticket[]> {
    return this.storedTickets;
  }

  async ticket(id: number): Promise<Ticket | null> {
    return this.storedTickets.find((t) => t.id === id) ?? null;
  }

  async newTicket(payload: { description: string }): Promise<Ticket> {
    const newTicket: Ticket = {
      id: this.nextId++,
      description: payload.description,
      assigneeId: null,
      completed: false,
    };

    this.storedTickets.push(newTicket);

    return newTicket;
  }

  async assign(ticketId: number, userId: number): Promise<boolean> {
    const ticket = await this.ticket(ticketId);
    const user = await this.usersService.user(userId);

    if (ticket && user) {
      ticket.assigneeId = +userId;
      return true;
    } else {
      return false;
    }
  }

  async unassign(ticketId: number): Promise<boolean> {
    const ticket = await this.ticket(ticketId);
    if (ticket) {
      ticket.assigneeId = null;
      return true;
    } else {
      return false;
    }
  }

  async complete(ticketId: number, completed: boolean): Promise<boolean> {
    const ticket = await this.ticket(ticketId);
    if (ticket) {
      ticket.completed = completed;
      return true;
    } else {
      return false;
    }
  }
}
