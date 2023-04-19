/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
export function removeCircularReferences(key: string, value: any) {
  const seenObjects = new WeakSet();

  if (typeof value === "object" && value !== null) {
    if (seenObjects.has(value)) {
      return; // Remove circular reference
    }
    seenObjects.add(value);
  }

  return value;
}
