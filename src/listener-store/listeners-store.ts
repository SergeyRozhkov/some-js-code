type Unsubscribe = () => void;
type Listeners = {
  [key: string]: (...args: any[]) => any;
};
type EventName<ListenersT extends Listeners> = keyof ListenersT;
type Store<ListenersT extends Listeners> = {
  [key in keyof ListenersT]?: ListenersT[key][];
};

export interface IListenersStore<ListenersT extends Listeners> {
  addListener: (
    eventName: EventName<ListenersT>,
    callback: ListenersT[typeof eventName],
  ) => Unsubscribe;
  removeListener: (
    eventName: EventName<ListenersT>,
    callback: ListenersT[typeof eventName],
  ) => void;
  notify: (
    eventName: EventName<ListenersT>,
    ...data: Parameters<ListenersT[typeof eventName]>
  ) => void;
}

export default class ListenersStore<ListenersT extends Listeners>
  implements IListenersStore<ListenersT>
{
  private readonly _store: Store<ListenersT> = {} as Store<ListenersT>;

  private _getCallbacks = <EventNameT extends EventName<ListenersT>>(
    eventName: EventNameT,
  ): ListenersT[EventNameT][] => {
    return (this._store[eventName] ??= [] as any);
  };

  public addListener = (
    eventName: EventName<ListenersT>,
    callback: ListenersT[typeof eventName],
  ) => {
    this._getCallbacks(eventName).push(callback);
    return () => this.removeListener(eventName, callback);
  };

  public removeListener = (
    eventName: EventName<ListenersT>,
    callback: ListenersT[typeof eventName],
  ) => {
    const callbackIndex = this._getCallbacks(eventName).findIndex(
      x => x === callback,
    );
    if (callbackIndex < 0) {
      return;
    }
    this._getCallbacks(eventName).splice(callbackIndex, 1);
  };

  public notify = (
    eventName: EventName<ListenersT>,
    ...data: Parameters<ListenersT[typeof eventName]>
  ) => {
    this._getCallbacks(eventName).forEach(x => x(data));
  };
}
