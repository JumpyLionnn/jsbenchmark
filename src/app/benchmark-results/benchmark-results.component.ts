import { Component, Input, OnInit } from '@angular/core';
import BenchmarkResults from '../benchmarkResults';
import CodeBlock from '../code-block';

@Component({
  selector: 'app-benchmark-results',
  templateUrl: './benchmark-results.component.html',
  styleUrls: ['./benchmark-results.component.scss']
})
export class BenchmarkResultsComponent implements OnInit {
  @Input()
  public benchmarkResults!: BenchmarkResults;

  @Input()
  public labels!: CodeBlock[];

  constructor() { }

  ngOnInit(): void {
  }
}
