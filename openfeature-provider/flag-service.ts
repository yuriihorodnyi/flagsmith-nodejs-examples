import {
    EvaluationContext, JsonValue,
} from '@openfeature/js-sdk';

/**
 * This function will check the type of the value and return the value if the type of the value matches the type of the flag else it will return undefined. 
 * 
 * The need of this function came from the fact that flagsmith returns any type of value for a flag and we need to check the type of the value before using it, as the openfeature methods require the value to be of a specific type.
 * 
 * @param value The value of the flag returned by flagsmith which will be checked for type 
 * @param expectedType The type of the flag which will be checked against type of the value
 * @returns The value if the type of the value matches the type of the flag else it will return undefined
 */

export const typeFactory = (value: any, expectedType: 'string' | 'number' | 'object' | 'boolean'):
    number | string | object | boolean | undefined => {
    try {
        if (value === undefined) return undefined;
        if (expectedType === 'number' && !isNaN(value)) return value;
        if (expectedType === 'string' && typeof value === 'string') {
            try {
                return typeof JSON.parse(value) !== 'object' ? value : undefined;
            } catch {
                return value;
            }
        }
        if (expectedType === 'object') {
            try {
                const obj = JSON.parse(value);
                return typeof obj === 'object' ? obj : undefined;
            } catch {
                return undefined;
            }
        }
        if (expectedType === 'boolean') {
            try {
                return typeof JSON.parse(value) === 'boolean' ? value : undefined;
            } catch {
                return undefined;
            }
        }
        return undefined;
    } catch (e) {
        console.log("Error :>>", e);
        return undefined;
    }
};

/**
 * This function will return the flags to be used for evaluation.
 * 
 * @param flagsmith The flagsmith instance
 * @param context The context for evaluation, if targetingKey is defined in the context then the identity flags will be used for evaluation else the environment flags will be used for evaluation.
 * @returns 
 */

const getFlags = async (flagsmith: any, context: EvaluationContext): Promise<any> => {
    try {
        let flags;
        if (context?.targetingKey) {
            flags = await flagsmith.getIdentityFlags(context.targetingKey);
        }
        else {
            flags = await flagsmith.getEnvironmentFlags();
        }
        return flags;
    } catch (e) {
        console.log("Error :>>", e);
        return undefined;
    }
}

const resolveFlagsmithEvaluation = async (flags: any, flagKey: string, expectedType: 'string' | 'number' | 'boolean' | 'object') => {
    try {
        //check if the flag is enabled 
        let flag = flags.isFeatureEnabled(flagKey);
        if (flag) {
            return typeFactory(flags.getFeatureValue(flagKey), expectedType);
        } else {
            console.log(`Flag : ${flagKey} is not enabled`);
            return undefined;
        }
    } catch (e) {
        console.log("Error :>>", e);
        return undefined;
    }
}

/**
 * This function will return the value of the flag with value of type boolean if the flag exists else it will return undefined.
 * 
 * @param flagsmith The flagsmith instance
 * @param flagKey The key of the flag for which the value will be returned
 * @param context The context for evaluation
 * 
 * If the flag exists and isUsingBooleanConfigValue is true then the feature_state_value will be used as the flag value else the flag value will be used.
 * 
 * @returns The value of the flag if the flag exists else undefined
 */

export const getBooleanFlagValue = async (flagsmith: any, flagKey: string, context: EvaluationContext):
    Promise<boolean | undefined> => {
    try {
        let flags = await getFlags(flagsmith, context);
        
        // When isUsingBooleanConfigValue is true the feature_state_value will be used as the flag value

        if (!!context?.isUsingBooleanConfigValue) {
            const value = await resolveFlagsmithEvaluation(flags, flagKey, 'boolean');
            return value as boolean | undefined;
        }

        return typeFactory(flags.isFeatureEnabled(flagKey), 'boolean') as boolean | undefined;

    } catch (e) {
        console.log("Error :>>", e);
        return undefined;
    }
};


/**
 * This function will return the value of the flag with value of type string if the flag exists else it will return undefined.
 * 
 * @param flagsmith The flagsmith instance
 * @param flagKey The key of the flag for which the value will be returned
 * @param context The context for evaluation
 * @returns The value of the flag if the flag exists else undefined
 */

export const getStringFlagValue = async (flagsmith: any, flagKey: string, context: EvaluationContext):
    Promise<string | undefined> => {
    try {
        let flags = await getFlags(flagsmith, context);
        const value = await resolveFlagsmithEvaluation(flags, flagKey, 'string');
        return value as string | undefined;
    } catch (e) {
        console.log("Error :>>", e);
        return undefined;
    }
}

/**
 * This function will return the value of the flag with value of type number if the flag exists else it will return undefined.
 * 
 * @param flagsmith The flagsmith instance
 * @param flagKey The key of the flag for which the value will be returned
 * @param context The context for evaluation
 * @returns The value of the flag if the flag exists else undefined
 */

export const getNumberFlagValue = async (flagsmith: any, flagKey: string, context: EvaluationContext):
    Promise<number | undefined> => {
    try {
        let flags = await getFlags(flagsmith, context);
        const value = await resolveFlagsmithEvaluation(flags, flagKey, 'number');
        return value as number | undefined;
    } catch (e) {
        console.log("Error :>>", e);
        return undefined;
    }
}

/**
 * This function will return the value of the flag with value of type object if the flag exists else it will return undefined.
 * 
 * @param flagsmith The flagsmith instance
 * @param flagKey The key of the flag for which the value will be returned
 * @param context The context for evaluation
 * @returns The value of the flag if the flag exists else undefined
 */

export const getObjectFlagValue = async <T extends JsonValue>(flagsmith: any, flagKey: string, context: EvaluationContext):
    Promise<T | undefined> => {
    try {
        let flags = await getFlags(flagsmith, context);
        const value = await resolveFlagsmithEvaluation(flags, flagKey, 'object');
        return value as T | undefined;
    } catch (e) {
        console.log("Error :>>", e);
        return undefined;
    }
}

/**
 * This function will return the context to be used for evaluation.
 * If privateContext is defined, it will be used for evaluation.
 * else globalContext will be used for evaluation.
 * 
 * @param globalContext : The global context for evaluation
 * @param privateContext : The private context for evaluation
 * @returns : The context to be used for evaluation
 */

export const getContext = async (globalContext: EvaluationContext | undefined, privateContext: EvaluationContext | undefined): Promise<EvaluationContext> => {
    let context = globalContext || {};
    //check if privateContext is not undefined
    !!privateContext?.targetingKey ? context = privateContext : context;
    return context;
};
