import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import BenchmarkResults from './benchmarkResults';
import { ErrorAlertComponent } from './error-alert/error-alert.component';

@Injectable({
  providedIn: 'root'
})
export class BenchmarkService {
  public sources: {[index: number]: string} = {};
  public setup: string = "";
  public onResults: EventEmitter<void> = new EventEmitter();

  private iframe?: HTMLIFrameElement;
  private iframeWindow?: Window;

  private error: Error | null = null;

  constructor(private dialog: MatDialog) { }

  public submit(index: number, source: string){
    this.sources[index] = source;
  }

  public submitSetup(source: string){
    this.setup = source;
  }

  public execute(timePerBlock: number = 1000): BenchmarkResults | null{
    if(this.iframe)
      document.body.removeChild(this.iframe);
    this.iframe = document.createElement('iframe');
    this.iframe.style.display = "none";
    this.iframe.id = 'iframe';
    document.body.appendChild(this.iframe);
    this.error = null;


    this.iframeWindow = <Window>this.iframe.contentWindow;

    this.iframeWindow.addEventListener("error", (e) => {
      this.error = e.error; // for script loading
      e.preventDefault();
      return true;
    });

    const error = this.loadScript(`"use strict";${this.setup}`);
    if(error !== null){
      this.dialog.open(ErrorAlertComponent, {
        data: {
          title: "script loading failed",
          message: error.message
        }
      });  
      return null;
    }
    // TODO: add support for libraries and load them here

    let results = new Map<number, {
      runTime: number;
      amountOfRounds: number;
      error?: Error;
    }>();

    let benchmarkScriptSrc = "";
    for (const index in this.sources) {
      // TODO: add a piece of code before each benchmark without including it in the timing 
      // verfifying that the function is ok
      let error;
      try {
        new Function(this.sources[index]);
      } catch (e) {
        error = this.getError(e);
      }
      if(error)
        results.set(+index, {runTime: 0, amountOfRounds: 0, error});
      else
        benchmarkScriptSrc += `function benchmark_${index}(){"use strict";${this.sources[index]}}`;
    }
    this.loadScript(benchmarkScriptSrc);

    for (const index in this.sources) {
      if(results.has(+index)){
        continue;
      }
      const testResult = this.runTestForAmountOfTime("benchmark_" + index, timePerBlock); 
      results.set(+index, {
        runTime: testResult.runTime,
        amountOfRounds: testResult.count,
        error: testResult.error
      });
    }
    const sum: number = Array.from(results.values()).reduce((previousValue, currentValue) => previousValue + currentValue.runTime, 0);
    return {results, time: sum};
  }

  private loadScript(src: string): Error | null{
    // verifying script
    try {
      new Function(src);
    } catch (error: any) {
      return error;
    }
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = src;
    this.iframeWindow?.document.body.appendChild(script);
    if(this.error !== null){
      return this.error;
    }
    return null;
  }

  private runTestForAmountOfTime(funcName: string, timePerBlock: number) {
    let count = 0;
    let error;
    let startTimer = performance.now();
    let timer = startTimer; // TODO: improve performence, there is a lot of code here that gets counted although it shouldnt
    do {  
      try{
        (<any>this.iframeWindow)[funcName]();
      }
      catch(e: any){
        // TODO: create a source map for the scripts
        error = this.getError(e);
        break;
      }
      count++;
      timer = performance.now();
    } while(timer - startTimer < timePerBlock);
    return { count: count, runTime: timer - startTimer, error };
  }

  private getError(a: any): Error{
    if(a === undefined){
      return new Error("undefined");
    }
    if(a === null){
      return new Error("null");
    }
    if(a.stack && a.message){
      return a;
    }
    return new Error(JSON.stringify(a));
  }
}
