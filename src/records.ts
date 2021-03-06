import { ITokenResult, Token } from "./tokenize";
import { getPrintStrings } from "./utils";

// import 'file'
// import a from 'file'
// import { a } from 'file'
// import * as b from 'file'
export type RecordType =
  | "import 'file'"
  | "import a from 'file'"
  | "import { a } from 'file'"
  | "import * as b from 'file'";

export type ImportType = "value" | "type";

export interface IRecord {
  tokens: ITokenResult[];
  type: RecordType;
  importType: ImportType;
}
export const TOKEN_MAP: {
  [key in Token]: Token[];
} = {
  import: ["file", "word", "{", "*", "type"],
  "{": ["word"],
  "}": ["from"],
  "*": ["as"],
  as: ["word"],
  from: ["file"],
  word: ["from", "}", ",", "as"],
  file: [],
  ",": ["}", "word"],
  type: ["{", "word", "*"],
};

class Stack<T> {
  private stack: T[] = [];
  push(v: T) {
    this.stack.push(v);
  }
  pop(): T | undefined {
    return this.stack.pop();
  }
  clear() {
    this.stack = [];
  }
}

export function findRecords(tokens: ITokenResult[]): IRecord[] {
  const records: IRecord[] = [];
  const stack = new Stack<ITokenResult>();
  for (const token of tokens) {
    const pre = stack.pop();
    if (!pre) {
      stack.push(token);
      continue;
    }
    if (TOKEN_MAP[pre.token].includes(token.token)) {
      if (token.token === "file") {
        const record = [];
        let t = stack.pop();
        while (t) {
          record.unshift(t);
          t = stack.pop();
        }
        record.push(pre);
        record.push(token);
        const importType: ImportType =
          record[1].token === "type" ? "type" : "value";
        const type: RecordType = (() => {
          const t = record[importType === "type" ? 2 : 1];
          if (t.token === "file") {
            return "import 'file'";
          }
          if (t.token === "word") {
            return "import a from 'file'";
          }
          if (t.token === "{") {
            return "import { a } from 'file'";
          }
          if (t.token === "*") {
            return "import * as b from 'file'";
          }
          throw new Error(
            `Import No.${records.length}: Unexpected Token: ${JSON.stringify(
              t
            )}`
          );
        })();

        records.push({ tokens: record, type, importType });
        continue;
      }
      stack.push(pre);
      stack.push(token);
      continue;
    } else {
      throw new Error(
        `Import No.${records.length}: Unexpected Token '${token.raw}' after '${
          pre.raw
        }': expected: ${getPrintStrings(TOKEN_MAP[pre.token])}`
      );
    }
  }
  return records;
}
