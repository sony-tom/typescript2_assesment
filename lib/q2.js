"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Pipeline {
    constructor(stages = []) {
        this.stages = stages;
    }
    addStage(stage) {
        const newStages = [...this.stages, stage];
        return new Pipeline(newStages);
    }
    onProgress(callback) {
        this.progressCallback = callback;
    }
    process(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let data = input;
            for (let i = 0; i < this.stages.length; i++) {
                const stage = this.stages[i];
                try {
                    data = yield stage.transform(data);
                    if (stage.validate && !(yield stage.validate(data))) {
                        console.log(`Validation failed at stage: ${stage.name}`);
                        throw new Error(`Validation failed at stage: ${stage.name}`);
                    }
                    (_a = this.progressCallback) === null || _a === void 0 ? void 0 : _a.call(this, stage.name, (i + 1) / this.stages.length);
                }
                catch (error) {
                    console.error(`Error in stage ${stage.name}:`, error);
                    throw error;
                }
            }
            return data;
        });
    }
}
class TokenizeStage {
    constructor() {
        this.name = "Tokenize";
    }
    transform(_a) {
        return __awaiter(this, arguments, void 0, function* ({ text }) {
            return { tokens: text.split(" ") };
        });
    }
    validate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data.tokens.length > 0;
        });
    }
}
class SentimentStage {
    constructor() {
        this.name = "Sentiment";
    }
    transform(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const sentiment = Math.random() * 2 - 1;
            return Object.assign(Object.assign({}, data), { sentiment });
        });
    }
    validate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data.sentiment >= -1 && data.sentiment <= 1;
        });
    }
}
const pipeline = new Pipeline()
    .addStage(new TokenizeStage())
    .addStage(new SentimentStage());
pipeline.onProgress((stage, progress) => {
    console.log(`Stage: ${stage}, Progress: ${(progress * 100).toFixed(2)}%`);
});
pipeline
    .process({ text: "This is the raw data" })
    .then((result) => console.log("Result:", result))
    .catch((error) => console.error("Error:", error));
