import { Web3Auth } from '@web3auth/web3auth';
import { fromEventPattern, Observable } from 'rxjs';
  
  type FirstParameter<T> = T extends () => unknown
    ? void
    : T extends (arg1: infer U, ...args: unknown[]) => unknown
    ? U
    : unknown;
  
  export const fromAdapterEvent = <
    EventName extends keyof string | symbol,
    CallbackParameter extends FirstParameter<EventName>
  >(
    adapter: Web3Auth,
    eventName: string | symbol
  ): Observable<CallbackParameter> =>
    fromEventPattern(
      (addHandler) => adapter.on(eventName, addHandler),
      (removeHandler) => adapter.off(eventName, removeHandler)
    );