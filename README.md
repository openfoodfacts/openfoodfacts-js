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

// Uses the native fetch available in modern Node.js and browsers.
const client = new OpenFoodFacts(globalThis.fetch);

(async () => {
  // then you can use the client to access the Open Food Facts API
  const { data, error } = await client.getProduct("5000112546415");
  if (!data) {
    console.error("Error fetching product:", error);
    return;
  }
  console.log("Product data:", data);
})();
```

### Universal barcode lookup and configuration

`getProduct()` uses API v3 and requests `product_type=all` by default, even
when the constructor receives no options. The server can identify the product
type from the barcode and redirect to the appropriate platform. Per-call query
values override configured defaults.

```ts
const client = new OpenFoodFacts(globalThis.fetch, {
  locale: { language: "it", country: "it" },
  app: { name: "MyApp", version: "1.0", contact: "https://example.com" },
  defaults: { productType: "all" },
  endpoints: {
    // Optional overrides, for example when using a proxy:
    products: "https://world.openfoodfacts.org",
  },
});

const { data, error } = await client.getProduct("5000112546415");
// Restrict one request when the product type is already known:
const food = await client.getProduct("5000112546415", {
  product_type: "food",
});
```

`resolveConfig()` is exported for inspecting the immutable resolved settings.
Each service uses its explicit endpoint override, or its production default
when omitted. To use the staging product API, set
`endpoints.products` to `https://world.openfoodfacts.net`. This changes only
the product endpoint; other services retain their production defaults unless
explicitly overridden.

For endpoint overrides, `images` is the full image root ending in
`/images/products`, `taxonomies` is the static host, and `robotoff` is the full
API base ending in `/api/v1`. Other service endpoints are service roots. These
URLs back `getProductImageUrl`, taxonomy methods, and the `robotoff`,
`nutriPatrol`, `searchApi`, `pricesApi`, `folksonomyApi`, and `facetsKp` clients.
`facetsKp` accesses the facets knowledge panel service; it is separate from
the product facet methods.

This configuration replaces the previous constructor options: use
`endpoints.products` instead of `host` or `type`, and `locale.country` /
`locale.language` instead of the top-level locale options. Use `getProduct()`
instead of `getProductV2()` or `getProductV3()`. Version-specific clients remain
available through `apiv2` and `apiv3` for explicit low-level access. Auxiliary clients and static
taxonomy downloads share the application identity header wrapper; the product
API access token is applied only to product-server requests.

- See the [Open Food Facts API documentation][off-api] for more details on the API endpoints.

- See the [SDK auto generated documentation](https://openfoodfacts.github.io/openfoodfacts-js/) for a complete list of available methods and classes.

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

### Browser and Node compatibility

Run `yarn typecheck` to check the entire SDK source in two separate environments:
browser declarations without Node types, and Node declarations without DOM
libraries. Both checks use `noEmit` and do not generate files in the source tree.
The editor and build use Node types; passing the browser check is also required.

CI runs both source checks before building the SDK.
The unit tests run in Node; these typechecks do not constitute browser runtime tests.

## Contribute

We accept contributions of any kind: new features, bug fixes, documentation improvements, etc.

You can also help us by reporting bugs, suggesting improvements or testing new features.

When submitting a PR, please use the [angular commit guideline](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits).

## Using this SDK and Third party applications

- If you use this SDK, feel free to open a PR to add your application in the list in [REUSERS.md](https://github.com/openfoodfacts/openfoodfacts-js/blob/develop/REUSERS.md)
- Make sure you comply with the OdBL licence, mentioning the Source of your data, and ensuring to avoid combining non free data you can't release legally as open data. Another requirement is contributing back any product you add using this SDK.

[off-api]: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/
