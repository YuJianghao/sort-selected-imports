export function getPrintStrings(strs: string[]) {
  return strs.map((str) => `${str}`).join(" or ");
}
