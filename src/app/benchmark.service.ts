import { EventEmitter, Injectable } from '@angular/core';
import BenchmarkResults from './benchmarkResults';

@Injectable({
  providedIn: 'root'
})
export class BenchmarkService {
  public sources: {[index: number]: string} = {};
  public onResults: EventEmitter<void> = new EventEmitter();

  private iframe?: HTMLIFrameElement;
  private iframeWindow?: Window;

  constructor() { }

  public submit(index: number, source: string){
    this.sources[index] = source;
  }

  public execute(timePerBlock: number = 1000): BenchmarkResults{
    if(this.iframe)
      document.body.removeChild(this.iframe);
    this.iframe = document.createElement('iframe');
    this.iframe.style.display = "none";
    this.iframe.id = 'iframe';
    document.body.appendChild(this.iframe);

    this.iframeWindow = <Window>this.iframe.contentWindow;

    // TODO: add code to inialize stuff before everything like helper functions and some data
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
        benchmarkScriptSrc += "function benchmark_" + index + "() {" + this.sources[index] + "}";
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

  private loadScript(src: string): Error | void{
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
