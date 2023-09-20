# open-feature-flagsmith-provider-node and demo app

Install the dependancies : 

`npm i`

Start the server : 

`npm run dev`

Setting the context : 

- Context can be provided globally or for each evaluation methods separately. Which depends upon the use cases.
- If the provided context is not valid then the default context will be used.
- TARGETING_KEY is the key that will be used to target the user/context in the provider
- IS_USING_BOOLEAN_CONFIG_VALUE is a boolean when its true it will be used to evaluate the feature_state_value as the flag value

Testing the provider :

Notes: You will only receive proper response if you have the feature flag created in the flagsmith dashboard and you are using the correct data type for the feature flag which is the same as the data type of flag in the flagsmith dashboard with the correct context. if not you will receive the default value that you have set in the request body.

`

``
`To test the string evaluation 

body : {
    "flagKey": "banner",
    "defaultValue": "100x100",
    "evaluationMethod": "string" 
}

response :{
    "value": "400x600",
    "reason": "some reason for resolveStringEvaluation",
    "flagMetadata": {},
    "flagKey": "banner"
}


To test the number evaluation

body : {
    "flagKey": "impressive-feature",
    "defaultValue": 0,
    "evaluationMethod": "number" 
}

response :{
    "value": 123,
    "reason": "some reason for resolveNumberEvaluation",
    "flagMetadata": {},
    "flagKey": "impressive-feature"
}

To test the boolean evaluation

body : {
    "flagKey": "impressive-feature",
    "defaultValue": true,
    "evaluationMethod": "boolean" 
}

response :{
    "value": false,
    "reason": "some reason for resolveBooleanEvaluation",
    "flagMetadata": {},
    "flagKey": "impressive-feature"
}

To test the object evaluation

body : {
    "flagKey": "impressive-feature-json",
    "defaultValue": { size: 'small' },
    "evaluationMethod": "object" 
}

response :{
    "value": {
        "field1": "value1",
        "field2": "value2"
    },
    "reason": "some reason for resolveObjectEvaluation",
    "flagMetadata": {},
    "flagKey": "impressive-feature-json"
}
`