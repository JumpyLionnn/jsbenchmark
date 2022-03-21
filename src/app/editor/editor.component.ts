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

  @Input()
  public code: string= "data.slice();";

  @Input()
  public type: string = "code";

  @Input()
  public index!: number;

  private decorations: string[] = [];

  private lintTimerId: number | null = null;

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
    if(this.lintTimerId !== null){
      clearTimeout(this.lintTimerId);
    }
    this.lintTimerId = window.setTimeout(() => {
      this.checkForErrors();
    }, 3000); // after every 3 seconds when the user stopped typing it will lint the code
    this.onChange(value);
  }

  public checkForErrors(){
    const options = {
      unused: this.type !== "setup" // some of the identifiers will be used in the code blocks and not in the setup block
    };
    let value = this.editor.getValue();
    let includeErrorsFrom = 0;
    if(this.type !== "setup"){ 
      // including the setup block if this one is not setup to prevent un defined errors when using identifiers from the setup block
      value = `${this.benchmark.setup} \n${value}`;
      includeErrorsFrom = this.benchmark.setup.split("\n").length;
    }
    let diagnostics = getDiagnostics(value, options);
    // filtering errors from other blocks
    diagnostics = diagnostics.filter((diagnostic) => diagnostic.startLineNumber > includeErrorsFrom);
    // setting up the diagnostic decoration
    let newDecorations = diagnostics.map(diagnostic => {
      return {
        range: new monaco.Range(diagnostic.startLineNumber - includeErrorsFrom, 1, diagnostic.startLineNumber - includeErrorsFrom, 1),
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
