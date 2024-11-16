// worker.js
import { env, pipeline } from '@xenova/transformers';

// Skip local model check since we are downloading the model from the Hugging Face Hub.
env.allowLocalModels = false;

class MyZeroShotClassificationPipeline {
  static task = 'zero-shot-classification';
  static model = 'Xenova/mobilebert-uncased-mnli';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, {
        quantized: true,
        progress_callback,
      });
    }

    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  // Retrieve the pipeline. When called for the first time,
  // this will load the pipeline and save it for future use.
  const classifier = await MyZeroShotClassificationPipeline.getInstance((x) => {
    // We also add a progress callback to the pipeline so that we can
    // track model loading.
    self.postMessage(x);
  });

  const { text, labels } = event.data;

  const split = text.split('\n');
  for (const line of split) {
    // Record the start time
    const startTime = performance.now();

    const output = await classifier(line, labels, {
      hypothesis_template: 'This text is about {}.',
      multi_label: true,
    });

    // Record the end time and calculate the classification time
    const endTime = performance.now();
    const classificationTime = endTime - startTime;

    // Send the output back to the main thread
    self.postMessage({ status: 'output', output, classificationTime });
  }
  // Send the output back to the main thread
  self.postMessage({ status: 'complete' });
});
