import { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

interface Section {
  title: string;
  items: {
    text: string;
    probabilities: { label: string; score: number }[];
    classificationTime: number;
  }[];
}

const PLACEHOLDER_REVIEWS: string[] = [
  // Add your sample text here for testing
];

const PLACEHOLDER_SECTIONS: string[] = [
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
  const [text, setText] = useState<string>(PLACEHOLDER_REVIEWS.join('\n'));
  const [sections, setSections] = useState<Section[]>(
    PLACEHOLDER_SECTIONS.map((title) => ({ title, items: [] }))
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'processing'>('idle');

  const sectionsRef = useRef(sections);
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'module',
      });
    }

    const onMessageReceived = (e: MessageEvent) => {
      const status = e.data.status;
      if (status === 'initiate') {
        setStatus('loading');
      } else if (status === 'ready') {
        setStatus('ready');
      } else if (status === 'output') {
        const { sequence, labels, scores } = e.data.output;
        const { classificationTime } = e.data;

        const labelScores = labels.map((label: string, index: number) => ({
          label,
          score: scores[index],
        })).sort((a, b) => b.score - a.score);

        const threshold = 0.2;
        const bestMatch = labelScores.find((ls) => ls.score >= threshold);
        const assignedLabel = bestMatch ? bestMatch.label : null;

        if (assignedLabel) {
          const sectionID = sectionsRef.current.findIndex(
            (section) => section.title === assignedLabel
          );

          const item = {
            text: sequence,
            probabilities: labelScores,
            classificationTime,
          };

          setSections((prevSections) => {
            const newSections = [...prevSections];
            if (sectionID >= 0) {
              newSections[sectionID] = {
                ...newSections[sectionID],
                items: [...newSections[sectionID].items, item],
              };
            }
            return newSections;
          });
        }
      } else if (status === 'complete') {
        setStatus('idle');
      }
    };

    worker.current.addEventListener('message', onMessageReceived);

    return () => {
      if (worker.current) {
        worker.current.removeEventListener('message', onMessageReceived);
      }
    };
  }, []);

  const classify = useCallback(() => {
    setStatus('processing');
    setSections((prevSections) =>
      prevSections.map((section) => ({ ...section, items: [] }))
    );
    worker.current?.postMessage({
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
          className={`border py-2 px-4 rounded text-black text-lg font-medium ${
            busy ? 'bg-gray-400 cursor-not-allowed' : ''
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
          className="border py-1 px-3 rounded text-black text-sm font-medium"
          onClick={() =>
            setSections((prevSections) =>
              prevSections.map((section) => ({ ...section, items: [] }))
            )
          }
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
                    <li>Time taken: {item.classificationTime.toFixed(2)} ms</li>
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
