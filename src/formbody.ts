type FormBodyValue =
  string | boolean | number | bigint | symbol | object | undefined | null;

export function formBody(params: Record<string, FormBodyValue>) {
  const formBody = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      // typeof null === object
      // typeof undefined === undefined
      continue;
    }

    switch (typeof value) {
      case "string":
        formBody.append(key, value);
        break;
      case "boolean":
      case "number":
      case "bigint":
        formBody.append(key, String(value));
        break;
      case "object":
        formBody.append(key, JSON.stringify(value));
        break;
      default:
        throw new Error(`Cannot formBody-fy a ${typeof value}!`);
    }
  }
  return formBody.toString();
}
