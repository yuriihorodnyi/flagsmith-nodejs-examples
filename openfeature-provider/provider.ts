import {
    EvaluationContext,
    FlagValue,
    Hook,
    JsonValue,
    Logger,
    OpenFeatureEventEmitter,
    Provider,
    ProviderStatus,
    ResolutionDetails,
} from '@openfeature/js-sdk';
import Flagsmith from 'flagsmith-nodejs';
import { Flags, FlagsmithConfig } from 'flagsmith-nodejs/build/sdk';
import { getBooleanFlagValue, getStringFlagValue, getNumberFlagValue, getObjectFlagValue, getContext } from './flag-service';

/**
 * FlagsmithProvider is the Node.JS provider implementation for the feature flag solution Flagsmith.
 */

export default class FlagsmithProvider implements Provider {
    readonly metadata = {
        name: 'Flagsmith Provider',
    } as const;

    hooks?: Hook<FlagValue>[];
    flagsmith: Flagsmith;
    environmentFlags: Promise<Flags>;
    globalContext?: EvaluationContext;

    constructor(config: FlagsmithConfig) {
        this.flagsmith = new Flagsmith(config);
        this.environmentFlags = this.flagsmith.getEnvironmentFlags();
    }

    async resolveBooleanEvaluation(
        flagKey: string,
        defaultValue: boolean,
        context: EvaluationContext,
        logger: Logger
    ): Promise<ResolutionDetails<boolean>> {
        try {
            const ctx = await getContext(context, this.globalContext);
            const value = await getBooleanFlagValue(this.flagsmith, flagKey, ctx) ?? defaultValue;
            return {
                value,
                reason: 'some reason for resolveBooleanEvaluation',
            };
        } catch (err) {
            throw err;
        }
    }

    async resolveStringEvaluation(
        flagKey: string,
        defaultValue: string,
        context: EvaluationContext,
        logger: Logger
    ): Promise<ResolutionDetails<string>> {
        try {
            const ctx = await getContext(context, this.globalContext);
            const value = await getStringFlagValue(this.flagsmith, flagKey, ctx) ?? defaultValue;
            return {
                value,
                reason: 'some reason for resolveStringEvaluation',
            };
        } catch (err) {
            throw err;
        }
    }

    async resolveNumberEvaluation(
        flagKey: string,
        defaultValue: number,
        context: EvaluationContext,
        logger: Logger
    ): Promise<ResolutionDetails<number>> {
        try {
            const ctx = await getContext(context, this.globalContext);
            const value = await getNumberFlagValue(this.flagsmith, flagKey, ctx) ?? defaultValue;
            return {
                value,
                reason: 'some reason for resolveNumberEvaluation',
            };
        } catch (err) {
            throw err;
        }
    }

    async resolveObjectEvaluation<T extends JsonValue>(
        flagKey: string,
        defaultValue: T,
        context: EvaluationContext,
        logger: Logger
    ): Promise<ResolutionDetails<T>> {
        try {
            const ctx = await getContext(context, this.globalContext);
            console.log('context resolveObjectEvaluation :>>', ctx, this.globalContext, context);
            const value = await getObjectFlagValue(this.flagsmith, flagKey, ctx) ?? defaultValue;
            return {
                value: value as T,
                reason: 'some reason for resolveObjectEvaluation',
            };
        } catch (err) {
            throw err;
        }
    }

    status?: ProviderStatus;
    events?: OpenFeatureEventEmitter;

    async initialize(context?: EvaluationContext): Promise<void> {
        // Initializing global context
        if (context?.targetingKey) {
            this.globalContext = context;
        }
    }

    async onClose(): Promise<void> {
        await this.flagsmith.close();
    }
}
