import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BenchmarkComponent } from './benchmark/benchmark.component';
import { EditorComponent } from './editor/editor.component';

const routes: Routes = [
  {path: "", component: BenchmarkComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
