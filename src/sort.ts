import * as vscode from "vscode";
import { findRecords, IRecord, RecordType } from "./records";
import { ITokenResult, tokenize } from "./tokenize";

export function sort() {
  const textEditor = vscode.window.activeTextEditor;
  if (!textEditor) {
    return;
  }
  const selection = textEditor.selection;

  if (selection.isEmpty || selection.isSingleLine) {
    return;
  }
  sortLines(textEditor, selection.start.line, selection.end.line);
}

function sortLines(editor: vscode.TextEditor, start: number, end: number) {
  const range = new vscode.Range(
    new vscode.Position(start, 0),
    new vscode.Position(end, editor.document.lineAt(end).text.length)
  );
  const lines = editor.document.getText(range);
  const tokens = tokenize(lines);
  const records = findRecords(tokens);
  const sortedRecords = records.map(sortLine);
  const result = sortRecords(sortedRecords);
  const str = recordsToString(result);
  editor.edit((editBuilder) => {
    editBuilder.replace(range, str);
  });
}

function recordsToString(records: IRecord[]): string {
  return records
    .map((record) =>
      record.tokens
        .map((token) => (token.token === "file" ? `"${token.raw}"` : token.raw))
        .join(" ")
    )
    .join("\n");
}

function sortLine(record: IRecord): IRecord {
  if (record.type !== "import { a } from 'file'") {
    return record;
  } else {
    const words = record.tokens.filter((t) => t.token === "word");
    const middle: ITokenResult[] = words
      .sort((a, b) => (a.raw > b.raw ? 1 : -1))
      .map((word, idx) =>
        idx ? [{ raw: ",", token: "," as const }, word] : [word]
      )
      .reduce((a, i) => [...a, ...i], []);
    const tokens = [
      ...record.tokens.slice(0, 2),
      ...middle,
      ...record.tokens.slice(-3),
    ];
    return { tokens, type: record.type };
  }
}

const LV_MAP: RecordType[] = [
  "import * as b from 'file'",
  "import { a } from 'file'",
  "import a from 'file'",
  "import 'file'",
];
const LOCAL_SRC = /^~\/.*$/;
const LOCAL_COMPONENT = /^@\/.*$/;
const LOCAL = /^\..*$/;
function sortRecords(records: IRecord[]): IRecord[] {
  function getFileRaw(record: IRecord) {
    return record.tokens.slice(-1)[0].raw;
  }
  const tests = [LOCAL_SRC, LOCAL_COMPONENT, LOCAL];
  function getLevel(record: IRecord) {
    const str = getFileRaw(record);
    let i = 0;
    while (i < tests.length) {
      if (tests[i].test(str)) {
        return i;
      }
      i++;
    }
    return -1;
  }
  function getTypeLevel(record: IRecord) {
    return LV_MAP.indexOf(record.type);
  }
  return records.sort((a, b) => {
    const lva = getLevel(a);
    const lvb = getLevel(b);
    if (lva !== lvb) {
      return lva > lvb ? 1 : -1;
    }
    const lvta = getTypeLevel(a);
    const lvtb = getTypeLevel(b);
    if (lvta !== lvtb) {
      return lvta > lvtb ? 1 : -1;
    }
    return 0;
  });
}
