/**
 * DSA Visualizer - Player Controller (js/player.js)
 * Điều khiển phát / tạm dừng / tua bước, quản lý timer và phím tắt toàn cục.
 * Module này không trực tiếp can thiệp DOM chi tiết hiển thị cột/bước.
 */

import { state } from './state.js';

class PlayerController {
  constructor() {
    this.timerId = null;
    this.initKeyboardShortcuts();

    // Lắng nghe sự kiện để hủy timer nếu thuật toán hoặc mảng đổi
    state.subscribe((eventType) => {
      if (['algorithmChange', 'arrayChange', 'init'].includes(eventType)) {
        this.pause();
      }
    });
  }

  /**
   * Bắt đầu chạy tự động
   */
  play() {
    if (state.isPlaying) return;

    // Nếu đang ở chế độ Xếp tự do, tự động chốt mảng và sinh các bước giải để phát
    if (state.interactionMode === 'setup') {
      state.setInteractionMode('practice');
      state.computeSteps();
    } else if (state.userRearranged) {
      state.continueFromUserArrangement();
    }

    // Nếu đang ở bước cuối cùng, tự động quay về đầu trước khi phát
    if (state.currentStepIndex >= state.steps.length - 1) {
      state.goToStep(0);
    }

    state.setIsPlaying(true);
    this.scheduleNextStep();
  }

  /**
   * Tạm dừng chạy
   */
  pause() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    state.setIsPlaying(false);
  }

  /**
   * Chuyển đổi trạng thái Chạy / Dừng
   */
  togglePlay() {
    if (state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Lên lịch chạy bước tiếp theo
   */
  scheduleNextStep() {
    if (!state.isPlaying) return;

    this.timerId = setTimeout(() => {
      if (!state.isPlaying) return;

      if (state.currentStepIndex < state.steps.length - 1) {
        state.goToStep(state.currentStepIndex + 1);
        this.scheduleNextStep();
      } else {
        // Đã đến bước cuối cùng
        this.pause();
      }
    }, state.speedMs);
  }

  /**
   * Tiến tới một bước
   */
  stepForward() {
    this.pause();
    if (state.interactionMode === 'setup') {
      state.setInteractionMode('practice');
      state.computeSteps();
    } else if (state.userRearranged) {
      state.continueFromUserArrangement();
    }
    if (state.currentStepIndex < state.steps.length - 1) {
      state.goToStep(state.currentStepIndex + 1);
    }
  }

  /**
   * Lùi lại một bước
   */
  stepBackward() {
    this.pause();
    if (state.currentStepIndex > 0) {
      state.goToStep(state.currentStepIndex - 1);
    }
  }

  /**
   * Về bước đầu tiên
   */
  goToFirst() {
    this.pause();
    state.goToStep(0);
  }

  /**
   * Nhảy đến bước cuối cùng
   */
  goToLast() {
    this.pause();
    if (state.userRearranged) {
      state.continueFromUserArrangement();
    }
    if (state.steps.length > 0) {
      state.goToStep(state.steps.length - 1);
    }
  }

  /**
   * Nhảy đến bước bất kỳ theo chỉ số
   * @param {number} index 
   */
  goToStep(index) {
    this.pause();
    state.goToStep(index);
  }

  /**
   * Thay đổi tốc độ phát
   * @param {number} speedMs 
   */
  setSpeed(speedMs) {
    state.setSpeed(speedMs);
    // Nếu đang chạy, lập lại lịch với tốc độ mới
    if (state.isPlaying) {
      if (this.timerId) clearTimeout(this.timerId);
      this.scheduleNextStep();
    }
  }

  /**
   * Đăng ký phím tắt bàn phím:
   * ←: Bước trước
   * →: Bước sau
   * Space: Chạy / Tạm dừng
   */
  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Bỏ qua nếu người dùng đang nhập liệu trong ô input/textarea
      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault(); // Ngăn cuộn trang
        this.togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.stepBackward();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.stepForward();
      }
    });
  }
}

export const player = new PlayerController();
