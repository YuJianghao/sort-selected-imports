export type Token =
  | "import"
  | "{"
  | "}"
  | "*"
  | "as"
  | "from"
  | "word"
  | "file"
  | ",";
export interface ITokenResult {
  raw: string;
  token: Token;
}

export function tokenize(code: string) {
  const str0 = addSpaceToComa(code);
  const str1 = replaceSemi(str0);
  const str2 = transformSingleQuotToDouble(str1);
  const words = splitToWords(str2);
  return words.map(wordToToken);
}

function addSpaceToComa(code: string): string {
  return code.split(",").join(" , ");
}

function replaceSemi(code: string): string {
  return code.split(";").join("\n");
}

function transformSingleQuotToDouble(code: string): string {
  return code.split("'").join('"');
}

function splitToWords(code: string): string[] {
  return code
    .split(" ")
    .map((s) => s.trim().split("\n"))
    .reduce((a, item) => [...a, ...item], [])
    .filter((w) => !!w);
}
function wordToToken(word: string): ITokenResult {
  if ("import" === word) {
    return { raw: word, token: word };
  }
  if ("{" === word) {
    return { raw: word, token: word };
  }
  if ("}" === word) {
    return { raw: word, token: word };
  }
  if ("*" === word) {
    return { raw: word, token: word };
  }
  if ("as" === word) {
    return { raw: word, token: word };
  }
  if ("from" === word) {
    return { raw: word, token: word };
  }
  if ("," === word) {
    return { raw: word, token: word };
  }
  if (word.length > 1 && word.startsWith('"') && word.endsWith('"')) {
    return { raw: word.slice(1, -1), token: "file" };
  }
  return { raw: word, token: "word" };
}
