# Open Food Facts - JS SDK

<a href="https://www.npmjs.com/package/@openfoodfacts/openfoodfacts-nodejs"><img alt="NPM Version" src="https://img.shields.io/npm/v/%40openfoodfacts%2Fopenfoodfacts-nodejs"></a>
<a href="https://openfoodfacts.github.io/openfoodfacts-nodejs/"><img src="https://img.shields.io/badge/docs-latest-blue.svg" alt="Documentation"></a>

This is the official JS/TS SDK for the Open Food Facts API.

## Installation

### From NPM

```shell
npm install @openfoodfacts/openfoodfacts-nodejs
```

### Using the latest git version

```shell
npm install git+https://github.com/openfoodfacts/openfoodfacts-js.git
```

## Usage

> [!WARNING]
> Be sure to read the [Open Food Facts API documentation][off-api] to understand how the API should be used and what data is available **BEFORE** starting to use the SDK.

Import the SDK in your project and create a client instance:

```ts
import { OpenFoodFacts } from "@openfoodfacts/openfoodfacts-nodejs";

// if you're on the browser, you can pass the fetch function as a parameter
const client = new OpenFoodFacts(window.fetch);
// or if you're on Node.js, you can pass the global fetch function
const client = new OpenFoodFacts(globalThis.fetch);
// or if you're using a custom fetch implementation
import fetch from "node-fetch";

const client = new OpenFoodFacts(fetch);

(async () => {
  // then you can use the client to access the Open Food Facts API
  const { data, error } = await client.getProductV3("5000112546415");
  if (!data) {
    console.error("Error fetching product:", error);
    return;
  }
  console.log("Product data:", data);
})();
```

- See the [Open Food Facts API documentation][off-api] for more details on the API endpoints.

- See the [SDK auto generated documentation](https://openfoodfacts.github.io/openfoodfacts-js/) for a complete list of available methods and classes.

### Other projects

The client also works with [Open Beauty Facts][obf], [Open Pet Food Facts][opff] and [Open Products Facts][opf]:

```ts
import {
  OpenFoodFacts,
  BackendType,
} from "@openfoodfacts/openfoodfacts-nodejs";

const client = new OpenFoodFacts(fetch, { type: BackendType.OBF });
```

Passing a project `host` has the same effect. Some interfaces, such as NutriPatrol and Open Prices, only support OFF.

## Development

### Prerequisites

- Node.js
- Yarn v4

### API bindings

The project uses [openapi-typescript](https://github.com/drwpow/openapi-typescript) to generate the API bindings automatically from the OpenAPI specification.

To generate the API bindings, run `yarn api`.
The files are to be committed to the repository, so that the SDK can be used without having to download the specs every time.

### Building

- Clone the repository and run `yarn install` in the directory.
- Run `yarn api` to generate the OpenAPI bindings, then `yarn build` to build the project.
- Run `yarn test` to run the tests.

## Contribute

We accept contributions of any kind: new features, bug fixes, documentation improvements, etc.

You can also help us by reporting bugs, suggesting improvements or testing new features.

When submitting a PR, please use the [angular commit guideline](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits).

## Using this SDK and Third party applications

- If you use this SDK, feel free to open a PR to add your application in the list in [REUSERS.md](https://github.com/openfoodfacts/openfoodfacts-js/blob/develop/REUSERS.md)
- Make sure you comply with the OdBL licence, mentioning the Source of your data, and ensuring to avoid combining non free data you can't release legally as open data. Another requirement is contributing back any product you add using this SDK.

[off-api]: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/
[obf]: https://world.openbeautyfacts.org/
[opff]: https://world.openpetfoodfacts.org/
[opf]: https://world.openproductsfacts.org/
