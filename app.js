
  // --- Web Audio API タクタイル音シンセサイザー ---
  let audioCtx = null;
  let isSoundEnabled = localStorage.getItem('tdr_sound_enabled') === 'true';

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, gainVal) {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal || 0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy
    }
  }

  function playCopySound() {
    if (!isSoundEnabled) return;
    playTone(523.25, 'triangle', 0.06, 0.08); // C5
    setTimeout(() => {
      playTone(783.99, 'triangle', 0.12, 0.07); // G5
    }, 50);
  }

  function playClickSound() {
    if (!isSoundEnabled) return;
    playTone(320, 'sine', 0.04, 0.05);
  }

  function setupSoundToggle() {
    const soundBtn = document.getElementById('soundToggleBtn');
    const soundIcon = document.getElementById('soundIcon');
    if (!soundBtn || !soundIcon) return;

    soundIcon.textContent = isSoundEnabled ? '🔊' : '🔇';

    soundBtn.addEventListener('click', function () {
      initAudio();
      isSoundEnabled = !isSoundEnabled;
      localStorage.setItem('tdr_sound_enabled', isSoundEnabled ? 'true' : 'false');
      soundIcon.textContent = isSoundEnabled ? '🔊' : '🔇';
      showToast(isSoundEnabled ? '🔊 効果音: ON' : '🔇 効果音: OFF');
      if (isSoundEnabled) playTone(659.25, 'triangle', 0.1, 0.08);
    });
  }

  // --- 決定版オープニングアニメーション（薄暗い城 → ズーム＆ライトアップ → 採用4Lロゴ出現） ---
  function initSplashScreen() {
    const splash = document.getElementById('splashScreen');
    const stage = document.getElementById('introCastleStage');
    const darkCastle = document.getElementById('introCastleDark');
    const litCastle = document.getElementById('introCastleLit');
    const flare = document.getElementById('introIgniteFlare');
    const logoReveal = document.getElementById('introLogoReveal');
    const officialLogo = document.querySelector('.intro-official-logo');
    const loaderBar = document.getElementById('introLoaderBar');
    const headerLogoBtn = document.getElementById('headerLogoBtn');

    if (!splash) return;

    let splashTimer = null;

    // 初回起動時アニメーション再生
    playSplashAnimation();

    // 画面タップで即スキップ
    splash.addEventListener('click', function () {
      finishSplash();
    });

    // ヘッダーロゴタップ：いつでも再演！
    if (headerLogoBtn) {
      headerLogoBtn.addEventListener('click', function () {
        playSplashAnimation();
      });
    }

    function playSplashAnimation() {
      if (splashTimer) clearTimeout(splashTimer);

      splash.classList.remove('fade-out');
      splash.style.removeProperty('display');
      splash.style.display = 'flex';
      splash.style.pointerEvents = 'auto';
      splash.style.visibility = 'visible';

      // 全アニメーション要素のクリーンリセット＆再トリガー
      const animElements = [
        stage, darkCastle, litCastle, flare, logoReveal, loaderBar
      ];
      animElements.forEach(el => {
        if (el) {
          el.style.animation = 'none';
          void el.offsetWidth; // 強制リフロー
          el.style.animation = '';
        }
      });

            // サウンド演出（効果音ON時）
      if (isSoundEnabled) {
        // 0.8s: 均等速度で滑らかに城に光が満ちるクリスタルチャイム音
        setTimeout(() => {
          playTone(1318.51, 'triangle', 0.40, 0.08); // E6
          playTone(1567.98, 'sine', 0.50, 0.07);     // G6
          playTone(2093.00, 'sine', 0.55, 0.06);     // C7
          playTone(2637.02, 'sine', 0.60, 0.05);     // E7
        }, 800);

        // 1.2s: スーッと一定速度で降りてくる滑らかな下降スウィープ音
        setTimeout(() => {
          playTone(1760.00, 'sine', 0.25, 0.06); // A6
          playTone(1318.51, 'sine', 0.30, 0.06); // E6
          playTone(987.77, 'sine', 0.35, 0.07);  // B5
          playTone(659.25, 'sine', 0.40, 0.08);  // E5
        }, 1200);

        // 2.6s: スーッと静かに100%着席する瞬間の優美なロイヤルゴールド和音
        setTimeout(() => {
          playTone(392.00, 'triangle', 0.65, 0.08);  // G4
          playTone(587.33, 'triangle', 0.70, 0.08);  // D5
          playTone(783.99, 'triangle', 0.75, 0.07);  // G5
          playTone(987.77, 'sine', 0.80, 0.07);      // B5
          playTone(1174.66, 'sine', 0.85, 0.06);     // D6
          playTone(1567.98, 'sine', 0.90, 0.06);     // G6
        }, 2600);
      }

      // 約4.2秒で優雅にフェードアウトしてツール画面へ（タップでいつでも即スキップ可）
      splashTimer = setTimeout(() => {
        finishSplash();
      }, 4200);
    }

    function finishSplash() {
      if (splashTimer) clearTimeout(splashTimer);
      splash.classList.add('fade-out');
      splash.style.setProperty('display', 'none', 'important');
      splash.style.pointerEvents = 'none';
      splash.style.visibility = 'hidden';
      setTimeout(() => {
        splash.style.setProperty('display', 'none', 'important');
      }, 300);
    }
  }

