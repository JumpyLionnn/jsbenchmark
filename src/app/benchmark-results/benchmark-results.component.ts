import { Component, HostListener, Input, OnInit } from '@angular/core';
import BenchmarkResults from '../benchmarkResults';
import CodeBlock from '../code-block';

@Component({
  selector: 'app-benchmark-results',
  templateUrl: './benchmark-results.component.html',
  styleUrls: ['./benchmark-results.component.scss']
})
export class BenchmarkResultsComponent implements OnInit {
  //@Input()
  public benchmarkResults: BenchmarkResults = {results: new Map()};
  public benchmarkDisplayResults: BenchmarkDisplayResults = new Map();

  //@Input()
  public labels: CodeBlock[] = [];

  //@Input()
  public timePerBlock: number = 1000;

  public chartData: {name: string, value: number}[] = [];

  // options
  scheme = "picnic";
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = false;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Iterations/s';
  showYAxisLabel: boolean = false;
  yAxisLabel: string = 'Code clocks';

  constructor() {}

  ngOnInit(): void {
  }

  public updateResults(benchmarkResults: BenchmarkResults, labels: CodeBlock[], timePerBlock: number): void{
    this.benchmarkResults = benchmarkResults;
    this.labels = labels.slice(); // labels.splice to copy it so it wont get updated by reference else it will mess up things on deleting
    this.timePerBlock = timePerBlock;

    this.chartData = [];
    for(let [key, value] of this.benchmarkResults.results){
      if(!value.error){
        this.chartData.push({
          name: this.labels[key].name,
          value: value.amountOfRounds / (this.timePerBlock * 0.001)
        });
      }
    }
    let maxId = this.getBestResult();
    let max = this.benchmarkResults.results.get(maxId)!.amountOfRounds;
    this.benchmarkDisplayResults.clear();
    const fastestTheshold = 2; // %
    for (let [key, value] of this.benchmarkResults.results) {
      let percent = 100 - (value.amountOfRounds / max * 100);
      this.benchmarkDisplayResults.set(key, {
        amountOfRounds: value.amountOfRounds / (this.timePerBlock * 0.001),
        percent: percent,
        fastest: key === maxId || percent < fastestTheshold,
        error: value.error
      });
    }
  }

  private getBestResult(){
    let max: number = 0;
    for(let [key, value] of this.benchmarkResults.results){
      max = value.amountOfRounds > this.benchmarkResults.results.get(max ?? 0)!.amountOfRounds ? key : max;
    }
    return max;
  }

  @HostListener("window:resize")
  onResize(){
    // trigger change detection on resize
  }
}

type BenchmarkDisplayResults = Map<number, {
      amountOfRounds: number;
      percent: number;
      fastest: boolean;
      error?: Error;
}>;