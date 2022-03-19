declare var JSHINT: any;


declare interface JSHINTOptions {
    bitwise: boolean;
    curly: boolean;
    eqeqeq: boolean;
    esversion: number;
    forin: boolean;
    freeze: boolean;
    futurehostile: boolean;
    latedef: boolean;
    leanswitch: boolean;
    maxcomplexity?: number;
    maxdepth?: number;
    maxerr?: number;
    maxparams?: number;
    maxstatements?: number;
    nocomma: boolean;
    nonbsp: boolean;
    nonew: boolean;
    noreturnawait: boolean;
    regexpu: boolean;
    shadow: boolean | string;
    singleGroups: boolean;
    strict: boolean | string;
    trailingcomma: boolean;
    undef: boolean;
    unused: boolean;
    varstmt: boolean;

    asi: boolean;
    boss: boolean;
    debug: boolean;
    elision: boolean;
    eqnull: boolean;
    evil: boolean;
    expr: boolean;
    funcscope: boolean;
    iterator: boolean;
    lastsemic: boolean;
    loopfunc: boolean;
    moz: boolean;
    notypeof: boolean;
    noyield: boolean;
    plusplus: boolean;
    proto: boolean;
    supernew: boolean;
    validthis: boolean;
    withstmt: boolean;

    browser: boolean;
    devel: boolean;
}

const options: JSHINTOptions = {
    bitwise: false,
    curly: false,
    eqeqeq: false,
    esversion: 11,
    forin: false,
    freeze: false,
    futurehostile: true,
    latedef: true,
    leanswitch: true,
    nocomma: false,
    nonbsp: true,
    nonew: true,
    noreturnawait: true,
    regexpu: false,
    shadow: "outer",
    singleGroups: false,
    strict: "implied",
    trailingcomma: false,
    undef: false,
    unused: true,
    varstmt: false,

    asi: true,
    boss: true,
    debug: false,
    elision: false,
    eqnull: true,
    evil: false,
    expr: false,
    funcscope: false,
    iterator: false,
    lastsemic: true,
    loopfunc: true,
    moz: false,
    notypeof: true,
    noyield: true,
    plusplus: false,
    proto: false,
    supernew: false,
    validthis: false,
    withstmt: false,

    browser: true,
    devel: true,
}

interface JSHINTError{
    id: string,
    raw: string,
    code: string,
    evidence: string,
    line: number,
    character: number,
    scope: string,
    a: any,
    b: any,
    c: any,
    d: any,
    reason: string
}

export enum Severity{
    Error,
    Warning
}

interface Diagnostic {
    startLineNumber: number,
    startColumn: number,
    endLineNumber: number,
    endColumn: number,
    message: string,
    severity: Severity
}

export function getErrors(source: string | string[]): Diagnostic[]{
    JSHINT(source, options, {});
    const errors = JSHINT.data().errors ?? [];
    return errors.map((e: JSHINTError) => {
        return {
          startLineNumber: e.line,
          startColumn: e.character,
          endLineNumber: e.line,
          endColumn: e.character,
          message: e.reason,
          severity: e.code[0] === "E" ? Severity.Error : Severity.Warning
        }
      });
}