/**
 * TDR 4-Letter Facility Search - Application Engine
 */

(function () {
  'use strict';

  // --- 状態管理 ---
  let allFacilities = (typeof FACILITY_DATABASE !== 'undefined') ? FACILITY_DATABASE : [];
  let currentParkFilter = 'ALL';
  let currentAreaFilter = 'ALL';
  let currentQuery = '';
  let favorites = new Set();
  let searchHistory = [];

  // --- DOM要素 ---
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const facilityListEl = document.getElementById('facilityList');
  const resultSummaryEl = document.getElementById('resultSummary');
  const emptyStateEl = document.getElementById('emptyState');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const areaSelectEl = document.getElementById('areaSelect');
  const quickChipsSection = document.getElementById('quickChipsSection');
  const quickChipsRow = document.getElementById('quickChipsRow');
  const toastEl = document.getElementById('toast');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBodyEl = document.getElementById('modalBody');

  // --- 初期化 ---
  function init() {
    setupSoundToggle();
    loadStoredData();
    setupEventListeners();
    updateTabCounts();
    populateAreaOptions();
    renderQuickChips();
    renderList();

    // 検索窓にフォーカス
    if (window.innerWidth > 768) {
      searchInput.focus();
    }
  }

  // --- LocalStorage 読み込み ---
  function loadStoredData() {
    try {
      const savedFavs = localStorage.getItem('tdr_4letter_favs');
      if (savedFavs) {
        favorites = new Set(JSON.parse(savedFavs));
      }
      const savedHistory = localStorage.getItem('tdr_4letter_history');
      if (savedHistory) {
        searchHistory = JSON.parse(savedHistory);
      }
    } catch (e) {
      console.warn('Storage load error:', e);
    }
  }

  function saveFavorites() {
    try {
      localStorage.setItem('tdr_4letter_favs', JSON.stringify(Array.from(favorites)));
    } catch (e) {}
  }

  function saveHistory() {
    try {
      localStorage.setItem('tdr_4letter_history', JSON.stringify(searchHistory.slice(0, 15)));
    } catch (e) {}
  }

  // --- 文字列の正規化・ひらがな/カタカナ変換 ---
  function kanaToHira(str) {
    if (!str) return '';
    return str.replace(/[\u30a1-\u30f6]/g, function (match) {
      return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });
  }

  function hiraToKana(str) {
    if (!str) return '';
    return str.replace(/[\u3041-\u3096]/g, function (match) {
      return String.fromCharCode(match.charCodeAt(0) + 0x60);
    });
  }

  function normalizeText(text) {
    if (!text) return '';
    return text
      .trim()
      .toUpperCase()
      .replace(/[\uFF01-\uFF5E]/g, function (ch) {
        return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
      })
      .replace(/[\s\u3000\-_/・*]/g, '');
  }

  // --- イベントリスナー設定 ---
  function setupEventListeners() {
    // 検索入力（リアルタイム）
    searchInput.addEventListener('input', function (e) {
      currentQuery = e.target.value.trim();
      searchClearBtn.classList.toggle('visible', currentQuery.length > 0);
      renderList();
    });

    // クリアボタン
    searchClearBtn.addEventListener('click', function () {
      searchInput.value = '';
      currentQuery = '';
      searchClearBtn.classList.remove('visible');
      searchInput.focus();
      renderList();
    });

    // パークタブ切り替え
    tabButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        tabButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentParkFilter = this.getAttribute('data-park');
        currentAreaFilter = 'ALL';
        populateAreaOptions();
        renderList();
      });
    });

    // エリアセレクト
    areaSelectEl.addEventListener('change', function () {
      currentAreaFilter = this.value;
      renderList();
    });

    // モーダル閉じる
    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });

    // 共有モーダル設定
    const shareBtn = document.getElementById('shareBtn');
        const shareModalOverlay = document.getElementById('shareModalOverlay');
    const shareModalCloseBtn = document.getElementById('shareModalCloseBtn');
    const shareCopyUrlBtn = document.getElementById('shareCopyUrlBtn');
    const nativeShareBtn = document.getElementById('nativeShareBtn');

    if (shareBtn) {
      shareBtn.addEventListener('click', openShareModal);
    }
        if (shareModalCloseBtn) {
      shareModalCloseBtn.addEventListener('click', function () {
        shareModalOverlay.classList.remove('open');
      });
    }
    if (shareModalOverlay) {
      shareModalOverlay.addEventListener('click', function (e) {
        if (e.target === shareModalOverlay) {
          shareModalOverlay.classList.remove('open');
        }
      });
    }
    if (shareCopyUrlBtn) {
      shareCopyUrlBtn.addEventListener('click', function () {
        const url = window.location.href;
        copyToClipboard(url, '共有URLをコピーしました！');
      });
    }
    if (nativeShareBtn) {
      nativeShareBtn.addEventListener('click', function () {
        const url = window.location.href;
        if (navigator.share) {
          navigator.share({
            title: 'TDR 4レター施設検索',
            text: '東京ディズニーリゾート 4レター施設コード検索ツール',
            url: url
          }).catch(() => {});
        } else {
          copyToClipboard(url, '共有URLをコピーしました！');
        }
      });
    }

    // ESCキーでモーダル閉じる
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeModal();
        if (shareModalOverlay) shareModalOverlay.classList.remove('open');
      }
    });
  }

  // --- タブ件数更新 ---
  function updateTabCounts() {
    const counts = {
      ALL: allFacilities.length,
      TDL: 0,
      TDS: 0,
      COM: 0,
      TRF: 0,
      FAV: favorites.size
    };

    allFacilities.forEach(f => {
      if (counts[f.park_code] !== undefined) {
        counts[f.park_code]++;
      }
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      const park = btn.getAttribute('data-park');
      const countEl = btn.querySelector('.count');
      if (countEl && counts[park] !== undefined) {
        countEl.textContent = counts[park];
      }
    });
  }

  // --- エリアドロップダウン生成 ---
  function populateAreaOptions() {
    const areas = new Set();
    allFacilities.forEach(f => {
      if (currentParkFilter === 'ALL' || f.park_code === currentParkFilter) {
        if (f.area_name) areas.add(f.area_name);
      }
    });

    const sortedAreas = Array.from(areas).sort();
    let optionsHtml = '<option value="ALL">すべてのエリア</option>';
    sortedAreas.forEach(a => {
      const selected = a === currentAreaFilter ? 'selected' : '';
      optionsHtml += `<option value="${escapeHtml(a)}" ${selected}>${escapeHtml(a)}</option>`;
    });
    areaSelectEl.innerHTML = optionsHtml;
  }

  // --- クイック履歴チップ表示 ---
  function renderQuickChips() {
    if (searchHistory.length === 0) {
      quickChipsSection.classList.remove('visible');
      return;
    }
    quickChipsSection.classList.add('visible');
    quickChipsRow.innerHTML = searchHistory.slice(0, 8).map(item => `
      <div class="quick-chip" data-code="${escapeHtml(item.code)}">
        <span class="code-badge">${escapeHtml(item.code)}</span>
        <span>${escapeHtml(item.name.length > 8 ? item.name.slice(0, 8) + '…' : item.name)}</span>
      </div>
    `).join('');

    quickChipsRow.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', function () {
        const code = this.getAttribute('data-code');
        searchInput.value = code;
        currentQuery = code;
        searchClearBtn.classList.add('visible');
        renderList();
      });
    });
  }

  function addToHistory(fac) {
    searchHistory = searchHistory.filter(h => h.code !== fac.code);
    searchHistory.unshift({ code: fac.code, name: fac.name, park_code: fac.park_code });
    saveHistory();
    renderQuickChips();
  }

  // --- 検索・ソートエンジン ---
  function getFilteredAndSortedFacilities() {
    const qRaw = currentQuery.trim();
    const qNorm = normalizeText(qRaw);
    const qHira = kanaToHira(qRaw.toLowerCase());
    const qKana = hiraToKana(qRaw);

    return allFacilities
      .filter(f => {
        // パークフィルター
        if (currentParkFilter === 'FAV') {
          if (!favorites.has(f.code)) return false;
        } else if (currentParkFilter !== 'ALL' && f.park_code !== currentParkFilter) {
          return false;
        }

        // エリアフィルター
        if (currentAreaFilter !== 'ALL' && f.area_name !== currentAreaFilter) {
          return false;
        }

        // 検索クエリなし
        if (!qRaw) return true;

        // あいまい一致チェック
        const searchBlob = f._search || '';
        if (searchBlob.includes(qRaw.toLowerCase())) return true;
        if (qNorm && searchBlob.includes(qNorm.toLowerCase())) return true;
        if (qHira && searchBlob.includes(qHira)) return true;
        if (qKana && searchBlob.includes(qKana)) return true;

        // 4レター・コンプレックスコード
        if (f.code.toLowerCase().includes(qRaw.toLowerCase())) return true;
        if (f.complex_code.toLowerCase().includes(qRaw.toLowerCase())) return true;

        return false;
      })
      .map(f => {
        // スコアリング（一致度合いによる並び替え）
        let score = 0;
        if (!qRaw) return { item: f, score: 0 };

        const upperQ = qRaw.toUpperCase();
        const codeUpper = f.code.toUpperCase();
        const cpxUpper = f.clean_complex_code.toUpperCase();

        // 1. コード完全一致 (最高得点)
        if (codeUpper === upperQ || cpxUpper === upperQ) {
          score += 1000;
        }
        // 2. コード前方一致
        else if (codeUpper.startsWith(upperQ) || cpxUpper.startsWith(upperQ)) {
          score += 500;
        }
        // 3. 施設名完全一致
        else if (f.name === qRaw) {
          score += 400;
        }
        // 4. 施設名前方一致
        else if (f.name.startsWith(qRaw) || kanaToHira(f.name).startsWith(qHira)) {
          score += 300;
        }
        // 5. コード部分一致
        else if (codeUpper.includes(upperQ) || cpxUpper.includes(upperQ)) {
          score += 200;
        }
        // 6. 施設名部分一致
        else if (f.name.includes(qRaw) || kanaToHira(f.name).includes(qHira) || f.name.includes(qKana)) {
          score += 150;
        }
        // 7. エリア名一致
        else if (f.area_name && f.area_name.includes(qRaw)) {
          score += 50;
        }
        // 8. 部屋名一致
        else if (f.rooms && f.rooms.some(r => r.name.includes(qRaw) || r.code.toUpperCase().includes(upperQ))) {
          score += 80;
        }

        // お気に入りは加点
        if (favorites.has(f.code)) {
          score += 30;
        }

        return { item: f, score: score };
      })
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.item);
  }

  // --- リスト描画 ---
  function renderList() {
    const list = getFilteredAndSortedFacilities();
    const count = list.length;

    // 件数表示
    resultSummaryEl.innerHTML = `該当 <b>${count}</b> 件`;

    if (count === 0) {
      facilityListEl.innerHTML = '';
      emptyStateEl.style.display = 'block';
      return;
    }

    emptyStateEl.style.display = 'none';

    // パフォーマンスのため最初の100件を表示
    const displayList = list.slice(0, 100);
    const q = currentQuery.trim();

    facilityListEl.innerHTML = displayList.map(fac => {
      const isFav = favorites.has(fac.code);
      const highlightedCode = highlightMatch(fac.code, q);
      const highlightedName = highlightMatch(fac.name, q);
      const parkClass = (fac.park_code || 'TDL').toLowerCase();

      return `
        <div class="facility-card ${fac.park_code ? fac.park_code.toLowerCase() : 'tdl'}-card" data-id="${fac.id}">
          <div class="card-top-row">
            <div class="card-code-group">
              <span class="code-pill ${parkClass}" data-copy="${escapeHtml(fac.code)}" title="タップで4レターをコピー">
                <span class="code-text">${highlightedCode}</span>
                <span class="copy-icon-hint">📋</span>
              </span>
              <span class="park-badge ${fac.park_code}">${fac.park_code}</span>
            </div>
            <div class="card-actions">
              <button class="card-btn copy-all-btn" data-full-copy="${escapeHtml(fac.code)} ${escapeHtml(fac.name)}" title="コードと施設名をコピー">
                📋 コピー
              </button>
              <button class="fav-star-btn ${isFav ? 'active' : ''}" data-fav-code="${escapeHtml(fac.code)}" title="お気に入り登録">
                ${isFav ? '★' : '☆'}
              </button>
            </div>
          </div>
          
          <div class="card-facility-name">${highlightedName}</div>
          ${fac.name_en ? `<div class="card-facility-subname">${escapeHtml(fac.name_en)}</div>` : ''}

          <div class="card-meta-row">
            <div class="meta-area">
              <span>📍 ${escapeHtml(fac.area_name || fac.park_name)}</span>
            </div>
            ${fac.rooms_count > 0 ? `
              <div class="meta-rooms">
                <span>🚪 部屋/系統: <b>${fac.rooms_count}</b></span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // カード内イベント付与
    attachCardEvents();
  }

  // --- カード内イベントのバインド ---
  function attachCardEvents() {
    // 4レター直接コピー
    facilityListEl.querySelectorAll('.code-pill').forEach(pill => {
      pill.addEventListener('click', function (e) {
        e.stopPropagation();
        const code = this.getAttribute('data-copy');
        copyToClipboard(code, `4レター「${code}」をコピーしました！`);
      });
    });

    // 全文コピーボタン
    facilityListEl.querySelectorAll('.copy-all-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const text = this.getAttribute('data-full-copy');
        copyToClipboard(text, `「${text}」をコピーしました！`);
      });
    });

    // お気に入りボタン
    facilityListEl.querySelectorAll('.fav-star-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const code = this.getAttribute('data-fav-code');
        toggleFavorite(code);
        this.classList.toggle('active', favorites.has(code));
        this.textContent = favorites.has(code) ? '★' : '☆';
        updateTabCounts();
      });
    });

    // カード全体タップで詳細モーダル
    facilityListEl.querySelectorAll('.facility-card').forEach(card => {
      card.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        const fac = allFacilities.find(f => f.id === id);
        if (fac) {
          addToHistory(fac);
          showDetailModal(fac);
        }
      });
    });
  }

  // --- お気に入り切替 ---
  function toggleFavorite(code) {
    if (favorites.has(code)) {
      favorites.delete(code);
      showToast(`「${code}」をお気に入りから解除しました`);
    } else {
      favorites.add(code);
      showToast(`「${code}」をお気に入りに追加しました ★`);
    }
    saveFavorites();
    updateTabCounts();
    if (currentParkFilter === 'FAV') {
      renderList();
    }
  }

  // --- クリップボードコピー ---
  function copyToClipboard(text, message) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(message);
      }).catch(() => fallbackCopy(text, message));
    } else {
      fallbackCopy(text, message);
    }
  }

  function fallbackCopy(text, message) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(message);
    } catch (e) {
      showToast('コピーに失敗しました');
    }
    document.body.removeChild(textArea);
  }

  // --- トースト通知 ---
  let toastTimer = null;
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('visible');
    }, 2200);
  }

  // --- 詳細モーダル表示 ---
  function showDetailModal(fac) {
    const parkClass = (fac.park_code || 'TDL').toLowerCase();
    const isFav = favorites.has(fac.code);

    let roomsHtml = '';
    if (fac.rooms && fac.rooms.length > 0) {
      roomsHtml = `
        <div>
          <div class="detail-section-title">🚪 所属部屋・系統 (${fac.rooms.length}室)</div>
          <div class="room-list-box">
            ${fac.rooms.map(rm => `
              <div class="room-item">
                <div>
                  <div class="room-item-code">${escapeHtml(rm.code)}</div>
                  <div class="room-item-name">${escapeHtml(rm.name)}</div>
                </div>
                <button class="card-btn" onclick="window.tdrCopyRoom('${escapeHtml(rm.code)}')">
                  📋
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    modalBodyEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="code-pill ${parkClass}" style="font-size:1.6rem; padding:4px 14px;">
            ${escapeHtml(fac.code)}
          </span>
          <span class="park-badge ${fac.park_code}">${fac.park_name}</span>
        </div>
        <button class="card-btn" onclick="window.tdrCopyCode('${escapeHtml(fac.code)}')" style="padding:8px 14px; font-size:0.9rem;">
          📋 4レターをコピー
        </button>
      </div>

      <div style="font-size:1.25rem; font-weight:800; color:#fff; line-height:1.3;">
        ${escapeHtml(fac.name)}
      </div>
      ${fac.name_en ? `<div style="font-size:0.88rem; color:#94a3b8; margin-top:-4px;">${escapeHtml(fac.name_en)}</div>` : ''}

      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">親コンプレックス</div>
          <div class="detail-value">${escapeHtml(fac.complex_name || fac.complex_code || '-')}</div>
          <div style="font-size:0.75rem; color:#38bdf8; font-family:monospace; margin-top:2px;">
            ${escapeHtml(fac.complex_code || '')}
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">所属エリア</div>
          <div class="detail-value">${escapeHtml(fac.area_name || '-')}</div>
          <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">
            ${escapeHtml(fac.area_code || '')}
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">稼働状態</div>
          <div class="detail-value" style="color: ${fac.status === 'アクティブ' ? '#34d399' : '#f87171'};">
            ● ${escapeHtml(fac.status || 'アクティブ')}
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">登録システム</div>
          <div class="system-badges-row" style="margin-top:4px;">
            <span class="system-badge ${fac.systems.maximo ? 'active' : ''}">Maximo</span>
            <span class="system-badge ${fac.systems.ifp ? 'active' : ''}">IFP</span>
            <span class="system-badge ${fac.systems.zumen ? 'active' : ''}">図面</span>
            <span class="system-badge ${fac.systems.tosho ? 'active' : ''}">図書</span>
          </div>
        </div>
      </div>

      ${roomsHtml}

      <div style="display:flex; gap:10px; margin-top:4px;">
        <button class="card-btn" style="flex:1; justify-content:center; padding:12px; font-size:0.95rem; background:#0284c7; color:#fff;"
          onclick="window.tdrCopyFull('${escapeHtml(fac.code)} ${escapeHtml(fac.name)}')">
          📋 「${escapeHtml(fac.code)} ${escapeHtml(fac.name)}」をコピー
        </button>
      </div>
    `;

    modalOverlay.classList.add('open');
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
  }

  // --- 共有QRコードモーダル表示 ---
  let shareQrInstance = null;
  function openShareModal() {
    const currentUrl = window.location.href;
    const shareModalOverlay = document.getElementById('shareModalOverlay');
    const shareUrlDisplay = document.getElementById('shareUrlDisplay');
    const container = document.getElementById('shareQrContainer');

    if (shareUrlDisplay) {
      shareUrlDisplay.textContent = currentUrl;
    }

    if (container && typeof QRCode !== 'undefined') {
      container.innerHTML = '';
      shareQrInstance = new QRCode(container, {
        text: currentUrl,
        width: 210,
        height: 210,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }

    if (shareModalOverlay) {
      shareModalOverlay.classList.add('open');
    }
  }


  // --- 関係者認証（合言葉）設定 ---
  // 初期合言葉: tdr4l (小文字/大文字OK)
  const AUTH_HASH = '8eb7c734d390d4a320701b9e37209ca7ac68ab8ae65203c6dbd23b1e650bc5c2';
  const AUTH_STORAGE_KEY = 'tdr_4letter_auth_v2';
  let isAppInitialized = false;

  async function sha256Hex(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function checkAuthentication() {
    const authOverlay = document.getElementById('authOverlay');
    const authForm = document.getElementById('authForm');
    const authInput = document.getElementById('authInput');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authErrorMsg = document.getElementById('authErrorMsg');
    const authToggleBtn = document.getElementById('authToggleVisibilityBtn');

    if (!authOverlay) {
      if (!isAppInitialized) { isAppInitialized = true; init(); }
      return;
    }

    // 既に認証済みかチェック
    const savedHash = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedHash === AUTH_HASH) {
      authOverlay.classList.add('hidden');
      if (!isAppInitialized) {
        isAppInitialized = true;
        init();
      }
      return;
    }

    // 未認証の場合はオーバーレイを表示
    authOverlay.classList.remove('hidden');

    // 表示切り替えボタン
    if (authToggleBtn && authInput) {
      authToggleBtn.addEventListener('click', function () {
        if (authInput.type === 'password') {
          authInput.type = 'text';
          authToggleBtn.textContent = '🙈';
        } else {
          authInput.type = 'password';
          authToggleBtn.textContent = '👁️';
        }
      });
    }

    // 認証送信処理
    async function handleAuthSubmit() {
      if (!authInput) return;
      const val = (authInput.value || '').trim().toLowerCase();
      if (!val) {
        if (authErrorMsg) authErrorMsg.textContent = '合言葉を入力してください';
        return;
      }

      if (authSubmitBtn) authSubmitBtn.disabled = true;
      if (authErrorMsg) authErrorMsg.textContent = '照合中…';

      try {
        const hash = await sha256Hex(val);
        if (hash === AUTH_HASH) {
          // 認証成功！端末に永続保存
          localStorage.setItem(AUTH_STORAGE_KEY, AUTH_HASH);
          if (authErrorMsg) authErrorMsg.textContent = '';
          authOverlay.classList.add('hidden');
          showToast('🔒 認証しました。次回以降は入力を省略します');
          if (!isAppInitialized) {
            isAppInitialized = true;
            init();
          }
        } else {
          if (authErrorMsg) authErrorMsg.textContent = '合言葉が正しくありません';
          authInput.select();
        }
      } catch (err) {
        console.error('Auth error:', err);
        if (authErrorMsg) authErrorMsg.textContent = '認証エラーが発生しました';
      } finally {
        if (authSubmitBtn) authSubmitBtn.disabled = false;
      }
    }

    if (authForm) {
      authForm.addEventListener('submit', function (e) {
        e.preventDefault();
        handleAuthSubmit();
      });
    }
    if (authSubmitBtn) {
      authSubmitBtn.addEventListener('click', handleAuthSubmit);
    }
  }

  // アプリ再ロック用グローバル関数（テスト用・端末貸出用）
  window.tdrLockApp = function () {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    location.reload();
  };

  // グローバル用コールバック
  window.tdrCopyCode = function (code) {
    copyToClipboard(code, `4レター「${code}」をコピーしました！`);
  };
  window.tdrCopyFull = function (fullText) {
    copyToClipboard(fullText, `「${fullText}」をコピーしました！`);
  };
  window.tdrCopyRoom = function (roomCode) {
    copyToClipboard(roomCode, `部屋コード「${roomCode}」をコピーしました！`);
  };

  // --- ヘルパー関数 ---
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function highlightMatch(text, query) {
    if (!text || !query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeHtml(query);
    const regex = new RegExp(`(${escapeRegExp(escapedQuery)})`, 'gi');
    return escapedText.replace(regex, '<mark class="hl">$1</mark>');
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 起動実行
  document.addEventListener('DOMContentLoaded', () => {
    initSplashScreen();
    checkAuthentication();
  });
})();
