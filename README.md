# DataShield OSINT Engine
## Automated Entity Profiling and Global Intelligence Aggregator

DataShield is a professional-grade OSINT (Open Source Intelligence) framework designed for deep-web scanning, digital footprint mapping, and automated dossier generation. It orchestrates multiple LLM agents to verify information across global and local data networks.

## Core Capabilities

- **Parallel Global Search**: Executes concurrent search operations in multiple languages to retrieve data from both local sources and global networks like Reddit, 4chan, and international news archives.

- **Dual-Agent Analysis Pipeline**:
  - **Detective (Llama 3.1)**: Performs aggressive raw data extraction, cross-references conflicting reports, and identifies potential leaks.
  - **Arbiter (Gemini 2.5 Flash)**: Synthesizes findings into a formal intelligence report and calculates a reliability score based on source consistency.

- **Leak and Forum Monitoring**: Specifically targets unindexed information and community-driven leaks to find data often missed by standard search engines.

- **Anti-Hallucination Framework**: Implements strict temperature controls and target-locking prompts to ensure the engine remains focused on verified evidence.

## Technical Architecture

The system utilizes a high-concurrency fetch layer to feed data into a structured chain of large language models. This ensures that the context window is optimized while maintaining a broad search reach.

```javascript
// DataShield Intelligence Logic
async function analyzeIntelligence(targetQuery) {
  // 1. Expand query for global reach
  const expandedQuery = await translator.expand(targetQuery); 
  
  // 2. Parallel OSINT retrieval
  const rawData = await tavily.search(expandedQuery, { depth: "advanced" }); 
  
  // 3. Agent deliberation
  const analysis = await detective.process(rawData); 
  return await arbiter.finalize(analysis); // Return formal dossier
}


Setup and Deployment

1. Repository Initialization
bash
git clone https://github.com/yusufkaplaner/DataShield-OSINT.git
cd DataShield-OSINT
npm install
2. Environment Configuration
Create a .env file in the root directory with the following parameters:

env
GOOGLE_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_llama3_api_key
TAVILY_API_KEY=your_tavily_search_key
PORT=3000
3. Execution
bash
node index.js
The interface will be available at http://localhost:3000.

Interface and Intelligence Dossier
The generated reports follow a strict intelligence community format:

Target Profile: Core identity and operational status.

Digital Footprint: Historical actions and affiliated entities.

Leaks and Controversies: Declassified information and forum-based claims.

Verified Sources: Direct links to primary and secondary evidence.

Legal and Ethical Compliance
This tool is built strictly for OSINT research and educational purposes. Users are responsible for complying with local privacy laws and the terms of service of any platform accessed through the engine.
