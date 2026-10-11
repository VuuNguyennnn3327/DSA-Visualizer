/**
 * DSA Visualizer - UI Controller (js/ui.js)
 * Điều phối giao diện người dùng: sidebar thu gọn/mở rộng, tiêu đề, mô tả,
 * form cấu hình mảng, modal tổng quan, modal xem mã nguồn (C++, Java, Python, JS).
 */

import { algorithms, algorithmsByGroup, GROUP_ORDER, GROUP_META, algorithmUseCases } from './algorithms/index.js';
import { codeSnippets } from './code-snippets.js';
import { state } from './state.js';
import { player } from './player.js';
import { parseArrayInput } from './utils.js';
import { soundFX } from './audio.js';
import { exportTraceToPDF } from './export-trace.js';
import { fireConfetti } from './confetti.js';
import { getPracticeMission } from './practice-missions.js';
import { linearInteractive } from './linear-interactive.js';

export class UIController {
  constructor(renderer) {
    this.renderer = renderer;
    this.selectedLanguage = 'cpp'; // Mặc định hiển thị code C++
    this.expandedGroups = new Set(GROUP_ORDER); // Trạng thái mở rộng Accordion trên Sidebar
    this.practiceTaskIndex = 0; // Chỉ số nhiệm vụ thực hành hiện tại

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
    this.btnPracticeHint = document.getElementById('btn-practice-hint');
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
    this.linearToolbarContainer = document.getElementById('linear-toolbar-container');

    this.bindEvents();
    this.updateSoundButton(soundFX.isMuted);
    this.renderSidebar();
    this.renderOverviewTable();
    linearInteractive.init(this, this.renderer);
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
    this.btnPracticeHint?.addEventListener('click', () => this.handleMissionHint());
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
   * Chuyển đổi chế độ tương tác (Xếp tự do vs Làm bài)
   */
  setMode(mode) {
    state.setInteractionMode(mode);
    this.updateModeUI(mode);

    const algo = state.getCurrentAlgorithm();
    if (!algo) return;

    if (algo.isLinear || algo.isTree) {
      this.practiceTaskIndex = 0;
      const mission = getPracticeMission(algo.id);
      if (mode === 'practice' && mission) {
        const firstTask = mission.tasks[0];
        this.clearFeedback();
        this.showFeedback(`🎯 [Làm bài - ${mission.title}] Bước 1/${mission.tasks.length}: ${firstTask.desc}. (Bấm '💡 Gợi ý' để được trợ giúp)`, false);
      } else {
        this.clearFeedback();
        this.showFeedback(`🛠️ Chế độ Tự do: Bạn có thể tự do nhập dữ liệu và thử nghiệm các nút thao tác trên ${algo.name}. Nhấn 'Làm bài' nếu muốn giải bài tập!`, false);
      }
    } else if (algo.isSearch) {
      this.clearFeedback();
      if (mode === 'practice') {
        this.showFeedback(`🎯 [Làm bài - ${algo.name}] Mục tiêu: Tìm giá trị Target = ${state.targetValue}. Bấm '💡 Gợi ý' để được trợ giúp!`, false);
      } else {
        this.showFeedback(`🛠️ Chế độ Tự do: Bạn có thể đổi giá trị cần tìm (Target) hoặc đổi mảng tùy ý.`, false);
      }
    }
  }

  /**
   * Làm lại bài tập từ đầu
   */
  restartPractice() {
    state.restartPractice();
    this.updateModeUI(state.interactionMode);

    const algo = state.getCurrentAlgorithm();
    if (!algo) return;

    if (algo.isLinear || algo.isTree) {
      this.practiceTaskIndex = 0;
      const mission = getPracticeMission(algo.id);
      this.clearFeedback();
      if (state.interactionMode === 'practice' && mission) {
        const firstTask = mission.tasks[0];
        this.showFeedback(`🔄 Đã làm lại bài tập! Hãy bắt đầu lại từ Bước 1/${mission.tasks.length}: ${firstTask.desc}.`, false);
      } else {
        this.showFeedback(`🔄 Đã làm mới cấu trúc ${algo.name} về ban đầu!`, false);
      }
    }
  }

  /**
   * Cung cấp gợi ý nhiệm vụ thực hành cho cấu trúc dữ liệu mới
   */
  handleMissionHint() {
    const algo = state.getCurrentAlgorithm();
    if (!algo || (!algo.isLinear && !algo.isTree && !algo.isSearch)) return;

    player.pause();
    if (state.interactionMode === 'setup') {
      this.showFeedback("💡 Bạn đang ở chế độ 'Tự do thao tác'. Hãy chuyển sang '🎯 Làm bài' để thực hành bài tập và nhận gợi ý!", false);
      return;
    }

    if (algo.isSearch) {
      soundFX.playHint();
      this.showFeedback(`💡 Gợi ý ${algo.name}: Giá trị cần tìm là Target = ${state.targetValue}. Hãy bấm nút '▶ Bước tiếp' để xem phần tử đang được xét!`, false);
      return;
    }

    const mission = getPracticeMission(algo.id);
    if (!mission) return;

    const currentTask = mission.tasks[this.practiceTaskIndex];
    if (!currentTask) {
      this.showFeedback('🎉 Bạn đã hoàn thành toàn bộ bài tập này rồi!', false);
      return;
    }

    soundFX.playHint();
    this.showFeedback(`💡 Gợi ý [Bước ${this.practiceTaskIndex + 1}/${mission.tasks.length}]: ${currentTask.hint}`, false);

    if (currentTask.buttonId) {
      const btn = document.getElementById(currentTask.buttonId);
      if (btn) {
        btn.classList.add('btn-hint-pulse');
        setTimeout(() => btn.classList.remove('btn-hint-pulse'), 2400);
      }
    }
  }

  /**
   * Kiểm tra tiến độ hoàn thành nhiệm vụ thực hành
   */
  checkPracticeProgress(actionType) {
    const algo = state.getCurrentAlgorithm();
    if (!algo || (!algo.isLinear && !algo.isTree)) return;
    if (state.interactionMode !== 'practice') return;

    const mission = getPracticeMission(algo.id);
    if (!mission) return;

    const currentTask = mission.tasks[this.practiceTaskIndex];
    if (!currentTask) return;

    if (currentTask.id === actionType) {
      this.practiceTaskIndex++;
      soundFX.playSwap();

      if (this.practiceTaskIndex >= mission.tasks.length) {
        // Hoàn thành bài tập xuất sắc!
        fireConfetti(3200);
        soundFX.playVictory();
        const elapsedSec = Math.floor((Date.now() - (state.practiceStats?.startTime || Date.now())) / 1000);
        this.showFeedback(`🎉 Xuất sắc! Bạn đã hoàn thành 100% bài tập ${mission.title}!`, false);
        setTimeout(() => {
          this.openVictoryModal({
            accuracy: 100,
            correctCount: mission.tasks.length,
            wrongCount: 0,
            elapsedSeconds: elapsedSec
          });
        }, 500);
      } else {
        const nextTask = mission.tasks[this.practiceTaskIndex];
        this.showFeedback(`✅ Chính xác! Hoàn thành: ${currentTask.label}. Bước tiếp theo (${this.practiceTaskIndex + 1}/${mission.tasks.length}): ${nextTask.desc}`, false);
      }
    }
  }

  /**
   * Cập nhật style nút bấm chế độ tương tác
   */
  updateModeUI(mode) {
    const algo = state.getCurrentAlgorithm();
    const isSort = algo && !algo.isLinear && !algo.isTree && !algo.isSearch;

    if (this.btnModeSetup) {
      this.btnModeSetup.innerHTML = isSort ? '✏️ Xếp tự do' : '✏️ Tự do thao tác';
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
   * Tạo Sidebar với danh sách thuật toán gom theo 4 nhóm dạng Accordion thu gọn / mở rộng
   */
  renderSidebar() {
    if (!this.sidebarContainer) return;
    this.sidebarContainer.innerHTML = '';

    GROUP_ORDER.forEach(groupName => {
      const groupAlgos = algorithmsByGroup[groupName] || [];
      if (groupAlgos.length === 0) return;

      const meta = GROUP_META[groupName] || { icon: '📂', name: groupName, badge: `${groupAlgos.length}` };
      const isExpanded = this.expandedGroups.has(groupName);

      const groupEl = document.createElement('div');
      groupEl.className = `sidebar-accordion-group ${isExpanded ? 'is-expanded' : 'is-collapsed'}`;
      groupEl.dataset.group = groupName;

      // Nút Header đóng / mở Accordion
      const headerBtn = document.createElement('button');
      headerBtn.className = 'sidebar-accordion-header';
      headerBtn.type = 'button';
      headerBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      headerBtn.title = `Nhấn để ${isExpanded ? 'thu gọn' : 'mở rộng'} ${meta.name || groupName}`;
      headerBtn.innerHTML = `
        <div class="accordion-header-left">
          <span class="accordion-icon">${meta.icon || '📂'}</span>
          <span class="accordion-title">${meta.name || groupName}</span>
          <span class="accordion-count">${groupAlgos.length}</span>
        </div>
        <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      `;

      headerBtn.addEventListener('click', () => {
        const currentlyExpanded = this.expandedGroups.has(groupName);
        if (currentlyExpanded) {
          this.expandedGroups.delete(groupName);
          groupEl.classList.remove('is-expanded');
          groupEl.classList.add('is-collapsed');
          headerBtn.setAttribute('aria-expanded', 'false');
          headerBtn.title = `Nhấn để mở rộng ${meta.name || groupName}`;
        } else {
          this.expandedGroups.add(groupName);
          groupEl.classList.remove('is-collapsed');
          groupEl.classList.add('is-expanded');
          headerBtn.setAttribute('aria-expanded', 'true');
          headerBtn.title = `Nhấn để thu gọn ${meta.name || groupName}`;
        }
      });

      groupEl.appendChild(headerBtn);

      // Thân Accordion chứa danh sách thuật toán
      const bodyEl = document.createElement('div');
      bodyEl.className = 'sidebar-accordion-body';

      const listEl = document.createElement('ul');
      listEl.className = 'sidebar-algo-list';

      groupAlgos.forEach(algo => {
        const itemEl = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = `algo-btn ${algo.id === state.currentAlgorithmId ? 'active' : ''}`;
        btn.dataset.id = algo.id;

        const shortBadge = algo.shortComplexity || algo.complexity?.worst?.match(/O\([^)]+\)/)?.[0] || 'O(n)';

        btn.innerHTML = `
          <span class="algo-btn-title" title="${algo.name}">${algo.name}</span>
          <span class="algo-btn-badge">${shortBadge}</span>
        `;

        btn.addEventListener('click', () => {
          this.clearFeedback();
          this.practiceTaskIndex = 0;
          state.setAlgorithm(algo.id);
        });

        itemEl.appendChild(btn);
        listEl.appendChild(itemEl);
      });

      bodyEl.appendChild(listEl);
      groupEl.appendChild(bodyEl);
      this.sidebarContainer.appendChild(groupEl);
    });
  }

  /**
   * Cập nhật trạng thái active trên Sidebar & tự động mở nhóm chứa thuật toán active
   */
  updateSidebarActive() {
    const currAlgo = state.getCurrentAlgorithm();
    if (currAlgo && currAlgo.group) {
      // Tự động mở nhóm chứa thuật toán đang được chọn
      if (!this.expandedGroups.has(currAlgo.group)) {
        this.expandedGroups.add(currAlgo.group);
        const groupEl = this.sidebarContainer?.querySelector(`[data-group="${currAlgo.group}"]`);
        if (groupEl) {
          groupEl.classList.remove('is-collapsed');
          groupEl.classList.add('is-expanded');
          const headerBtn = groupEl.querySelector('.sidebar-accordion-header');
          headerBtn?.setAttribute('aria-expanded', 'true');
        }
      }
    }

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

    // Hiển thị cụm nút chuyển chế độ (Xếp tự do / Làm bài) trên toàn bộ các thuật toán & cấu trúc dữ liệu
    if (this.modeSwitchGroup) {
      this.modeSwitchGroup.style.display = 'inline-flex';
      this.updateModeUI(state.interactionMode);
    }

    // Hiển thị thanh thao tác nhanh riêng biệt cho Cấu trúc Tuyến tính
    this.renderLinearToolbar(algo);

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

  /**
   * Render thanh thao tác riêng cho Cấu trúc Dữ liệu Tuyến tính (Stack, Queue, Linked List)
   */
  renderLinearToolbar(algo) {
    if (!this.linearToolbarContainer) return;
    if (!algo?.isLinear && !algo?.isTree) {
      this.linearToolbarContainer.style.display = 'none';
      return;
    }

    this.linearToolbarContainer.style.display = 'flex';
    const type = algo.linearType || algo.treeType || algo.id;

    if (type === 'stack') {
      this.linearToolbarContainer.innerHTML = `
        <span class="linear-toolbar-label">Thao tác Stack:</span>
        <div class="linear-input-group">
          <input id="linear-input-val" type="number" class="linear-input-num" value="${Math.floor(Math.random() * 80) + 10}" min="1" max="99" placeholder="Số">
          <button id="btn-linear-push" class="btn btn-primary btn-sm">📥 Push(x)</button>
        </div>
        <button id="btn-linear-pop" class="btn btn-secondary btn-sm">📤 Pop()</button>
        <button id="btn-linear-peek" class="btn btn-secondary btn-sm">👁 Peek()</button>
        <button id="btn-linear-reset" class="btn btn-secondary btn-sm" style="margin-left: auto;">🔄 Chạy lại kịch bản</button>
      `;

      document.getElementById('btn-linear-push')?.addEventListener('click', () => this.handleStackPush());
      document.getElementById('btn-linear-pop')?.addEventListener('click', () => this.handleStackPop());
      document.getElementById('btn-linear-peek')?.addEventListener('click', () => this.handleStackPeek());
      document.getElementById('btn-linear-reset')?.addEventListener('click', () => {
        state.computeSteps();
        state.notify('stepChange');
      });
    } else if (type === 'queue') {
      this.linearToolbarContainer.innerHTML = `
        <span class="linear-toolbar-label">Thao tác Queue:</span>
        <div class="linear-input-group">
          <input id="linear-input-val" type="number" class="linear-input-num" value="${Math.floor(Math.random() * 80) + 10}" min="1" max="99" placeholder="Số">
          <button id="btn-linear-enqueue" class="btn btn-primary btn-sm">📥 Enqueue(x)</button>
        </div>
        <button id="btn-linear-dequeue" class="btn btn-secondary btn-sm">📤 Dequeue()</button>
        <button id="btn-linear-front" class="btn btn-secondary btn-sm">👁 GetFront()</button>
        <button id="btn-linear-reset" class="btn btn-secondary btn-sm" style="margin-left: auto;">🔄 Chạy lại kịch bản</button>
      `;

      document.getElementById('btn-linear-enqueue')?.addEventListener('click', () => this.handleQueueEnqueue());
      document.getElementById('btn-linear-dequeue')?.addEventListener('click', () => this.handleQueueDequeue());
      document.getElementById('btn-linear-front')?.addEventListener('click', () => this.handleQueueFront());
      document.getElementById('btn-linear-reset')?.addEventListener('click', () => {
        state.computeSteps();
        state.notify('stepChange');
      });
    } else if (type === 'linkedList') {
      this.linearToolbarContainer.innerHTML = `
        <span class="linear-toolbar-label">Thao tác Singly Linked List:</span>
        <div class="linear-input-group">
          <input id="linear-input-val" type="number" class="linear-input-num" value="${Math.floor(Math.random() * 80) + 10}" min="1" max="99" placeholder="Giá trị">
          <button id="btn-linear-insert-head" class="btn btn-primary btn-sm" title="Thêm node mới vào đầu danh sách (O(1))">➕ Thêm đầu</button>
          <button id="btn-linear-insert-tail" class="btn btn-primary btn-sm" title="Thêm node mới vào cuối danh sách (O(n))">➕ Thêm đuôi</button>
          <button id="btn-linear-search" class="btn btn-secondary btn-sm" title="Tìm kiếm tuần tự node có giá trị x (O(n))">🔍 Tìm(x)</button>
        </div>
        <button id="btn-linear-del-head" class="btn btn-secondary btn-sm" title="Xóa node ở đầu danh sách (O(1))">🗑️ Xóa đầu</button>
        <button id="btn-linear-del-tail" class="btn btn-secondary btn-sm" title="Xóa node ở cuối danh sách (O(n))">🗑️ Xóa đuôi</button>
        <button id="btn-linear-reverse" class="btn btn-secondary btn-sm" title="Đảo ngược liên kết toàn bộ danh sách (O(n))">🔄 Đảo ngược</button>
        <button id="btn-linear-clear" class="btn btn-secondary btn-sm" title="Xóa rỗng toàn bộ danh sách">🧹 Xóa rỗng</button>
        <button id="btn-linear-reset" class="btn btn-secondary btn-sm" style="margin-left: auto;" title="Chạy lại kịch bản mô phỏng mặc định">🔄 Chạy lại kịch bản</button>
      `;

      document.getElementById('btn-linear-insert-head')?.addEventListener('click', () => this.handleLLInsertHead());
      document.getElementById('btn-linear-insert-tail')?.addEventListener('click', () => this.handleLLInsertTail());
      document.getElementById('btn-linear-search')?.addEventListener('click', () => this.handleLLSearch());
      document.getElementById('btn-linear-del-head')?.addEventListener('click', () => this.handleLLDeleteHead());
      document.getElementById('btn-linear-del-tail')?.addEventListener('click', () => this.handleLLDeleteTail());
      document.getElementById('btn-linear-reverse')?.addEventListener('click', () => this.handleLLReverse());
      document.getElementById('btn-linear-clear')?.addEventListener('click', () => this.handleLLClear());
      document.getElementById('btn-linear-reset')?.addEventListener('click', () => {
        state.computeSteps();
        state.notify('stepChange');
      });
    } else if (type === 'doublyLinkedList') {
      this.linearToolbarContainer.innerHTML = `
        <span class="linear-toolbar-label">Thao tác DSLK Đôi:</span>
        <div class="linear-input-group">
          <input id="dll-input-val" type="number" class="linear-input-num" value="${Math.floor(Math.random() * 80) + 10}" min="1" max="99" placeholder="Giá trị x">
          <input id="dll-input-idx" type="number" class="linear-input-num" value="1" min="0" max="7" style="width: 52px;" title="Vị trí chèn K (0-indexed)" placeholder="K">
          <button id="btn-dll-insert-head" class="btn btn-primary btn-sm" title="Thêm node mới vào đầu danh sách (O(1))">➕ Thêm đầu</button>
          <button id="btn-dll-insert-tail" class="btn btn-primary btn-sm" title="Thêm node mới vào cuối danh sách (O(1))">➕ Thêm đuôi</button>
          <button id="btn-dll-insert-at" class="btn btn-secondary btn-sm" title="Chèn node tại vị trí k (O(n))">📍 Chèn tại K</button>
          <button id="btn-dll-search" class="btn btn-secondary btn-sm" title="Tìm kiếm tuần tự node có giá trị x (O(n))">🔍 Tìm(x)</button>
        </div>
        <div class="tree-traversal-group">
          <button id="btn-dll-traverse-fwd" class="btn btn-secondary btn-sm" title="Duyệt xuôi từ Head ➔ Tail qua con trỏ next">➡️ Duyệt xuôi</button>
          <button id="btn-dll-traverse-bwd" class="btn btn-secondary btn-sm" title="Duyệt ngược từ Tail ⬅ Head qua con trỏ prev">⬅️ Duyệt ngược</button>
          <button id="btn-dll-reverse" class="btn btn-secondary btn-sm" title="Đảo ngược DSLK Đôi bằng cách swap(prev, next)">🔄 Đảo ngược</button>
        </div>
        <div class="tree-minmax-group">
          <button id="btn-dll-del-head" class="btn btn-secondary btn-sm" title="Xóa node ở đầu danh sách (O(1))">🗑️ Xóa đầu</button>
          <button id="btn-dll-del-tail" class="btn btn-secondary btn-sm" title="Xóa node ở cuối danh sách (O(1))">🗑️ Xóa đuôi</button>
          <button id="btn-dll-del-val" class="btn btn-secondary btn-sm" title="Xóa node mang giá trị x">🗑️ Xóa X</button>
        </div>
        <button id="btn-dll-sample" class="btn btn-outline btn-sm" title="Tạo ngẫu nhiên danh sách đôi mới">🎲 Ngẫu nhiên</button>
        <button id="btn-dll-clear" class="btn btn-secondary btn-sm" title="Xóa rỗng toàn bộ danh sách">🧹 Xóa rỗng</button>
        <button id="btn-linear-reset" class="btn btn-secondary btn-sm" style="margin-left: auto;" title="Chạy lại kịch bản mô phỏng mặc định">🔄 Kịch bản gốc</button>
      `;

      document.getElementById('btn-dll-insert-head')?.addEventListener('click', () => this.handleDLLInsertHead());
      document.getElementById('btn-dll-insert-tail')?.addEventListener('click', () => this.handleDLLInsertTail());
      document.getElementById('btn-dll-insert-at')?.addEventListener('click', () => this.handleDLLInsertAt());
      document.getElementById('btn-dll-search')?.addEventListener('click', () => this.handleDLLSearch());
      document.getElementById('btn-dll-traverse-fwd')?.addEventListener('click', () => this.handleDLLTraverseForward());
      document.getElementById('btn-dll-traverse-bwd')?.addEventListener('click', () => this.handleDLLTraverseBackward());
      document.getElementById('btn-dll-reverse')?.addEventListener('click', () => this.handleDLLReverse());
      document.getElementById('btn-dll-del-head')?.addEventListener('click', () => this.handleDLLDeleteHead());
      document.getElementById('btn-dll-del-tail')?.addEventListener('click', () => this.handleDLLDeleteTail());
      document.getElementById('btn-dll-del-val')?.addEventListener('click', () => this.handleDLLDeleteVal());
      document.getElementById('btn-dll-sample')?.addEventListener('click', () => this.handleDLLSample());
      document.getElementById('btn-dll-clear')?.addEventListener('click', () => this.handleDLLClear());
      document.getElementById('btn-linear-reset')?.addEventListener('click', () => {
        state.computeSteps();
        state.notify('stepChange');
        player.play();
      });
    } else if (type === 'circularLinkedList') {
      this.linearToolbarContainer.innerHTML = `
        <span class="linear-toolbar-label">Thao tác DSLK Vòng:</span>
        <div class="linear-input-group">
          <input id="cll-input-val" type="number" class="linear-input-num" value="${Math.floor(Math.random() * 80) + 10}" min="1" max="99" placeholder="Giá trị x">
          <button id="btn-cll-insert-head" class="btn btn-primary btn-sm" title="Thêm node vào đầu, Tail.next trỏ vòng về Head mới">➕ Thêm đầu</button>
          <button id="btn-cll-insert-tail" class="btn btn-primary btn-sm" title="Thêm node vào cuối, Node mới trỏ vòng về Head">➕ Thêm đuôi</button>
          <button id="btn-cll-round-robin" class="btn btn-secondary btn-sm" title="Cấp phát 1 lượt CPU Quantum cho tiến trình tiếp theo theo vòng tròn khép kín">⚡ Round-Robin(1 lượt)</button>
          <button id="btn-cll-search" class="btn btn-secondary btn-sm" title="Tìm kiếm x trên vòng tròn">🔍 Tìm(x)</button>
        </div>
        <div class="tree-minmax-group">
          <button id="btn-cll-del-head" class="btn btn-secondary btn-sm" title="Xóa node ở đầu và cập nhật Tail.next trỏ về Head mới">🗑️ Xóa đầu</button>
          <button id="btn-cll-del-tail" class="btn btn-secondary btn-sm" title="Xóa node ở cuối">🗑️ Xóa đuôi</button>
        </div>
        <button id="btn-cll-sample" class="btn btn-outline btn-sm" title="Tạo ngẫu nhiên danh sách vòng mới">🎲 Ngẫu nhiên</button>
        <button id="btn-cll-clear" class="btn btn-secondary btn-sm" title="Xóa rỗng danh sách vòng">🧹 Xóa rỗng</button>
        <button id="btn-linear-reset" class="btn btn-secondary btn-sm" style="margin-left: auto;" title="Chạy lại kịch bản mô phỏng mặc định">🔄 Kịch bản gốc</button>
      `;

      document.getElementById('btn-cll-insert-head')?.addEventListener('click', () => this.handleCLLInsertHead());
      document.getElementById('btn-cll-insert-tail')?.addEventListener('click', () => this.handleCLLInsertTail());
      document.getElementById('btn-cll-round-robin')?.addEventListener('click', () => this.handleCLLRoundRobin());
      document.getElementById('btn-cll-search')?.addEventListener('click', () => this.handleCLLSearch());
      document.getElementById('btn-cll-del-head')?.addEventListener('click', () => this.handleCLLDeleteHead());
      document.getElementById('btn-cll-del-tail')?.addEventListener('click', () => this.handleCLLDeleteTail());
      document.getElementById('btn-cll-sample')?.addEventListener('click', () => this.handleCLLSample());
      document.getElementById('btn-cll-clear')?.addEventListener('click', () => this.handleCLLClear());
      document.getElementById('btn-linear-reset')?.addEventListener('click', () => {
        state.computeSteps();
        state.notify('stepChange');
        player.play();
      });
    } else if (type === 'deque') {
      this.linearToolbarContainer.innerHTML = `
        <span class="linear-toolbar-label">Thao tác Deque (2 đầu):</span>
        <div class="linear-input-group">
          <input id="deque-input-val" type="number" class="linear-input-num" value="${Math.floor(Math.random() * 80) + 10}" min="1" max="99" placeholder="Số x">
          <button id="btn-deque-push-front" class="btn btn-primary btn-sm" title="Đẩy phần tử vào đầu trước (Front)">📥 Push Front</button>
          <button id="btn-deque-push-back" class="btn btn-primary btn-sm" title="Đẩy phần tử vào đuôi sau (Rear)">📥 Push Back</button>
        </div>
        <div class="tree-traversal-group">
          <button id="btn-deque-pop-front" class="btn btn-secondary btn-sm" title="Rút phần tử ở đầu trước (Front)">📤 Pop Front</button>
          <button id="btn-deque-pop-back" class="btn btn-secondary btn-sm" title="Rút phần tử ở đuôi sau (Rear)">📤 Pop Back</button>
        </div>
        <div class="tree-minmax-group">
          <button id="btn-deque-peek-front" class="btn btn-outline btn-sm" title="Xem giá trị đầu trước">👁️ Peek Front</button>
          <button id="btn-deque-peek-back" class="btn btn-outline btn-sm" title="Xem giá trị đuôi sau">👁️ Peek Rear</button>
        </div>
        <button id="btn-deque-palindrome" class="btn btn-outline btn-sm" title="Nạp chuỗi mẫu và mô phỏng kiểm tra đối xứng Palindrome">✨ Palindrome</button>
        <button id="btn-deque-clear" class="btn btn-secondary btn-sm" title="Xóa rỗng Deque">🧹 Xóa rỗng</button>
        <button id="btn-linear-reset" class="btn btn-secondary btn-sm" style="margin-left: auto;" title="Chạy lại kịch bản mặc định">🔄 Kịch bản gốc</button>
      `;

      document.getElementById('btn-deque-push-front')?.addEventListener('click', () => this.handleDequePushFront());
      document.getElementById('btn-deque-push-back')?.addEventListener('click', () => this.handleDequePushBack());
      document.getElementById('btn-deque-pop-front')?.addEventListener('click', () => this.handleDequePopFront());
      document.getElementById('btn-deque-pop-back')?.addEventListener('click', () => this.handleDequePopBack());
      document.getElementById('btn-deque-peek-front')?.addEventListener('click', () => this.handleDequePeekFront());
      document.getElementById('btn-deque-peek-back')?.addEventListener('click', () => this.handleDequePeekBack());
      document.getElementById('btn-deque-palindrome')?.addEventListener('click', () => this.handleDequePalindromeDemo());
      document.getElementById('btn-deque-clear')?.addEventListener('click', () => this.handleDequeClear());
      document.getElementById('btn-linear-reset')?.addEventListener('click', () => {
        state.computeSteps();
        state.notify('stepChange');
        player.play();
      });
    } else if (algo.isTree) {
      if (algo.id === 'bst') {
        this.linearToolbarContainer.innerHTML = `
          <span class="linear-toolbar-label">Thao tác BST:</span>
          <div class="linear-input-group">
            <input id="tree-input-val" type="number" class="linear-input-num" value="${Math.floor(Math.random() * 80) + 10}" min="1" max="99" placeholder="Khóa x">
            <button id="btn-tree-insert" class="btn btn-primary btn-sm" title="Chèn khóa x vào BST theo quy tắc < trái, > phải">➕ Chèn(x)</button>
            <button id="btn-tree-search" class="btn btn-secondary btn-sm" title="Tìm kiếm khóa x trên cây BST O(h)">🔍 Tìm(x)</button>
            <button id="btn-tree-delete" class="btn btn-secondary btn-sm" title="Xóa node có khóa x (Lá / 1 con / 2 con)">🗑️ Xóa(x)</button>
          </div>
          <div class="tree-traversal-group">
            <button id="btn-tree-inorder" class="btn btn-secondary btn-sm" title="Duyệt Inorder (L-N-R) thu dãy số tăng dần">📖 Inorder</button>
            <button id="btn-tree-preorder" class="btn btn-secondary btn-sm" title="Duyệt Preorder (N-L-R) Tiền thứ tự">🌿 Preorder</button>
            <button id="btn-tree-postorder" class="btn btn-secondary btn-sm" title="Duyệt Postorder (L-R-N) Hậu thứ tự">🍂 Postorder</button>
            <button id="btn-tree-levelorder" class="btn btn-secondary btn-sm" title="Duyệt Level-order (BFS) theo từng tầng">🌊 Level-order</button>
          </div>
          <div class="tree-minmax-group">
            <button id="btn-tree-min" class="btn btn-outline btn-sm" title="Tìm giá trị nhỏ nhất Min ở nhánh con trái cùng">🔻 Min</button>
            <button id="btn-tree-max" class="btn btn-outline btn-sm" title="Tìm giá trị lớn nhất Max ở nhánh con phải cùng">🔺 Max</button>
          </div>
          <button id="btn-tree-sample" class="btn btn-outline btn-sm" title="Nạp lại cây BST mẫu chuẩn">🌱 Cây mẫu</button>
          <button id="btn-tree-random" class="btn btn-outline btn-sm" title="Tạo ngẫu nhiên một cây BST mới">🎲 Ngẫu nhiên</button>
          <button id="btn-tree-clear" class="btn btn-secondary btn-sm" title="Xóa rỗng cây BST (Root = NULL)">🧹 Xóa rỗng</button>
          <button id="btn-linear-reset" class="btn btn-secondary btn-sm" style="margin-left: auto;" title="Chạy kịch bản mô phỏng mặc định ban đầu">🔄 Kịch bản gốc</button>
        `;

        document.getElementById('btn-tree-insert')?.addEventListener('click', () => this.handleBSTInsert());
        document.getElementById('btn-tree-search')?.addEventListener('click', () => this.handleBSTSearch());
        document.getElementById('btn-tree-delete')?.addEventListener('click', () => this.handleBSTDelete());
        document.getElementById('btn-tree-inorder')?.addEventListener('click', () => this.handleBSTInorder());
        document.getElementById('btn-tree-preorder')?.addEventListener('click', () => this.handleBSTPreorder());
        document.getElementById('btn-tree-postorder')?.addEventListener('click', () => this.handleBSTPostorder());
        document.getElementById('btn-tree-levelorder')?.addEventListener('click', () => this.handleBSTLevelOrder());
        document.getElementById('btn-tree-min')?.addEventListener('click', () => this.handleBSTFindMin());
        document.getElementById('btn-tree-max')?.addEventListener('click', () => this.handleBSTFindMax());
        document.getElementById('btn-tree-sample')?.addEventListener('click', () => this.handleBSTSample());
        document.getElementById('btn-tree-random')?.addEventListener('click', () => this.handleBSTRandom());
        document.getElementById('btn-tree-clear')?.addEventListener('click', () => this.handleBSTClear());
        document.getElementById('btn-linear-reset')?.addEventListener('click', () => {
          state.computeSteps();
          state.notify('stepChange');
          player.play();
        });
      } else if (algo.id === 'avlTree') {
        this.linearToolbarContainer.innerHTML = `
          <span class="linear-toolbar-label">Thao tác AVL:</span>
          <div class="linear-input-group">
            <input id="tree-input-val" type="number" class="linear-input-num" value="${Math.floor(Math.random() * 80) + 10}" min="1" max="99" placeholder="Khóa x">
            <button id="btn-avl-insert" class="btn btn-primary btn-sm" title="Chèn khóa x và tự động xoay cân bằng nếu |BF| > 1">➕ Chèn(x)</button>
            <button id="btn-avl-search" class="btn btn-secondary btn-sm" title="Tìm kiếm khóa x trên cây AVL O(log n)">🔍 Tìm(x)</button>
          </div>
          <div class="avl-rotation-presets">
            <button id="btn-avl-case-ll" class="btn btn-outline btn-sm" title="Thử trường hợp Left-Left (LL) ➔ Tự xoay phải">⚡ Xoay LL</button>
            <button id="btn-avl-case-rr" class="btn btn-outline btn-sm" title="Thử trường hợp Right-Right (RR) ➔ Tự xoay trái">⚡ Xoay RR</button>
            <button id="btn-avl-case-lr" class="btn btn-outline btn-sm" title="Thử trường hợp Left-Right (LR) ➔ Tự xoay kép Trái-Phải">⚡ Xoay LR</button>
            <button id="btn-avl-case-rl" class="btn btn-outline btn-sm" title="Thử trường hợp Right-Left (RL) ➔ Tự xoay kép Phải-Trái">⚡ Xoay RL</button>
          </div>
          <button id="btn-tree-clear" class="btn btn-secondary btn-sm" title="Xóa rỗng cây AVL">🧹 Xóa rỗng</button>
          <button id="btn-linear-reset" class="btn btn-secondary btn-sm" style="margin-left: auto;">🔄 Chạy lại kịch bản</button>
        `;

        document.getElementById('btn-avl-insert')?.addEventListener('click', () => this.handleAVLInsert());
        document.getElementById('btn-avl-search')?.addEventListener('click', () => this.handleAVLSearch());
        document.getElementById('btn-avl-case-ll')?.addEventListener('click', () => this.handleAVLRotationPreset('ll'));
        document.getElementById('btn-avl-case-rr')?.addEventListener('click', () => this.handleAVLRotationPreset('rr'));
        document.getElementById('btn-avl-case-lr')?.addEventListener('click', () => this.handleAVLRotationPreset('lr'));
        document.getElementById('btn-avl-case-rl')?.addEventListener('click', () => this.handleAVLRotationPreset('rl'));
        document.getElementById('btn-tree-clear')?.addEventListener('click', () => this.handleAVLClear());
        document.getElementById('btn-linear-reset')?.addEventListener('click', () => {
          state.computeSteps();
          state.notify('stepChange');
        });
      } else if (algo.id === 'heap') {
        this.linearToolbarContainer.innerHTML = `
          <span class="linear-toolbar-label">Thao tác Max-Heap:</span>
          <div class="linear-input-group">
            <input id="tree-input-val" type="number" class="linear-input-num" value="${Math.floor(Math.random() * 80) + 10}" min="1" max="99" placeholder="Số">
            <button id="btn-heap-push" class="btn btn-primary btn-sm" title="Thêm phần tử vào cuối mảng và Sift-up nổi lên trên">📥 Thêm(x)</button>
          </div>
          <button id="btn-heap-extract" class="btn btn-secondary btn-sm" title="Rút phần tử lớn nhất ở đỉnh đống (Root) và Sift-down">⚡ Rút Max()</button>
          <button id="btn-heap-sort-run" class="btn btn-secondary btn-sm" title="Chạy toàn bộ Heap Sort từng bước">🔄 Chạy Heap Sort</button>
          <button id="btn-heap-sample" class="btn btn-outline btn-sm" title="Đổi mảng ngẫu nhiên và vun đống lại">🎲 Đổi mảng</button>
          <button id="btn-linear-reset" class="btn btn-secondary btn-sm" style="margin-left: auto;">🔄 Chạy lại kịch bản</button>
        `;

        document.getElementById('btn-heap-push')?.addEventListener('click', () => this.handleHeapPush());
        document.getElementById('btn-heap-extract')?.addEventListener('click', () => this.handleHeapExtractMax());
        document.getElementById('btn-heap-sort-run')?.addEventListener('click', () => this.handleHeapSortRun());
        document.getElementById('btn-heap-sample')?.addEventListener('click', () => this.handleHeapSample());
        document.getElementById('btn-linear-reset')?.addEventListener('click', () => {
          state.computeSteps();
          state.notify('stepChange');
        });
      }
    }
  }

  handleStackPush() {
    player.pause();
    const input = document.getElementById('linear-input-val');
    const val = input ? parseInt(input.value, 10) || 50 : 50;

    const currStep = state.getCurrentStep() || {};
    const stack = currStep.stack ? [...currStep.stack] : [];

    if (stack.length >= 8) {
      this.showFeedback('⚠️ Ngăn xếp đã đầy (Stack Overflow, tối đa 8 phần tử)!', true);
      return;
    }

    const newStack = [...stack, { value: val, id: `stack-${Date.now()}` }];
    const newStep = {
      linearType: 'stack',
      stack: newStack,
      top: newStack.length - 1,
      capacity: 8,
      activeAction: 'push_done',
      activeItem: val,
      message: `[Người dùng] Thực hiện push(${val}) thành công! Top = ${newStack.length - 1}.`,
      codeLine: 5,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.checkPracticeProgress('push');
    if (input) input.value = Math.floor(Math.random() * 80) + 10;
  }

  handleStackPop() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const stack = currStep.stack ? [...currStep.stack] : [];

    if (stack.length === 0) {
      this.showFeedback('⚠️ Ngăn xếp rỗng (Stack Underflow)! Không thể pop.', true);
      return;
    }

    const poppedVal = stack[stack.length - 1].value;
    const newStack = stack.slice(0, -1);
    const newStep = {
      linearType: 'stack',
      stack: newStack,
      top: newStack.length - 1,
      capacity: 8,
      activeAction: 'pop_done',
      activeItem: poppedVal,
      message: `[Người dùng] Thực hiện pop() thành công phần tử ${poppedVal}! Top = ${newStack.length - 1}.`,
      codeLine: 8,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.checkPracticeProgress('pop');
  }

  handleStackPeek() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const stack = currStep.stack ? [...currStep.stack] : [];

    if (stack.length === 0) {
      this.showFeedback('⚠️ Ngăn xếp đang rỗng, không có phần tử ở đỉnh.', true);
      return;
    }

    const topVal = stack[stack.length - 1].value;
    const newStep = {
      linearType: 'stack',
      stack: [...stack],
      top: stack.length - 1,
      capacity: 8,
      activeAction: 'peek',
      activeItem: topVal,
      message: `[Người dùng] Thao tác peek(): Phần tử tại đỉnh Top hiện tại là ${topVal}.`,
      codeLine: 9,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.checkPracticeProgress('peek');
  }

  handleQueueEnqueue() {
    player.pause();
    const input = document.getElementById('linear-input-val');
    const val = input ? parseInt(input.value, 10) || 50 : 50;

    const currStep = state.getCurrentStep() || {};
    const queue = currStep.queue ? [...currStep.queue] : [];

    if (queue.length >= 8) {
      this.showFeedback('⚠️ Hàng đợi đã đầy (Queue Overflow, tối đa 8 phần tử)!', true);
      return;
    }

    const newQueue = [...queue, { value: val, id: `queue-${Date.now()}` }];
    const newStep = {
      linearType: 'queue',
      queue: newQueue,
      front: 0,
      rear: newQueue.length - 1,
      capacity: 8,
      activeAction: 'enqueue_done',
      activeItem: val,
      message: `[Người dùng] Thực hiện enqueue(${val}) thành công! Đứng vào cuối hàng (Rear = ${newQueue.length - 1}).`,
      codeLine: 5,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.checkPracticeProgress('enqueue');
    if (input) input.value = Math.floor(Math.random() * 80) + 10;
  }

  handleQueueDequeue() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const queue = currStep.queue ? [...currStep.queue] : [];

    if (queue.length === 0) {
      this.showFeedback('⚠️ Hàng đợi rỗng (Queue Underflow)! Không thể dequeue.', true);
      return;
    }

    const dequeuedVal = queue[0].value;
    const newQueue = queue.slice(1);
    const newStep = {
      linearType: 'queue',
      queue: newQueue,
      front: 0,
      rear: newQueue.length - 1,
      capacity: 8,
      activeAction: 'dequeue_done',
      activeItem: dequeuedVal,
      message: `[Người dùng] Thực hiện dequeue() thành công! Phần tử ${dequeuedVal} rời khỏi đầu hàng (Front).`,
      codeLine: 8,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.checkPracticeProgress('dequeue');
  }

  handleQueueFront() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const queue = currStep.queue ? [...currStep.queue] : [];

    if (queue.length === 0) {
      this.showFeedback('⚠️ Hàng đợi rỗng, không có phần tử đầu hàng.', true);
      return;
    }

    const frontVal = queue[0].value;
    const newStep = {
      linearType: 'queue',
      queue: [...queue],
      front: 0,
      rear: queue.length - 1,
      capacity: 8,
      activeAction: 'peek',
      activeItem: frontVal,
      message: `[Người dùng] getFront(): Phần tử đang ở đầu hàng đợi hiện tại là ${frontVal}.`,
      codeLine: 11,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.checkPracticeProgress('front');
  }

  handleLLInsertHead() {
    player.pause();
    const input = document.getElementById('linear-input-val');
    const val = input ? parseInt(input.value, 10) || 50 : 50;

    const currStep = state.getCurrentStep() || {};
    const nodes = currStep.nodes ? currStep.nodes.map(n => ({ ...n })) : [];

    if (nodes.length >= 7) {
      this.showFeedback('⚠️ Danh sách đã đạt giới hạn hiển thị (7 Node)!', true);
      return;
    }

    const newId = `node-${Date.now()}`;
    const newHead = { id: newId, value: val, nextId: nodes[0]?.id || null };
    nodes.unshift(newHead);

    const newStep = {
      linearType: 'linkedList',
      nodes: nodes,
      activeNodeId: newId,
      pointers: { head: newId, tail: nodes[nodes.length - 1]?.id },
      activeAction: 'insert_head',
      message: `[Người dùng] insertHead(${val}): Tạo Node(${val}) mới và trỏ Head vào node này.`,
      codeLine: 4,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã thêm Node(${val}) vào đầu danh sách (Head)!`);
    this.checkPracticeProgress('insert_head');
    if (input) input.value = Math.floor(Math.random() * 80) + 10;
  }

  handleLLInsertTail() {
    player.pause();
    const input = document.getElementById('linear-input-val');
    const val = input ? parseInt(input.value, 10) || 50 : 50;

    const currStep = state.getCurrentStep() || {};
    const nodes = currStep.nodes ? currStep.nodes.map(n => ({ ...n })) : [];

    if (nodes.length >= 7) {
      this.showFeedback('⚠️ Danh sách đã đạt giới hạn hiển thị (7 Node)!', true);
      return;
    }

    const newId = `node-${Date.now()}`;
    const newTail = { id: newId, value: val, nextId: null };
    if (nodes.length > 0) {
      nodes[nodes.length - 1].nextId = newId;
    }
    nodes.push(newTail);

    const newStep = {
      linearType: 'linkedList',
      nodes: nodes,
      activeNodeId: newId,
      pointers: { head: nodes[0]?.id, tail: newId },
      activeAction: 'insert_tail',
      message: `[Người dùng] insertTail(${val}): Thêm Node(${val}) vào đuôi danh sách liên kết.`,
      codeLine: 8,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã thêm Node(${val}) vào đuôi danh sách (Tail)!`);
    this.checkPracticeProgress('insert_tail');
    if (input) input.value = Math.floor(Math.random() * 80) + 10;
  }

  handleLLReverse() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const nodes = currStep.nodes ? currStep.nodes.map(n => ({ ...n })) : [];

    if (nodes.length <= 1) {
      this.showFeedback('⚠️ Cần ít nhất 2 Node để thực hiện đảo ngược.', true);
      return;
    }

    nodes.reverse();
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].nextId = i < nodes.length - 1 ? nodes[i + 1].id : null;
    }

    const newStep = {
      linearType: 'linkedList',
      nodes: nodes,
      activeNodeId: nodes[0]?.id,
      pointers: { head: nodes[0]?.id, tail: nodes[nodes.length - 1]?.id },
      activeAction: 'reverse_done',
      message: `[Người dùng] Đã đảo ngược (Reverse) toàn bộ danh sách liên kết thành công! Head mới là Node(${nodes[0].value}).`,
      codeLine: 14,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback('✓ Đã đảo ngược danh sách liên kết thành công!');
    this.checkPracticeProgress('reverse');
  }

  handleLLSearch() {
    player.pause();
    const input = document.getElementById('linear-input-val');
    const val = input ? parseInt(input.value, 10) || 50 : 50;

    const currStep = state.getCurrentStep() || {};
    const nodes = currStep.nodes ? currStep.nodes.map(n => ({ ...n })) : [];

    if (nodes.length === 0) {
      this.showFeedback('⚠️ Danh sách liên kết đang rỗng, không có phần tử để tìm kiếm.', true);
      return;
    }

    const searchSteps = [];
    let foundIndex = -1;

    for (let i = 0; i < nodes.length; i++) {
      const isMatch = nodes[i].value === val;
      searchSteps.push({
        linearType: 'linkedList',
        nodes: nodes.map(n => ({ ...n })),
        activeNodeId: nodes[i].id,
        pointers: {
          head: nodes[0].id,
          tail: nodes[nodes.length - 1].id,
          curr: nodes[i].id,
          prev: i > 0 ? nodes[i - 1].id : null
        },
        activeAction: isMatch ? 'search_found' : 'search',
        activeItem: val,
        message: isMatch
          ? `★ [Người dùng] ĐÃ TÌM THẤY Node(${nodes[i].value}) tại vị trí [${i}]! Chi phí tìm kiếm O(${i + 1}).`
          : `[Tìm kiếm ${val}] Duyệt con trỏ curr đến Node(${nodes[i].value}) tại [${i}]. So sánh: ${nodes[i].value} !== ${val} ➔ bước tiếp curr = curr.next.`,
        codeLine: 28,
        isLinear: true
      });

      if (isMatch) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      searchSteps.push({
        linearType: 'linkedList',
        nodes: nodes.map(n => ({ ...n })),
        activeNodeId: null,
        pointers: {
          head: nodes[0].id,
          tail: nodes[nodes.length - 1].id,
          curr: null,
          prev: nodes[nodes.length - 1].id
        },
        activeAction: 'search_miss',
        activeItem: val,
        message: `✕ [Người dùng] curr đã trỏ tới NULL: Không tìm thấy giá trị ${val} trong danh sách! Chi phí duyệt toàn bộ O(n).`,
        codeLine: 28,
        isLinear: true
      });
      this.showFeedback(`Không tìm thấy giá trị ${val} trong danh sách liên kết.`, true);
    } else {
      this.showFeedback(`✓ Đã tìm thấy Node(${val}) tại vị trí [${foundIndex}]!`);
    }

    this.executeInteractiveSteps(searchSteps, foundIndex !== -1 ? `✓ Đã tìm thấy Node(${val}) tại vị trí [${foundIndex}]!` : `Không tìm thấy giá trị ${val} trong danh sách liên kết.`);
    if (foundIndex !== -1) soundFX.playFound();
    this.checkPracticeProgress('search');
  }

  handleLLDeleteHead() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const nodes = currStep.nodes ? currStep.nodes.map(n => ({ ...n })) : [];

    if (nodes.length === 0) {
      this.showFeedback('⚠️ Danh sách liên kết đang rỗng (Head = NULL), không thể xóa!', true);
      return;
    }

    const removedNode = nodes.shift();
    const newStep = {
      linearType: 'linkedList',
      nodes: nodes,
      activeNodeId: nodes[0]?.id || null,
      pointers: {
        head: nodes[0]?.id || null,
        tail: nodes[nodes.length - 1]?.id || null
      },
      activeAction: 'delete_head',
      activeItem: removedNode.value,
      message: nodes.length > 0
        ? `[Người dùng] Xóa Node đầu (${removedNode.value}): Dời Head = Head.next (Node ${nodes[0].value}), thu hồi bộ nhớ Node cũ. Chi phí O(1).`
        : `[Người dùng] Xóa Node đầu (${removedNode.value}): Danh sách chỉ còn 1 node, giải phóng và đưa về Head = Tail = NULL.`,
      codeLine: 4,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã xóa phần tử đầu Node(${removedNode.value}) thành công!`);
  }

  handleLLDeleteTail() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const nodes = currStep.nodes ? currStep.nodes.map(n => ({ ...n })) : [];

    if (nodes.length === 0) {
      this.showFeedback('⚠️ Danh sách liên kết đang rỗng (Tail = NULL), không thể xóa!', true);
      return;
    }

    const removedNode = nodes.pop();
    if (nodes.length > 0) {
      nodes[nodes.length - 1].nextId = null;
    }

    const newStep = {
      linearType: 'linkedList',
      nodes: nodes,
      activeNodeId: nodes[nodes.length - 1]?.id || null,
      pointers: {
        head: nodes[0]?.id || null,
        tail: nodes[nodes.length - 1]?.id || null
      },
      activeAction: 'delete_tail',
      activeItem: removedNode.value,
      message: nodes.length > 0
        ? `[Người dùng] Xóa Node đuôi (${removedNode.value}): Duyệt đến node áp chót (${nodes[nodes.length - 1].value}), gán next = NULL, cập nhật Tail. Chi phí O(n).`
        : `[Người dùng] Xóa Node đuôi (${removedNode.value}): Danh sách trở về rỗng (Head = Tail = NULL).`,
      codeLine: 8,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã xóa phần tử đuôi Node(${removedNode.value}) thành công!`);
  }

  handleLLClear() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const nodes = currStep.nodes || [];

    if (nodes.length === 0) {
      this.showFeedback('ℹ️ Danh sách liên kết đã rỗng sẵn.', false);
      return;
    }

    const newStep = {
      linearType: 'linkedList',
      nodes: [],
      activeNodeId: null,
      pointers: { head: null, tail: null },
      activeAction: 'clear',
      message: `[Người dùng] Đã giải phóng bộ nhớ và xóa rỗng toàn bộ danh sách liên kết (Head = Tail = NULL).`,
      codeLine: 1,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback('🧹 Đã xóa rỗng danh sách liên kết thành công!');
  }

  // =========================================================================
  // THAO TÁC TƯƠNG TÁC DANH SÁCH LIÊN KẾT ĐÔI (DOUBLY LINKED LIST)
  // =========================================================================

  _cloneDLLNodes(nodes) {
    return (nodes || []).map(n => ({ ...n }));
  }

  handleDLLInsertHead() {
    player.pause();
    const input = document.getElementById('dll-input-val');
    const val = input ? parseInt(input.value, 10) || 50 : 50;

    const currStep = state.getCurrentStep() || {};
    const nodes = this._cloneDLLNodes(currStep.nodes);

    if (nodes.length >= 7) {
      this.showFeedback('⚠️ Danh sách đã đạt giới hạn hiển thị (7 Node)!', true);
      return;
    }

    const newId = `dll-node-${Date.now()}`;
    const newHead = { id: newId, value: val, prevId: null, nextId: nodes[0]?.id || null };
    if (nodes.length > 0) {
      nodes[0].prevId = newId;
    }
    nodes.unshift(newHead);

    const newStep = {
      linearType: 'doublyLinkedList',
      nodes: nodes,
      activeNodeId: newId,
      pointers: { head: newId, tail: nodes[nodes.length - 1]?.id },
      activeAction: 'insert_head',
      activeItem: val,
      message: `[Người dùng] insertHead(${val}): Tạo Node(${val}), gán next ➔ Head cũ, gán prev của Head cũ ⬅ Node mới. Cập nhật Head mới. Chi phí O(1).`,
      codeLine: 3,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã thêm Node(${val}) vào đầu DSLK Đôi (Head)!`);
    soundFX.playSwap();
    this.checkPracticeProgress('insert_head');
    if (input) input.value = Math.floor(Math.random() * 80) + 10;
  }

  handleDLLInsertTail() {
    player.pause();
    const input = document.getElementById('dll-input-val');
    const val = input ? parseInt(input.value, 10) || 50 : 50;

    const currStep = state.getCurrentStep() || {};
    const nodes = this._cloneDLLNodes(currStep.nodes);

    if (nodes.length >= 7) {
      this.showFeedback('⚠️ Danh sách đã đạt giới hạn hiển thị (7 Node)!', true);
      return;
    }

    const newId = `dll-node-${Date.now()}`;
    const lastNode = nodes[nodes.length - 1];
    const newTail = { id: newId, value: val, prevId: lastNode ? lastNode.id : null, nextId: null };
    if (lastNode) {
      lastNode.nextId = newId;
    }
    nodes.push(newTail);

    const newStep = {
      linearType: 'doublyLinkedList',
      nodes: nodes,
      activeNodeId: newId,
      pointers: { head: nodes[0]?.id, tail: newId },
      activeAction: 'insert_tail',
      activeItem: val,
      message: `[Người dùng] insertTail(${val}): Nhờ con trỏ Tail trực tiếp, gán Tail.next ➔ Node mới, Node.prev ⬅ Tail cũ. Cập nhật Tail mới trong O(1)!`,
      codeLine: 7,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã thêm Node(${val}) vào đuôi DSLK Đôi (Tail) O(1)!`);
    soundFX.playSwap();
    this.checkPracticeProgress('insert_tail');
    if (input) input.value = Math.floor(Math.random() * 80) + 10;
  }

  handleDLLInsertAt() {
    player.pause();
    const inputVal = document.getElementById('dll-input-val');
    const inputIdx = document.getElementById('dll-input-idx');
    const val = inputVal ? parseInt(inputVal.value, 10) || 50 : 50;
    const k = inputIdx ? Math.max(0, parseInt(inputIdx.value, 10) || 0) : 0;

    const currStep = state.getCurrentStep() || {};
    const nodes = this._cloneDLLNodes(currStep.nodes);

    if (nodes.length >= 7) {
      this.showFeedback('⚠️ Danh sách đã đạt giới hạn hiển thị (7 Node)!', true);
      return;
    }

    if (nodes.length === 0 || k === 0) {
      this.handleDLLInsertHead();
      return;
    }

    if (k >= nodes.length) {
      this.handleDLLInsertTail();
      return;
    }

    // Chèn tại vị trí k ở giữa
    const insertSteps = [];
    // Mô phỏng duyệt đến k
    for (let i = 0; i <= k; i++) {
      insertSteps.push({
        linearType: 'doublyLinkedList',
        nodes: this._cloneDLLNodes(nodes),
        activeNodeId: nodes[i].id,
        pointers: {
          head: nodes[0].id,
          tail: nodes[nodes.length - 1].id,
          curr: nodes[i].id
        },
        activeAction: 'traverse_forward',
        activeItem: val,
        message: `[Chèn tại vị trí ${k}] Duyệt đến vị trí ${i}: curr = Node(${nodes[i].value})...`,
        codeLine: 2,
        isLinear: true
      });
    }

    // Thực hiện chèn node vào giữa
    const newId = `dll-node-${Date.now()}`;
    const prevNode = nodes[k - 1];
    const nextNode = nodes[k];
    const newNode = { id: newId, value: val, prevId: prevNode.id, nextId: nextNode.id };

    prevNode.nextId = newId;
    nextNode.prevId = newId;
    nodes.splice(k, 0, newNode);

    insertSteps.push({
      linearType: 'doublyLinkedList',
      nodes: this._cloneDLLNodes(nodes),
      activeNodeId: newId,
      pointers: {
        head: nodes[0].id,
        tail: nodes[nodes.length - 1].id,
        curr: newId
      },
      activeAction: 'insert_at',
      activeItem: val,
      message: `★ [Chèn tại vị trí ${k}] Thành công! Nối 4 liên kết: Node(${prevNode.value}).next = Node(${val}), Node(${val}).prev = Node(${prevNode.value}), Node(${val}).next = Node(${nextNode.value}), Node(${nextNode.value}).prev = Node(${val}).`,
      codeLine: 5,
      isLinear: true
    });

    this.executeInteractiveSteps(insertSteps, `✓ Đã chèn Node(${val}) vào vị trí [${k}] thành công!`);
    soundFX.playSwap();
    if (inputVal) inputVal.value = Math.floor(Math.random() * 80) + 10;
  }

  handleDLLSearch() {
    player.pause();
    const input = document.getElementById('dll-input-val');
    const val = input ? parseInt(input.value, 10) || 50 : 50;

    const currStep = state.getCurrentStep() || {};
    const nodes = this._cloneDLLNodes(currStep.nodes);

    if (nodes.length === 0) {
      this.showFeedback('⚠️ Danh sách liên kết đôi đang rỗng, không thể tìm kiếm.', true);
      return;
    }

    const searchSteps = [];
    let foundIndex = -1;

    for (let i = 0; i < nodes.length; i++) {
      const isMatch = nodes[i].value === val;
      searchSteps.push({
        linearType: 'doublyLinkedList',
        nodes: this._cloneDLLNodes(nodes),
        activeNodeId: nodes[i].id,
        pointers: {
          head: nodes[0].id,
          tail: nodes[nodes.length - 1].id,
          curr: nodes[i].id
        },
        activeAction: isMatch ? 'search_found' : 'search',
        activeItem: val,
        message: isMatch
          ? `★ [Người dùng] ĐÃ TÌM THẤY Node(${nodes[i].value}) tại vị trí [${i}]! Chi phí tìm kiếm O(${i + 1}).`
          : `[Tìm kiếm ${val}] Duyệt con trỏ curr = curr.next ➔ Node(${nodes[i].value}) tại [${i}]. So sánh: ${nodes[i].value} !== ${val}...`,
        codeLine: 10,
        isLinear: true
      });

      if (isMatch) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      searchSteps.push({
        linearType: 'doublyLinkedList',
        nodes: this._cloneDLLNodes(nodes),
        activeNodeId: null,
        pointers: {
          head: nodes[0].id,
          tail: nodes[nodes.length - 1].id,
          curr: null
        },
        activeAction: 'search_miss',
        activeItem: val,
        message: `✕ [Người dùng] curr đã duyệt tới NULL: Không tìm thấy giá trị ${val} trong danh sách liên kết đôi!`,
        codeLine: 10,
        isLinear: true
      });
    }

    this.executeInteractiveSteps(searchSteps, foundIndex !== -1 ? `✓ Đã tìm thấy Node(${val}) tại vị trí [${foundIndex}]!` : `Không tìm thấy giá trị ${val} trong DSLK Đôi.`);
    if (foundIndex !== -1) soundFX.playFound();
    else soundFX.playCompare();
  }

  handleDLLTraverseForward() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const nodes = this._cloneDLLNodes(currStep.nodes);

    if (nodes.length === 0) {
      this.showFeedback('⚠️ Danh sách rỗng, không có phần tử để duyệt.', true);
      return;
    }

    const travSteps = [];
    for (let i = 0; i < nodes.length; i++) {
      travSteps.push({
        linearType: 'doublyLinkedList',
        nodes: this._cloneDLLNodes(nodes),
        activeNodeId: nodes[i].id,
        pointers: {
          head: nodes[0].id,
          tail: nodes[nodes.length - 1].id,
          curr: nodes[i].id
        },
        activeAction: 'traverse_forward',
        message: `➡️ [Duyệt xuôi] Bước ${i + 1}/${nodes.length}: curr = Node(${nodes[i].value}) tại [${i}]. Tiếp tục qua curr.next ➔`,
        codeLine: 10,
        isLinear: true
      });
    }

    this.executeInteractiveSteps(travSteps, '✓ Đã hoàn thành duyệt xuôi từ Head ➔ Tail!');
    soundFX.playVictory();
    this.checkPracticeProgress('traverse_forward');
  }

  handleDLLTraverseBackward() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const nodes = this._cloneDLLNodes(currStep.nodes);

    if (nodes.length === 0) {
      this.showFeedback('⚠️ Danh sách rỗng, không có phần tử để duyệt.', true);
      return;
    }

    const travSteps = [];
    for (let i = nodes.length - 1; i >= 0; i--) {
      travSteps.push({
        linearType: 'doublyLinkedList',
        nodes: this._cloneDLLNodes(nodes),
        activeNodeId: nodes[i].id,
        pointers: {
          head: nodes[0].id,
          tail: nodes[nodes.length - 1].id,
          curr: nodes[i].id
        },
        activeAction: 'traverse_backward',
        message: `⬅️ [Duyệt ngược] Bước ${nodes.length - i}/${nodes.length}: curr = Node(${nodes[i].value}) tại [${i}]. Lùi về qua con trỏ curr.prev ⬅`,
        codeLine: 12,
        isLinear: true
      });
    }

    this.executeInteractiveSteps(travSteps, '✓ Đã hoàn thành duyệt ngược từ Tail ⬅ Head thành công!');
    soundFX.playVictory();
    this.checkPracticeProgress('traverse_backward');
  }

