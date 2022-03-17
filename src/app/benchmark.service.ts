import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BenchmarkService {
  public source: string = "";
  public onResults: EventEmitter<void> = new EventEmitter();
  constructor() { }

  public async execute(iterationCount: number){
    const results = [];
    for(let i = 0; i < (iterationCount < 1 ? 1 : iterationCount); i++){
      results.push(this.iteration());
    }
    return {
      median: this.median(results) * 0.001,
      average: this.average(results) * 0.001
    };
  }

  private iteration(): number{
    return eval(`
    (function(){
      const startTime = window.performance.now();
      ${this.source}
      return window.performance.now() - startTime;
    })();
    `);
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
