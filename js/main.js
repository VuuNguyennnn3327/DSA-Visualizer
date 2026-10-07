/**
 * DSA Visualizer - Main Entrypoint (js/main.js)
 * Điểm khởi động ứng dụng: kết nối các module State, UI, Player và Renderer.
 */

import { state } from './state.js';
import { player } from './player.js';
import { Renderer } from './renderer.js';
import { UIController } from './ui.js';
import { InteractiveSortController } from './interactive-sort.js';

function startApp() {
  try {
    // 1. Khởi tạo Renderer, UIController và InteractiveSortController
    const renderer = new Renderer();
    const ui = new UIController(renderer);
    const interactiveSort = new InteractiveSortController();

    // 2. Lắng nghe các thay đổi trạng thái từ StateStore
    state.subscribe((eventType, stateObj, data) => {
      const currentStep = state.getCurrentStep();
      const currentAlgo = state.getCurrentAlgorithm();

      switch (eventType) {
        case 'init':
        case 'algorithmChange':
        case 'arrayChange':
        case 'targetChange':
          ui.updateAlgorithmInfo();
          ui.updatePlaybackButton(state.isPlaying);
          renderer.renderStep(
            currentStep,
            currentAlgo,
            state.currentStepIndex,
            state.steps.length,
            state.steps
          );
          break;

        case 'stepChange':
          renderer.renderStep(
            currentStep,
            currentAlgo,
            state.currentStepIndex,
            state.steps.length,
            state.steps
          );
          break;

        case 'playbackStateChange':
          ui.updatePlaybackButton(state.isPlaying);
          break;

        case 'modeChange':
        case 'practiceRestart':
          ui.updateModeUI(state.interactionMode);
          renderer.renderStep(
            currentStep,
            currentAlgo,
            state.currentStepIndex,
            state.steps.length,
            state.steps
          );
          break;

        case 'practiceCompleted':
          setTimeout(() => {
            ui.openVictoryModal(data);
          }, 450);
          break;

        default:
          break;
      }
    });

    // 3. Khởi tạo trạng thái ban đầu của ứng dụng
    state.init();

    // 4. Render bước khởi đầu ngay lập tức với bảng chạy tay đầy đủ
    ui.updateAlgorithmInfo();
    renderer.renderStep(
      state.getCurrentStep(),
      state.getCurrentAlgorithm(),
      state.currentStepIndex,
      state.steps.length,
      state.steps
    );

    console.log('✅ DSA Visualizer đã khởi động thành công!');
  } catch (err) {
    console.error('❌ Lỗi trong quá trình khởi động DSA Visualizer:', err);
    const msgEl = document.getElementById('step-message-text');
    if (msgEl) {
      msgEl.textContent = `Lỗi khởi động: ${err.message}`;
    }
  }
}

// Khởi chạy an toàn: nếu DOM đã sẵn sàng thì chạy ngay, nếu chưa thì chờ DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
