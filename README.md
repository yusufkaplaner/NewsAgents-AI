DataShield OSINT Engine
DataShield is a high-performance, multi-agent Open Source Intelligence (OSINT) engine designed for deep entity profiling and automated digital footprint analysis. By leveraging the analytical power of Llama 3.1 (via Groq) and the synthesis capabilities of Gemini 2.5 Flash, it automates the process of gathering and verifying information across global and local networks.

Features
Global Intelligence Reach: Automatically translates queries to English to scan international sources (Reddit, forums, global news) while maintaining local context.

Dual-Agent Verification: Uses a "Detective" agent for raw data extraction and an "Arbiter" agent for final synthesis and truth verification.

Deep OSINT Search: Powered by Tavily's advanced search depth to find information beyond surface-level Google results.

Zero-Hallucination Policy: Strict temperature controls and system prompts ensure that the engine only reports verified data.

Professional Dossier Output: Generates structured intelligence reports including target identity, digital footprints, and potential leaks.

Tech Stack
Runtime: Node.js

AI Framework: LangChain

Models: Llama 3.1 8B (Groq), Gemini 2.5 Flash (Google)

Search Engine: Tavily OSINT API

Backend: Express.js

Getting Started
1. Prerequisites
Node.js (v18 or higher)

A Tavily API Key

A Groq API Key

A Google AI (Gemini) API Key

2. Installation
Bash
git clone https://github.com/yourusername/datashield-osint.git
cd datashield-osint
npm install
3. Environment Setup
Create a .env file in the root directory:

Kod snippet'i
GOOGLE_API_KEY=your_google_key
GROQ_API_KEY=your_groq_key
TAVILY_API_KEY=your_tavily_key
4. Run the Engine
Bash
node index.js
Access the interface at http://localhost:3000.

Disclaimer
This tool is intended for OSINT (Open Source Intelligence) purposes only. It only accesses publicly available data and must not be used for unauthorized surveillance or illegal activities.