import { Publisher, Subjects, TicketCreatedEvent } from '@ms-ticketing-bth/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
