import express from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// 1. Agents with zero temperature for deterministic analysis
const hakemModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash", 
  temperature: 0.0, 
});

const dedektifModel = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0.0, 
});

// 2. Tavily search for OSINT data across web and forums
async function tavilyAramaYap(query) {
    try {
        console.log(`🕵️‍♂️ OSINT Araması Başlatıldı Hedef: "${query}"...`);
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: process.env.TAVILY_API_KEY,
                query: query,
                search_depth: "advanced", 
                max_results: 10, 
                include_answer: true 
            })
        });
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) return "SİSTEM BİLGİSİ: Derin ağda veya forumlarda bu hedefle ilgili hiçbir kayıt/sızıntı bulunamadı.";
        
        return data.results.map((r, i) => `[Kaynak ${i+1}] Başlık: ${r.title}\nÖzet: ${r.content.substring(0, 800)}\nLink: ${r.url}\n---`).join("\n");
    } catch (error) {
        throw new Error("Arama yapılamadı");
    }
}

// 3. Core analysis function with two agents: detective and referee
async function haberAnaliziYap(aranacakHaber) {
  let aramaSonucu = "";
  try {
    aramaSonucu = await tavilyAramaYap(aranacakHaber);
  } catch (error) {
    return "### ❌ İstihbarat Ağı Hatası\nTavily API'sine bağlanılamadı. Kotalar dolmuş olabilir.";
  }

  // Detective prompt: focuses on leaks, forums, Reddit
  const dedektifPrompt = PromptTemplate.fromTemplate(`
    Sen dünyanın en tehlikeli ve soğukkanlı siber istihbarat (OSINT) analistisin.
    Sadece resmi haber ajanslarını değil; Reddit, 4chan, X (Twitter) ve yerel forumlardaki sızıntıları, görgü tanığı ifadelerini ve tartışmaları da analiz etmektir.
    
    KRİTİK GÖREVLERİN: 
    1. Senin tek hedefin şudur: "{hedef}". Bu hedeften ASLA sapma.
    2. Reddit veya diğer forumlarda anonim hesapların yazdığı iddiaları (eğer mantıklıysa ve diğer verilerle uyuşuyorsa) sızıntı/istihbarat olarak değerlendir. Ancak bariz trolleri ve manipülasyonları hemen ifşa et.
    3. Veriler arasında isim benzerliği olan alakasız kişileri, şirketleri veya olayları SAKIN zorla birbirine bağlama! 
    4. İddiaları [Link] vererek destekle. Eğer hiçbir şey yoksa dürüstçe "Derin ağda ve forumlarda kayıt bulunamadı" de.

    Araştırılan Hedef Konu: {hedef}
    İstihbarat Verileri: {veri}
    
    Derin Analiz ve Tespit Edilen Çelişkiler:
  `);
  const dedektifChain = dedektifPrompt.pipe(dedektifModel);
  const dedektifRaporu = await dedektifChain.invoke({ veri: aramaSonucu, hedef: aranacakHaber });

  // Referee prompt: validates, filters, and formats final report
  const hakemPrompt = PromptTemplate.fromTemplate(`
    Sen nihai Hakem ve Baş İstihbarat Şefisin. Araştırılan asıl konu: "{hedef}".
    Dedektiften gelen şu analiz raporunu oku:
    
    Dedektif Raporu: {rapor}
    
    Lütfen şu formatta Markdown dilini kullanarak şık bir istihbarat raporu sun:

    ### 📌 KESİNLEŞMİŞ GERÇEK VE SIRLAR
    (Sadece "{hedef}" ile ilgili olayları, sızdırılmış forum/Reddit verilerini veya net gerçekleri açıkla. Alakasız saçmalıkları filtrele.)

    ### 🔗 KANITLANMIŞ KAYNAKLAR
    (Gerçeği, Reddit sızıntılarını veya iddiaları destekleyen linkler)

    ### 🚨 TESPİT EDİLEN DEZENFORMASYON VEYA EFSANE
    (Hedefle ilgili forumlarda yayılan yalanlar, troller, örtbas girişimleri veya komplo teorileri)

    ### 🎯 GÜVEN SKORU
    (% üzerinden. Resmi makamlar + Reddit/Forum sızıntıları birbirini tutuyorsa skoru yüksek ver.)
  `);
  const hakemChain = hakemPrompt.pipe(hakemModel);
  const finalKarar = await hakemChain.invoke({ rapor: dedektifRaporu.content, hedef: aranacakHaber });
  
  return finalKarar.content;
}

