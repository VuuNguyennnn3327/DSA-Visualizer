/**
 * DSA Visualizer - Application State (js/state.js)
 * Quản lý trạng thái ứng dụng tập trung (Single Source of Truth).
 * Không đụng đến DOM; sử dụng mô hình Observer/Pub-Sub để thông báo cập nhật.
 */

import { getAlgorithmById } from './algorithms/index.js';
import {
  generateRandomArray,
  generateSortedArray,
  generateReverseSortedArray,
  generateNearlySortedArray,
  generateDuplicatesArray,
  cloneArray
} from './utils.js';

class StateStore {
  constructor() {
    this.currentAlgorithmId = 'bubble';
    this.arraySize = 10;
    this.targetValue = 25;
    this.speedMs = 600; // Tốc độ chạy mặc định (ms/bước)
    this.isPlaying = false;
    this.currentStepIndex = 0;
    this.steps = [];
    this.arrayData = [];
    this.initialPracticeArray = []; // Mảng đề bài ban đầu để Restart
    this.interactionMode = 'practice'; // 'setup' (Xếp tự do) hoặc 'practice' (Làm bài)
    this.userRearranged = false; // Đánh dấu người dùng đã tự can thiệp sắp xếp bằng tay

    // Thống kê phiên thực hành làm bài tập (Gamification)
    this.practiceStats = {
      startTime: Date.now(),
      correctCount: 0,
      wrongCount: 0,
      totalMoves: 0
    };

    this.listeners = new Set();
  }

  /**
   * Đăng ký hàm lắng nghe sự thay đổi trạng thái
   * @param {Function} listener (eventType, state) => void
   * @returns {Function} Hàm hủy đăng ký
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Phát sự kiện thông báo trạng thái thay đổi
   * @param {string} eventType 
   * @param {*} [data=null]
   */
  notify(eventType, data = null) {
    this.listeners.forEach(fn => {
      try {
        fn(eventType, this, data);
      } catch (err) {
        console.error('Lỗi trong subscriber của StateStore:', err);
      }
    });
  }

  /**
   * Khởi tạo dữ liệu ban đầu
   */
  init() {
    const algo = getAlgorithmById(this.currentAlgorithmId);
    const rule = algo ? algo.inputRule : { min: 5, max: 100, sorted: false };
    this.arrayData = generateRandomArray(this.arraySize, rule.min, rule.max, rule.sorted);
    if (this.arrayData.length > 0) {
      // Đặt targetValue bằng một phần tử ngẫu nhiên có trong mảng
      const randIdx = Math.floor(this.arrayData.length / 2);
      this.targetValue = this.arrayData[randIdx].value;
    }
    this.computeSteps();
    this.notify('init');
  }

  /**
   * Tính toán lại danh sách các bước mô phỏng (pure function)
   */
  computeSteps() {
    const algo = getAlgorithmById(this.currentAlgorithmId);
    if (!algo) return;

    // Binary search tự sắp xếp mảng
    if (algo.id === 'binary') {
      this.arrayData.sort((a, b) => a.value - b.value);
    }

    this.initialPracticeArray = cloneArray(this.arrayData);

    const options = {
      target: this.targetValue
    };

    this.steps = algo.run(this.arrayData, options);
    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.userRearranged = false;
  }

