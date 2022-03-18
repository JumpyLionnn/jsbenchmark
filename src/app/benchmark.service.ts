import { EventEmitter, Injectable } from '@angular/core';
import BenchmarkResults from './benchmarkResults';

@Injectable({
  providedIn: 'root'
})
export class BenchmarkService {
  public sources: {[index: number]: string} = {};
  public onResults: EventEmitter<void> = new EventEmitter();
  constructor() { }

  public submit(index: number, source: string){
    this.sources[index] = source;
  }

  public execute(iterationCount: number): BenchmarkResults{
    const results: BenchmarkResults = new Map();
    for (const index in this.sources) {
      const timings: number[] = [];
      let error = false;
      for(let i = 0; i < (iterationCount < 1 ? 1 : iterationCount); i++){
        const iteration = this.iteration(this.sources[index]);
        if(iteration.error){
          results.set(+index, {
            median: 0,
            average: 0,
            error: iteration.error
          });
          error = true;
          break;
        }
        timings.push(iteration.result);
      }
      if(!error){
        results.set(+index, {
          median: +(this.median(timings) * 0.001).toPrecision(6),
          average: +(this.average(timings) * 0.001).toPrecision(6)
        });
      }
    }
    
    return results;
  }

  private iteration(source: string): {result: number, error?: Error}{
    try {
      const result = eval(`
      (function(){
        const startTime = window.performance.now();
        ${source}
        return window.performance.now() - startTime;
      })();
      `);
      return {result};
    } catch (error: any) {
      return {result: 0,error: error};
    }
    
  }

  private median(values: number[]){
    values.sort((a: number, b: number) => {
      return a-b;
    });
  
    var half = Math.floor(values.length / 2);
    
    if (values.length % 2)
      return values[half];
    
    return (values[half - 1] + values[half]) / 2;
  }

  private average(values: number[]){
    const sum = values.reduce((a:number, b: number) => a + b, 0);
    return (sum / values.length) || 0;
  }

  
}
