export function isMostlyAscii(value: string): boolean {
  return Array.from(value).every((character) => character.charCodeAt(0) <= 0x7f);
}
