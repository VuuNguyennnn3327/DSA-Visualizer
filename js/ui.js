/**
 * DSA Visualizer - UI Controller (js/ui.js)
 * Điều phối giao diện người dùng: sidebar thu gọn/mở rộng, tiêu đề, mô tả,
 * form cấu hình mảng, modal tổng quan, modal xem mã nguồn (C++, Java, Python, JS).
 */

import { algorithms, algorithmsByGroup, GROUP_ORDER, algorithmUseCases } from './algorithms/index.js';
import { codeSnippets } from './code-snippets.js';
import { state } from './state.js';
import { player } from './player.js';
import { parseArrayInput } from './utils.js';
import { soundFX } from './audio.js';
import { exportTraceToPDF } from './export-trace.js';

export class UIController {
  constructor(renderer) {
    this.renderer = renderer;
    this.selectedLanguage = 'cpp'; // Mặc định hiển thị code C++

    // DOM Elements
    this.appBody = document.getElementById('app-body');
    this.sidebarContainer = document.getElementById('sidebar-groups');
    this.btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    this.btnCollapseSidebar = document.getElementById('btn-collapse-sidebar');

    this.algoTitle = document.getElementById('algo-title');
    this.algoGroupBadge = document.getElementById('algo-group-badge');
    this.complexityWorst = document.getElementById('complexity-worst');
    this.complexityBest = document.getElementById('complexity-best');
    this.complexitySpace = document.getElementById('complexity-space');
    this.complexityStable = document.getElementById('complexity-stable');
    this.algoDesc = document.getElementById('algo-description');
    this.algoAnalogy = document.getElementById('algo-analogy');

    // Controls
    this.btnPlay = document.getElementById('btn-play');
    this.btnPrev = document.getElementById('btn-prev');
    this.btnNext = document.getElementById('btn-next');
    this.btnFirst = document.getElementById('btn-first');
    this.btnLast = document.getElementById('btn-last');
    this.stepSlider = document.getElementById('step-slider');
    this.speedSlider = document.getElementById('speed-slider');
    this.speedValueLabel = document.getElementById('speed-val-label');

    // Array Config Form
    this.arraySizeInput = document.getElementById('array-size-input');
    this.arraySizeLabel = document.getElementById('array-size-label');
    this.btnRandomArray = document.getElementById('btn-random-array');
    this.customArrayInput = document.getElementById('custom-array-input');
    this.btnApplyCustom = document.getElementById('btn-apply-custom');
    this.inputFeedback = document.getElementById('input-feedback');
    this.inputRuleHint = document.getElementById('input-rule-hint');

    // Search target controls
    this.searchTargetGroup = document.getElementById('search-target-group');
    this.searchTargetInput = document.getElementById('search-target-input');
    this.btnApplyTarget = document.getElementById('btn-apply-target');

    // Modal Tuỳ Chọn & Khởi Tạo Mảng
    this.btnConfigArray = document.getElementById('btn-config-array');
    this.arrayModalBackdrop = document.getElementById('array-modal-backdrop');
    this.btnCloseArrayModal = document.getElementById('btn-close-array-modal');
    this.btnFinishArrayModal = document.getElementById('btn-finish-array-modal');

    // Modal Overview
    this.btnOverview = document.getElementById('btn-overview');
    this.btnSidebarOverview = document.getElementById('btn-sidebar-overview');
    this.overviewModalBackdrop = document.getElementById('overview-modal-backdrop');
    this.btnCloseOverview = document.getElementById('btn-close-overview');
    this.overviewTableBody = document.getElementById('overview-table-body');

    // Modal Xem Mã Nguồn (C++, Java, Python, JS)
    this.btnViewCode = document.getElementById('btn-view-code');
    this.codeModalBackdrop = document.getElementById('code-modal-backdrop');
    this.codeModalTitle = document.getElementById('code-modal-title');
    this.codeModalContent = document.getElementById('code-modal-content');
    this.btnCloseCodeModal = document.getElementById('btn-close-code-modal');
    this.btnCopyCode = document.getElementById('btn-copy-code');
    this.langTabs = document.querySelectorAll('.lang-tab');

    // Header Algorithm Name Pill
    this.headerAlgoName = document.getElementById('header-algo-name');

    // Canvas Corner Algorithm Title
    this.canvasAlgoTitle = document.getElementById('canvas-algo-title');

    // Section Xem Chi Tiết Thuật Toán (dưới cùng)
    this.btnToggleAlgoDetail = document.getElementById('btn-toggle-algo-detail');
    this.algoDetailDropdown = document.getElementById('algo-detail-dropdown');
    this.btnToggleDetailText = document.getElementById('btn-toggle-detail-text');
    this.detailChevron = document.getElementById('detail-chevron');

    // Theme Toggle
    this.btnThemeToggle = document.getElementById('btn-theme-toggle');

    // Chế độ tương tác & Nút làm lại mảng
    this.modeSwitchGroup = document.getElementById('mode-switch-group');
    this.btnModeSetup = document.getElementById('btn-mode-setup');
    this.btnModePractice = document.getElementById('btn-mode-practice');
    this.btnRestartPractice = document.getElementById('btn-restart-practice');

    // Nút phóng to / thu nhỏ ở góc dưới bên phải bảng phần tử
    this.visualizerWrapper = document.querySelector('.visualizer-wrapper');
    this.btnFullscreenToggle = document.getElementById('btn-fullscreen-toggle');

    // Nút bật/tắt âm thanh & Xuất Markdown bảng chạy tay
    this.btnToggleSound = document.getElementById('btn-toggle-sound');
    this.btnExportTrace = document.getElementById('btn-export-trace');

    // Modal Chúc mừng Hoàn thành Thực hành (Gamification)
    this.victoryModalBackdrop = document.getElementById('victory-modal-backdrop');
    this.btnCloseVictory = document.getElementById('btn-close-victory');
    this.btnVictoryRestart = document.getElementById('btn-victory-restart');
    this.victoryAlgoName = document.getElementById('victory-algo-name');
    this.victoryStatTime = document.getElementById('victory-stat-time');
    this.victoryStatAccuracy = document.getElementById('victory-stat-accuracy');
    this.victoryStatCorrect = document.getElementById('victory-stat-correct');
    this.victoryStatWrong = document.getElementById('victory-stat-wrong');

    this.bindEvents();
    this.updateSoundButton(soundFX.isMuted);
    this.renderSidebar();
    this.renderOverviewTable();
  }

