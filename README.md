# backstage-plugin-scaffolder-json-merge-actions

This is a `json-merge` actions plugin for the `scaffolder-backend` in Backstage.

This contains a collection of actions for using with npm:

- json:merge

## Prerequisites

- Node must be installed in the environment your Backstage instance is running in, but it will most likely already be there since your Backstage instance runs in Node.

- Additionally, these actions use the [JSON Merger npm package.](https://www.npmjs.com/package/json-merger#mergefilesfiles-string-config-config). It will be useful to understand how it functions as well as what options are available in the configuration.

## Getting started

In the root directory of your Backstage project:

```
yarn add --cwd packages/backend @mdude2314/backstage-plugin-scaffolder-json-merge-actions
```

Add the actions you'd like to the scaffolder:

```typescript
// packages/backend/src/plugins/scaffolder.ts

import {
  createJsonMergeAction,
} from '@mdude2314/backstage-plugin-scaffolder-json-merge-actions';
import { ScmIntegrations } from '@backstage/integration';
import { createBuiltinActions, createRouter } from '@backstage/plugin-scaffolder-backend';

...

const integrations = ScmIntegrations.fromConfig(env.config);
const builtInActions = createBuiltinActions({
  catalogClient,
  integrations,
  config: env.config,
  reader: env.reader
});

const actions = [
    createJsonMergeAction(),
  ...builtInActions
];

return await createRouter({
  logger: env.logger,
  config: env.config,
  database: env.database,
  reader: env.reader,
  catalogClient,
  actions
});
```

## Example of using the JSON merge:

```json
/// files/file-1.json
{ "hello": "world", "foo": ["bar", "baz"] }

/// files/file-2.json
{ "goodbye": "world", "foo": ["rab", "zab"] }
```

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: json-merge-demo
  title: My json merge template
  description: Merge JSON files in the working directory of the task
spec:
  owner: mdude2314
  type: service

  steps:
    - id: fetch-files
      name: Fetch files
      action: fetch:plain
      input:
        url: ./files # files should contain the JSON files you want to merge

    - id: merge-files
      name: Merge files
      action: json:merge
      input:
        inputFiles: ["file-1.json", "file-2.json"]
        outputFilePath: results
        outputFileName: results.json
        jsonMergeOptions: # options passed directly to the mergeFiles function
          defaultArrayMergeOperation: "concat"
```

Output:

```json
/// results/results.json
{ "hello": "world", "foo": ["bar", "baz", "rab", "zab"], "goodbye": "world" }
```
