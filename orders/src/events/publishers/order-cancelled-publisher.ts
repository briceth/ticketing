import { OrderCancelledEvent, Publisher, Subjects } from '@ms-ticketing-bth/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
