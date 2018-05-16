import { Injectable, Optional, Inject } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';

import { Hero } from '../shared/hero';
import { MessageService } from './message.service';
import { TransferState, makeStateKey } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class HeroService {
  private static readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  private static readonly getHeroesStateKey = makeStateKey('getHeroes');
  private static readonly getHeroStateKey = makeStateKey('getHero');
  private static readonly searchHeroesStateKey = makeStateKey('searchHeroes');
  private heroesUrl = '/api/heroes';  // URL to web api

  constructor(
    private readonly http: HttpClient,
    private readonly state: TransferState,
    private readonly messageService: MessageService,
    @Optional() @Inject(APP_BASE_HREF) private readonly origin: string
  ) {
    this.heroesUrl = `${origin || ''}${this.heroesUrl}`;
  }

  /** GET heroes from the server */
  getHeroes (): Observable<Hero[]> {
    return of(this.state.get(HeroService.getHeroesStateKey, []))
      .pipe(
        switchMap(heroes => {
          if (heroes && heroes.length > 0) {
            return of(heroes);
          }

          return this.http.get<Hero[]>(this.heroesUrl);
        }),
        tap(heroes => this.state.set(HeroService.getHeroesStateKey, heroes)),
        tap(heroes => this.log(`fetched heroes`)),
        catchError(this.handleError('getHeroes', []))
      );
  }

  /** GET hero by id. Return `undefined` when id not found */
  getHeroNo404<Data>(id: number): Observable<Hero> {
    return of(this.state.get(HeroService.getHeroStateKey, {}))
      .pipe(
        map(heroes => !!heroes ? heroes[id] : null),
        switchMap(hero => {
          if (hero) {
            return of(hero);
          }

          return this.http.get<Hero[]>(`${this.heroesUrl}/?id=${id}`)
            .pipe(
              map(heroes => heroes[0]), // returns a {0|1} element array
            );
        }),
        tap(hero => {
          this.state.set(
            HeroService.getHeroStateKey,
            {
              ...this.state.get(HeroService.getHeroStateKey, {}),
              [id]: hero
            }
          );
        }),
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  /** GET hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    return of(this.state.get(HeroService.getHeroStateKey, {}))
      .pipe(
        map(heroes => !!heroes ? heroes[id] : null),
        switchMap(hero => {
          if (hero) {
            return of(hero);
          }

          return this.http.get<Hero[]>(`${this.heroesUrl}/${id}`);
        }),
        tap(hero => {
          this.state.set(
            HeroService.getHeroStateKey,
            {
              ...this.state.get(HeroService.getHeroStateKey, {}),
              [id]: hero
            }
          );
        }),
        tap(_ => this.log(`fetched hero id=${id}`)),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  /* GET heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // if not search term, return empty hero array.
      return of([]);
    }


    return of(this.state.get(HeroService.searchHeroesStateKey, {}))
      .pipe(
        map(heroes => !!heroes ? heroes[term] : null),
        switchMap(heroes => {
          if (heroes) {
            return of(heroes);
          }

          return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`);
        }),
        tap(heroes => {
          this.state.set(
            HeroService.searchHeroesStateKey,
            {
              ...this.state.get(HeroService.searchHeroesStateKey, {}),
              [term]: heroes
            }
          );
        }),
        tap(_ => this.log(`found heroes matching "${term}"`)),
        catchError(this.handleError<Hero[]>('searchHeroes', []))
      );
  }

  //////// Save methods //////////

  /** POST: add a new hero to the server */
  addHero (hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, HeroService.httpOptions).pipe(
      tap((createdHero: Hero) => this.log(`added hero w/ id=${createdHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  /** DELETE: delete the hero from the server */
  deleteHero (hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, HeroService.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  /** PUT: update the hero on the server */
  updateHero (hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, HeroService.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add('HeroService: ' + message);
  }
}
