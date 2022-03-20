import { Component, HostListener, Input, OnChanges, OnInit, ViewEncapsulation } from '@angular/core';
import * as monaco from 'monaco-editor';
import { BenchmarkService } from '../benchmark.service';
import { getErrors as getDiagnostics, Severity } from '../jshint';
import { Theme, ThemeService } from '../theme/theme.service';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditorComponent implements OnInit, OnChanges {
  private editor!: monaco.editor.IStandaloneCodeEditor;

  public editorOptions = {
    language: 'javascript', 
    mouseWheelZoom: true, 
    minimap: {enabled: false}, 
    automaticLayout: true, 
    glyphMargin: true, 
    theme: this.getTheme()
  };
  public code: string= 'console.log("Hello world!");';

  @Input()
  public type: string = "code";

  @Input()
  public index!: number;

  private decorations: string[] = [];

  constructor(private benchmark: BenchmarkService, private theme: ThemeService) { }

  ngOnInit(): void {
    this.theme.onChange.subscribe((theme) => {
      this.editorOptions = { ...this.editorOptions, theme: this.getTheme() };
    });
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    this.onChange(this.code);

    this.benchmark.onResults.subscribe(() => {
      this.onResize();
    });
  }

  ngOnChanges() {
    this.onChange(this.editor?.getValue() ?? "");
  }

  onInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    this.editor.focus();
  }

  onChange(value: string){
    switch (this.type) {
      case "code":
        this.benchmark.submit(this.index, value);
        break;
      case "setup":
        this.benchmark.submitSetup(value);
        break;
    
      default:
        throw new Error(`no editor type '${this.type}'`);
    }
  }

  onValueChanges(value: string){
    this.checkForErrors();
    this.onChange(value);
  }

  // TODO: recude the amount of times this function gets called to reduce performence
  public checkForErrors(){
    const diagnostics = getDiagnostics(this.editor.getValue());
    let newDecorations = diagnostics.map(diagnostic => {
      return {
        range: new monaco.Range(diagnostic.startLineNumber, 1, diagnostic.startLineNumber, 1),
        options: {
          isWholeLine: true,
          glyphMarginClassName: diagnostic.severity === Severity.Error ? 'errorIcon' : 'warningIcon',
          glyphMarginHoverMessage: {value: diagnostic.message}
        }
      }
    })
    this.decorations = this.editor.deltaDecorations(this.decorations, newDecorations);
  }

  @HostListener("window:resize")
  public onResize(){
    this.editor.layout({} as monaco.editor.IDimension);
  }

  private getTheme(){
    return this.theme.current === Theme.Light ? "vs" : "vs-dark";
  }

}
