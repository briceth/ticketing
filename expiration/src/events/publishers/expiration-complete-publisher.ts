import { ExpirationCompleteEvent, Publisher, Subjects } from '@ms-ticketing-bth/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
