        // State variables with proper JSON parsing and fallbacks
        let currentPage = 1;
        const pageSize = 50;
 
        // Safe JSON parsing with proper fallbacks
        function safeJsonParse(data, fallback) {
            try {
                return data ? JSON.parse(data) : fallback;
            } catch (e) {
                return fallback;
            }
        }
 
        const originalLines = safeJsonParse(localStorage.getItem('originalLines'), []);
        const dialogIndexes = safeJsonParse(localStorage.getItem('dialogIndexes'), []);
        const detectedDialogs = safeJsonParse(localStorage.getItem('detectedDialogs'), []);
        let translatedDialogs = safeJsonParse(localStorage.getItem('translatedDialogs'), []);
        const apiKey = localStorage.getItem('deepseekApiKey') || '';
        const langTarget = localStorage.getItem('targetLang') || 'Bahasa Indonesia';
        const translationModel = localStorage.getItem('translationModel') || 'deepseek';
 
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // Show error if no data found
            if (detectedDialogs.length === 0) {
                document.getElementById('list').innerHTML = `
          <div class="text-center text-red-400 p-4 bg-gray-800 rounded-lg">
            No translation data found!<br>
            Please go back to the main page and process your file first.
          </div>
        `;
                return;
            }
 
            renderModelBadge();
            renderList();
            injectWatermark();
        });
 
        function renderModelBadge() {
            const modelBadge = document.getElementById('model-badge');
            modelBadge.innerHTML = `
        <div class="inline-block text-xs px-3 py-1 rounded-full mb-2 ${
          translationModel === 'deepseek' 
            ? 'bg-blue-900 text-blue-300' 
            : 'bg-amber-900 text-amber-300'
        }">
          Using: ${translationModel.toUpperCase()} ${translationModel === 'libre' ? '(Free)' : '(API)'}
        </div>
      `;
        }
 
        function renderList() {
            let html = '';
            const totalPages = Math.ceil(detectedDialogs.length / pageSize);
            const start = (currentPage - 1) * pageSize;
            const end = Math.min(start + pageSize, detectedDialogs.length);
 
            for (let i = start; i < end; i++) {
                const dialog = detectedDialogs[i] || '';
                const translation = translatedDialogs[i] || '';
                const warn = shouldWarn(translation);
 
                html += `
          <div class="bg-gray-800 rounded-xl p-4 shadow">
            <div class="text-xs text-gray-400 mb-1">Dialog ${i+1} (line ${(dialogIndexes[i]?.index || 0) + 1})</div>
            <div class="mb-2 text-blue-400 break-words"><span class="font-semibold">Original:</span> ${escapeHtml(dialog)}</div>
            <textarea id="trans_${i}" rows="2" class="w-full p-2 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:outline-none focus:ring focus:border-blue-400 transition mb-2">${escapeHtml(translation)}</textarea>
            <div id="warn_${i}" class="text-xs mt-1 text-yellow-400">${warn || ''}</div>
            <div class="flex gap-2 mt-2">
              <button onclick="restore(${i})" class="bg-yellow-600 hover:bg-yellow-700 text-sm rounded px-4 py-1 font-medium transition">Restore</button>
              <button onclick="retranslate(${i})" class="bg-blue-600 hover:bg-blue-700 text-sm rounded px-4 py-1 font-medium transition">Retranslate</button>
            </div>
            <div id="status_${i}" class="text-xs mt-1"></div>
          </div>
        `;
            }
 
            if (detectedDialogs.length > 0) {
                html += `
          <div class="flex justify-center gap-4 mt-4">
            <button onclick="gotoPage(currentPage-1)" ${currentPage==1 ? 'disabled' : ''} class="px-4 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50">Prev</button>
            <span>Page ${currentPage} / ${totalPages}</span>
            <button onclick="gotoPage(currentPage+1)" ${currentPage==totalPages ? 'disabled' : ''} class="px-4 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50">Next</button>
          </div>
        `;
            }
 
            document.getElementById('list').innerHTML = html;
        }
 
        async function retranslate(idx) {
            const dialog = detectedDialogs[idx] || '';
            const statusEl = document.getElementById('status_' + idx);
            const textareaEl = document.getElementById('trans_' + idx);
 
            if (!dialog) {
                statusEl.innerHTML = '<span class="text-red-400">✗ No text to translate</span>';
                return;
            }
 
            statusEl.innerHTML = '<span class="spinner"></span> Translating...';
            textareaEl.value = '...translating...';
            textareaEl.disabled = true;
 
            try {
                let translated;
                if (translationModel === 'deepseek') {
                    if (!apiKey) throw new Error('API Key required for DeepSeek');
                    translated = await translateWithDeepSeek(dialog);
                } else {
                    translated = await translateWithLingva(dialog);
                }
 
                if (!translated) throw new Error('Empty translation result');
 
                textareaEl.value = translated;
                translatedDialogs[idx] = translated;
                localStorage.setItem('translatedDialogs', JSON.stringify(translatedDialogs));
                statusEl.innerHTML = '<span class="text-green-400">✓ Success</span>';
                updateWarning(idx);
            } catch (e) {
                console.error('Translation failed:', e);
                statusEl.innerHTML = '<span class="text-red-400">✗ ' + (e.message || 'Translation failed') + '</span>';
                textareaEl.value = translatedDialogs[idx] || dialog;
            } finally {
                textareaEl.disabled = false;
            }
        }
 
        async function translateWithDeepSeek(text) {
            const prompt = `[REN'PY TRANSLATION]
Translate this to ${langTarget} while preserving all special formats:
- Keep {color=}, [tags], and \\n exactly as-is
- Only translate text outside these markers
- Return JUST the translated text with NO additional comments
 
Text to translate: "${text}"`;
 
            const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [{
                            role: 'system',
                            content: 'You are a precise Ren\'Py translator'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.1,
                    max_tokens: 2000
                })
            });
 
            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error?.message || 'API error');
            }
 
            const data = await res.json();
            const result = data.choices?.[0]?.message?.content;
            return result ? result.replace(/^"+|"+$/g, '').trim() : text;
        }
 
        async function translateWithLingva(text) {
            const langMap = {
                'Bahasa Indonesia': 'id',
                'English': 'en',
                'Malay': 'ms',
                'Vietnamese': 'vi',
                'Filipino': 'tl'
            };
            const targetCode = langMap[langTarget] || 'en';
 
            const endpoints = [
                'https://lingva.lunar.icu',
                'https://lingva.ml',
                'https://translate.plausibility.cloud'
            ];
 
            for (const endpoint of endpoints) {
                try {
                    const res = await fetch(`${endpoint}/api/v1/en/${targetCode}/${encodeURIComponent(text)}`);
                    if (res.ok) {
                        const data = await res.json();
                        return data.translation || text;
                    }
                } catch (e) {
                    console.log(`Endpoint ${endpoint} failed, trying next...`);
                }
            }
            throw new Error('All Lingva endpoints failed');
        }
 
        function gotoPage(page) {
            const totalPages = Math.ceil(detectedDialogs.length / pageSize);
            if (page < 1 || page > totalPages) return;
            currentPage = page;
            renderList();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
 
        function saveEdit(idx) {
            translatedDialogs[idx] = document.getElementById('trans_' + idx).value;
            localStorage.setItem('translatedDialogs', JSON.stringify(translatedDialogs));
        }
 
        function restore(idx) {
            document.getElementById('trans_' + idx).value = detectedDialogs[idx] || '';
            saveEdit(idx);
            updateWarning(idx);
            document.getElementById('status_' + idx).textContent = '';
        }
 
        function shouldWarn(text) {
            if (!text) return '';
            const trimmed = text.trim();
            const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed);
            const isCodeLike = /^[\W\d_]+$/.test(trimmed) || trimmed.length < 3;
            return isHex || isCodeLike ?
                '⚠️ This might be code/color value. Consider restoring.' :
                '';
        }
 
        function updateWarning(idx) {
            const text = document.getElementById('trans_' + idx).value;
            document.getElementById('warn_' + idx).textContent = shouldWarn(text);
        }
 
        function downloadFile() {
            let finalLines = [...originalLines];
            for (let i = 0; i < dialogIndexes.length; i++) {
                const obj = dialogIndexes[i] || {};
                const index = obj.index || 0;
                const pre = obj.pre || '';
                const quote = obj.quote || '"';
                const post = obj.post || '';
 
                const indentation = (originalLines[index] || '').match(/^\s*/)?.[0] || '';
                let val = (translatedDialogs[i] || '').trim();
 
                // Handle escaped quotes properly
                val = val
                    // First preserve existing escaped quotes
                    .replace(/\\"/g, '\uFFFF') // Temporary placeholder
                    // Remove surrounding quotes if they exist
                    .replace(/^["']|["']$/g, '')
                    // Restore escaped quotes
                    .replace(/\uFFFF/g, '\\"')
                    // Escape any unescaped quotes in the content
                    .replace(/([^\\])"/g, '$1\\"');
 
                // Ensure we don't exceed original lines array
                if (index < finalLines.length) {
                    finalLines[index] =
                        indentation +
                        (pre ? pre + ' ' : '') +
                        quote + val + quote +
                        (post ? ' ' + post : '');
                }
            }
 
            const blob = new Blob([finalLines.join('\n')], {
                type: 'text/plain'
            });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'translated_result.rpy';
            a.click();
        }
 
        function escapeHtml(str) {
            if (!str) return '';
            return str
                .replace(/\\"/g, '\uFFFF') // Preserve escaped quotes
                .replace(/[&<>"']/g, function(m) {
                    return {
                        '&': '&',
                        '<': '<',
                        '>': '>',
                        '"': '"',
                        "'": '''
                    } [m];
                })
                .replace(/\uFFFF/g, '\\"'); // Restore escaped quotes
        }
 
        function injectWatermark() {
            const el = document.createElement('div');
            el.className = 'inline-block text-xs opacity-60 text-gray-200 select-none z-50 font-mono px-4 py-1 rounded-xl bg-gray-700/60 shadow';
            el.textContent = '© Translated with Ren\'Py Translator';
            document.getElementById('watermark-place').appendChild(el);
        }