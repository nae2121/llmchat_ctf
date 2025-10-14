// js/main.js
window.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chatBox');
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const clearBtn = document.getElementById('clearBtn');        // ない場合は null
    const statusDot = document.getElementById('statusDot');      // ない場合は null
    const statusText = document.getElementById('statusText');    // ない場合は null
    const emptyState = document.getElementById('emptyState');
    const charCount = document.getElementById('charCount');
  
    const LIMIT = 200;
  
    function setStatus(state){
      if (!statusDot || !statusText) return; // ガード
      if (state === 'busy') {
        statusDot.classList.remove('online'); statusDot.classList.add('busy'); statusText.textContent = '送信中…';
      } else {
        statusDot.classList.remove('busy'); statusDot.classList.add('online'); statusText.textContent = '待機中';
      }
    }
  
    function escapeHTML(str){
      return str.replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
    }
  
    function autoScroll(){ chatBox.scrollTop = chatBox.scrollHeight; }
  
    function autoResize(){
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 160) + 'px';
    }
  
    function updateCounter(){
      const len = Array.from(input.value).length; // コードポイント基準
      if (charCount) charCount.textContent = `${len}/${LIMIT}`;
      sendBtn.disabled = len === 0; // 入力ゼロなら送信不可
    }
  
    function enforceLimit(){
      const chars = Array.from(input.value);
      if (chars.length > LIMIT) {
        input.value = chars.slice(0, LIMIT).join('');
      }
      updateCounter();
      autoResize();
    }
  
    function timeStr(){
      const d = new Date();
      return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    }
  
    function addMessage(role, text, opts={}){
      if (emptyState) emptyState.remove();
      const row = document.createElement('div');
      row.className = 'row ' + (role === 'user' ? 'user' : 'ai');
  
      const avatar = document.createElement('div');
      avatar.className = 'avatar ' + (role === 'user' ? 'user' : 'ai');
      avatar.setAttribute('aria-label', role === 'user' ? 'You' : 'AI');
      const img = document.createElement('img');
      img.src = role === 'user' ? 'img/You.png' : 'img/AI.png';  // ← 画像パス
      img.alt = role === 'user' ? 'You' : 'AI';
      img.className = 'avatar-img';
      avatar.appendChild(img);
  
      const msgWrap = document.createElement('div');
      const bubble = document.createElement('div');
      bubble.className = 'bubble ' + (role === 'user' ? 'user' : 'ai');
  
      if (opts.typing) {
        bubble.innerHTML = '<span class="typing" aria-label="入力中"><span class="d"></span><span class="d"></span><span class="d"></span></span>';
      } else {
        bubble.textContent = text;
      }
  
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `<span>${role === 'user' ? 'あなた' : 'Gemini'}</span> · <span>${timeStr()}</span>`;
  
      if (role === 'ai' && !opts.typing) {
        const copy = document.createElement('span');
        copy.className = 'copy';
        copy.textContent = 'コピー';
        copy.addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(text); copy.textContent = 'コピーしました'; setTimeout(()=> copy.textContent='コピー', 1200); } catch (e) {}
        });
        meta.appendChild(copy);
      }
  
      msgWrap.appendChild(bubble);
      msgWrap.appendChild(meta);
  
      if (role === 'user') { row.appendChild(msgWrap); row.appendChild(avatar); }
      else { row.appendChild(avatar); row.appendChild(msgWrap); }
  
      chatBox.appendChild(row);
      autoScroll();
  
      return { row, bubble };
    }
  
    async function sendMessage(){
      const message = input.value.trim();
      if (!message) return;
  
      setStatus('busy');
      sendBtn.disabled = true; input.disabled = true;
  
      addMessage('user', message);
      input.value = '';
      enforceLimit();
  
      const typing = addMessage('ai', '', { typing: true });
  
      try {
        const res = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
  
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
  
        const safe = escapeHTML(String(data.response ?? ''));
        typing.bubble.textContent = safe;
      } catch (err) {
        typing.bubble.textContent = `エラーが発生しました: ${err.message}. しばらくしてから再度お試しください。`;
        typing.bubble.style.borderColor = 'rgba(255,0,0,.35)';
      } finally {
        setStatus('idle');
        sendBtn.disabled = false; input.disabled = false; input.focus();
      }
    }
  
    // events
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    input.addEventListener('input', enforceLimit);
    enforceLimit();
  
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        chatBox.innerHTML = '<div class="empty" id="emptyState">履歴をクリアしました。新しいメッセージを入力してください。</div>';
        input.focus();
      });
    }
  
    // draft restore
    try {
      const DRAFT_KEY = 'gemini-chat-draft';
      input.value = sessionStorage.getItem(DRAFT_KEY) || '';
      enforceLimit();
      input.addEventListener('input', () => { sessionStorage.setItem(DRAFT_KEY, input.value); });
    } catch (_) {}
  });
  