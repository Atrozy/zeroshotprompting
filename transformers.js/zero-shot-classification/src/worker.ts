import { env, pipeline } from '@xenova/transformers';

env.allowLocalModels = false;

interface ClassificationOutput {
  sequence: string;
  labels: string[];
  scores: number[];
}

class MyZeroShotClassificationPipeline {
  static task = 'zero-shot-classification';
  static model = 'Xenova/mobilebert-uncased-mnli';
  static instance: any = null;

  static async getInstance(progress_callback: (progress: any) => void = () => {}) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, {
        quantized: true,
        progress_callback,
      });
    }
    return this.instance;
  }
}

self.addEventListener('message', async (event: MessageEvent) => {
  const classifier = await MyZeroShotClassificationPipeline.getInstance((x) => {
    self.postMessage({ status: 'loading', progress: x });
  });

  const { text, labels } = event.data as { text: string; labels: string[] };

  const splitText = text.split('\n');
  for (const line of splitText) {
    const startTime = performance.now();

    const output: ClassificationOutput = await classifier(line, labels, {
      hypothesis_template: 'This text is about {}.',
      multi_label: true,
    });

    const endTime = performance.now();
    const classificationTime = endTime - startTime;

    self.postMessage({ status: 'output', output, classificationTime });
  }

  self.postMessage({ status: 'complete' });
});
