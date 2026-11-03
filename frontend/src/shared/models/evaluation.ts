import { Status } from './status';

export interface Evaluation {
  status: Status;
  messages: string[];
}
