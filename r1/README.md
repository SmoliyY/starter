## Test config

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| defaults| [Defaults Object](#defaults) | Default parameters used for every request | {} |
| flows  | [Flow Object](#flows) | Flows map where every flow defines custom order of the requests to be made | {} |


### [defaults](#defaults)

| Option  | Type | Description  |  Default value |
|----------|--------------|----------------|-----|
| basePath | String | Base URL for all requests |  "" |
| parameters  | [Parameters Object](#ParametersObject)  |  | {} |


### [flows](#flows)

Map<string, [TestCaseObject[]](#TestCaseObject)>

#### [TestCaseObject](#TestCaseObject)

| Option | Required  | Type | Description  |  Default value |
|----------|---------|------|--------------|----------------|
| name | false | String | Test case name | path@blabla |
| path  | true  | String | Request path | - |
| method | true | String | HTTP Method | - |
| expect | false | [ExpectObject](#ExpectObject) | Set of expectations | - |
| assert | false | [AssertionObject](#Assertion) | Custom assertion | - |


#### [Expect](#ExpectObject)

| Option | Required | Type | Description | Default value |
|--------|----------|------|-------------|---------------|
| body | false | [BodyObject](#BodyObject) | TBD | - |
| status | false | Number | TBD | - |


#### [BodyObject](#BodyObject)

| Option | Required | Type | Description | Default value |
|--------|----------|------|-------------|---------------|
|  | false |  | TBD | - |
|  | false |  | TBD | - |



#### [Parameters Object](#ParametersObject)


#### [Context](#Context)


#### [Assertion](#Assertion)

You can write your custom assertions by providing string as a valid JavaScript function or reference to `.js` file e.g.:

```yaml
assert: |
  (expect, response) => {
    expect(response.body.message).match(/OK/i);
  }
```

OR

```yaml
assert: 
  $ref: ./custom-assertion.js
```

Assertion function takes next arguments:

`expect` - [Expect function](#ExpectFunction) (Caveat: currently we support only function expressions, e.g. `() => {}` or `(function a () {})`. Function declaration must be wrapped by grouping operator `()` in order `vm.Script` to parse it properly).
`ctx` - [Context Object](#Context)