// 4. Web server with frontend interface
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NewsAgent-AI | Derin İstihbarat Ağı</title>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #050505; color: #c9d1d9; padding: 20px; display: flex; flex-direction: column; align-items: center; }
            .container { max-width: 900px; width: 100%; }
            h1 { color: #ff3333; text-align: center; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 10px rgba(255, 51, 51, 0.3); }
            .subtitle { text-align: center; color: #6e7681; margin-bottom: 20px; font-weight: bold; }
            .input-box { width: 100%; padding: 15px; border-radius: 4px; border: 1px solid #30363d; background: #0d1117; color: #58a6ff; font-size: 16px; margin-bottom: 15px; font-family: 'Courier New', Courier, monospace; }
            .input-box:focus { outline: none; border-color: #ff3333; box-shadow: 0 0 8px rgba(255,51,51,0.2); }
            button { width: 100%; padding: 15px; background: #8a0e1b; color: white; border: none; border-radius: 4px; font-size: 18px; cursor: pointer; transition: 0.3s; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
            button:hover { background: #b31222; box-shadow: 0 0 15px rgba(179, 18, 34, 0.4); }
            button:disabled { background: #30363d; cursor: not-allowed; box-shadow: none; }
            .result-box { margin-top: 20px; padding: 25px; border-radius: 4px; background: #0d1117; border: 1px solid #30363d; display: none; line-height: 1.6; border-left: 5px solid #ff3333; box-shadow: inset 0 0 20px rgba(0,0,0,0.5); }
            .result-box h3 { color: #ff5e5e; margin-top: 25px; border-bottom: 1px solid #30363d; padding-bottom: 5px; }
            .result-box a { color: #58a6ff; text-decoration: none; word-break: break-all; }
            .result-box a:hover { text-decoration: underline; color: #79c0ff; }
            .spinner { display: none; margin: 20px auto; width: 40px; height: 40px; border: 4px solid rgba(255,51,51,0.1); border-top: 4px solid #ff3333; border-radius: 50%; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .status-text { text-align: center; color: #ff5e5e; margin-top: 10px; font-style: italic; display: none; font-family: 'Courier New', Courier, monospace; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>👁️ VeriKalkanı: OSINT Ağı</h1>
            <p class="subtitle">Haber Ağları • Reddit & Forum Sızıntıları • Kesin Doğrulama</p>
            
            <textarea id="newsInput" class="input-box" rows="4" placeholder="Sızdırılacak veya doğrulanacak hedef bilgiyi girin..."></textarea>
            <button id="analyzeBtn" onclick="startAnalysis()">SİBER İSTİHBARAT TARAMASINI BAŞLAT</button>
            
            <div class="spinner" id="loadingSpinner"></div>
            <div class="status-text" id="statusText">Ajanlar hedefe kilitlendi, Reddit ve derin ağ taranıyor...</div>
            
            <div class="result-box" id="resultBox"></div>
        </div>

        <script>
            async function startAnalysis() {
                const input = document.getElementById('newsInput').value;
                if (!input.trim()) return alert("Lütfen bir hedef veya iddia girin!");

                document.getElementById('analyzeBtn').disabled = true;
                document.getElementById('loadingSpinner').style.display = 'block';
                document.getElementById('statusText').style.display = 'block';
                document.getElementById('resultBox').style.display = 'none';

                try {
                    const response = await fetch('/api/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: input })
                    });
                    
                    const data = await response.json();
                    
                    document.getElementById('resultBox').innerHTML = marked.parse(data.result);
                    document.getElementById('resultBox').style.display = 'block';
                } catch (error) {
                    document.getElementById('resultBox').innerHTML = "<p style='color:#ff7b72;'>❌ Analiz sırasında kritik bir siber ağ hatası oluştu.</p>";
                    document.getElementById('resultBox').style.display = 'block';
                } finally {
                    document.getElementById('analyzeBtn').disabled = false;
                    document.getElementById('loadingSpinner').style.display = 'none';
                    document.getElementById('statusText').style.display = 'none';
                }
            }
        </script>
    </body>
    </html>
  `);
});

app.post("/api/analyze", async (req, res) => {
  try {
      const query = req.body.query;
      const result = await haberAnaliziYap(query);
      res.json({ result: result });
  } catch (error) {
      console.error("Arka Plan Çökme Hatası:", error);
      res.json({ result: `### ❌ Sistem Aşırı Yüklendi\nAPI kotalarımız dolmuş veya yapay zeka sunucuları anlık olarak yanıt vermiyor olabilir.\n\n**Arka Plan Hatası:** ${error.message}` });
  }
});

app.listen(3000, () => {
  console.log("\\n🦅 DERİN İSTİHBARAT AĞI HEDEFE KİLİTLENDİ! Tarayıcında şu adresi aç: http://localhost:3000\\n");
});