import { OpenFeature } from "@openfeature/js-sdk";
import FlagsmithProvider from "./provider";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

// Initialize OpenFeature provider
try {
    const environmentKey = process.env.ENVIRONMENTKEY || "";
    if (!environmentKey) {
        throw new Error("Environment key not provided");
    }

    const flagsmithProvider = new FlagsmithProvider({
        environmentKey,
        requestTimeoutSeconds: 10
    })

    // Setting global context for all evaluations
    flagsmithProvider.initialize({
        "targetingKey": process.env.TARGETING_KEY || ""
    });

    // ProviderStatus is an enum with the following values: NOT_READY, READY, ERROR
    // This is used to indicate the status of the provider.
    
    enum ProviderStatus {
        /**
         * The provider has not been initialized and cannot yet evaluate flags.
         */
        NOT_READY = "NOT_READY",
        /**
         * The provider is ready to resolve flags.
         */
        READY = "READY",
        /**
         * The provider is in an error state and unable to evaluate flags.
         */
        ERROR = "ERROR"
    }

    flagsmithProvider.status = ProviderStatus.READY;

    OpenFeature.setProvider(flagsmithProvider);

} catch (err) {
    console.error("Error initializing OpenFeature:", err);
}

const app: Express = express();

app.use(express.json());

interface Body {
    flagKey: string;
    defaultValue: string | number | boolean | object;
    evaluationMethod: "string" | "number" | "boolean" | "object";
}

app.post('/', async (req: Request, res: Response) => {
    try {
        const body: Body = req.body;
        if (!body.flagKey || body.defaultValue === undefined || !body.evaluationMethod) {
            return res.status(400).send("Invalid request body");
        }

        const { flagKey, defaultValue, evaluationMethod } = body;

        // Setting context for these evaluations only
        const context = {
            // "targetingKey": process.env.TARGETING_KEY || "",
            // "isUsingBooleanConfigValue": process.env.IS_USING_BOOLEAN_CONFIG_VALUE === "true"
        }

        let details;

        switch (evaluationMethod) {
            case "string":
                details = await OpenFeature.getClient().getStringDetails(flagKey, defaultValue as string, context);
                break;
            case "number":
                details = await OpenFeature.getClient().getNumberDetails(flagKey, defaultValue as number, context);
                break;
            case "boolean":
                details = await OpenFeature.getClient().getBooleanDetails(flagKey, defaultValue as boolean, context);
                break;
            case "object":
                details = await OpenFeature.getClient().getObjectDetails(flagKey, JSON.stringify(defaultValue), context);
                break;
            default:
                return res.status(400).send("Invalid evaluation method");
        }

        return res.status(200).send(details);
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).send("An error occurred");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Openfeature flagsmith provider demo app is listening on port ${PORT}!`);
});
