/**
 * DSA Visualizer - Interactive Sorting Controller (js/interactive-sort.js)
 * Quản lý tương tác người dùng tự sắp xếp bằng tay: Kéo-thả (Drag & Drop) hoặc Click-to-Swap.
 * - Chế độ Xếp tự do ('setup'): Thoải mái đổi chỗ mảng đề bài, không ghi bước ở bảng dưới.
 * - Chế độ Làm bài ('practice'): Kiểm tra logic nghiêm ngặt từng bước theo thuật toán (trừ search).
 *   Ghi nhận bước làm vào bảng chạy tay. Nếu sai báo lỗi chi tiết, có nút Làm lại từ đầu!
 * - Hệ thống Gợi ý (Hint System): Bấm 'Gợi ý' để phát sáng 2 ô cần đổi tiếp theo.
 * - Hiệu ứng âm thanh Web Audio & Pháo hoa Confetti chúc mừng.
 */

import { state } from './state.js';
import { player } from './player.js';
import { PracticeEngine } from './practice-verifier.js';
import { soundFX } from './audio.js';
import { fireConfetti } from './confetti.js';

export class InteractiveSortController {
  constructor() {
    this.canvasContainer = document.getElementById('visualizer-canvas');
    this.btnPracticeHint = document.getElementById('btn-practice-hint');
    this.selectedElement = null; // Dùng cho Click-to-Swap
    this.selectedIndex = null;
    this.draggedElement = null;  // Dùng cho Drag & Drop
    this.draggedIndex = null;

    this.practiceEngine = new PracticeEngine();

    this.initEvents();
    this.initEngineSync();
  }

  /**
   * Đồng bộ hóa bộ máy kiểm tra PracticeEngine với StateStore
   */
  initEngineSync() {
    if (state.arrayData && state.arrayData.length > 0) {
      this.practiceEngine.init(state.currentAlgorithmId, state.arrayData);
    }

    state.subscribe((eventType) => {
      if (['init', 'algorithmChange', 'arrayChange'].includes(eventType)) {
        this.practiceEngine.init(state.currentAlgorithmId, state.arrayData);
      } else if (['practiceRestart', 'practiceStart', 'modeChange'].includes(eventType)) {
        this.practiceEngine.init(state.currentAlgorithmId, state.arrayData);
      }
    });
  }

