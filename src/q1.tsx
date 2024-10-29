interface RetryOptions {
  retries: number;
  delay: number;
  exponentialBackoff?: boolean;
  shouldRetry?: (error: any) => boolean;
}

function retry<T>(
  fn: (attempt: number, retries: number) => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    retries,
    delay,
    exponentialBackoff = false,
    shouldRetry = () => true,
  } = options;

  return new Promise<T>((resolve, reject) => {
    let attempt = 0;

    const execution = async () => {
      try {
        const result = await fn(attempt, retries);
        resolve(result);
      } catch (error) {
        attempt++;

        if (attempt > retries || !shouldRetry(error)) {
          reject(error);
        }

        const nextDelay = exponentialBackoff
          ? delay * Math.pow(2, attempt - 1)
          : delay;

        setTimeout(execution, nextDelay);
      }
    };

    execution();
  });
}

const fetchData = async (attempt: number, retries: number) => {
  if (attempt < retries) {
    console.log("Execution failed");
    throw new Error("Failed");
  }
  return "Execution success";
};

retry(fetchData, {
  retries: 3,
  delay: 1000,
  exponentialBackoff: true,
  shouldRetry: (error) => error.message === "Failed",
}).then((result) => console.log(result));
