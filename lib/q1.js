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
function retry(fn, options) {
    const { retries, delay, exponentialBackoff = false, shouldRetry = () => true, } = options;
    return new Promise((resolve, reject) => {
        let attempt = 0;
        const execution = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield fn(attempt, retries);
                resolve(result);
            }
            catch (error) {
                attempt++;
                if (attempt > retries || !shouldRetry(error)) {
                    reject(error);
                }
                const nextDelay = exponentialBackoff
                    ? delay * Math.pow(2, attempt - 1)
                    : delay;
                setTimeout(execution, nextDelay);
            }
        });
        execution();
    });
}
const fetchData = (attempt, retries) => __awaiter(void 0, void 0, void 0, function* () {
    if (attempt < retries) {
        console.log("Execution failed");
        throw new Error("Failed");
    }
    return "Execution success";
});
retry(fetchData, {
    retries: 3,
    delay: 1000,
    exponentialBackoff: true,
    shouldRetry: (error) => error.message === "Failed",
}).then((result) => console.log(result));