  /**
   * Đăng ký sự kiện thông qua Event Delegation trên container
   */
  initEvents() {
    if (!this.canvasContainer) return;

    // 1. Drag & Drop HTML5 Events
    this.canvasContainer.addEventListener('dragstart', (e) => this.handleDragStart(e));
    this.canvasContainer.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.canvasContainer.addEventListener('dragenter', (e) => this.handleDragEnter(e));
    this.canvasContainer.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    this.canvasContainer.addEventListener('drop', (e) => this.handleDrop(e));
    this.canvasContainer.addEventListener('dragend', () => this.handleDragEnd());

    // 2. Click-to-Swap (hỗ trợ cả chạm di động và click chuột)
    this.canvasContainer.addEventListener('click', (e) => this.handleClick(e));

    // 3. Hủy chọn nếu click ra ngoài vùng mô phỏng
    document.addEventListener('click', (e) => {
      if (!this.canvasContainer.contains(e.target) && this.selectedElement) {
        this.clearSelection();
      }
    });

    // 4. Hủy chọn khi bấm phím Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSelection();
      }
    });

    // 5. Nút Gợi ý bước kế tiếp
    this.btnPracticeHint?.addEventListener('click', () => this.showHint());
  }

  /**
   * Cung cấp gợi ý bước tiếp theo: phát sáng viền cặp ô cần đổi và phát chuông gợi ý
   */
  showHint() {
    player.pause();
    if (state.interactionMode === 'setup') {
      const msgText = document.getElementById('step-message-text');
      if (msgText) {
        msgText.textContent = "💡 Bạn đang ở chế độ 'Xếp tự do'. Hãy chuyển sang '🎯 Làm bài' để thực hành và nhận gợi ý!";
      }
      return;
    }

    const hint = this.practiceEngine.getHint();
    if (!hint) return;

    soundFX.playHint();

    const msgBox = document.getElementById('step-message-box');
    const msgText = document.getElementById('step-message-text');
    if (msgText) {
      msgText.textContent = hint.message;
    }
    if (msgBox) {
      msgBox.classList.remove('user-wrong');
      msgBox.classList.add('user-correct');
    }

    if (hint.from >= 0 && hint.to >= 0 && this.canvasContainer) {
      const items = this.canvasContainer.querySelectorAll('.bar-wrapper, .tile-wrapper');
      [hint.from, hint.to].forEach(idx => {
        const el = items[idx];
        if (el) {
          el.classList.add('is-hint-pulse');
          setTimeout(() => {
            el.classList.remove('is-hint-pulse');
          }, 2400);
        }
      });
    }
  }

  /**
   * Tìm wrapper chứa phần tử (cột hoặc ô số)
   */
  getItemWrapper(target) {
    if (!target) return null;
    return target.closest('.bar-wrapper, .tile-wrapper');
  }

  /**
   * Lấy vị trí chỉ số (index) hiện tại của phần tử trong mảng
   */
  getItemIndex(wrapper) {
    if (!wrapper) return -1;
    if (wrapper.dataset.index !== undefined && wrapper.dataset.index !== '') {
      const idx = Number(wrapper.dataset.index);
      if (!isNaN(idx)) return idx;
    }
    if (wrapper.parentElement) {
      return Array.from(wrapper.parentElement.children).indexOf(wrapper);
    }
    return -1;
  }

  /* --------------------------------------------------------------------------
     1. Xử lý Drag & Drop
     -------------------------------------------------------------------------- */
  handleDragStart(e) {
    const wrapper = this.getItemWrapper(e.target);
    if (!wrapper) return;

    player.pause();

    this.draggedElement = wrapper;
    this.draggedIndex = this.getItemIndex(wrapper);

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(this.draggedIndex));

    setTimeout(() => {
      if (this.draggedElement) {
        this.draggedElement.classList.add('is-dragging');
      }
    }, 0);
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  handleDragEnter(e) {
    e.preventDefault();
    const wrapper = this.getItemWrapper(e.target);
    if (wrapper && wrapper !== this.draggedElement) {
      wrapper.classList.add('drag-over');
    }
  }

  handleDragLeave(e) {
    const wrapper = this.getItemWrapper(e.target);
    if (wrapper) {
      wrapper.classList.remove('drag-over');
    }
  }

  handleDrop(e) {
    e.preventDefault();
    const targetWrapper = this.getItemWrapper(e.target);
    if (!targetWrapper) return;

    targetWrapper.classList.remove('drag-over');
    const targetIdx = this.getItemIndex(targetWrapper);

    let sourceIdx = this.draggedIndex;
    const rawData = e.dataTransfer.getData('text/plain');
    if (rawData !== '' && !isNaN(Number(rawData))) {
      sourceIdx = Number(rawData);
    }

    if (sourceIdx !== null && sourceIdx !== -1 && targetIdx !== -1 && sourceIdx !== targetIdx) {
      this.executeSwap(sourceIdx, targetIdx);
    }

    this.clearDragState();
  }

  handleDragEnd() {
    this.clearDragState();
  }

  clearDragState() {
    if (this.draggedElement) {
      this.draggedElement.classList.remove('is-dragging');
      this.draggedElement = null;
    }
    this.draggedIndex = null;

    const allOver = this.canvasContainer.querySelectorAll('.drag-over');
    allOver.forEach(el => el.classList.remove('drag-over'));
  }

  /* --------------------------------------------------------------------------
     2. Xử lý Click-to-Swap (Bấm 2 ô liên tiếp để đổi chỗ)
     -------------------------------------------------------------------------- */
  handleClick(e) {
    const wrapper = this.getItemWrapper(e.target);
    if (!wrapper) return;

    player.pause();

    const clickedIdx = this.getItemIndex(wrapper);
    if (clickedIdx === -1) return;

    // Nếu chưa chọn phần tử đầu tiên
    if (this.selectedElement === null) {
      this.selectedElement = wrapper;
      this.selectedIndex = clickedIdx;
      wrapper.classList.add('is-selected-for-swap');
      return;
    }

    // Nếu bấm lại chính phần tử đã chọn -> hủy chọn
    if (this.selectedElement === wrapper || this.selectedIndex === clickedIdx) {
      this.clearSelection();
      return;
    }

    // Bấm phần tử thứ 2 -> thực hiện hoán đổi!
    const fromIdx = this.selectedIndex;
    const toIdx = clickedIdx;
    this.clearSelection();
    this.executeSwap(fromIdx, toIdx);
  }

  clearSelection() {
    if (this.selectedElement) {
      this.selectedElement.classList.remove('is-selected-for-swap');
      this.selectedElement = null;
    }
    this.selectedIndex = null;
  }

  /* --------------------------------------------------------------------------
     3. Thực thi Hoán đổi Người dùng & Xét tính đúng/sai
     -------------------------------------------------------------------------- */
  executeSwap(fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    player.pause();

    const val1 = state.arrayData[fromIdx]?.value ?? 0;
    const val2 = state.arrayData[toIdx]?.value ?? 0;

    // 1. Chế độ XẾP MẢNG TỰ DO (SETUP MODE):
    if (state.interactionMode === 'setup') {
      soundFX.playSwap(val1, val2);
      const evalResult = {
        isCorrect: true,
        isAllSorted: false,
        badgeText: '🛠️ Xếp tự do',
        message: `Đã đổi chỗ vị trí [${fromIdx}] (${val1}) và [${toIdx}] (${val2}) trong mảng đề bài.`
      };
      state.applyUserSwap(fromIdx, toIdx, evalResult);
      this.practiceEngine.init(state.currentAlgorithmId, state.arrayData);
      return;
    }

    // 2. Chế độ THỰC HÀNH LÀM BÀI (PRACTICE MODE):
    const evalResult = this.practiceEngine.evaluate(fromIdx, toIdx);

    // Xử lý âm thanh & hiệu ứng thị giác theo kết quả
    if (evalResult && evalResult.isCorrect === false && !evalResult.isSearch) {
      soundFX.playWrong();
      this.triggerErrorShake(fromIdx, toIdx);
    } else if (evalResult && evalResult.isAllSorted) {
      soundFX.playCorrect();
      setTimeout(() => {
        soundFX.playVictory(state.arrayData);
        fireConfetti(3200);
      }, 350);
    } else {
      soundFX.playCorrect();
    }

    state.applyUserSwap(fromIdx, toIdx, evalResult);
  }

  /**
   * Tạo hiệu ứng rung / viền đỏ cảnh báo khi người dùng chọn sai cặp
   */
  triggerErrorShake(idx1, idx2) {
    if (!this.canvasContainer) return;
    const items = this.canvasContainer.querySelectorAll('.bar-wrapper, .tile-wrapper');
    [idx1, idx2].forEach(idx => {
      const el = items[idx];
      if (el) {
        el.classList.add('is-shake-error');
        setTimeout(() => {
          el.classList.remove('is-shake-error');
        }, 650);
      }
    });
  }
}
