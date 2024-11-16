# **Project Documentation: Zero-Shot Text Classification Web Application**

## **Overview**

This project is a web application that performs zero-shot text classification using a transformer model running entirely in the browser. It leverages the `@xenova/transformers` library to run transformer models without the need for a server or backend. The application allows users to input text and categorize it into predefined labels based on the model's predictions.

## **Table of Contents**

1. [Features](#features)
2. [Getting Started](#getting-started)
   - [Installation](#installation)
3. [Usage](#usage)
4. [Project Structure](#project-structure)
5. [Technical Details](#technical-details)
   - [Zero-Shot Classification Model](#zero-shot-classification-model)
   - [Web Workers](#web-workers)
   - [Client-Side Inference](#client-side-inference)
6. [Customization](#customization)
7. [Performance Optimization](#performance-optimization)
8. [Known Issues](#known-issues)

---

## **Features**

- **Zero-Shot Text Classification**: Classify text into user-defined categories without additional training.
- **Client-Side Processing**: All computations are done locally in the browser; no server is required.
- **Performance Metrics**: Display the time taken for each classification in milliseconds.
- **Customizable Categories**: Predefined categories can be modified to suit different use cases.



## **Getting Started**


### **Installation**


## Installation

To set up the project locally:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Atrozy/zeroshotprompting.git


2. **Navigate to the project directory:**

   ```bash
   cd zeroshotprompting/transformers.js/zero-shot-classification
   npm install
   npm run dev


```
```
# Usage
## Access the Application
- Open your web browser and navigate to http://localhost:5173/.

## Input Text
- Enter the text you want to classify in the textarea provided.
- You can input multiple pieces of text, separated by new lines.

## Categorize Text
- Click the Categorize button to start the classification process.
- The model will load (if not already loaded) and process the input text.

## View Results
- The text will be categorized under the relevant sections based on the model's predictions.
- For each piece of text, you will see:
  - The classification probabilities for each category .
  - The time taken to classify the text in milliseconds.

## Clear Results
- Click the Clear button to reset the classifications and input new text.

# Project Structure
```
```
zero-shot-text-classification/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── worker.js
│   ├── index.js
│   ├── index.css
│   └── App.css
├── package.json
├── package-lock.json
└── README.md
```
```
## Key Files:
- **App.js**: Main React component that renders the user interface and handles interaction with the web worker.
- **worker.js**: Web Worker script that loads the model and performs text classification.
- **index.js**: Entry point of the React application.
- **index.html**: The HTML template for the application.
- **App.css** and **index.css**: Stylesheets for the application.

# Technical Details
## Zero-Shot Classification Model
- **Model Used**: Xenova/mobilebert-uncased-mnli
- **Library**: @xenova/transformers
- **Quantization**: Enabled for reduced model size and faster inference.

## Web Workers
- **Implementation**: The worker.js file sets up a worker that loads the model and performs classification .

## Client-Side Inference
- **Model Loading**: The model is downloaded and cached in the browser upon first use.
- **Advantages**:
  - **Privacy**: No data is sent to a server; all processing is local.
  - **Responsiveness**: Eliminates network latency for inference after the model is loaded.

## Customization
### Modifying Categories
```
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
```

### Adjusting the Threshold
```
const threshold = 0.2; // Set a threshold for classification
```
- **Modification**: Adjust the value between 0 and 1 as needed.

### Styling
- **CSS Files**: Modify App.css and index.css to change the appearance of the application.
- **Inline Styles**: You can also adjust styles directly in the JSX elements if preferred.

## Performance Optimization
### Model Quantization
- **Enabled by Default**: The model is loaded with quantization to improve performance.

## Hardware Considerations
- **CPU Performance**: Faster CPUs will reduce classification time.
- **Browser Choice**: Modern browsers with efficient JavaScript engines (e.g., Chrome, Edge) offer better performance.
- **Memory (RAM)**: Adequate RAM ensures smooth operation without swapping to disk.

## Batch Processing
- **Current Implementation**: Texts are processed individually in a loop.
- **Potential Improvement**: Modify worker.js to perform batch inference if supported by the model.

## Known Issues
- **Initial Loading Time**: The first-time model loading can be slow due to downloading and initializing the model.
- **Memory Usage**: Loading transformer models can be memory-intensive.
- **Browser Compatibility**: Ensure you use a browser that supports Web Workers and modern JavaScript features.

