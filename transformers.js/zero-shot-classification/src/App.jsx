import { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

const PLACEHOLDER_REVIEWS = [
  // Add your sample text here for testing
];

const PLACEHOLDER_SECTIONS = [
  'Conversational',
  'Website',
  'Question',
  'Financial Markets',
  'Programming',
  'Math',
  'Product Search',
  'Location',
  'News',
  'Cooking',
  'Translation',
  'Academic Research',
  'Job Career',
  'Travel Planning',
  'Social Media',
];

function App() {
  const [text, setText] = useState(PLACEHOLDER_REVIEWS.join('\n'));
  const [sections, setSections] = useState(
    PLACEHOLDER_SECTIONS.map((title) => ({ title, items: [] }))
  );
  const [status, setStatus] = useState('idle');

  // Reference to keep track of the latest sections state
  const sectionsRef = useRef(sections);
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  // Create a reference to the worker object.
  const worker = useRef(null);

  // Setup the worker when the component mounts
  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module',
      });
    }

    // Callback function for messages from the worker thread
    const onMessageReceived = (e) => {
      const status = e.data.status;
      if (status === 'initiate') {
        setStatus('loading');
      } else if (status === 'ready') {
        setStatus('ready');
      } else if (status === 'output') {
        const { sequence, labels, scores } = e.data.output;
        const { classificationTime } = e.data;

        // Create an array of label-score pairs
        const labelScores = labels.map((label, index) => ({
          label,
          score: scores[index],
        }));

        // Sort labels by score in descending order
        labelScores.sort((a, b) => b.score - a.score);

        // Set a threshold for classification
        const threshold = 0.2;

        // Determine the assigned label
        const bestMatch = labelScores.find((ls) => ls.score >= threshold);
        const assignedLabel = bestMatch ? bestMatch.label : null;

        // Only proceed if an assigned label is found
        if (assignedLabel) {
          // Find the index of the assigned label in sections
          const sectionID = sectionsRef.current.findIndex(
            (section) => section.title === assignedLabel
          );

          // Create an item with text, probabilities, and classification time
          const item = {
            text: sequence,
            probabilities: labelScores,
            classificationTime,
          };

          setSections((prevSections) => {
            const newSections = [...prevSections];
            const index = sectionID >= 0 ? sectionID : null;
            if (index !== null) {
              newSections[index] = {
                ...newSections[index],
                items: [...newSections[index].items, item],
              };
            }
            return newSections;
          });
        }
      } else if (status === 'complete') {
        setStatus('idle');
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener('message', onMessageReceived);

    // Cleanup when the component unmounts
    return () => {
      worker.current.removeEventListener('message', onMessageReceived);
    };
  }, []);

  const classify = useCallback(() => {
    setStatus('processing');
    // Clear previous classification results
    setSections((prevSections) =>
      prevSections.map((section) => ({ ...section, items: [] }))
    );
    worker.current.postMessage({
      text,
      labels: sections.map((section) => section.title),
    });
  }, [text, sections]);

  const busy = status !== 'idle';

  return (
    <div className="flex flex-col h-full p-4">
      <textarea
        className="border w-full p-2 h-1/2 mb-4 resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text here..."
      ></textarea>
      <div className="flex flex-col justify-center items-center m-2 gap-2">
        <button
          type="button"
          className={`border py-2 px-4 rounded text-white text-lg font-medium ${
            busy
              ? 'bg-gray-400 cursor-not-allowed'
              : ''
          }`}
          disabled={busy}
          onClick={classify}
        >
          {!busy
            ? 'Categorize'
            : status === 'loading'
            ? 'Model loading...'
            : 'Processing...'}
        </button>
        <button
          type="button"
          className="border py-1 px-3  rounded text-white text-sm font-medium"
          onClick={() => {
            setSections((prevSections) =>
              prevSections.map((section) => ({
                ...section,
                items: [],
              }))
            );
          }}
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap flex-grow overflow-y-auto mt-4">
        {sections.map((section, index) => (
          <div key={index} className="w-full mb-4">
            <h2 className="font-semibold text-lg mb-2">{section.title}</h2>
            <ul className="list-disc list-inside">
              {section.items.map((item, idx) => (
                <li key={idx} className="mb-2">
                  <div>{item.text}</div>
                  <ul className="ml-4 text-sm text-gray-600">
                    {item.probabilities.map((prob, index) => (
                      <li key={index}>
                        {prob.label}: {(prob.score * 100).toFixed(2)}%
                      </li>
                    ))}
                    <li>
                      Time taken: {item.classificationTime.toFixed(2)} ms
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {busy && status === 'processing' && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        </div>
      )}
    </div>
  );
}

export default App;