  /**
   * Đăng ký toàn bộ sự kiện giao diện
   */
  bindEvents() {
    // 1. Thu gọn / Mở rộng Sidebar (Thụt thò)
    this.btnToggleSidebar?.addEventListener('click', () => this.toggleSidebar());
    this.btnCollapseSidebar?.addEventListener('click', () => this.collapseSidebar());

    // 2. Playback Controls
    this.btnPlay?.addEventListener('click', () => player.togglePlay());
    this.btnPrev?.addEventListener('click', () => player.stepBackward());
    this.btnNext?.addEventListener('click', () => player.stepForward());
    this.btnFirst?.addEventListener('click', () => player.goToFirst());
    this.btnLast?.addEventListener('click', () => player.goToLast());

    // Step Slider
    this.stepSlider?.addEventListener('input', (e) => {
      const stepIdx = parseInt(e.target.value, 10);
      player.goToStep(stepIdx);
    });

    // Speed Slider
    this.speedSlider?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      const speedMs = Math.round(1500 - (val - 1) * 140);
      player.setSpeed(speedMs);
      if (this.speedValueLabel) {
        this.speedValueLabel.textContent = `${(val * 0.25 + 0.5).toFixed(1)}x`;
      }
    });

    // Array Size Range
    this.arraySizeInput?.addEventListener('input', (e) => {
      const size = parseInt(e.target.value, 10);
      if (this.arraySizeLabel) this.arraySizeLabel.textContent = size;
      state.setArraySize(size);
    });

    // Random Array Button
    this.btnRandomArray?.addEventListener('click', () => {
      this.clearFeedback();
      state.generateRandomArray();
      this.showFeedback('🎲 Đã tạo mảng ngẫu nhiên mới thành công!', false);
    });

    // Custom Array Input
    this.btnApplyCustom?.addEventListener('click', () => this.handleCustomArraySubmit());
    this.customArrayInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleCustomArraySubmit();
      }
    });

    // Search Target Input
    this.btnApplyTarget?.addEventListener('click', () => this.handleTargetSubmit());
    this.searchTargetInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleTargetSubmit();
      }
    });

    // Modal Tuỳ Chọn & Khởi Tạo Mảng
    this.btnConfigArray?.addEventListener('click', () => this.openArrayModal());
    this.btnCloseArrayModal?.addEventListener('click', () => this.closeArrayModal());
    this.btnFinishArrayModal?.addEventListener('click', () => this.closeArrayModal());
    this.arrayModalBackdrop?.addEventListener('click', (e) => {
      if (e.target === this.arrayModalBackdrop) {
        this.closeArrayModal();
      }
    });

    // Modal Overview
    this.btnOverview?.addEventListener('click', () => this.openOverviewModal());
    this.btnSidebarOverview?.addEventListener('click', () => this.openOverviewModal());
    this.btnCloseOverview?.addEventListener('click', () => this.closeOverviewModal());
    this.overviewModalBackdrop?.addEventListener('click', (e) => {
      if (e.target === this.overviewModalBackdrop) {
        this.closeOverviewModal();
      }
    });

    // Modal Xem Mã Nguồn (C++, Java, Python, JS)
    this.btnViewCode?.addEventListener('click', () => this.openCodeModal());
    this.btnCloseCodeModal?.addEventListener('click', () => this.closeCodeModal());
    this.codeModalBackdrop?.addEventListener('click', (e) => {
      if (e.target === this.codeModalBackdrop) {
        this.closeCodeModal();
      }
    });

    // Tabs chọn ngôn ngữ
    this.langTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.langTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.selectedLanguage = tab.dataset.lang;
        this.updateCodeModalSnippet();
      });
    });

    // Nút Sao chép code
    this.btnCopyCode?.addEventListener('click', () => this.copyCodeSnippet());

    // Theme Toggle
    this.btnThemeToggle?.addEventListener('click', () => this.toggleTheme());

    // Chế độ tương tác & Nút làm lại mảng
    this.btnModeSetup?.addEventListener('click', () => this.setMode('setup'));
    this.btnModePractice?.addEventListener('click', () => this.setMode('practice'));
    this.btnRestartPractice?.addEventListener('click', () => this.restartPractice());

    // Toggle Xem chi tiết mô tả thuật toán ở dưới cùng
    this.btnToggleAlgoDetail?.addEventListener('click', () => this.toggleAlgoDetail());

    // Nút phóng to / thu nhỏ ở góc dưới bên phải bảng phần tử
    this.btnFullscreenToggle?.addEventListener('click', () => this.toggleVisualizerFullscreen());

    // Sự kiện toàn màn hình của trình duyệt (Browser Fullscreen Event)
    document.addEventListener('fullscreenchange', () => {
      const isFs = !!document.fullscreenElement;
      if (this.visualizerWrapper) {
        if (isFs) {
          this.visualizerWrapper.classList.add('is-fullscreen');
        } else {
          this.visualizerWrapper.classList.remove('is-fullscreen');
        }
      }
      this.updateFullscreenIcon(isFs);
    });

    // Thoát phóng to khi nhấn phím Escape (cho trường hợp CSS overlay)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.visualizerWrapper?.classList.contains('is-fullscreen')) {
        this.exitVisualizerFullscreen();
      }
    });

    // 8. Bật / Tắt âm thanh tổng hợp
    this.btnToggleSound?.addEventListener('click', () => {
      const isMuted = soundFX.toggleMute();
      this.updateSoundButton(isMuted);
    });

    // 9. Xuất bảng chạy tay ra định dạng PDF chuẩn A4
    this.btnExportTrace?.addEventListener('click', () => {
      const algo = state.getCurrentAlgorithm();
      const success = exportTraceToPDF(algo, state.steps);
      if (success && this.btnExportTrace) {
        const originalText = this.btnExportTrace.innerHTML;
        this.btnExportTrace.innerHTML = '✓ Đang xuất PDF...';
        this.btnExportTrace.classList.add('btn-primary');
        setTimeout(() => {
          this.btnExportTrace.innerHTML = originalText;
          this.btnExportTrace.classList.remove('btn-primary');
        }, 2200);
      }
    });

    // 10. Các nút chọn kịch bản mảng mẫu (Edge Cases Presets)
    const presetBtns = this.arrayModalBackdrop?.querySelectorAll('.preset-btn');
    presetBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (preset) {
          state.applyArrayPreset(preset);
          this.clearFeedback();
          this.showFeedback(`⚡ Đã áp dụng kịch bản mảng: ${btn.textContent.trim()}`, false);
          if (this.customArrayInput) {
            this.customArrayInput.value = state.arrayData.map(x => x.value).join(', ');
          }
        }
      });
    });

    // 11. Đóng & Chơi lại trên Modal Chiến Thắng
    this.btnCloseVictory?.addEventListener('click', () => this.closeVictoryModal());
    this.btnVictoryRestart?.addEventListener('click', () => {
      this.closeVictoryModal();
      this.restartPractice();
    });
    this.victoryModalBackdrop?.addEventListener('click', (e) => {
      if (e.target === this.victoryModalBackdrop) {
        this.closeVictoryModal();
      }
    });

    // 12. Phím tắt tiện lợi: H (Gợi ý), M (Âm thanh)
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'h' || e.key === 'H') {
        const hintBtn = document.getElementById('btn-practice-hint');
        if (hintBtn && getComputedStyle(hintBtn).display !== 'none') {
          hintBtn.click();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        this.btnToggleSound?.click();
      }
    });
  }

  /**
   * Phóng to / Thu nhỏ bảng phần tử toàn màn hình
   */
  toggleVisualizerFullscreen() {
    const wrapper = this.visualizerWrapper;
    if (!wrapper) return;

    const isFullscreen = !!document.fullscreenElement || wrapper.classList.contains('is-fullscreen');

    if (!isFullscreen) {
      if (wrapper.requestFullscreen) {
        wrapper.requestFullscreen().catch(() => {
          wrapper.classList.add('is-fullscreen');
          this.updateFullscreenIcon(true);
        });
      } else {
        wrapper.classList.add('is-fullscreen');
        this.updateFullscreenIcon(true);
      }
    } else {
      this.exitVisualizerFullscreen();
    }
  }

  exitVisualizerFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (this.visualizerWrapper) {
      this.visualizerWrapper.classList.remove('is-fullscreen');
    }
    this.updateFullscreenIcon(false);
  }

  updateFullscreenIcon(isFs) {
    const expandIcon = this.btnFullscreenToggle?.querySelector('.fs-icon-expand');
    const compressIcon = this.btnFullscreenToggle?.querySelector('.fs-icon-compress');
    if (expandIcon && compressIcon) {
      expandIcon.style.display = isFs ? 'none' : 'block';
      compressIcon.style.display = isFs ? 'block' : 'none';
    }
    if (this.btnFullscreenToggle) {
      this.btnFullscreenToggle.title = isFs ? 'Thu nhỏ lại (Esc)' : 'Phóng to bảng phần tử';
    }
  }

  /**
   * Chuyển đổi chế độ tương tác mảng (Xếp tự do vs Làm bài)
   */
  setMode(mode) {
    state.setInteractionMode(mode);
    this.updateModeUI(mode);
  }

  /**
   * Làm lại bài tập từ đầu
   */
  restartPractice() {
    state.restartPractice();
    this.updateModeUI(state.interactionMode);
  }

  /**
   * Cập nhật style nút bấm chế độ tương tác
   */
  updateModeUI(mode) {
    if (this.btnModeSetup) {
      if (mode === 'setup') {
        this.btnModeSetup.classList.add('active', 'btn-primary');
        this.btnModeSetup.classList.remove('btn-secondary');
      } else {
        this.btnModeSetup.classList.remove('active', 'btn-primary');
        this.btnModeSetup.classList.add('btn-secondary');
      }
    }
    if (this.btnModePractice) {
      if (mode === 'practice') {
        this.btnModePractice.classList.add('active', 'btn-primary');
        this.btnModePractice.classList.remove('btn-secondary');
      } else {
        this.btnModePractice.classList.remove('active', 'btn-primary');
        this.btnModePractice.classList.add('btn-secondary');
      }
    }
  }

  /**
   * Đóng / mở khung chi tiết mô tả thuật toán ở dưới đáy
   */
  toggleAlgoDetail() {
    if (!this.algoDetailDropdown) return;
    const isHidden = this.algoDetailDropdown.style.display === 'none' || !this.algoDetailDropdown.style.display;
    if (isHidden) {
      this.algoDetailDropdown.style.display = 'flex';
      this.btnToggleAlgoDetail?.setAttribute('aria-expanded', 'true');
      if (this.btnToggleDetailText) this.btnToggleDetailText.textContent = 'Thu gọn mô tả thuật toán';
      if (this.detailChevron) this.detailChevron.textContent = '▲';
      this.algoDetailDropdown.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      this.algoDetailDropdown.style.display = 'none';
      this.btnToggleAlgoDetail?.setAttribute('aria-expanded', 'false');
      if (this.btnToggleDetailText) this.btnToggleDetailText.textContent = 'Xem chi tiết mô tả thuật toán';
      if (this.detailChevron) this.detailChevron.textContent = '▼';
    }
  }

  /**
   * Chuyển đổi trạng thái đóng / mở sidebar (Thụt thò)
   */
  toggleSidebar() {
    this.appBody?.classList.toggle('sidebar-collapsed');
    const isCollapsed = this.appBody?.classList.contains('sidebar-collapsed');
    if (this.btnToggleSidebar) {
      this.btnToggleSidebar.innerHTML = isCollapsed
        ? '<span class="btn-icon">☰</span> <span class="btn-text">Danh sách</span>'
        : '<span class="btn-icon">◀</span> <span class="btn-text">Thu gọn</span>';
    }
  }

  collapseSidebar() {
    this.appBody?.classList.add('sidebar-collapsed');
    if (this.btnToggleSidebar) {
      this.btnToggleSidebar.innerHTML = '<span class="btn-icon">☰</span> <span class="btn-text">Danh sách</span>';
    }
  }

  /**
   * Tạo Sidebar với danh sách thuật toán gom theo 4 nhóm
   */
  renderSidebar() {
    if (!this.sidebarContainer) return;
    this.sidebarContainer.innerHTML = '';

    GROUP_ORDER.forEach(groupName => {
      const groupAlgos = algorithmsByGroup[groupName] || [];
      if (groupAlgos.length === 0) return;

      const groupEl = document.createElement('div');
      groupEl.className = 'sidebar-group';

      const titleEl = document.createElement('div');
      titleEl.className = 'sidebar-group-title';
      titleEl.textContent = groupName;
      groupEl.appendChild(titleEl);

      const listEl = document.createElement('ul');
      listEl.className = 'sidebar-algo-list';

      groupAlgos.forEach(algo => {
        const itemEl = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = `algo-btn ${algo.id === state.currentAlgorithmId ? 'active' : ''}`;
        btn.dataset.id = algo.id;

        btn.innerHTML = `
          <span>${algo.name}</span>
          <span class="algo-btn-badge">${algo.complexity.worst}</span>
        `;

        btn.addEventListener('click', () => {
          this.clearFeedback();
          state.setAlgorithm(algo.id);
        });

        itemEl.appendChild(btn);
        listEl.appendChild(itemEl);
      });

      groupEl.appendChild(listEl);
      this.sidebarContainer.appendChild(groupEl);
    });
  }

  /**
   * Cập nhật trạng thái active trên Sidebar
   */
  updateSidebarActive() {
    const buttons = this.sidebarContainer?.querySelectorAll('.algo-btn');
    buttons?.forEach(btn => {
      if (btn.dataset.id === state.currentAlgorithmId) {
        btn.classList.add('active');
        btn.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Cập nhật toàn bộ thông tin thuật toán trên màn hình
   */
  updateAlgorithmInfo() {
    const algo = state.getCurrentAlgorithm();
    if (!algo) return;

    if (this.headerAlgoName) this.headerAlgoName.textContent = algo.name;
    if (this.canvasAlgoTitle) this.canvasAlgoTitle.textContent = algo.name;
    if (this.algoTitle) this.algoTitle.textContent = algo.name;
    if (this.algoGroupBadge) this.algoGroupBadge.textContent = algo.group;
    if (this.complexityWorst) this.complexityWorst.textContent = algo.complexity.worst;
    if (this.complexityBest) this.complexityBest.textContent = algo.complexity.best;
    if (this.complexitySpace) this.complexitySpace.textContent = algo.complexity.space;
    if (this.complexityStable) {
      this.complexityStable.textContent = algo.complexity.stable ? 'Có (Ổn định)' : 'Không';
      this.complexityStable.style.color = algo.complexity.stable ? 'var(--state-ok)' : 'var(--text-muted)';
    }
    if (this.algoDesc) this.algoDesc.textContent = algo.description;
    if (this.algoAnalogy) this.algoAnalogy.textContent = `💡 Ví dụ đời thường: ${algo.analogy}`;

    // Khởi tạo khung mã giả
    this.renderer.initPseudocode(algo.pseudocode);

    // Cập nhật gợi ý quy tắc nhập mảng
    if (this.inputRuleHint) {
      let hint = `Khoảng giá trị: [${algo.inputRule.min} .. ${algo.inputRule.max}]. Số lượng: 5 - 20 số.`;
      if (algo.id === 'counting') hint += ' (Counting Sort giới hạn tối đa 30 để mảng đếm trực quan).';
      if (algo.id === 'radix') hint += ' (Radix Sort là số nguyên không âm tối đa 999).';
      if (algo.id === 'binary') hint += ' (Binary Search: mảng sẽ tự động được sắp xếp tăng dần).';
      this.inputRuleHint.textContent = hint;
    }

    // Hiển thị hoặc ẩn ô nhập Target Value cho Tìm kiếm
    if (this.searchTargetGroup) {
      if (algo.isSearch) {
        this.searchTargetGroup.style.display = 'flex';
        if (this.searchTargetInput) {
          this.searchTargetInput.value = state.targetValue;
        }
      } else {
        this.searchTargetGroup.style.display = 'none';
      }
    }

    // Cập nhật input mảng hiện thời
    if (this.customArrayInput) {
      this.customArrayInput.value = state.arrayData.map(x => x.value).join(', ');
    }
    if (this.arraySizeInput) {
      this.arraySizeInput.value = state.arraySize;
    }
    if (this.arraySizeLabel) {
      this.arraySizeLabel.textContent = state.arraySize;
    }

    // Hiển thị hoặc ẩn cụm nút chuyển chế độ & nút restart
    if (this.modeSwitchGroup) {
      if (algo.isSearch) {
        this.modeSwitchGroup.style.display = 'none';
      } else {
        this.modeSwitchGroup.style.display = 'inline-flex';
        this.updateModeUI(state.interactionMode);
      }
    }

    this.updateSidebarActive();
  }

  /**
   * Cập nhật trạng thái nút Play / Pause
   */
  updatePlaybackButton(isPlaying) {
    if (!this.btnPlay) return;
    if (isPlaying) {
      this.btnPlay.innerHTML = '<span>⏸</span><span>Tạm dừng</span>';
      this.btnPlay.classList.remove('btn-primary');
      this.btnPlay.classList.add('btn-secondary');
    } else {
      this.btnPlay.innerHTML = '<span>▶</span><span>Chạy</span>';
      this.btnPlay.classList.add('btn-primary');
      this.btnPlay.classList.remove('btn-secondary');
    }
  }

  /**
   * Xử lý gửi mảng tự nhập
   */
  handleCustomArraySubmit() {
    const valStr = this.customArrayInput?.value;
    const algo = state.getCurrentAlgorithm();
    const rule = algo ? algo.inputRule : { min: 0, max: 100, sorted: false };

    const parsed = parseArrayInput(valStr, rule.min, rule.max, rule.sorted);
    if (!parsed.valid) {
      this.showFeedback(parsed.error, true);
      return;
    }

    this.showFeedback('Mảng hợp lệ! Đã cập nhật thành công.', false);
    state.setArrayData(parsed.data);
  }

  /**
   * Xử lý gửi giá trị tìm kiếm mới
   */
  handleTargetSubmit() {
    const rawVal = this.searchTargetInput?.value;
    const num = Number(rawVal);
    if (isNaN(num)) {
      this.showFeedback('Giá trị tìm kiếm phải là số nguyên hợp lệ.', true);
      return;
    }
    this.clearFeedback();
    state.setTargetValue(num);
    this.showFeedback('✓ Đã cập nhật giá trị cần tìm thành công!', false);
  }

  showFeedback(msg, isError = false) {
    if (!this.inputFeedback) return;
    this.inputFeedback.textContent = msg;
    this.inputFeedback.className = `input-feedback ${isError ? 'error' : ''}`;
  }

  clearFeedback() {
    if (this.inputFeedback) {
      this.inputFeedback.textContent = '';
      this.inputFeedback.className = 'input-feedback';
    }
  }

  /**
   * Render bảng so sánh tổng quan 9 thuật toán
   */
  renderOverviewTable() {
    if (!this.overviewTableBody) return;
    this.overviewTableBody.innerHTML = '';

    algorithms.forEach(algo => {
      const tr = document.createElement('tr');
      const useCase = algorithmUseCases[algo.id] || '';

      tr.innerHTML = `
        <td><strong>${algo.name}</strong></td>
        <td><span class="algo-group-badge">${algo.group}</span></td>
        <td><code>${algo.complexity.worst}</code></td>
        <td><code>${algo.complexity.best}</code></td>
        <td><code>${algo.complexity.space}</code></td>
        <td class="${algo.complexity.stable ? 'badge-stable-yes' : 'badge-stable-no'}">
          ${algo.complexity.stable ? '✓ Có' : '✕ Không'}
        </td>
        <td style="font-size: 13px; color: var(--text-muted); max-width: 320px;">${useCase}</td>
        <td>
          <button class="btn btn-outline btn-sm btn-select-algo" data-id="${algo.id}">
            Mô phỏng
          </button>
        </td>
      `;

      tr.querySelector('.btn-select-algo')?.addEventListener('click', () => {
        this.closeOverviewModal();
        state.setAlgorithm(algo.id);
      });

      this.overviewTableBody.appendChild(tr);
    });
  }

  /**
   * Mở Modal Tuỳ Chọn & Khởi Tạo Mảng
   */
  openArrayModal() {
    player.pause();
    this.clearFeedback();
    if (this.customArrayInput) {
      this.customArrayInput.value = state.arrayData.map(x => x.value).join(', ');
    }
    if (this.searchTargetInput) {
      this.searchTargetInput.value = state.targetValue;
    }
    this.arrayModalBackdrop?.classList.add('active');
  }

  closeArrayModal() {
    this.arrayModalBackdrop?.classList.remove('active');
  }

  openOverviewModal() {
    player.pause();
    this.overviewModalBackdrop?.classList.add('active');
  }

  closeOverviewModal() {
    this.overviewModalBackdrop?.classList.remove('active');
  }

  /**
   * Mở Modal Xem Mã Nguồn (C++, Java, Python, JS)
   */
  openCodeModal() {
    player.pause();
    const algo = state.getCurrentAlgorithm();
    if (!algo) return;

    if (this.codeModalTitle) {
      this.codeModalTitle.innerHTML = `💻 Mã Nguồn Cài Đặt: <strong>${algo.name}</strong>`;
    }
    this.updateCodeModalSnippet();
    this.codeModalBackdrop?.classList.add('active');
  }

  closeCodeModal() {
    this.codeModalBackdrop?.classList.remove('active');
  }

  /**
   * Cập nhật nội dung code theo ngôn ngữ đang chọn (bao gồm cả Mã giả)
   */
  updateCodeModalSnippet() {
    const algoId = state.currentAlgorithmId;
    const algo = state.getCurrentAlgorithm();

    if (this.selectedLanguage === 'pseudo') {
      const codeText = algo && algo.pseudocode
        ? algo.pseudocode.map((line, idx) => `${String(idx + 1).padStart(2, ' ')}  ${line}`).join('\n')
        : '// Chưa có mã giả cho thuật toán này.';
      if (this.codeModalContent) {
        this.codeModalContent.textContent = codeText;
      }
      return;
    }

    const snippetMap = codeSnippets[algoId] || {};
    const codeText = snippetMap[this.selectedLanguage] || '// Chưa có mã nguồn cho ngôn ngữ này.';

    if (this.codeModalContent) {
      this.codeModalContent.textContent = codeText;
    }
  }

  /**
   * Sao chép mã nguồn vào bộ nhớ tạm
   */
  copyCodeSnippet() {
    const textToCopy = this.codeModalContent?.textContent || '';
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      if (this.btnCopyCode) {
        const originalText = this.btnCopyCode.innerHTML;
        this.btnCopyCode.innerHTML = '✓ Đã sao chép!';
        this.btnCopyCode.classList.add('btn-primary');
        setTimeout(() => {
          this.btnCopyCode.innerHTML = originalText;
          this.btnCopyCode.classList.remove('btn-primary');
        }, 1800);
      }
    }).catch(err => {
      console.error('Không thể sao chép code:', err);
    });
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    if (this.btnThemeToggle) {
      this.btnThemeToggle.innerHTML = newTheme === 'dark'
        ? '<span class="btn-icon">☀️</span> <span class="btn-text">Sáng</span>'
        : '<span class="btn-icon">🌙</span> <span class="btn-text">Tối</span>';
    }
  }

  /**
   * Cập nhật trạng thái hiển thị của nút Bật / Tắt âm thanh
   */
  updateSoundButton(isMuted) {
    if (!this.btnToggleSound) return;
    this.btnToggleSound.innerHTML = isMuted
      ? '<span class="btn-icon">🔇</span> <span class="btn-text">Tắt tiếng</span>'
      : '<span class="btn-icon">🔊</span> <span class="btn-text">Âm thanh</span>';
    this.btnToggleSound.title = isMuted ? 'Âm thanh đang tắt (Bấm hoặc nhấn M để bật)' : 'Âm thanh đang bật (Bấm hoặc nhấn M để tắt)';
  }

  /**
   * Mở Modal Chúc Mừng Hoàn Thành Sắp Xếp (Gamification)
   */
  openVictoryModal(data = {}) {
    player.pause();
    const algo = state.getCurrentAlgorithm();
    if (this.victoryAlgoName) {
      this.victoryAlgoName.textContent = `Bạn đã tự tay hoàn thành chính xác 100% thuật toán ${algo?.name || ''}`;
    }
    const sec = data.elapsedSeconds || 0;
    const mins = Math.floor(sec / 60);
    const remSec = sec % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
    if (this.victoryStatTime) this.victoryStatTime.textContent = timeStr;
    if (this.victoryStatAccuracy) this.victoryStatAccuracy.textContent = `${data.accuracy ?? 100}%`;
    if (this.victoryStatCorrect) this.victoryStatCorrect.textContent = `${data.correctCount ?? 0} bước`;
    if (this.victoryStatWrong) this.victoryStatWrong.textContent = `${data.wrongCount ?? 0} lần`;
    this.victoryModalBackdrop?.classList.add('active');
  }

  closeVictoryModal() {
    this.victoryModalBackdrop?.classList.remove('active');
  }
}