  /**
   * Chuyển đổi giữa chế độ Xếp mảng tự do ('setup') và Thực hành làm bài ('practice')
   * @param {'setup'|'practice'} mode 
   */
  setInteractionMode(mode) {
    if (this.interactionMode === mode) return;
    this.interactionMode = mode;
    this.isPlaying = false;

    const algo = this.getCurrentAlgorithm();
    const algoName = algo ? algo.name : '';

    if (mode === 'practice') {
      // Chốt mảng hiện tại làm mảng đề bài ban đầu
      this.initialPracticeArray = cloneArray(this.arrayData);
      this.practiceStats = {
        startTime: Date.now(),
        correctCount: 0,
        wrongCount: 0,
        totalMoves: 0
      };
      this.steps = [{
        array: cloneArray(this.arrayData),
        highlights: {},
        tags: {},
        message: `🎯 Bắt đầu làm bài tập ${algoName}: Hãy tự kéo thả từng bước theo thuật toán để hoàn thành bài toán!`,
        codeLine: 1,
        stats: { comparisons: 0, swaps: 0 }
      }];
      this.currentStepIndex = 0;
      this.userRearranged = false;
    } else {
      // Chế độ Xếp mảng tự do: chỉ hiển thị mảng đề bài, không ghi bước
      this.steps = [{
        array: cloneArray(this.arrayData),
        highlights: {},
        tags: {},
        message: `🛠️ Chế độ Xếp mảng tự do: Bạn có thể kéo thả để tạo đề bài mảng theo ý muốn. Bấm 'Làm bài' để bắt đầu giải!`,
        codeLine: 1,
        stats: { comparisons: 0, swaps: 0 }
      }];
      this.currentStepIndex = 0;
      this.userRearranged = false;
    }

    this.notify('modeChange');
    this.notify('stepChange');
  }

  /**
   * Làm lại bài tập từ đầu: Khôi phục mảng ban đầu và xóa các bước sai
   */
  restartPractice() {
    this.isPlaying = false;
    if (this.initialPracticeArray && this.initialPracticeArray.length > 0) {
      this.arrayData = cloneArray(this.initialPracticeArray);
    }
    const algo = this.getCurrentAlgorithm();
    const algoName = algo ? algo.name : '';

    this.practiceStats = {
      startTime: Date.now(),
      correctCount: 0,
      wrongCount: 0,
      totalMoves: 0
    };

    this.steps = [{
      array: cloneArray(this.arrayData),
      highlights: {},
      tags: {},
      message: `✓ Đã làm lại mảng từ đầu! Bạn có thể thực hành lại bài tập ${algoName} từ Bước 0.`,
      codeLine: 1,
      stats: { comparisons: 0, swaps: 0 }
    }];
    this.currentStepIndex = 0;
    this.userRearranged = false;

    this.notify('practiceRestart');
    this.notify('stepChange');
  }

  /**
   * Áp dụng các bộ nạp dữ liệu mảng đặc biệt (Edge Case Presets)
   * @param {'random'|'sorted'|'reverse'|'nearly'|'duplicates'} presetType 
   */
  applyArrayPreset(presetType) {
    const algo = this.getCurrentAlgorithm();
    const rule = algo ? algo.inputRule : { min: 5, max: 100, sorted: false };
    const size = this.arraySize;

    switch (presetType) {
      case 'sorted':
        this.arrayData = generateSortedArray(size, rule.min, rule.max);
        break;
      case 'reverse':
        this.arrayData = generateReverseSortedArray(size, rule.min, rule.max);
        break;
      case 'nearly':
        this.arrayData = generateNearlySortedArray(size, rule.min, rule.max);
        break;
      case 'duplicates':
        this.arrayData = generateDuplicatesArray(size, rule.min, rule.max);
        break;
      case 'random':
      default:
        this.arrayData = generateRandomArray(size, rule.min, rule.max, rule.sorted);
        break;
    }

    if (algo && algo.isSearch && this.arrayData.length > 0) {
      this.targetValue = this.arrayData[Math.floor(this.arrayData.length / 2)].value;
    }

    this.computeSteps();
    this.notify('arrayChange');
  }

  /**
   * Lấy thuật toán hiện tại
   */
  getCurrentAlgorithm() {
    return getAlgorithmById(this.currentAlgorithmId);
  }

  /**
   * Lấy bước hiện tại
   */
  getCurrentStep() {
    if (!this.steps || this.steps.length === 0) return null;
    const idx = Math.min(Math.max(0, this.currentStepIndex), this.steps.length - 1);
    return this.steps[idx];
  }