  handleDLLReverse() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const nodes = this._cloneDLLNodes(currStep.nodes);

    if (nodes.length <= 1) {
      this.showFeedback('⚠️ Cần ít nhất 2 Node để thực hiện đảo ngược.', true);
      return;
    }

    const revSteps = [];
    revSteps.push({
      linearType: 'doublyLinkedList',
      nodes: this._cloneDLLNodes(nodes),
      pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id, curr: nodes[0].id },
      activeAction: 'reverse_start',
      message: 'Bắt đầu đảo ngược DSLK Đôi: Duyệt từng node và swap(node.prev, node.next).',
      codeLine: 14,
      isLinear: true
    });

    nodes.forEach((node, idx) => {
      const temp = node.prevId;
      node.prevId = node.nextId;
      node.nextId = temp;

      revSteps.push({
        linearType: 'doublyLinkedList',
        nodes: this._cloneDLLNodes(nodes),
        activeNodeId: node.id,
        pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id, curr: node.id },
        activeAction: 'reverse_swap',
        message: `Hoán đổi cặp con trỏ tại Node(${node.value}): swap(prev, next). Con trỏ tiến trở thành con trỏ lùi.`,
        codeLine: 15,
        isLinear: true
      });
    });

    nodes.reverse();

    revSteps.push({
      linearType: 'doublyLinkedList',
      nodes: this._cloneDLLNodes(nodes),
      activeNodeId: nodes[0].id,
      pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id },
      activeAction: 'reverse_done',
      message: `Đảo ngược DSLK Đôi thành công! Hoán đổi Head ⇄ Tail: Head mới là Node(${nodes[0].value}), Tail mới là Node(${nodes[nodes.length - 1].value}).`,
      codeLine: 16,
      isLinear: true
    });

    this.executeInteractiveSteps(revSteps, '✓ Đã đảo ngược toàn bộ DSLK Đôi thành công!');
    soundFX.playVictory();
    this.checkPracticeProgress('reverse');
  }

  handleDLLDeleteHead() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const nodes = this._cloneDLLNodes(currStep.nodes);

    if (nodes.length === 0) {
      this.showFeedback('⚠️ DSLK Đôi đang rỗng (Head = NULL), không thể xóa!', true);
      return;
    }

    const removed = nodes.shift();
    if (nodes.length > 0) {
      nodes[0].prevId = null;
    }

    const newStep = {
      linearType: 'doublyLinkedList',
      nodes: nodes,
      activeNodeId: nodes[0]?.id || null,
      pointers: {
        head: nodes[0]?.id || null,
        tail: nodes[nodes.length - 1]?.id || null
      },
      activeAction: 'delete_head',
      activeItem: removed.value,
      message: nodes.length > 0
        ? `[Người dùng] Xóa Node đầu (${removed.value}): Gán Head = Head.next (Node ${nodes[0].value}), gán Head.prev = NULL. Chi phí O(1).`
        : `[Người dùng] Xóa Node đầu (${removed.value}): Danh sách chỉ còn 1 node, giải phóng đưa về Head = Tail = NULL.`,
      codeLine: 4,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã xóa phần tử đầu Node(${removed.value}) thành công!`);
    soundFX.playSwap();
  }

  handleDLLDeleteTail() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const nodes = this._cloneDLLNodes(currStep.nodes);

    if (nodes.length === 0) {
      this.showFeedback('⚠️ DSLK Đôi đang rỗng (Tail = NULL), không thể xóa!', true);
      return;
    }

    const removed = nodes.pop();
    if (nodes.length > 0) {
      nodes[nodes.length - 1].nextId = null;
    }

    const newStep = {
      linearType: 'doublyLinkedList',
      nodes: nodes,
      activeNodeId: nodes[nodes.length - 1]?.id || null,
      pointers: {
        head: nodes[0]?.id || null,
        tail: nodes[nodes.length - 1]?.id || null
      },
      activeAction: 'delete_tail',
      activeItem: removed.value,
      message: nodes.length > 0
        ? `[Người dùng] Xóa Node đuôi (${removed.value}): Nhờ con trỏ prev, gán Tail = Tail.prev (Node ${nodes[nodes.length - 1].value}), Tail.next = NULL cực nhanh trong O(1)! (Vượt trội so với DSLK Đơn mất O(n)).`
        : `[Người dùng] Xóa Node đuôi (${removed.value}): Danh sách trở về rỗng (Head = Tail = NULL).`,
      codeLine: 8,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã xóa phần tử đuôi Node(${removed.value}) trong O(1)!`);
    soundFX.playSwap();
  }

  handleDLLDeleteVal() {
    player.pause();
    const input = document.getElementById('dll-input-val');
    const val = input ? parseInt(input.value, 10) || 50 : 50;

    const currStep = state.getCurrentStep() || {};
    const nodes = this._cloneDLLNodes(currStep.nodes);

    if (nodes.length === 0) {
      this.showFeedback('⚠️ Danh sách rỗng, không có phần tử để xóa.', true);
      return;
    }

    const targetIdx = nodes.findIndex(n => n.value === val);
    if (targetIdx === -1) {
      this.showFeedback(`⚠️ Không tìm thấy Node mang giá trị ${val} để xóa.`, true);
      return;
    }

    if (targetIdx === 0) {
      this.handleDLLDeleteHead();
      return;
    }
    if (targetIdx === nodes.length - 1) {
      this.handleDLLDeleteTail();
      return;
    }

    // Xóa ở giữa: bắc cầu qua prev và next
    const prevNode = nodes[targetIdx - 1];
    const nextNode = nodes[targetIdx + 1];
    prevNode.nextId = nextNode.id;
    nextNode.prevId = prevNode.id;
    const removed = nodes.splice(targetIdx, 1)[0];

    const newStep = {
      linearType: 'doublyLinkedList',
      nodes: nodes,
      activeNodeId: prevNode.id,
      pointers: {
        head: nodes[0].id,
        tail: nodes[nodes.length - 1].id
      },
      activeAction: 'delete_val',
      activeItem: val,
      message: `[Người dùng] Xóa Node(${val}): Bắc cầu trực tiếp node.prev.next = node.next và node.next.prev = node.prev. Giải phóng Node(${val}).`,
      codeLine: 6,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã xóa Node(${val}) khỏi DSLK Đôi thành công!`);
    soundFX.playSwap();
  }

  handleDLLSample() {
    player.pause();
    const count = Math.floor(Math.random() * 2) + 3; // 3 hoặc 4 nodes
    const sampleVals = [];
    while (sampleVals.length < count) {
      const r = Math.floor(Math.random() * 85) + 12;
      if (!sampleVals.includes(r)) sampleVals.push(r);
    }

    const nodes = [];
    sampleVals.forEach((val, idx) => {
      const node = {
        id: `dll-node-sample-${idx}`,
        value: val,
        prevId: idx > 0 ? `dll-node-sample-${idx - 1}` : null,
        nextId: idx < count - 1 ? `dll-node-sample-${idx + 1}` : null
      };
      nodes.push(node);
    });

    const newStep = {
      linearType: 'doublyLinkedList',
      nodes: nodes,
      activeNodeId: nodes[0].id,
      pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id },
      activeAction: 'init',
      message: `[Người dùng] Tạo ngẫu nhiên DSLK Đôi mới gồm ${count} Node: ${sampleVals.join(' ⇄ ')}.`,
      codeLine: 1,
      isLinear: true
    };

    state.steps = [newStep];
    state.currentStepIndex = 0;
    state.notify('stepChange');
    this.showFeedback(`🎲 Đã tạo ngẫu nhiên DSLK Đôi mới gồm ${count} node!`);
    soundFX.playShuffle();
  }

  handleDLLClear() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const nodes = currStep.nodes || [];

    if (nodes.length === 0) {
      this.showFeedback('ℹ️ Danh sách liên kết đôi đã rỗng sẵn.', false);
      return;
    }

    const newStep = {
      linearType: 'doublyLinkedList',
      nodes: [],
      activeNodeId: null,
      pointers: { head: null, tail: null },
      activeAction: 'clear',
      message: `[Người dùng] Đã giải phóng bộ nhớ và xóa rỗng toàn bộ DSLK Đôi (Head = Tail = NULL).`,
      codeLine: 1,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback('🧹 Đã xóa rỗng Danh sách liên kết đôi thành công!');
    soundFX.playPop();
  }

  // =========================================================================
  // THAO TÁC TƯƠNG TÁC DANH SÁCH LIÊN KẾT VÒNG (CIRCULAR LINKED LIST)
  // =========================================================================

  handleCLLInsertHead() {
    player.pause();
    const input = document.getElementById('cll-input-val');
    const val = input ? parseInt(input.value, 10) || 50 : 50;

    const currStep = state.getCurrentStep() || {};
    const nodes = (currStep.nodes || []).map(n => ({ ...n }));

    if (nodes.length >= 7) {
      this.showFeedback('⚠️ Danh sách vòng đã đạt giới hạn hiển thị (7 Node)!', true);
      return;
    }

    const newId = `cll-node-${Date.now()}`;
    const newHead = { id: newId, value: val, nextId: nodes[0]?.id || newId };
    if (nodes.length > 0) {
      nodes[nodes.length - 1].nextId = newId;
    }
    nodes.unshift(newHead);

    const newStep = {
      linearType: 'circularLinkedList',
      nodes: nodes,
      activeNodeId: newId,
      pointers: { head: newId, tail: nodes[nodes.length - 1]?.id },
      activeAction: 'insert_head',
      activeItem: val,
      message: `[Người dùng] insertHead(${val}): Tạo Node(${val}), nối next ➔ Head cũ, Tail.next uốn vòng trỏ về Head mới! Head = Node(${val}).`,
      codeLine: 4,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã thêm Node(${val}) vào đầu DSLK Vòng!`);
    soundFX.playSwap();
    if (input) input.value = Math.floor(Math.random() * 80) + 10;
  }

  handleCLLInsertTail() {
    player.pause();
    const input = document.getElementById('cll-input-val');
    const val = input ? parseInt(input.value, 10) || 50 : 50;

    const currStep = state.getCurrentStep() || {};
    const nodes = (currStep.nodes || []).map(n => ({ ...n }));

    if (nodes.length >= 7) {
      this.showFeedback('⚠️ Danh sách vòng đã đạt giới hạn hiển thị (7 Node)!', true);
      return;
    }

    const newId = `cll-node-${Date.now()}`;
    const newTail = { id: newId, value: val, nextId: nodes[0]?.id || newId };
    if (nodes.length > 0) {
      nodes[nodes.length - 1].nextId = newId;
    }
    nodes.push(newTail);

    const newStep = {
      linearType: 'circularLinkedList',
      nodes: nodes,
      activeNodeId: newId,
      pointers: { head: nodes[0]?.id, tail: newId },
      activeAction: 'insert_tail',
      activeItem: val,
      message: `[Người dùng] insertTail(${val}): Tạo Node(${val}), nối Tail cũ ➔ Node mới, Node mới uốn vòng trỏ về Head. Cập nhật Tail mới.`,
      codeLine: 7,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã thêm Node(${val}) vào đuôi DSLK Vòng!`);
    soundFX.playSwap();
    if (input) input.value = Math.floor(Math.random() * 80) + 10;
  }

  handleCLLRoundRobin() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const nodes = (currStep.nodes || []).map(n => ({ ...n }));

    if (nodes.length === 0) {
      this.showFeedback('⚠️ Danh sách vòng đang rỗng.', true);
      return;
    }

    const currId = currStep.pointers?.curr;
    let nextIdx = 0;
    if (currId) {
      const currIdx = nodes.findIndex(n => n.id === currId);
      nextIdx = (currIdx + 1) % nodes.length;
    }

    const isLoopBack = nextIdx === 0 && nodes.length > 1;
    const targetNode = nodes[nextIdx];

    const newStep = {
      linearType: 'circularLinkedList',
      nodes: nodes,
      activeNodeId: targetNode.id,
      pointers: {
        head: nodes[0].id,
        tail: nodes[nodes.length - 1].id,
        curr: targetNode.id
      },
      activeAction: isLoopBack ? 'loop_back' : 'round_robin',
      message: isLoopBack
        ? `🔄 [Round-Robin Vòng mới] Đã hoàn thành 1 vòng tròn! Tail trỏ ngược về Head (Node ${targetNode.value}). CPU tiếp tục luân chuyển không ngừng!`
        : `⚡ [Round-Robin CPU Quantum] Cấp phát 1 lượt xử lý cho Tiến trình Node(${targetNode.value}) tại vị trí [${nextIdx}].`,
      codeLine: 10,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`⚡ CPU cấp phát lượt cho Node(${targetNode.value})!`);
    soundFX.playCompare();
  }

  handleCLLSearch() {
    player.pause();
    const input = document.getElementById('cll-input-val');
    const val = input ? parseInt(input.value, 10) || 50 : 50;

    const currStep = state.getCurrentStep() || {};
    const nodes = (currStep.nodes || []).map(n => ({ ...n }));

    if (nodes.length === 0) {
      this.showFeedback('⚠️ Danh sách rỗng, không thể tìm kiếm.', true);
      return;
    }

    const searchSteps = [];
    let found = false;

    for (let i = 0; i < nodes.length; i++) {
      const isMatch = nodes[i].value === val;
      searchSteps.push({
        linearType: 'circularLinkedList',
        nodes: nodes.map(n => ({ ...n })),
        activeNodeId: nodes[i].id,
        pointers: {
          head: nodes[0].id,
          tail: nodes[nodes.length - 1].id,
          curr: nodes[i].id
        },
        activeAction: isMatch ? 'search_found' : 'search',
        activeItem: val,
        message: isMatch
          ? `★ [DSLK Vòng] ĐÃ TÌM THẤY Node(${nodes[i].value}) tại vị trí [${i}]!`
          : `[Tìm ${val}] Duyệt qua Node(${nodes[i].value}) [${i}]...`,
        codeLine: 10,
        isLinear: true
      });
      if (isMatch) {
        found = true;
        break;
      }
    }

    if (!found) {
      searchSteps.push({
        linearType: 'circularLinkedList',
        nodes: nodes.map(n => ({ ...n })),
        activeNodeId: null,
        pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id, curr: null },
        activeAction: 'search_miss',
        message: `✕ Đã duyệt hết 1 vòng khép kín: Không tìm thấy giá trị ${val} trong DSLK Vòng!`,
        codeLine: 10,
        isLinear: true
      });
    }

    this.executeInteractiveSteps(searchSteps, found ? `✓ Đã tìm thấy Node(${val})!` : `Không tìm thấy ${val} trong vòng tròn.`);
    if (found) soundFX.playFound();
    else soundFX.playCompare();
  }

  handleCLLDeleteHead() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const nodes = (currStep.nodes || []).map(n => ({ ...n }));

    if (nodes.length === 0) {
      this.showFeedback('⚠️ DSLK Vòng đang rỗng, không thể xóa!', true);
      return;
    }

    const removed = nodes.shift();
    if (nodes.length > 0) {
      nodes[nodes.length - 1].nextId = nodes[0].id;
    }

    const newStep = {
      linearType: 'circularLinkedList',
      nodes: nodes,
      activeNodeId: nodes[0]?.id || null,
      pointers: {
        head: nodes[0]?.id || null,
        tail: nodes[nodes.length - 1]?.id || null
      },
      activeAction: 'delete_head',
      activeItem: removed.value,
      message: nodes.length > 0
        ? `[Người dùng] Xóa Node đầu (${removed.value}): Gán Head = Head.next, cập nhật Tail.next uốn vòng trỏ về Head mới (Node ${nodes[0].value}).`
        : `[Người dùng] Xóa Node đầu (${removed.value}): Danh sách trở về rỗng (Head = Tail = NULL).`,
      codeLine: 4,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã xóa Node đầu (${removed.value}) thành công!`);
    soundFX.playSwap();
  }

  handleCLLDeleteTail() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const nodes = (currStep.nodes || []).map(n => ({ ...n }));

    if (nodes.length === 0) {
      this.showFeedback('⚠️ DSLK Vòng đang rỗng, không thể xóa!', true);
      return;
    }

    const removed = nodes.pop();
    if (nodes.length > 0) {
      nodes[nodes.length - 1].nextId = nodes[0].id;
    }

    const newStep = {
      linearType: 'circularLinkedList',
      nodes: nodes,
      activeNodeId: nodes[nodes.length - 1]?.id || null,
      pointers: {
        head: nodes[0]?.id || null,
        tail: nodes[nodes.length - 1]?.id || null
      },
      activeAction: 'delete_tail',
      activeItem: removed.value,
      message: nodes.length > 0
        ? `[Người dùng] Xóa Node đuôi (${removed.value}): Duyệt đến node áp chót, cập nhật thành Tail mới và gán Tail.next trỏ về Head.`
        : `[Người dùng] Xóa Node đuôi (${removed.value}): Danh sách trở về rỗng (Head = Tail = NULL).`,
      codeLine: 7,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã xóa Node đuôi (${removed.value}) thành công!`);
    soundFX.playSwap();
  }

  handleCLLSample() {
    player.pause();
    const count = Math.floor(Math.random() * 2) + 3;
    const sampleVals = [];
    while (sampleVals.length < count) {
      const r = Math.floor(Math.random() * 85) + 12;
      if (!sampleVals.includes(r)) sampleVals.push(r);
    }

    const nodes = [];
    sampleVals.forEach((val, idx) => {
      nodes.push({
        id: `cll-node-sample-${idx}`,
        value: val,
        nextId: idx < count - 1 ? `cll-node-sample-${idx + 1}` : `cll-node-sample-0`
      });
    });

    const newStep = {
      linearType: 'circularLinkedList',
      nodes: nodes,
      activeNodeId: nodes[0].id,
      pointers: { head: nodes[0].id, tail: nodes[nodes.length - 1].id },
      activeAction: 'init',
      message: `[Người dùng] Tạo ngẫu nhiên DSLK Vòng gồm ${count} Node: ${sampleVals.join(' ➔ ')} (vòng về ${sampleVals[0]}).`,
      codeLine: 1,
      isLinear: true
    };

    state.steps = [newStep];
    state.currentStepIndex = 0;
    state.notify('stepChange');
    this.showFeedback(`🎲 Đã tạo ngẫu nhiên DSLK Vòng mới gồm ${count} node!`);
    soundFX.playShuffle();
  }

  handleCLLClear() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const nodes = currStep.nodes || [];

    if (nodes.length === 0) {
      this.showFeedback('ℹ️ Danh sách vòng đã rỗng sẵn.', false);
      return;
    }

    const newStep = {
      linearType: 'circularLinkedList',
      nodes: [],
      activeNodeId: null,
      pointers: { head: null, tail: null },
      activeAction: 'clear',
      message: `[Người dùng] Đã giải phóng toàn bộ DSLK Vòng (Head = Tail = NULL).`,
      codeLine: 1,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback('🧹 Đã xóa rỗng DSLK Vòng thành công!');
    soundFX.playPop();
  }

  // =========================================================================
  // THAO TÁC TƯƠNG TÁC HÀNG ĐỢI HAI ĐẦU (DEQUE)
  // =========================================================================

  handleDequePushFront() {
    player.pause();
    const input = document.getElementById('deque-input-val');
    const val = input ? parseInt(input.value, 10) || 45 : 45;

    const currStep = state.getCurrentStep() || {};
    const deque = currStep.deque ? [...currStep.deque] : [];

    if (deque.length >= 8) {
      this.showFeedback('⚠️ Deque đã đầy (Tối đa 8 phần tử)!', true);
      return;
    }

    const newDeque = [{ id: `deque-${Date.now()}`, value: val }, ...deque];
    const newStep = {
      linearType: 'deque',
      deque: newDeque,
      capacity: 8,
      activeAction: 'push_front',
      activeItem: val,
      activeEnds: ['front'],
      message: `[Người dùng] pushFront(${val}): Đẩy phần tử ${val} vào đầu trước (Front) trong O(1). Size = ${newDeque.length}.`,
      codeLine: 2,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã thêm ${val} vào đầu trước (Front) của Deque!`);
    soundFX.playSwap();
    if (input) input.value = Math.floor(Math.random() * 80) + 10;
  }

  handleDequePushBack() {
    player.pause();
    const input = document.getElementById('deque-input-val');
    const val = input ? parseInt(input.value, 10) || 75 : 75;

    const currStep = state.getCurrentStep() || {};
    const deque = currStep.deque ? [...currStep.deque] : [];

    if (deque.length >= 8) {
      this.showFeedback('⚠️ Deque đã đầy (Tối đa 8 phần tử)!', true);
      return;
    }

    const newDeque = [...deque, { id: `deque-${Date.now()}`, value: val }];
    const newStep = {
      linearType: 'deque',
      deque: newDeque,
      capacity: 8,
      activeAction: 'push_back',
      activeItem: val,
      activeEnds: ['rear'],
      message: `[Người dùng] pushBack(${val}): Đẩy phần tử ${val} vào đuôi sau (Rear) trong O(1). Size = ${newDeque.length}.`,
      codeLine: 3,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã thêm ${val} vào đuôi sau (Rear) của Deque!`);
    soundFX.playSwap();
    if (input) input.value = Math.floor(Math.random() * 80) + 10;
  }

  handleDequePopFront() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const deque = currStep.deque ? [...currStep.deque] : [];

    if (deque.length === 0) {
      this.showFeedback('⚠️ Deque đang rỗng, không thể popFront!', true);
      return;
    }

    const removed = deque.shift();
    const newStep = {
      linearType: 'deque',
      deque: deque,
      capacity: 8,
      activeAction: 'pop_front',
      activeItem: removed.value,
      activeEnds: ['front'],
      message: `[Người dùng] popFront(): Rút phần tử đầu trước ${removed.value} ra khỏi Deque trong O(1).`,
      codeLine: 4,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã rút ${removed.value} từ Front của Deque!`);
    soundFX.playPop();
  }

  handleDequePopBack() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const deque = currStep.deque ? [...currStep.deque] : [];

    if (deque.length === 0) {
      this.showFeedback('⚠️ Deque đang rỗng, không thể popBack!', true);
      return;
    }

    const removed = deque.pop();
    const newStep = {
      linearType: 'deque',
      deque: deque,
      capacity: 8,
      activeAction: 'pop_back',
      activeItem: removed.value,
      activeEnds: ['rear'],
      message: `[Người dùng] popBack(): Rút phần tử đuôi sau ${removed.value} ra khỏi Deque trong O(1).`,
      codeLine: 5,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback(`✓ Đã rút ${removed.value} từ Rear của Deque!`);
    soundFX.playPop();
  }

  handleDequePeekFront() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const deque = currStep.deque || [];

    if (deque.length === 0) {
      this.showFeedback('ℹ️ Deque đang rỗng.', false);
      return;
    }

    const val = deque[0].value;
    this.showFeedback(`👁️ Giá trị đang ở đầu trước (Front) là: ${val}`);
    soundFX.playCompare();
  }

  handleDequePeekRear() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const deque = currStep.deque || [];

    if (deque.length === 0) {
      this.showFeedback('ℹ️ Deque đang rỗng.', false);
      return;
    }

    const val = deque[deque.length - 1].value;
    this.showFeedback(`👁️ Giá trị đang ở đuôi sau (Rear) là: ${val}`);
    soundFX.playCompare();
  }

  handleDequePalindromeDemo() {
    player.pause();
    // Khởi tạo Deque với chuỗi đối xứng mẫu: 18, 42, 99, 42, 18
    const palVals = [18, 42, 99, 42, 18];
    const steps = [];

    const d = palVals.map((v, i) => ({ id: `pal-${i}`, value: v }));
    steps.push({
      linearType: 'deque',
      deque: [...d],
      capacity: 8,
      activeAction: 'init',
      message: 'Ứng dụng kinh điển của Deque: Kiểm tra dãy đối xứng Palindrome [18, 42, 99, 42, 18].',
      codeLine: 6,
      isLinear: true
    });

    let current = [...d];
    while (current.length > 1) {
      const f = current[0].value;
      const r = current[current.length - 1].value;

      steps.push({
        linearType: 'deque',
        deque: [...current],
        capacity: 8,
        activeAction: 'cmp_ends',
        activeEnds: ['front', 'rear'],
        message: `So sánh 2 đầu: Front (${f}) vs Rear (${r}). Hai giá trị KHỚP NHAU (${f} == ${r})!`,
        codeLine: 6,
        isLinear: true
      });

      current.shift();
      current.pop();

      steps.push({
        linearType: 'deque',
        deque: [...current],
        capacity: 8,
        activeAction: 'pop_both',
        message: `Rút đồng thời popFront() và popBack(). Còn lại ${current.length} phần tử trong ống.`,
        codeLine: 6,
        isLinear: true
      });
    }

    steps.push({
      linearType: 'deque',
      deque: [...current],
      capacity: 8,
      activeAction: 'palindrome_success',
      message: '🎉 KẾT LUẬN: Dãy số trên là PALINDROME ĐỐI XỨNG HOÀN HẢO! Deque đã chứng minh trong O(n/2) = O(n).',
      codeLine: 6,
      isLinear: true
    });

    this.executeInteractiveSteps(steps, '🎉 Đã xác minh thành công: Dãy là Palindrome!');
    soundFX.playVictory();
  }

  handleDequeClear() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const deque = currStep.deque || [];

    if (deque.length === 0) {
      this.showFeedback('ℹ️ Deque đã rỗng sẵn.', false);
      return;
    }

    const newStep = {
      linearType: 'deque',
      deque: [],
      capacity: 8,
      activeAction: 'clear',
      message: `[Người dùng] Đã xóa rỗng toàn bộ Deque (Size = 0).`,
      codeLine: 1,
      isLinear: true
    };

    state.steps.push(newStep);
    state.currentStepIndex = state.steps.length - 1;
    state.notify('stepChange');
    this.showFeedback('🧹 Đã xóa rỗng Deque thành công!');
    soundFX.playPop();
  }

  // =========================================================================
  // THAO TÁC TƯƠNG TÁC CÂY NHỊ PHÂN TÌM KIẾM (BST)
  // =========================================================================

  _cloneBST(node) {
    if (!node) return null;
    return {
      id: node.id,
      val: node.val,
      left: this._cloneBST(node.left),
      right: this._cloneBST(node.right)
    };
  }

  /**
   * Thực thi chuỗi các bước mô phỏng tương tác:
   * Nạp steps mới, bắt đầu từ Bước 0 và tự động phát chuyển động mượt mà qua từng bước
   */
  executeInteractiveSteps(actionSteps, successMsg = '') {
    if (!actionSteps || actionSteps.length === 0) return;
    player.pause();
    state.steps = actionSteps;
    state.currentStepIndex = 0;
    state.notify('stepChange');
    if (successMsg) {
      this.showFeedback(successMsg, false);
    }
    if (actionSteps.length > 1) {
      player.play();
    }
  }

  handleBSTInsert() {
    player.pause();
    const input = document.getElementById('tree-input-val');
    const val = input ? parseInt(input.value, 10) : 45;
    if (isNaN(val)) {
      this.showFeedback('⚠️ Vui lòng nhập số nguyên hợp lệ để chèn.', true);
      return;
    }

    const currStep = state.getCurrentStep() || {};
    let root = this._cloneBST(currStep.root);
    const newSteps = [];

    if (!root) {
      const newRoot = { id: `node-${Date.now()}`, val, left: null, right: null };
      newSteps.push({
        treeType: 'bst',
        root: newRoot,
        activeNodeId: newRoot.id,
        activeAction: 'insert_done',
        activeItem: val,
        message: `[Chèn ${val}] Cây BST đang rỗng: Đã tạo Node(${val}) làm Root gốc của cây!`,
        codeLine: 3,
        isTree: true
      });
      this.executeInteractiveSteps(newSteps, `✓ Đã chèn Node(${val}) làm Root của cây BST!`);
      this.checkPracticeProgress('insert');
      if (input) input.value = Math.floor(Math.random() * 80) + 10;
      return;
    }

    let curr = root;
    let inserted = false;
    let nodeCount = 100 + Math.floor(Math.random() * 900);

    while (curr && !inserted) {
      newSteps.push({
        treeType: 'bst',
        root: this._cloneBST(root),
        activeNodeId: curr.id,
        activeAction: 'compare',
        activeItem: val,
        message: `[Chèn ${val}] So sánh với Node(${curr.val}): Vì ${val} ${val < curr.val ? '<' : (val > curr.val ? '>' : '==')} ${curr.val} ➔ Rẽ sang ${val < curr.val ? 'TRÁI' : (val > curr.val ? 'PHẢI' : 'TRÙNG LẶP')}.`,
        codeLine: val < curr.val ? 4 : 5,
        isTree: true
      });

      if (val === curr.val) {
        newSteps.push({
          treeType: 'bst',
          root: this._cloneBST(root),
          activeNodeId: curr.id,
          activeAction: 'compare',
          activeItem: val,
          message: `⚠️ Giá trị ${val} đã tồn tại trong BST tại Node(${curr.val})! Cây BST không chứa khóa trùng lặp.`,
          codeLine: 1,
          isTree: true
        });
        inserted = true;
        break;
      } else if (val < curr.val) {
        if (!curr.left) {
          curr.left = { id: `node-${Date.now()}-${nodeCount++}`, val, left: null, right: null };
          newSteps.push({
            treeType: 'bst',
            root: this._cloneBST(root),
            activeNodeId: curr.left.id,
            activeAction: 'insert_done',
            activeItem: val,
            message: `✓ [Hoàn thành] Đã chèn thành công Node(${val}) vào cây con bên TRÁI của Node(${curr.val})!`,
            codeLine: 3,
            isTree: true
          });
          inserted = true;
        } else {
          curr = curr.left;
        }
      } else {
        if (!curr.right) {
          curr.right = { id: `node-${Date.now()}-${nodeCount++}`, val, left: null, right: null };
          newSteps.push({
            treeType: 'bst',
            root: this._cloneBST(root),
            activeNodeId: curr.right.id,
            activeAction: 'insert_done',
            activeItem: val,
            message: `✓ [Hoàn thành] Đã chèn thành công Node(${val}) vào cây con bên PHẢI của Node(${curr.val})!`,
            codeLine: 3,
            isTree: true
          });
          inserted = true;
        } else {
          curr = curr.right;
        }
      }
    }

    this.executeInteractiveSteps(newSteps, `✓ Đã chèn Node(${val}) vào cây BST!`);
    this.checkPracticeProgress('insert');
    if (input) input.value = Math.floor(Math.random() * 80) + 10;
  }

  handleBSTSearch() {
    player.pause();
    const input = document.getElementById('tree-input-val');
    const val = input ? parseInt(input.value, 10) : 45;
    if (isNaN(val)) {
      this.showFeedback('⚠️ Vui lòng nhập số nguyên hợp lệ để tìm kiếm.', true);
      return;
    }

    const currStep = state.getCurrentStep() || {};
    const root = this._cloneBST(currStep.root);

    if (!root) {
      this.showFeedback('⚠️ Cây BST rỗng, không có phần tử để tìm kiếm.', true);
      return;
    }

    const searchSteps = [];
    let curr = root;
    let found = false;

    while (curr) {
      if (curr.val === val) {
        searchSteps.push({
          treeType: 'bst',
          root: this._cloneBST(root),
          activeNodeId: curr.id,
          activeAction: 'search_found',
          activeItem: val,
          message: `★ [TÌM THẤY] Đã tìm thấy Node(${val}) trên BST! Chi phí tra cứu O(h).`,
          codeLine: 8,
          isTree: true
        });
        found = true;
        break;
      } else if (val < curr.val) {
        searchSteps.push({
          treeType: 'bst',
          root: this._cloneBST(root),
          activeNodeId: curr.id,
          activeAction: 'search_left',
          activeItem: val,
          message: `[Tìm ${val}] So sánh với Node(${curr.val}): Vì ${val} < ${curr.val} ➔ Rẽ sang TRÁI.`,
          codeLine: 9,
          isTree: true
        });
        curr = curr.left;
      } else {
        searchSteps.push({
          treeType: 'bst',
          root: this._cloneBST(root),
          activeNodeId: curr.id,
          activeAction: 'search_right',
          activeItem: val,
          message: `[Tìm ${val}] So sánh với Node(${curr.val}): Vì ${val} > ${curr.val} ➔ Rẽ sang PHẢI.`,
          codeLine: 10,
          isTree: true
        });
        curr = curr.right;
      }
    }

    if (!found) {
      searchSteps.push({
        treeType: 'bst',
        root: this._cloneBST(root),
        activeNodeId: null,
        activeAction: 'search_failed',
        activeItem: val,
        message: `✕ [KHÔNG TÌM THẤY] Đi tới nhánh NULL: Giá trị ${val} KHÔNG tồn tại trong cây BST.`,
        codeLine: 7,
        isTree: true
      });
    }

    this.executeInteractiveSteps(searchSteps, found ? `✓ Đã tìm thấy Node(${val}) trên BST!` : `✕ Không tìm thấy Node(${val}) trong cây BST.`);
    if (found) soundFX.playFound();
    this.checkPracticeProgress('search');
  }

  handleBSTDelete() {
    player.pause();
    const input = document.getElementById('tree-input-val');
    const val = input ? parseInt(input.value, 10) : 45;
    if (isNaN(val)) {
      this.showFeedback('⚠️ Vui lòng nhập số nguyên hợp lệ để xóa.', true);
      return;
    }

    const currStep = state.getCurrentStep() || {};
    let root = this._cloneBST(currStep.root);

    if (!root) {
      this.showFeedback('⚠️ Cây BST rỗng, không có phần tử để xóa.', true);
      return;
    }

    const delSteps = [];
    let foundNode = false;

    const deleteRec = (curr, target) => {
      if (!curr) {
        delSteps.push({
          treeType: 'bst',
          root: this._cloneBST(root),
          activeNodeId: null,
          activeAction: 'delete_not_found',
          activeItem: target,
          message: `✕ Không tìm thấy Node(${target}) trong BST để xóa.`,
          codeLine: 7,
          isTree: true
        });
        return null;
      }

      delSteps.push({
        treeType: 'bst',
        root: this._cloneBST(root),
        activeNodeId: curr.id,
        activeAction: 'compare',
        activeItem: target,
        message: `[Tìm kiếm node cần xóa] Xét Node(${curr.val}) với giá trị ${target}...`,
        codeLine: 7,
        isTree: true
      });

      if (target < curr.val) {
        curr.left = deleteRec(curr.left, target);
        return curr;
      } else if (target > curr.val) {
        curr.right = deleteRec(curr.right, target);
        return curr;
      } else {
        foundNode = true;
        // Trường hợp 1: Node lá (không có con)
        if (!curr.left && !curr.right) {
          delSteps.push({
            treeType: 'bst',
            root: this._cloneBST(root),
            activeNodeId: curr.id,
            activeAction: 'delete_leaf',
            activeItem: target,
            message: `[Trường hợp 1] Node(${curr.val}) là node lá: Ngắt liên kết và giải phóng trực tiếp.`,
            codeLine: 8,
            isTree: true
          });
          return null;
        }

        // Trường hợp 2: Node chỉ có con phải
        if (!curr.left) {
          delSteps.push({
            treeType: 'bst',
            root: this._cloneBST(root),
            activeNodeId: curr.right.id,
            activeAction: 'delete_one_child',
            activeItem: target,
            message: `[Trường hợp 2] Node(${curr.val}) chỉ có con phải: Đưa con phải Node(${curr.right.val}) lên thay thế.`,
            codeLine: 8,
            isTree: true
          });
          return curr.right;
        }

        // Trường hợp 2: Node chỉ có con trái
        if (!curr.right) {
          delSteps.push({
            treeType: 'bst',
            root: this._cloneBST(root),
            activeNodeId: curr.left.id,
            activeAction: 'delete_one_child',
            activeItem: target,
            message: `[Trường hợp 2] Node(${curr.val}) chỉ có con trái: Đưa con trái Node(${curr.left.val}) lên thay thế.`,
            codeLine: 8,
            isTree: true
          });
          return curr.left;
        }

        // Trường hợp 3: Node có cả 2 con
        let succ = curr.right;
        while (succ.left) {
          succ = succ.left;
        }

        delSteps.push({
          treeType: 'bst',
          root: this._cloneBST(root),
          activeNodeId: succ.id,
          activeAction: 'delete_two_children',
          activeItem: succ.val,
          message: `[Trường hợp 3] Node(${curr.val}) có 2 con: Tìm Inorder Successor là Node(${succ.val}) (nhỏ nhất bên phải) làm thế thân.`,
          codeLine: 9,
          isTree: true
        });

        curr.val = succ.val;
        curr.id = `node-${succ.val}-${Date.now()}`;
        curr.right = deleteRec(curr.right, succ.val);
        return curr;
      }
    };

    root = deleteRec(root, val);

    if (foundNode) {
      delSteps.push({
        treeType: 'bst',
        root: this._cloneBST(root),
        activeNodeId: null,
        activeAction: 'delete_done',
        activeItem: val,
        message: `✓ Hoàn tất thao tác xóa Node(${val})! Bất biến BST: cây con trái < gốc < cây con phải luôn được duy trì.`,
        codeLine: 8,
        isTree: true
      });
      this.executeInteractiveSteps(delSteps, `✓ Đã xóa Node(${val}) khỏi BST!`);
    } else {
      this.executeInteractiveSteps(delSteps, `✕ Không tìm thấy Node(${val}) trong BST để xóa.`);
    }
  }

  handleBSTInorder() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const root = this._cloneBST(currStep.root);

    if (!root) {
      this.showFeedback('⚠️ Cây BST rỗng, không có phần tử để duyệt.', true);
      return;
    }

    const inorderSteps = [];
    const list = [];

    const traverse = (node) => {
      if (!node) return;
      traverse(node.left);
      list.push(node.val);
      inorderSteps.push({
        treeType: 'bst',
        root: this._cloneBST(root),
        activeNodeId: node.id,
        activeAction: 'inorder_visit',
        activeItem: node.val,
        traversalResult: [...list],
        traversalType: 'Inorder (L-N-R)',
        message: `Duyệt Inorder: Thăm Node(${node.val}). Dãy tăng dần hiện tại: [ ${list.join(', ')} ].`,
        codeLine: 12,
        isTree: true
      });
      traverse(node.right);
    };

    traverse(root);

    inorderSteps.push({
      treeType: 'bst',
      root: this._cloneBST(root),
      activeNodeId: null,
      activeAction: 'complete',
      traversalResult: [...list],
      traversalType: 'Inorder (L-N-R)',
      message: `✓ Hoàn thành duyệt Inorder (L-N-R)! Thu được toàn bộ dãy số sắp xếp tăng dần: [ ${list.join(', ')} ].`,
      codeLine: 12,
      isTree: true
    });

    this.executeInteractiveSteps(inorderSteps, `✓ Đã hoàn tất duyệt Inorder: [ ${list.join(', ')} ]`);
    this.checkPracticeProgress('inorder');
  }

  handleBSTPreorder() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const root = this._cloneBST(currStep.root);

    if (!root) {
      this.showFeedback('⚠️ Cây BST rỗng, không có phần tử để duyệt.', true);
      return;
    }

    const preSteps = [];
    const list = [];

    const traverse = (node) => {
      if (!node) return;
      list.push(node.val);
      preSteps.push({
        treeType: 'bst',
        root: this._cloneBST(root),
        activeNodeId: node.id,
        activeAction: 'preorder_visit',
        activeItem: node.val,
        traversalResult: [...list],
        traversalType: 'Preorder (N-L-R)',
        message: `Duyệt Preorder: Thăm Gốc Node(${node.val}) trước, sau đó rẽ trái/phải. Dãy hiện tại: [ ${list.join(', ')} ].`,
        codeLine: 11,
        isTree: true
      });
      traverse(node.left);
      traverse(node.right);
    };

    traverse(root);

    preSteps.push({
      treeType: 'bst',
      root: this._cloneBST(root),
      activeNodeId: null,
      activeAction: 'complete',
      traversalResult: [...list],
      traversalType: 'Preorder (N-L-R)',
      message: `✓ Hoàn thành duyệt Preorder (N-L-R: Gốc ➔ Trái ➔ Phải)! Dãy thu được: [ ${list.join(', ')} ].`,
      codeLine: 11,
      isTree: true
    });

    this.executeInteractiveSteps(preSteps, `✓ Đã hoàn tất duyệt Preorder: [ ${list.join(', ')} ]`);
  }

  handleBSTPostorder() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const root = this._cloneBST(currStep.root);

    if (!root) {
      this.showFeedback('⚠️ Cây BST rỗng, không có phần tử để duyệt.', true);
      return;
    }

    const postSteps = [];
    const list = [];

    const traverse = (node) => {
      if (!node) return;
      traverse(node.left);
      traverse(node.right);
      list.push(node.val);
      postSteps.push({
        treeType: 'bst',
        root: this._cloneBST(root),
        activeNodeId: node.id,
        activeAction: 'postorder_visit',
        activeItem: node.val,
        traversalResult: [...list],
        traversalType: 'Postorder (L-R-N)',
        message: `Duyệt Postorder: Duyệt xong 2 nhánh con rồi thăm Gốc Node(${node.val}). Dãy hiện tại: [ ${list.join(', ')} ].`,
        codeLine: 12,
        isTree: true
      });
    };

    traverse(root);

    postSteps.push({
      treeType: 'bst',
      root: this._cloneBST(root),
      activeNodeId: null,
      activeAction: 'complete',
      traversalResult: [...list],
      traversalType: 'Postorder (L-R-N)',
      message: `✓ Hoàn thành duyệt Postorder (L-R-N: Trái ➔ Phải ➔ Gốc)! Dãy thu được: [ ${list.join(', ')} ].`,
      codeLine: 12,
      isTree: true
    });

    this.executeInteractiveSteps(postSteps, `✓ Đã hoàn tất duyệt Postorder: [ ${list.join(', ')} ]`);
  }

  handleBSTLevelOrder() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const root = this._cloneBST(currStep.root);

    if (!root) {
      this.showFeedback('⚠️ Cây BST rỗng, không có phần tử để duyệt.', true);
      return;
    }

    const levelSteps = [];
    const list = [];
    const queue = [root];

    while (queue.length > 0) {
      const node = queue.shift();
      list.push(node.val);
      levelSteps.push({
        treeType: 'bst',
        root: this._cloneBST(root),
        activeNodeId: node.id,
        activeAction: 'level_visit',
        activeItem: node.val,
        traversalResult: [...list],
        traversalType: 'Level-order (BFS)',
        message: `Duyệt Level-order (BFS): Thăm Node(${node.val}) ở tầng hiện tại bằng Queue. Dãy: [ ${list.join(', ')} ].`,
        codeLine: 12,
        isTree: true
      });

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    levelSteps.push({
      treeType: 'bst',
      root: this._cloneBST(root),
      activeNodeId: null,
      activeAction: 'complete',
      traversalResult: [...list],
      traversalType: 'Level-order (BFS)',
      message: `✓ Hoàn thành duyệt Level-order (BFS: Từ trên xuống dưới, từ trái sang phải)! Dãy: [ ${list.join(', ')} ].`,
      codeLine: 12,
      isTree: true
    });

    this.executeInteractiveSteps(levelSteps, `✓ Đã hoàn tất duyệt Level-order: [ ${list.join(', ')} ]`);
  }

  handleBSTFindMin() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const root = this._cloneBST(currStep.root);

    if (!root) {
      this.showFeedback('⚠️ Cây BST rỗng, không có giá trị Min.', true);
      return;
    }

    const minSteps = [];
    let curr = root;

    while (curr.left) {
      minSteps.push({
        treeType: 'bst',
        root: this._cloneBST(root),
        activeNodeId: curr.id,
        activeAction: 'search_left',
        activeItem: curr.val,
        message: `Tìm Min: Xét Node(${curr.val}). Vì vẫn còn con trái ➔ Tiếp tục rẽ sang TRÁI để tìm khóa nhỏ hơn.`,
        codeLine: 9,
        isTree: true
      });
      curr = curr.left;
    }

    minSteps.push({
      treeType: 'bst',
      root: this._cloneBST(root),
      activeNodeId: curr.id,
      activeAction: 'search_found',
      activeItem: curr.val,
      message: `★ [TÌM THẤY MIN] Node(${curr.val}) là node ngoài cùng bên TRÁI (không còn con trái)! Giá trị nhỏ nhất Min = ${curr.val}.`,
      codeLine: 8,
      isTree: true
    });

    this.executeInteractiveSteps(minSteps, `★ Giá trị nhỏ nhất của cây là Min = ${curr.val}!`);
    soundFX.playFound();
  }

  handleBSTFindMax() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const root = this._cloneBST(currStep.root);

    if (!root) {
      this.showFeedback('⚠️ Cây BST rỗng, không có giá trị Max.', true);
      return;
    }

    const maxSteps = [];
    let curr = root;

    while (curr.right) {
      maxSteps.push({
        treeType: 'bst',
        root: this._cloneBST(root),
        activeNodeId: curr.id,
        activeAction: 'search_right',
        activeItem: curr.val,
        message: `Tìm Max: Xét Node(${curr.val}). Vì vẫn còn con phải ➔ Tiếp tục rẽ sang PHẢI để tìm khóa lớn hơn.`,
        codeLine: 10,
        isTree: true
      });
      curr = curr.right;
    }

    maxSteps.push({
      treeType: 'bst',
      root: this._cloneBST(root),
      activeNodeId: curr.id,
      activeAction: 'search_found',
      activeItem: curr.val,
      message: `★ [TÌM THẤY MAX] Node(${curr.val}) là node ngoài cùng bên PHẢI (không còn con phải)! Giá trị lớn nhất Max = ${curr.val}.`,
      codeLine: 8,
      isTree: true
    });

    this.executeInteractiveSteps(maxSteps, `★ Giá trị lớn nhất của cây là Max = ${curr.val}!`);
    soundFX.playFound();
  }

  handleBSTRandom() {
    player.pause();
    const nums = [];
    while (nums.length < 6) {
      const r = Math.floor(Math.random() * 85) + 12;
      if (!nums.includes(r)) nums.push(r);
    }

    let root = null;
    const randomSteps = [];
    let nodeCount = 0;

    randomSteps.push({
      treeType: 'bst',
      root: null,
      activeNodeId: null,
      activeAction: 'init',
      message: `🎲 Khởi tạo cây BST ngẫu nhiên với tập khóa [ ${nums.join(', ')} ]...`,
      codeLine: 1,
      isTree: true
    });

    const insertHelper = (curr, val) => {
      if (!curr) {
        nodeCount++;
        return { id: `rand-node-${nodeCount}`, val, left: null, right: null };
      }
      if (val < curr.val) curr.left = insertHelper(curr.left, val);
      else if (val > curr.val) curr.right = insertHelper(curr.right, val);
      return curr;
    };

    nums.forEach(val => {
      root = insertHelper(root, val);
      randomSteps.push({
        treeType: 'bst',
        root: this._cloneBST(root),
        activeNodeId: `rand-node-${nodeCount}`,
        activeAction: 'insert_done',
        activeItem: val,
        message: `Đã chèn Node(${val}) vào cây BST.`,
        codeLine: 3,
        isTree: true
      });
    });

    this.executeInteractiveSteps(randomSteps, `🎲 Đã tạo cây BST ngẫu nhiên mới: [ ${nums.join(', ')} ]!`);
  }

  handleBSTSample() {
    player.pause();
    state.computeSteps();
    state.notify('stepChange');
    player.play();
    this.showFeedback('🌱 Đã nạp lại Cây BST chuẩn mẫu thành công!', false);
  }

  handleBSTClear() {
    player.pause();
    state.steps = [{
      treeType: 'bst',
      root: null,
      activeNodeId: null,
      activeAction: 'init',
      message: '🧹 [Người dùng] Đã xóa rỗng cây BST: Root = NULL. Bạn có thể tự do gõ số và bấm Chèn(x)!',
      codeLine: 1,
      isTree: true
    }];
    state.currentStepIndex = 0;
    state.notify('stepChange');
    this.showFeedback('🧹 Đã xóa rỗng cây BST.', false);
  }

  // =========================================================================
  // THAO TÁC TƯƠNG TÁC CÂY AVL (TỰ CÂN BẰNG)
  // =========================================================================

  _cloneAVL(node) {
    if (!node) return null;
    return {
      id: node.id,
      val: node.val,
      height: node.height,
      bf: node.bf,
      left: this._cloneAVL(node.left),
      right: this._cloneAVL(node.right)
    };
  }

  _heightAVL(node) {
    return node ? node.height : 0;
  }

  _getBFAVL(node) {
    return node ? this._heightAVL(node.left) - this._heightAVL(node.right) : 0;
  }

  _updateNodeAVL(node) {
    if (!node) return;
    node.height = 1 + Math.max(this._heightAVL(node.left), this._heightAVL(node.right));
    node.bf = this._getBFAVL(node);
  }

  _rotateRightAVL(y) {
    const x = y.left;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    this._updateNodeAVL(y);
    this._updateNodeAVL(x);
    return x;
  }

  _rotateLeftAVL(x) {
    const y = x.right;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    this._updateNodeAVL(x);
    this._updateNodeAVL(y);
    return y;
  }

  handleAVLInsert() {
    player.pause();
    const input = document.getElementById('tree-input-val');
    const val = input ? parseInt(input.value, 10) || 25 : 25;

    const currStep = state.getCurrentStep() || {};
    let root = this._cloneAVL(currStep.root);
    const avlSteps = [];

    const insertAVLRec = (node, key) => {
      if (!node) {
        return {
          id: `avl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          val: key,
          height: 1,
          bf: 0,
          left: null,
          right: null
        };
      }

      avlSteps.push({
        treeType: 'avl',
        root: this._cloneAVL(root),
        activeNodeId: node.id,
        activeAction: 'compare',
        activeItem: key,
        message: `Chèn ${key}: So sánh với Node(${node.val}, BF=${node.bf}). Rẽ sang ${key < node.val ? 'TRÁI' : 'PHẢI'}.`,
        codeLine: 1,
        isTree: true
      });

      if (key < node.val) {
        node.left = insertAVLRec(node.left, key);
      } else if (key > node.val) {
        node.right = insertAVLRec(node.right, key);
      } else {
        return node;
      }

      this._updateNodeAVL(node);
      const balance = node.bf;

      if (balance > 1 && key < node.left.val) {
        avlSteps.push({
          treeType: 'avl',
          root: this._cloneAVL(root),
          activeNodeId: node.id,
          activeAction: 'unbalanced_ll',
          activeItem: node.val,
          message: `⚠️ Phát hiện mất cân bằng Left-Left (LL) tại Node(${node.val}, BF=${balance})! Cần thực hiện phép Xoay Phải (Right Rotation).`,
          codeLine: 4,
          isTree: true
        });
        const rotated = this._rotateRightAVL(node);
        avlSteps.push({
          treeType: 'avl',
          root: this._cloneAVL(root ? (node === root ? rotated : root) : rotated),
          activeNodeId: rotated.id,
          activeAction: 'rotate_done',
          activeItem: rotated.val,
          message: `✓ Đã xoay phải tại Node(${node.val})! Node(${rotated.val}) lên làm gốc mới với BF=${rotated.bf}.`,
          codeLine: 5,
          isTree: true
        });
        return rotated;
      }

      if (balance < -1 && key > node.right.val) {
        avlSteps.push({
          treeType: 'avl',
          root: this._cloneAVL(root),
          activeNodeId: node.id,
          activeAction: 'unbalanced_rr',
          activeItem: node.val,
          message: `⚠️ Phát hiện mất cân bằng Right-Right (RR) tại Node(${node.val}, BF=${balance})! Cần thực hiện phép Xoay Trái (Left Rotation).`,
          codeLine: 6,
          isTree: true
        });
        const rotated = this._rotateLeftAVL(node);
        avlSteps.push({
          treeType: 'avl',
          root: this._cloneAVL(root ? (node === root ? rotated : root) : rotated),
          activeNodeId: rotated.id,
          activeAction: 'rotate_done',
          activeItem: rotated.val,
          message: `✓ Đã xoay trái tại Node(${node.val})! Node(${rotated.val}) lên làm gốc mới với BF=${rotated.bf}.`,
          codeLine: 7,
          isTree: true
        });
        return rotated;
      }

      if (balance > 1 && key > node.left.val) {
        avlSteps.push({
          treeType: 'avl',
          root: this._cloneAVL(root),
          activeNodeId: node.id,
          activeAction: 'unbalanced_lr',
          activeItem: node.val,
          message: `⚠️ Phát hiện mất cân bằng Left-Right (LR) tại Node(${node.val}, BF=${balance})! Cần Xoay Trái con trái rồi Xoay Phải node hiện tại.`,
          codeLine: 8,
          isTree: true
        });
        node.left = this._rotateLeftAVL(node.left);
        const rotated = this._rotateRightAVL(node);
        avlSteps.push({
          treeType: 'avl',
          root: this._cloneAVL(root ? (node === root ? rotated : root) : rotated),
          activeNodeId: rotated.id,
          activeAction: 'rotate_done',
          activeItem: rotated.val,
          message: `✓ Đã hoàn thành phép xoay kép LR! Node(${rotated.val}) lên làm gốc mới với BF=${rotated.bf}.`,
          codeLine: 9,
          isTree: true
        });
        return rotated;
      }

      if (balance < -1 && key < node.right.val) {
        avlSteps.push({
          treeType: 'avl',
          root: this._cloneAVL(root),
          activeNodeId: node.id,
          activeAction: 'unbalanced_rl',
          activeItem: node.val,
          message: `⚠️ Phát hiện mất cân bằng Right-Left (RL) tại Node(${node.val}, BF=${balance})! Cần Xoay Phải con phải rồi Xoay Trái node hiện tại.`,
          codeLine: 10,
          isTree: true
        });
        node.right = this._rotateRightAVL(node.right);
        const rotated = this._rotateLeftAVL(node);
        avlSteps.push({
          treeType: 'avl',
          root: this._cloneAVL(root ? (node === root ? rotated : root) : rotated),
          activeNodeId: rotated.id,
          activeAction: 'rotate_done',
          activeItem: rotated.val,
          message: `✓ Đã hoàn thành phép xoay kép RL! Node(${rotated.val}) lên làm gốc mới với BF=${rotated.bf}.`,
          codeLine: 11,
          isTree: true
        });
        return rotated;
      }

      return node;
    };

    root = insertAVLRec(root, val);

    avlSteps.push({
      treeType: 'avl',
      root: this._cloneAVL(root),
      activeNodeId: null,
      activeAction: 'insert_done',
      activeItem: val,
      message: `✓ [Người dùng] Đã chèn Node(${val}) vào cây AVL thành công! Chiều cao luôn được duy trì tối ưu O(log n).`,
      codeLine: 2,
      isTree: true
    });

    this.executeInteractiveSteps(avlSteps, `✓ Đã chèn Node(${val}) vào cây AVL thành công!`);
    this.checkPracticeProgress('insert');
    if (input) input.value = Math.floor(Math.random() * 80) + 10;
  }

  handleAVLSearch() {
    player.pause();
    const input = document.getElementById('tree-input-val');
    const val = input ? parseInt(input.value, 10) || 25 : 25;

    const currStep = state.getCurrentStep() || {};
    const root = this._cloneAVL(currStep.root);

    if (!root) {
      this.showFeedback('⚠️ Cây AVL rỗng, không có phần tử để tìm kiếm.', true);
      return;
    }

    const searchSteps = [];
    let curr = root;
    let found = false;

    while (curr) {
      if (curr.val === val) {
        searchSteps.push({
          treeType: 'avl',
          root: this._cloneAVL(root),
          activeNodeId: curr.id,
          activeAction: 'search_found',
          activeItem: val,
          message: `★ [Người dùng] ĐÃ TÌM THẤY Node(${val}) trên Cây AVL! Đảm bảo thời gian tra cứu O(log n).`,
          codeLine: 1,
          isTree: true
        });
        found = true;
        break;
      } else if (val < curr.val) {
        searchSteps.push({
          treeType: 'avl',
          root: this._cloneAVL(root),
          activeNodeId: curr.id,
          activeAction: 'search_left',
          activeItem: val,
          message: `Tìm ${val}: So sánh với Node(${curr.val}). Vì ${val} < ${curr.val} ➔ rẽ sang TRÁI.`,
          codeLine: 1,
          isTree: true
        });
        curr = curr.left;
      } else {
        searchSteps.push({
          treeType: 'avl',
          root: this._cloneAVL(root),
          activeNodeId: curr.id,
          activeAction: 'search_right',
          activeItem: val,
          message: `Tìm ${val}: So sánh với Node(${curr.val}). Vì ${val} > ${curr.val} ➔ rẽ sang PHẢI.`,
          codeLine: 1,
          isTree: true
        });
        curr = curr.right;
      }
    }

    if (!found) {
      searchSteps.push({
        treeType: 'avl',
        root: this._cloneAVL(root),
        activeNodeId: null,
        activeAction: 'search_failed',
        activeItem: val,
        message: `✕ [Người dùng] Không tìm thấy giá trị ${val} trong cây AVL.`,
        codeLine: 1,
        isTree: true
      });
    }

    this.executeInteractiveSteps(searchSteps, found ? `✓ Đã tìm thấy Node(${val}) trên Cây AVL!` : `✕ Không tìm thấy Node(${val}) trong cây AVL.`);
    if (found) soundFX.playFound();
    this.checkPracticeProgress('search');
  }

  handleAVLRotationPreset(type) {
    player.pause();
    let sequence = [];
    let desc = '';
    if (type === 'll') {
      sequence = [30, 20, 10];
      desc = 'Kịch bản Left-Left (LL): Chèn [30, 20, 10] khiến Node(30) có BF = +2 ➔ Tự kích hoạt Xoay Phải (Right Rotation).';
    } else if (type === 'rr') {
      sequence = [10, 20, 30];
      desc = 'Kịch bản Right-Right (RR): Chèn [10, 20, 30] khiến Node(10) có BF = -2 ➔ Tự kích hoạt Xoay Trái (Left Rotation).';
    } else if (type === 'lr') {
      sequence = [30, 10, 20];
      desc = 'Kịch bản Left-Right (LR): Chèn [30, 10, 20] khiến Node(30) có BF = +2 và con trái lệch phải ➔ Xoay kép Trái-Phải.';
    } else if (type === 'rl') {
      sequence = [10, 30, 20];
      desc = 'Kịch bản Right-Left (RL): Chèn [10, 30, 20] khiến Node(10) có BF = -2 và con phải lệch trái ➔ Xoay kép Phải-Trái.';
    }

    const steps = [];
    let root = null;

    steps.push({
      treeType: 'avl',
      root: null,
      activeNodeId: null,
      activeAction: 'init',
      message: `Bắt đầu mô phỏng ${desc}`,
      codeLine: 1,
      isTree: true
    });

    const insertHelper = (node, key) => {
      if (!node) {
        return {
          id: `avl-preset-${key}`,
          val: key,
          height: 1,
          bf: 0,
          left: null,
          right: null
        };
      }
      if (key < node.val) node.left = insertHelper(node.left, key);
      else if (key > node.val) node.right = insertHelper(node.right, key);

      this._updateNodeAVL(node);
      const balance = node.bf;

      if (balance > 1 && key < node.left.val) {
        steps.push({
          treeType: 'avl',
          root: this._cloneAVL(root),
          activeNodeId: node.id,
          activeAction: 'unbalanced_ll',
          activeItem: node.val,
          message: `⚠️ Mất cân bằng LL tại Node(${node.val}, BF=${balance})! Chuẩn bị xoay phải.`,
          codeLine: 4,
          isTree: true
        });
        const rot = this._rotateRightAVL(node);
        steps.push({
          treeType: 'avl',
          root: this._cloneAVL(node === root ? rot : root),
          activeNodeId: rot.id,
          activeAction: 'rotate_done',
          activeItem: rot.val,
          message: `✓ Đã xoay phải thành công! Node(${rot.val}) trở thành gốc với BF=${rot.bf}.`,
          codeLine: 5,
          isTree: true
        });
        return rot;
      }
      if (balance < -1 && key > node.right.val) {
        steps.push({
          treeType: 'avl',
          root: this._cloneAVL(root),
          activeNodeId: node.id,
          activeAction: 'unbalanced_rr',
          activeItem: node.val,
          message: `⚠️ Mất cân bằng RR tại Node(${node.val}, BF=${balance})! Chuẩn bị xoay trái.`,
          codeLine: 6,
          isTree: true
        });
        const rot = this._rotateLeftAVL(node);
        steps.push({
          treeType: 'avl',
          root: this._cloneAVL(node === root ? rot : root),
          activeNodeId: rot.id,
          activeAction: 'rotate_done',
          activeItem: rot.val,
          message: `✓ Đã xoay trái thành công! Node(${rot.val}) trở thành gốc với BF=${rot.bf}.`,
          codeLine: 7,
          isTree: true
        });
        return rot;
      }
      if (balance > 1 && key > node.left.val) {
        steps.push({
          treeType: 'avl',
          root: this._cloneAVL(root),
          activeNodeId: node.id,
          activeAction: 'unbalanced_lr',
          activeItem: node.val,
          message: `⚠️ Mất cân bằng LR tại Node(${node.val}, BF=${balance})! Chuẩn bị xoay kép LR.`,
          codeLine: 8,
          isTree: true
        });
        node.left = this._rotateLeftAVL(node.left);
        const rot = this._rotateRightAVL(node);
        steps.push({
          treeType: 'avl',
          root: this._cloneAVL(node === root ? rot : root),
          activeNodeId: rot.id,
          activeAction: 'rotate_done',
          activeItem: rot.val,
          message: `✓ Đã xoay kép LR thành công! Node(${rot.val}) trở thành gốc với BF=${rot.bf}.`,
          codeLine: 9,
          isTree: true
        });
        return rot;
      }
      if (balance < -1 && key < node.right.val) {
        steps.push({
          treeType: 'avl',
          root: this._cloneAVL(root),
          activeNodeId: node.id,
          activeAction: 'unbalanced_rl',
          activeItem: node.val,
          message: `⚠️ Mất cân bằng RL tại Node(${node.val}, BF=${balance})! Chuẩn bị xoay kép RL.`,
          codeLine: 10,
          isTree: true
        });
        node.right = this._rotateRightAVL(node.right);
        const rot = this._rotateLeftAVL(node);
        steps.push({
          treeType: 'avl',
          root: this._cloneAVL(node === root ? rot : root),
          activeNodeId: rot.id,
          activeAction: 'rotate_done',
          activeItem: rot.val,
          message: `✓ Đã xoay kép RL thành công! Node(${rot.val}) trở thành gốc với BF=${rot.bf}.`,
          codeLine: 11,
          isTree: true
        });
        return rot;
      }

      return node;
    };

    sequence.forEach(x => {
      root = insertHelper(root, x);
      steps.push({
        treeType: 'avl',
        root: this._cloneAVL(root),
        activeNodeId: `avl-preset-${x}`,
        activeAction: 'insert_done',
        activeItem: x,
        message: `Đã chèn Node(${x}) vào cây AVL.`,
        codeLine: 2,
        isTree: true
      });
    });

    this.executeInteractiveSteps(steps, `⚡ Đã kích hoạt mô phỏng ${type.toUpperCase()}`);
    this.checkPracticeProgress('rotate');
  }

  handleAVLClear() {
    player.pause();
    state.steps = [{
      treeType: 'avl',
      root: null,
      activeNodeId: null,
      activeAction: 'init',
      message: '🧹 [Người dùng] Đã xóa rỗng cây AVL: Root = NULL. Hãy nhập số và bấm Chèn(x) để xem cây tự xoay cân bằng!',
      codeLine: 1,
      isTree: true
    }];
    state.currentStepIndex = 0;
    state.notify('stepChange');
    this.showFeedback('🧹 Đã xóa rỗng cây AVL.', false);
  }

  // =========================================================================
  // THAO TÁC TƯƠNG TÁC BINARY HEAP & HEAP SORT
  // =========================================================================

  _arrayToHeapTree(arrayData, heapLimit) {
    const limit = typeof heapLimit === 'number' ? heapLimit : arrayData.length;
    const buildSubtree = (i) => {
      if (i >= limit || !arrayData[i]) return null;
      return {
        id: arrayData[i].id,
        val: arrayData[i].value,
        index: i,
        left: buildSubtree(2 * i + 1),
        right: buildSubtree(2 * i + 2)
      };
    };
    return buildSubtree(0);
  }

  handleHeapPush() {
    player.pause();
    const input = document.getElementById('tree-input-val');
    const val = input ? parseInt(input.value, 10) || 85 : 85;

    const currStep = state.getCurrentStep() || {};
    const heapArr = currStep.array ? currStep.array.map(x => ({ ...x })) : [];

    if (heapArr.length >= 12) {
      this.showFeedback('⚠️ Max-Heap đã đạt giới hạn trực quan (12 phần tử)!', true);
      return;
    }

    const newId = `h-${Date.now()}`;
    heapArr.push({ id: newId, value: val });
    const heapSteps = [];
    const n = heapArr.length;

    heapSteps.push({
      treeType: 'heap',
      root: this._arrayToHeapTree(heapArr, n),
      array: heapArr.map(x => ({ ...x })),
      heapSize: n,
      activeAction: 'push_leaf',
      highlights: { [n - 1]: 'cmp' },
      message: `[Người dùng] Thêm phần tử ${val} vào cuối mảng (Lá mới tại index [${n - 1}]). Chuẩn bị Sift-up lên trên...`,
      codeLine: 1,
      isTree: true
    });

    let i = n - 1;
    while (i > 0) {
      const parentIdx = Math.floor((i - 1) / 2);
      heapSteps.push({
        treeType: 'heap',
        root: this._arrayToHeapTree(heapArr, n),
        array: heapArr.map(x => ({ ...x })),
        heapSize: n,
        activeAction: 'sift_up_check',
        highlights: { [i]: 'cmp', [parentIdx]: 'cmp' },
        message: `Sift-up: So sánh phần tử con ${val} tại [${i}] với cha ${heapArr[parentIdx].value} tại [${parentIdx}].`,
        codeLine: 2,
        isTree: true
      });

      if (heapArr[i].value > heapArr[parentIdx].value) {
        const temp = heapArr[i];
        heapArr[i] = heapArr[parentIdx];
        heapArr[parentIdx] = temp;

        heapSteps.push({
          treeType: 'heap',
          root: this._arrayToHeapTree(heapArr, n),
          array: heapArr.map(x => ({ ...x })),
          heapSize: n,
          activeAction: 'sift_up_swap',
          highlights: { [parentIdx]: 'swap' },
          message: `Vì ${val} > ${heapArr[i].value}, hoán đổi đưa ${val} lên cha tại index [${parentIdx}].`,
          codeLine: 4,
          isTree: true
        });

        i = parentIdx;
      } else {
        break;
      }
    }

    heapSteps.push({
      treeType: 'heap',
      root: this._arrayToHeapTree(heapArr, n),
      array: heapArr.map(x => ({ ...x })),
      heapSize: n,
      activeAction: 'push_done',
      highlights: { [i]: 'sorted' },
      message: `✓ Hoàn thành Sift-up! Max-Heap đã đạt trạng thái cân bằng hoàn hảo (A[cha] >= A[con]).`,
      codeLine: 5,
      isTree: true
    });

    this.executeInteractiveSteps(heapSteps, `✓ Đã thêm phần tử ${val} và Sift-up lên vị trí cân bằng của Max-Heap!`);
    this.checkPracticeProgress('push');
    if (input) input.value = Math.floor(Math.random() * 80) + 10;
  }

  handleHeapExtractMax() {
    player.pause();
    const currStep = state.getCurrentStep() || {};
    const heapArr = currStep.array ? currStep.array.map(x => ({ ...x })) : [];

    if (heapArr.length === 0) {
      this.showFeedback('⚠️ Max-Heap rỗng, không thể rút phần tử.', true);
      return;
    }

    const extractSteps = [];
    const maxVal = heapArr[0].value;

    extractSteps.push({
      treeType: 'heap',
      root: this._arrayToHeapTree(heapArr, heapArr.length),
      array: heapArr.map(x => ({ ...x })),
      heapSize: heapArr.length,
      activeAction: 'extract_max',
      highlights: { 0: 'sorted' },
      message: `[Người dùng] Rút phần tử lớn nhất Max = ${maxVal} ở đỉnh Root [0]!`,
      codeLine: 5,
      isTree: true
    });

    if (heapArr.length === 1) {
      heapArr.pop();
      extractSteps.push({
        treeType: 'heap',
        root: null,
        array: [],
        heapSize: 0,
        activeAction: 'complete',
        message: 'Max-Heap trở về trạng thái rỗng.',
        codeLine: 5,
        isTree: true
      });
      this.executeInteractiveSteps(extractSteps, `✓ Đã rút phần tử Max = ${maxVal}! Heap trở về rỗng.`);
      this.checkPracticeProgress('extract');
      return;
    }

    const lastItem = heapArr.pop();
    heapArr[0] = lastItem;
    const n = heapArr.length;

    extractSteps.push({
      treeType: 'heap',
      root: this._arrayToHeapTree(heapArr, n),
      array: heapArr.map(x => ({ ...x })),
      heapSize: n,
      activeAction: 'replace_root',
      highlights: { 0: 'swap' },
      message: `Đưa phần tử cuối cùng (${lastItem.value}) lên đỉnh Root [0]. Bắt đầu Heapify-down (Sift-down)...`,
      codeLine: 6,
      isTree: true
    });

    let i = 0;
    while (true) {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < n && heapArr[left].value > heapArr[largest].value) largest = left;
      if (right < n && heapArr[right].value > heapArr[largest].value) largest = right;

      if (largest !== i) {
        extractSteps.push({
          treeType: 'heap',
          root: this._arrayToHeapTree(heapArr, n),
          array: heapArr.map(x => ({ ...x })),
          heapSize: n,
          activeAction: 'heapify_down_cmp',
          highlights: { [i]: 'cmp', [largest]: 'cmp' },
          message: `Sift-down: Node cha (${heapArr[i].value}) nhỏ hơn con lớn nhất (${heapArr[largest].value} tại [${largest}]). Hoán đổi!`,
          codeLine: 3,
          isTree: true
        });

        const temp = heapArr[i];
        heapArr[i] = heapArr[largest];
        heapArr[largest] = temp;
        i = largest;
      } else {
        break;
      }
    }

    extractSteps.push({
      treeType: 'heap',
      root: this._arrayToHeapTree(heapArr, n),
      array: heapArr.map(x => ({ ...x })),
      heapSize: n,
      activeAction: 'extract_done',
      highlights: { 0: 'sorted' },
      message: `✓ Hoàn tất rút Max (${maxVal}) và vun đống lại! Max mới tại đỉnh là ${heapArr[0].value}.`,
      codeLine: 5,
      isTree: true
    });

    this.executeInteractiveSteps(extractSteps, `✓ Hoàn tất rút phần tử lớn nhất Max = ${maxVal} và vun đống lại!`);
    this.checkPracticeProgress('extract');
  }

  handleHeapSortRun() {
    player.pause();
    state.computeSteps();
    state.notify('stepChange');
    player.play();
    this.showFeedback('🔄 Đang chạy mô phỏng toàn bộ Heap Sort...', false);
  }

  handleHeapSample() {
    player.pause();
    state.generateRandomArray();
    state.computeSteps();
    state.notify('stepChange');
    this.showFeedback('🎲 Đã tạo mảng ngẫu nhiên và vun đống Max-Heap mới!', false);
  }
}
