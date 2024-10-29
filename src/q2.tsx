interface PipelineStage<TInput, TOutput> {
  name: string;
  transform(data: TInput): Promise<TOutput>;
  validate?(data: TOutput): Promise<boolean>;
}

class Pipeline<TInput, TOutput> {
  private stages: PipelineStage<any, any>[];
  private progressCallback?: (stage: string, progress: number) => void;

  constructor(stages: PipelineStage<any, any>[] = []) {
    this.stages = stages;
  }

  addStage<TNext>(
    stage: PipelineStage<TOutput, TNext>
  ): Pipeline<TInput, TNext> {
    const newStages = [...this.stages, stage];
    return new Pipeline<TInput, TNext>(newStages);
  }

  onProgress(callback: (stage: string, progress: number) => void): void {
    this.progressCallback = callback;
  }

  async process(input: TInput): Promise<TOutput> {
    let data: any = input;

    for (let i = 0; i < this.stages.length; i++) {
      const stage = this.stages[i];
      try {
        data = await stage.transform(data);

        if (stage.validate && !(await stage.validate(data))) {
          console.log(`Validation failed at stage: ${stage.name}`);
          throw new Error(`Validation failed at stage: ${stage.name}`);
        }

        this.progressCallback?.(stage.name, (i + 1) / this.stages.length);
      } catch (error) {
        console.error(`Error in stage ${stage.name}:`, error);
        throw error;
      }
    }

    return data;
  }
}

interface RawData {
  text: string;
}

interface TokenizedData {
  tokens: string[];
}

interface ProcessedData extends TokenizedData {
  sentiment: number;
}

class TokenizeStage implements PipelineStage<RawData, TokenizedData> {
  name = "Tokenize";

  async transform({ text }: RawData): Promise<TokenizedData> {
    return { tokens: text.split(" ") };
  }

  async validate(data: TokenizedData): Promise<boolean> {
    return data.tokens.length > 0;
  }
}

class SentimentStage implements PipelineStage<TokenizedData, ProcessedData> {
  name = "Sentiment";

  async transform(data: TokenizedData): Promise<ProcessedData> {
    const sentiment = Math.random() * 2 - 1;
    return { ...data, sentiment };
  }

  async validate(data: ProcessedData): Promise<boolean> {
    return data.sentiment >= -1 && data.sentiment <= 1;
  }
}

const pipeline = new Pipeline<RawData, RawData>()
  .addStage(new TokenizeStage())
  .addStage(new SentimentStage());

pipeline.onProgress((stage, progress) => {
  console.log(`Stage: ${stage}, Progress: ${(progress * 100).toFixed(2)}%`);
});

pipeline
  .process({ text: "This is the raw data" })
  .then((result) => console.log("Result:", result))
  .catch((error) => console.error("Error:", error));
