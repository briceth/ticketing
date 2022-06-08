import { Publisher, Subjects, TicketUpdatedEvent } from '@ms-ticketing-bth/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
