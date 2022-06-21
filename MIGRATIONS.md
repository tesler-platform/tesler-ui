# Migration
More details can be found at the link in the **Source References** section.

## Migration to 1.2.0 of redux-observable
1. Need RxJs v7
2. Need Redux v4
3. Changed the use of `rootEpic` when creating epicMiddleware
    ```tsx
    const epicMiddleware = createEpicMiddleware();
    const store = createStore(rootReducer, applyMiddleware(epicMiddleware));
    
    epicMiddleware.run(rootEpic);
    ```
4. Adapters are no longer supported
   It was:

    ```tsx
    import mostAdapter from 'redux-observable-adapter-most';
    
    const epicMiddleware = createEpicMiddleware(rootEpic, { adapter: mostAdapter });
    ```

   You can simulate in `rootEpic`:

    ```tsx
    import most from 'most';
    import { from } from 'rxjs';
    
    // a Most.js implementatin of combineEpics
    const combineEpics = (...epics) => (...args) =>
      most.merge(
        ...epics.map(epic => epic(...args))
      );
    
    const rootEpic = (action$, state$, ...rest) => {
      const epic = combineEpics(epic1, epic2, ...etc);
      // action$ and state$ are converted from Observables to Most.js streams
      const output = epic(
        most.from(action$),
        most.from(state$),
        ...rest
      );
    
      // convert Most.js stream back to Observable
      return from(output);
    };
    ```
5. Actions emitted by your epics are now scheduled on a queue
    ```tsx
    const epic1 = action$ =>
      action$.pipe(
        ofType('FIRST'),
        mergeMap(() =>
          of({ type: 'SECOND' }, { type: 'THIRD' }) // guarantees that the THIRD will f llow the SECOND.
        )
      );
    
    const epic2 = action$ =>
      action$.pipe(
        ofType('SECOND'),
        map(() => ({ type: 'FOURTH' })),
        startWith({ type: 'FIRST' })
      );// notice that epic2 comes *after* epic1
    const rootEpic = combineEpics(epic1, epic2);
    ```
   Result:
    > FIRST > SECOND > THIRD > FOURTH
6. `epicMiddleware.replaceEpic` was removed.  
   You can simulate with takeUntil
7. Dispatching an action  
    store.dispatch() is now unavailable and not recommended for use.
    The second argument in Epic is now a `store$` thread.
    For backward compatibility, `store` has been added to Epic dependencies.
    It will be removed in the future.
8. Accessing state  
   Now `StateObservable` is used as the second argument. The state is obtained via `state$.value` instead of `store.getState()`.
9. Removal of ActionsObservable in favor of just Observable.
10. the TS type definition for combineEpics() no longer accepts any unsafe overloads. Cast to any if you need to provide unsafe/untyped Epics.

## Migration to 7.5.5 of rxjs
1. Path of imports
 ```tsx
 // Creation methods, types, schedulers and utilities
 import { Observable, Subject, asapScheduler, pipe, of, from, interval, merge, fromEvent, SubscriptionLike, PartialObserver } from 'rxjs';
 // All pipeable operators
 import { map, filter, scan } from 'rxjs/operators';
 // The web socket subject implementation
 import { webSocket } from 'rxjs/webSocket';
 // The Rx ajax implementation
 import { ajax } from 'rxjs/ajax';
 // The testing utilities
 import { TestScheduler } from 'rxjs/testing';
 ```
3. Operator pipe syntax  
   The call chain has been replaced by `pipe` and `operators`
4. Changed operator names  
    - `do` => `tap`
    - `catch` => `catchError`
    - `switch` => `switchAll`
    - `finally` => `finalize`
    - `combineLatest` => `combineLatestWith`
    - `merge` => `mergeWith`
    - `zip` => `zipWith`
    - `concat` => `concatWith`
    - `race` => `raceWith`
5. operators deprecated
    - `timeoutWith`
```ts
// rxjs 6
timer(5000, 1000)
  .pipe(timeoutWith(2000, of("timeout")))
  .subscribe(console.log);
// rxjs 7
timer(5000, 1000)
  .pipe(timeout({ first: 2000, with: _ => of("timeout") }))
  .subscribe(console.log);
```
6. try/catch not supported 
7. resultSelector has been removed for operators  
8. EMPTY instead of empty()  

## Source References
1. [Migration redux-observable](https://redux-observable.js.org/MIGRATION.html)
2. [Changelog redux-observable](https://redux-observable.js.org/CHANGELOG.html)
3. [Migration rxjs6](https://en.spec-zone.ru/rxjs/guide/v6/migration)
3. [RxJS 6.x to 7.x Detailed Change List](https://rxjs.dev/6-to-7-change-summary)
4. [Breaking changes in rxjs 7](https://rxjs.dev/deprecations/breaking-changes)