  /**
   * Đổi thuật toán
   * @param {string} algoId 
   */
  setAlgorithm(algoId) {
    if (this.currentAlgorithmId === algoId) return;
    this.currentAlgorithmId = algoId;
    const algo = this.getCurrentAlgorithm();

    // Điều chỉnh mảng phù hợp với ràng buộc của thuật toán mới
    if (algo) {
      let needRegenerate = false;
      const { min, max, sorted } = algo.inputRule;

      for (const item of this.arrayData) {
        if (item.value < min || item.value > max) {
          needRegenerate = true;
          break;
        }
      }

      if (needRegenerate) {
        this.arrayData = generateRandomArray(this.arraySize, min, max, sorted);
      } else if (sorted) {
        this.arrayData.sort((a, b) => a.value - b.value);
      }

      // Đảm bảo targetValue thuộc khoảng hợp lệ
      if (algo.isSearch) {
        const foundInArr = this.arrayData.some(x => x.value === this.targetValue);
        if (!foundInArr && this.arrayData.length > 0) {
          this.targetValue = this.arrayData[Math.floor(this.arrayData.length / 2)].value;
        }
      }
    }

    this.computeSteps();
    this.notify('algorithmChange');
  }

  /**
   * Cập nhật mảng dữ liệu mới
   * @param {Array<{id: string, value: number}>} newArray 
   */
  setArrayData(newArray) {
    this.arrayData = cloneArray(newArray);
    this.arraySize = newArray.length;
    this.computeSteps();
    this.notify('arrayChange');
  }

  /**
   * Sinh mảng ngẫu nhiên theo số lượng và ràng buộc hiện tại
   */
  generateRandomArray() {
    const algo = this.getCurrentAlgorithm();
    const rule = algo ? algo.inputRule : { min: 5, max: 100, sorted: false };
    this.arrayData = generateRandomArray(this.arraySize, rule.min, rule.max, rule.sorted);

    if (algo && algo.isSearch && this.arrayData.length > 0) {
      this.targetValue = this.arrayData[Math.floor(Math.random() * this.arrayData.length)].value;
    }

    this.computeSteps();
    this.notify('arrayChange');
  }

  /**
   * Đặt kích thước mảng
   * @param {number} size 
   */
  setArraySize(size) {
    if (size === this.arraySize) return;
    this.arraySize = Math.max(5, Math.min(20, Math.round(size)));
    this.generateRandomArray();
  }

  /**
   * Cập nhật giá trị cần tìm
   * @param {number} val 
   */
  setTargetValue(val) {
    const num = Number(val);
    if (isNaN(num)) return;
    this.targetValue = num;
    this.computeSteps();
    this.notify('targetChange');
  }

  /**
   * Chuyển đến bước cụ thể
   * @param {number} index 
   */
  goToStep(index) {
    if (!this.steps || this.steps.length === 0) return;
    const clampedIndex = Math.min(Math.max(0, index), this.steps.length - 1);
    if (clampedIndex !== this.currentStepIndex) {
      this.currentStepIndex = clampedIndex;
      this.notify('stepChange');
    }
  }

  /**
   * Đặt trạng thái đang chạy / dừng
   * @param {boolean} playing 
   */
  setIsPlaying(playing) {
    if (this.isPlaying !== playing) {
      this.isPlaying = playing;
      this.notify('playbackStateChange');
    }
  }

  /**
   * Đặt tốc độ chạy (ms/bước)
   * @param {number} speedMs 
   */
  setSpeed(speedMs) {
    this.speedMs = Math.max(80, Math.min(2000, speedMs));
    this.notify('speedChange');
  }

