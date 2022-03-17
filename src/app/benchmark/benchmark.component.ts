import { Component, OnInit } from '@angular/core';
import { BenchmarkService } from '../benchmark.service';
import BenchmarkResults from './benchmarkResults';

@Component({
  selector: 'app-benchmark',
  templateUrl: './benchmark.component.html',
  styleUrls: ['./benchmark.component.scss']
})
export class BenchmarkComponent implements OnInit {
  public iterationCount: number = 10;
  public showResults: boolean = false;
  public benchmarkResults: BenchmarkResults = {median: 0, average: 0};
  constructor(private benchmark: BenchmarkService) { }

  ngOnInit(): void {
  }

  public async onRunClicked(){
    this.benchmarkResults = await this.benchmark.execute(this.iterationCount);
    this.showResults = true;
  }

}
