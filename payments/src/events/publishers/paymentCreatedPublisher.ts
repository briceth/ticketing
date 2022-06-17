import { PaymentCreatedEvent, Publisher, Subjects } from '@ms-ticketing-bth/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