  /**
   * Áp dụng bước sắp xếp do người dùng tự thực hiện (kéo-thả hoặc click hoán đổi)
   * @param {number} fromIdx - Vị trí phần tử 1
   * @param {number} toIdx - Vị trí phần tử 2
   * @param {object} evalResult - Kết quả đánh giá tính đúng sai { isCorrect, isAllSorted, badgeText, message }
   */
  applyUserSwap(fromIdx, toIdx, evalResult) {
    if (fromIdx === toIdx) return;
    const currentStep = this.getCurrentStep();
    if (!currentStep || !currentStep.array) return;

    const n = currentStep.array.length;
    if (fromIdx < 0 || fromIdx >= n || toIdx < 0 || toIdx >= n) return;

    // 1. NẾU ĐANG Ở CHẾ ĐỘ XẾP MẢNG TỰ DO (SETUP MODE):
    if (this.interactionMode === 'setup') {
      const newArray = cloneArray(currentStep.array);
      const temp = newArray[fromIdx];
      newArray[fromIdx] = newArray[toIdx];
      newArray[toIdx] = temp;

      this.arrayData = cloneArray(newArray);
      this.initialPracticeArray = cloneArray(newArray);

      // KHÔNG thêm dòng mới vào bảng chạy tay, chỉ cập nhật Bước 0 hiện tại
      this.steps = [{
        array: cloneArray(newArray),
        highlights: {
          [fromIdx]: 'swp',
          [toIdx]: 'swp'
        },
        tags: {
          [fromIdx]: 'Đổi',
          [toIdx]: 'Đổi'
        },
        message: `🛠️ [Xếp mảng tự do] Đã đổi chỗ A[${fromIdx}] (${temp.value}) ↔ A[${toIdx}] (${newArray[fromIdx].value}). Bấm 'Làm bài' để bắt đầu thực hành.`,
        codeLine: 1,
        stats: { comparisons: 0, swaps: 0 }
      }];
      this.currentStepIndex = 0;
      this.userRearranged = false;
      this.notify('stepChange');
      return;
    }

    // 2. NẾU ĐANG Ở CHẾ ĐỘ THỰC HÀNH LÀM BÀI (PRACTICE MODE):
    // Trường hợp làm SAI (và không phải tìm kiếm):
    if (evalResult && evalResult.isCorrect === false && !evalResult.isSearch) {
      this.practiceStats.wrongCount++;
      this.practiceStats.totalMoves++;

      const prevStats = currentStep.stats || { comparisons: 0, swaps: 0 };
      const errStep = {
        array: cloneArray(currentStep.array), // Giữ nguyên mảng để không làm hỏng đề bài
        highlights: {
          [fromIdx]: 'err',
          [toIdx]: 'err'
        },
        tags: {
          [fromIdx]: '⚠️ Sai',
          [toIdx]: '⚠️ Sai'
        },
        message: evalResult.message,
        codeLine: currentStep.codeLine ?? 1,
        stats: {
          comparisons: prevStats.comparisons,
          swaps: prevStats.swaps
        },
        isUserStep: true,
        userEvaluation: evalResult,
        swappedPair: [fromIdx, toIdx]
      };

      const historySteps = this.steps.slice(0, this.currentStepIndex + 1);
      historySteps.push(errStep);
      this.steps = historySteps;
      this.currentStepIndex = this.steps.length - 1;
      this.userRearranged = true;
      this.notify('stepChange');
      return;
    }

    // Trường hợp LÀM ĐÚNG (hoặc tương tác tìm kiếm):
    if (evalResult && evalResult.isCorrect === true) {
      this.practiceStats.correctCount++;
      this.practiceStats.totalMoves++;
    }

    const newArray = cloneArray(currentStep.array);
    const temp = newArray[fromIdx];
    newArray[fromIdx] = newArray[toIdx];
    newArray[toIdx] = temp;

    const prevStats = currentStep.stats || { comparisons: 0, swaps: 0 };
    const userStep = {
      array: cloneArray(newArray),
      highlights: {
        [fromIdx]: 'swp',
        [toIdx]: 'swp'
      },
      tags: {
        [fromIdx]: 'Bạn đổi',
        [toIdx]: 'Bạn đổi'
      },
      message: evalResult.message,
      codeLine: currentStep.codeLine ?? 1,
      stats: {
        comparisons: prevStats.comparisons,
        swaps: prevStats.swaps + 1
      },
      isUserStep: true,
      userEvaluation: evalResult,
      swappedPair: [fromIdx, toIdx]
    };

    const historySteps = this.steps.slice(0, this.currentStepIndex + 1);
    historySteps.push(userStep);
    this.steps = historySteps;
    this.currentStepIndex = this.steps.length - 1;
    this.arrayData = cloneArray(newArray);
    this.userRearranged = true;

    // Nếu mảng đã được hoàn thành sắp xếp 100%
    if (evalResult && evalResult.isAllSorted) {
      const finalArray = cloneArray(newArray);
      const allOkHighlights = {};
      finalArray.forEach((_, idx) => {
        allOkHighlights[idx] = 'ok';
      });

      this.steps.push({
        array: finalArray,
        highlights: allOkHighlights,
        tags: {},
        message: '🎉 Chúc mừng bạn đã tự tay sắp xếp hoàn thành chính xác 100% bài tập!',
        codeLine: null,
        stats: {
          comparisons: prevStats.comparisons,
          swaps: prevStats.swaps + 1
        },
        isComplete: true
      });
      this.currentStepIndex = this.steps.length - 1;
      this.userRearranged = false;

      const elapsedSec = Math.max(1, Math.round((Date.now() - (this.practiceStats.startTime || Date.now())) / 1000));
      const accuracy = this.practiceStats.totalMoves > 0
        ? Math.round((this.practiceStats.correctCount / this.practiceStats.totalMoves) * 100)
        : 100;

      const completionData = {
        elapsedSeconds: elapsedSec,
        accuracy: accuracy,
        correctCount: this.practiceStats.correctCount,
        wrongCount: this.practiceStats.wrongCount
      };

      this.notify('practiceCompleted', completionData);
      this.notify('stepChange');
      return;
    }

    this.notify('stepChange');
  }

