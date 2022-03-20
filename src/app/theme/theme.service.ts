import { EventEmitter, Inject, Injectable } from '@angular/core';
import * as monaco from 'monaco-editor';
import { filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _current: Theme;
  constructor() { 
    const saved = localStorage.getItem("theme");
    this._current = saved === null ? Theme.Light : +saved;
  }

  public onChange: EventEmitter<Theme> = new EventEmitter();

  public change(newTheme: Theme){
    this._current = newTheme;
    localStorage.setItem("theme", newTheme.toString());
    this.onChange.emit(newTheme);
  }

  public get current() { return this._current; }
}

export enum Theme{
  Light,
  Dark
}
