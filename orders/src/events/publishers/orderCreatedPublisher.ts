import { OrderCreatedEvent, Publisher, Subjects } from '@ms-ticketing-bth/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
