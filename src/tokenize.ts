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
  const str = compose([
    addSpaceToBrace,
    addSpaceToComa,
    replaceSemi,
    transformSingleQuotToDouble,
  ])(code);
  const words = splitToWords(str);
  return words.map(wordToToken);
}

function compose(fns: ((str: string) => string)[]) {
  return (str: string): string => {
    if (fns.length === 1) {
      return fns[0](str);
    }
    const fn = fns[0];
    return compose(fns.slice(1))(fn(str));
  };
}

function addSpaceToBrace(code: string): string {
  return code.split("{").join(" { ").split("}").join(" } ");
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
