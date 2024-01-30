# API Styleguide

This API should adhere REST design pattern. 
Authentication is done via API Keys and basic authentication.
Endpoint naming should follow RESTful resource naming conventions, e. g. it should use nouns for resources and not verbs.

Each operation should contain request and parameters examples corresponding to the responses statuses. 
And each response should contain a response schema to be comparable with the actual response.

```yaml
get:
  responses:
    200:
      description: OK
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/MyResponse'
    400:
      description: Bad Request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Problem'
  parameters:
    - name: id
      in: query
      schema:
        type: string
      examples:
        200:
          value: 123
          summary: A valid id
        400:
          value: 1234
          summary: An invalid id
```

Each path item should contain at least one operation for creating a resource. This allows to check the API automatically.

Get requests should not contain a request body.

API versioning is done via the URL path.