  /**
   * Tính toán và nối tiếp các bước thuật toán còn lại từ mảng người dùng vừa xếp
   */
  appendContinuationSteps() {
    const algo = this.getCurrentAlgorithm();
    if (!algo) return;

    const lastUserStats = this.steps[this.currentStepIndex]?.stats || { comparisons: 0, swaps: 0 };

    if (!algo.isSearch) {
      const isSorted = this.arrayData.every((item, i, arr) => i === 0 || arr[i - 1].value <= item.value);
      if (isSorted) {
        const finalArray = cloneArray(this.arrayData);
        const allOkHighlights = {};
        finalArray.forEach((_, idx) => {
          allOkHighlights[idx] = 'ok';
        });

        this.steps.push({
          array: finalArray,
          highlights: allOkHighlights,
          tags: {},
          message: '🎉 Mảng đã được sắp xếp hoàn toàn chính xác! Thuật toán kết thúc thành công.',
          codeLine: null,
          stats: { ...lastUserStats },
          isComplete: true
        });
        this.userRearranged = false;
        return;
      }
    }

    const options = { target: this.targetValue };
    const continuationSteps = algo.run(this.arrayData, options);

    if (continuationSteps && continuationSteps.length > 1) {
      const futureSteps = continuationSteps.slice(1).map(step => {
        const stepStats = step.stats || { comparisons: 0, swaps: 0 };
        return {
          ...step,
          stats: {
            comparisons: lastUserStats.comparisons + stepStats.comparisons,
            swaps: lastUserStats.swaps + stepStats.swaps
          }
        };
      });

      this.steps.push(...futureSteps);
    }

    this.userRearranged = false;
  }

  /**
   * Đảm bảo các bước chạy tiếp từ thứ tự người dùng xếp đã sẵn sàng
   * Nếu trước đó người dùng có bước sai -> tự động dọn dẹp và chạy chuẩn từ đầu!
   */
  continueFromUserArrangement() {
    // Nếu có bước làm sai trong lịch sử: Tự động xóa các bước sai và tính lại toàn bộ từ mảng đề bài ban đầu!
    const hasError = this.steps.some(s => s.userEvaluation && s.userEvaluation.isCorrect === false);
    if (hasError) {
      if (this.initialPracticeArray && this.initialPracticeArray.length > 0) {
        this.arrayData = cloneArray(this.initialPracticeArray);
      }
      this.computeSteps();
      return;
    }

    if (!this.userRearranged) return;
    this.appendContinuationSteps();
  }
}

export const state = new StateStore();
