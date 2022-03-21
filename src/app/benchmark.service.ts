import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import BenchmarkResults from './benchmarkResults';
import { ErrorAlertComponent } from './error-alert/error-alert.component';
import { waitUntilNextEventCycle } from './utilities';

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
  
  public async execute(timePerBlock: number): Promise<BenchmarkResults | null>{
    const startTime = window.performance.now();
    if(this.iframe)
      document.body.removeChild(this.iframe);
    this.error = null;
    this.iframe = document.createElement('iframe');
    this.iframe.style.display = "none";
    this.iframe.id = 'iframe';
    document.body.appendChild(this.iframe);

    this.iframeWindow = <Window>this.iframe.contentWindow;
    this.iframeWindow.addEventListener("error", this.onError.bind(this));
    
    await waitUntilNextEventCycle();

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
    
    await waitUntilNextEventCycle();

    let results = new Map<number, {
      amountOfRounds: number;
      error?: Error;
    }>();

    let benchmarkScriptSrc = "";
    for (const index in this.sources) {
      // TODO: add a piece of code before each benchmark without including it in the timing 
      // verfifying that the function is ok and doesnt mess ith this source code  
      try {
        new Function(this.sources[index]);
        benchmarkScriptSrc += `function benchmark_${index}(){"use strict";${this.sources[index]}}`;
      } catch (e) {
        results.set(+index, {amountOfRounds: 0, error: this.getError(e)});
      }
    }
    this.loadScript(benchmarkScriptSrc);
    await waitUntilNextEventCycle();

    for (const index in this.sources) {
      if(results.has(+index))
        continue; // it means this block has an error
      const testResult = await this.runTestForAmountOfTime("benchmark_" + index, timePerBlock); 
      results.set(+index, {
        amountOfRounds: testResult.count,
        error: testResult.error
      });
    }
    console.log("total time:", window.performance.now() - startTime);
    return {results};
  }

  private loadScript(src: string): Error | null{
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = src;
    this.iframeWindow?.document.body.appendChild(script);
    if(this.error !== null){
      return this.error;
    }
    return null;
  }

  private async runTestForAmountOfTime(funcName: string, timePerBlock: number) {
    let count = 0;
    let error;
    let timeSum = 0;
    let lastTimeWaited = 0; // for async ability
    do {
      if(timeSum > lastTimeWaited + 30){  // 30 is the time in milliseconds it runs it per event cycle
        lastTimeWaited = timeSum;
        await waitUntilNextEventCycle();
      }
      try{
        const lastTime = performance.now();
        (<any>this.iframeWindow)[funcName]();
        timeSum += performance.now() - lastTime;
      }
      catch(e: any){
        error = this.getError(e);
        break;
      }
      count++;
    } while(timeSum < timePerBlock);
    return { count: count, error };
  }

  private onError(e: ErrorEvent){
    this.error = e.error; // for script loading
    e.preventDefault();
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
