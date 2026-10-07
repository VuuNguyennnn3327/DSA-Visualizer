/**
 * DSA Visualizer - Practice Engine & Algorithm Verifier (js/practice-verifier.js)
 * Bộ máy kiểm tra tính đúng/sai nghiêm ngặt từng bước khi người dùng tự giải bằng tay:
 * - Bubble Sort: Duyệt tuần tự qua các cặp liền kề nghịch thế; nếu phần tử lớn gặp
 *   phần tử lớn hơn nữa thì con trỏ chuyển tiếp sang phần tử lớn hơn đó.
 * - Selection Sort: Tìm phần tử nhỏ nhất trong đoạn chưa sắp xếp đưa về đầu đoạn.
 * - Insertion Sort: Lấy từng key và dời lùi sang trái qua các số lớn hơn.
 * - Quick Sort: Hoán đổi theo đúng quá trình phân hoạch Lomuto partition.
 * - Tìm kiếm (Linear/Binary): Tương tác tự do, không chấm đúng sai.
 */

export class PracticeEngine {
  constructor() {
    this.algoId = 'bubble';
    this.initialArray = [];
    this.currentArray = [];
    this.state = {};
  }

  /**
   * Khởi tạo bài tập với thuật toán và mảng đề bài ban đầu
   * @param {string} algoId 
   * @param {Array} array 
   */
  init(algoId, array) {
    this.algoId = algoId || 'bubble';
    this.initialArray = array.map(x => ({ ...x }));
    this.currentArray = array.map(x => ({ ...x }));
    this.resetState();
  }

  /**
   * Đặt lại trạng thái kiểm tra về ban đầu
   */
  resetState() {
    this.currentArray = this.initialArray.map(x => ({ ...x }));

    if (this.algoId === 'bubble') {
      this.state = { pass: 0, pointer: 0 };
    } else if (this.algoId === 'selection') {
      this.state = { pass: 0 };
    } else if (this.algoId === 'insertion') {
      this.state = { keyIdx: 1, currPos: 1 };
    } else if (this.algoId === 'quick') {
      this.state = {
        swaps: this.computeQuickSwaps(this.initialArray),
        swapIdx: 0
      };
    } else {
      this.state = {};
    }
  }

  /**
   * Kiểm tra xem mảng hiện tại đã sắp xếp tăng dần 100% chưa
   */
  isCurrentArraySorted() {
    const arr = this.currentArray;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1].value > arr[i].value) return false;
    }
    return true;
  }

  /* --------------------------------------------------------------------------
     1. BUBBLE SORT LOGIC
     -------------------------------------------------------------------------- */
  getNextExpectedBubbleSwap() {
    const arr = this.currentArray;
    const n = arr.length;
    let { pass, pointer } = this.state;

    while (pass < n - 1) {
      for (let j = pointer; j < n - 1 - pass; j++) {
        if (arr[j].value > arr[j + 1].value) {
          return {
            from: j,
            to: j + 1,
            pass,
            pointer: j
          };
        }
      }
      // Hết pass này mà không còn cặp nào cần đổi nữa -> chuyển pass tiếp theo
      pass++;
      pointer = 0;
      this.state.pass = pass;
      this.state.pointer = pointer;
    }
    return null;
  }

  verifyBubbleSwap(idx1, idx2) {
    const arr = this.currentArray;
    const n = arr.length;

    // Nếu mảng đã sắp xếp xong hoàn toàn
    if (this.isCurrentArraySorted()) {
      return {
        isCorrect: true,
        isAllSorted: true,
        badgeText: '🎉 Hoàn tất',
        message: '🎉 Tuyệt vời! Toàn bộ mảng đã được sắp xếp tăng dần hoàn chỉnh!'
      };
    }

    const expected = this.getNextExpectedBubbleSwap();
    if (!expected) {
      return {
        isCorrect: true,
        isAllSorted: true,
        badgeText: '🎉 Hoàn tất',
        message: '🎉 Hoàn tất Bubble Sort: Không còn cặp nghịch thế nào trong mảng!'
      };
    }

    // 1. Kiểm tra tính liền kề
    const isAdjacent = (idx2 === idx1 + 1);
    if (!isAdjacent) {
      return {
        isCorrect: false,
        expected,
        badgeText: '⚠️ Sai quy tắc',
        message: `⚠️ Sai quy tắc Bubble Sort: Chỉ được đổi chỗ 2 phần tử LIỀN KỀ nhau (khoảng cách 1 ô), nhưng bạn đã chọn vị trí [${idx1}] và [${idx2}]!`
      };
    }

    const val1 = arr[idx1].value;
    const val2 = arr[idx2].value;

    // 2. Kiểm tra có nghịch thế không
    if (val1 <= val2) {
      return {
        isCorrect: false,
        expected,
        badgeText: '⚠️ Chưa đúng',
        message: `⚠️ Chưa đúng: Hai phần tử A[${idx1}] = ${val1} và A[${idx2}] = ${val2} đã đúng thứ tự tăng dần (${val1} ≤ ${val2}), không cần đổi chỗ!`
      };
    }

    // 3. Kiểm tra có đúng lượt (không nhảy cóc) không
    if (idx1 !== expected.from || idx2 !== expected.to) {
      const expVal1 = arr[expected.from].value;
      const expVal2 = arr[expected.to].value;
      return {
        isCorrect: false,
        expected,
        badgeText: '⚠️ Nhảy cóc',
        message: `⚠️ Chưa đúng lượt duyệt: Bubble Sort duyệt tuần tự từ trái sang phải. Cặp cần đổi tiếp theo phải là A[${expected.from}] (${expVal1}) ↔ A[${expected.to}] (${expVal2}), bạn không thể nhảy qua vị trí khác!`
      };
    }

    // ĐÚNG QUY TẮC! Cập nhật mảng nội bộ
    const temp = arr[idx1];
    arr[idx1] = arr[idx2];
    arr[idx2] = temp;

    // Di chuyển con trỏ pointer sang idx2 (vị trí mới của phần tử lớn)
    this.state.pointer = idx2;

    // Tạo lời giải thích thông minh bước tiếp theo
    const nextIdx = idx2 + 1;
    let followUpNote = '';
    if (nextIdx < n - expected.pass) {
      if (arr[idx2].value > arr[nextIdx].value) {
        followUpNote = ` Phần tử ${temp.value} tiếp tục lớn hơn ${arr[nextIdx].value}, hãy tiếp tục đổi nó sang phải!`;
      } else {
        followUpNote = ` Phần tử ${temp.value} gặp số lớn hơn hoặc bằng (${arr[nextIdx].value}) nên dừng lại; tiếp theo thuật toán sẽ chuyển sang so sánh tiếp từ vị trí ${idx2}!`;
      }
    }

    const nextExpected = this.getNextExpectedBubbleSwap();
    const isAllSorted = !nextExpected || this.isCurrentArraySorted();

    return {
      isCorrect: true,
      isAllSorted,
      badgeText: isAllSorted ? '🎉 Hoàn tất' : '✓ Xếp đúng',
      message: isAllSorted
        ? `🎉 XUẤT SẮC! Hoán đổi A[${idx1}] (${val1}) ↔ A[${idx2}] (${val2}) đã đưa toàn bộ mảng về thứ tự tăng dần hoàn chỉnh!`
        : `✓ Hoàn toàn chính xác theo Bubble Sort: Đã đổi chỗ A[${idx1}] = ${val1} ↔ A[${idx2}] = ${val2}.${followUpNote}`
    };
  }

  /* --------------------------------------------------------------------------
     2. SELECTION SORT LOGIC
     -------------------------------------------------------------------------- */
  getNextExpectedSelectionSwap() {
    const arr = this.currentArray;
    const n = arr.length;
    let { pass } = this.state;

    while (pass < n - 1) {
      let minIdx = pass;
      for (let j = pass + 1; j < n; j++) {
        if (arr[j].value < arr[minIdx].value) {
          minIdx = j;
        }
      }

      if (minIdx !== pass) {
        return {
          from: pass,
          to: minIdx,
          pass,
          minVal: arr[minIdx].value
        };
      }
      // Phần tử tại pass đã là nhỏ nhất sẵn
      pass++;
      this.state.pass = pass;
    }
    return null;
  }

  verifySelectionSwap(idx1, idx2) {
    const arr = this.currentArray;
    if (this.isCurrentArraySorted()) {
      return {
        isCorrect: true,
        isAllSorted: true,
        badgeText: '🎉 Hoàn tất',
        message: '🎉 Tuyệt vời! Toàn bộ mảng đã được sắp xếp tăng dần hoàn chỉnh!'
      };
    }

    const expected = this.getNextExpectedSelectionSwap();
    if (!expected) {
      return {
        isCorrect: true,
        isAllSorted: true,
        badgeText: '🎉 Hoàn tất',
        message: '🎉 Hoàn tất Selection Sort: Toàn bộ mảng đã có thứ tự tăng dần!'
      };
    }

    const expFrom = Math.min(expected.from, expected.to);
    const expTo = Math.max(expected.from, expected.to);

    if (idx1 !== expFrom || idx2 !== expTo) {
      const curVal = arr[expected.from].value;
      return {
        isCorrect: false,
        expected,
        badgeText: '⚠️ Chưa đúng',
        message: `⚠️ Chưa đúng theo Selection Sort: Ở lượt ${expected.pass + 1}, bạn cần tìm phần tử nhỏ nhất trong đoạn chưa xếp [${expected.from}..${arr.length - 1}] là ${expected.minVal} (tại vị trí [${expected.to}]) để đổi chỗ với A[${expected.from}] (${curVal})!`
      };
    }

    // ĐÚNG QUY TẮC!
    const temp = arr[idx1];
    arr[idx1] = arr[idx2];
    arr[idx2] = temp;

    this.state.pass = expected.pass + 1;

    const nextExpected = this.getNextExpectedSelectionSwap();
    const isAllSorted = !nextExpected || this.isCurrentArraySorted();

    return {
      isCorrect: true,
      isAllSorted,
      badgeText: isAllSorted ? '🎉 Hoàn tất' : '✓ Xếp đúng',
      message: isAllSorted
        ? `🎉 XUẤT SẮC! Đã đưa phần tử nhỏ nhất về vị trí [${idx1}]. Toàn bộ mảng đã được sắp xếp tăng dần hoàn chỉnh!`
        : `✓ Chuẩn xác theo Selection Sort: Đã tìm đúng phần tử nhỏ nhất (${expected.minVal}) tại vị trí [${idx2}] và đưa về đầu đoạn chưa xếp [${idx1}].`
    };
  }

  /* --------------------------------------------------------------------------
     3. INSERTION SORT LOGIC
     -------------------------------------------------------------------------- */
  getNextExpectedInsertionSwap() {
    const arr = this.currentArray;
    const n = arr.length;
    let { keyIdx, currPos } = this.state;

    while (keyIdx < n) {
      if (currPos > 0 && arr[currPos - 1].value > arr[currPos].value) {
        return {
          from: currPos - 1,
          to: currPos,
          keyIdx,
          currPos
        };
      }
      // Key hiện tại đã về đúng vị trí trong đoạn [0..keyIdx]
      keyIdx++;
      currPos = keyIdx;
      this.state.keyIdx = keyIdx;
      this.state.currPos = currPos;
    }
    return null;
  }

  verifyInsertionSwap(idx1, idx2) {
    const arr = this.currentArray;
    if (this.isCurrentArraySorted()) {
      return {
        isCorrect: true,
        isAllSorted: true,
        badgeText: '🎉 Hoàn tất',
        message: '🎉 Tuyệt vời! Toàn bộ mảng đã được sắp xếp tăng dần hoàn chỉnh!'
      };
    }

    const expected = this.getNextExpectedInsertionSwap();
    if (!expected) {
      return {
        isCorrect: true,
        isAllSorted: true,
        badgeText: '🎉 Hoàn tất',
        message: '🎉 Hoàn tất Insertion Sort: Các phần tử đã được chèn vào đúng vị trí!'
      };
    }

    if (idx1 !== expected.from || idx2 !== expected.to) {
      const valCurr = arr[expected.currPos].value;
      const valPrev = arr[expected.currPos - 1].value;
      return {
        isCorrect: false,
        expected,
        badgeText: '⚠️ Sai hướng',
        message: `⚠️ Chưa đúng theo Insertion Sort: Cần tiếp tục dời phần tử đang chèn tại vị trí [${expected.currPos}] (${valCurr}) sang trái đổi chỗ với A[${expected.currPos - 1}] (${valPrev}) vì ${valPrev} > ${valCurr}!`
      };
    }

    // ĐÚNG!
    const temp = arr[idx1];
    arr[idx1] = arr[idx2];
    arr[idx2] = temp;

    this.state.currPos = expected.currPos - 1;

    const nextExpected = this.getNextExpectedInsertionSwap();
    const isAllSorted = !nextExpected || this.isCurrentArraySorted();

    return {
      isCorrect: true,
      isAllSorted,
      badgeText: isAllSorted ? '🎉 Hoàn tất' : '✓ Xếp đúng',
      message: isAllSorted
        ? `🎉 XUẤT SẮC! Đã chèn các phần tử về đúng vị trí. Toàn bộ mảng đã được sắp xếp tăng dần hoàn chỉnh!`
        : `✓ Đúng chuẩn Insertion Sort: Đã dời phần tử ${temp.value} sang trái qua số lớn hơn ${arr[idx2].value}.`
    };
  }

  /* --------------------------------------------------------------------------
     4. QUICK SORT LOGIC (Lomuto Partition)
     -------------------------------------------------------------------------- */
  computeQuickSwaps(initialArr) {
    const arr = initialArr.map(x => ({ ...x }));
    const swaps = [];

    function partition(lo, hi) {
      const pivotVal = arr[hi].value;
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        if (arr[j].value < pivotVal) {
          i++;
          if (i !== j) {
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            swaps.push({
              from: Math.min(i, j),
              to: Math.max(i, j),
              desc: `Đổi chỗ A[${i}] (${arr[i].value}) và A[${j}] (${arr[j].value}) để đưa số nhỏ hơn pivot sang trái.`,
              pivotVal
            });
          }
        }
      }
      const p = i + 1;
      if (p !== hi) {
        const temp = arr[p];
        arr[p] = arr[hi];
        arr[hi] = temp;
        swaps.push({
          from: Math.min(p, hi),
          to: Math.max(p, hi),
          desc: `Đưa pivot ${arr[p].value} về đúng vị trí phân hoạch tại chỉ số ${p}.`,
          pivotVal
        });
      }
      return p;
    }

    function qs(lo, hi) {
      if (lo >= hi) return;
      const p = partition(lo, hi);
      qs(lo, p - 1);
      qs(p + 1, hi);
    }

    qs(0, arr.length - 1);
    return swaps;
  }

  verifyQuickSwap(idx1, idx2) {
    const { swaps, swapIdx } = this.state;
    if (!swaps || swapIdx >= swaps.length || this.isCurrentArraySorted()) {
      return {
        isCorrect: true,
        isAllSorted: true,
        badgeText: '🎉 Hoàn tất',
        message: '🎉 Tuyệt vời! Thuật toán Quick Sort đã hoàn tất phân hoạch mảng!'
      };
    }

    const expected = swaps[swapIdx];
    if (idx1 !== expected.from || idx2 !== expected.to) {
      return {
        isCorrect: false,
        expected,
        badgeText: '⚠️ Chưa đúng',
        message: `⚠️ Chưa đúng theo Quick Sort: ${expected.desc} Cặp cần đổi tiếp theo phải là [${expected.from}] ↔ [${expected.to}]!`
      };
    }

    // ĐÚNG!
    const temp = this.currentArray[idx1];
    this.currentArray[idx1] = this.currentArray[idx2];
    this.currentArray[idx2] = temp;

    this.state.swapIdx = swapIdx + 1;
    const isAllSorted = this.state.swapIdx >= swaps.length || this.isCurrentArraySorted();

    return {
      isCorrect: true,
      isAllSorted,
      badgeText: isAllSorted ? '🎉 Hoàn tất' : '✓ Xếp đúng',
      message: isAllSorted
        ? `🎉 XUẤT SẮC! Hoàn thành tất cả các bước phân hoạch của Quick Sort!`
        : `✓ Chính xác theo Quick Sort: ${expected.desc}`
    };
  }

  /* --------------------------------------------------------------------------
     5. ĐÁNH GIÁ CHUNG CHO TỪNG THUẬT TOÁN
     -------------------------------------------------------------------------- */
  evaluate(fromIdx, toIdx) {
    const idx1 = Math.min(fromIdx, toIdx);
    const idx2 = Math.max(fromIdx, toIdx);

    // Thuật toán Tìm kiếm (Linear & Binary)
    if (this.algoId === 'linear' || this.algoId === 'binary') {
      const temp = this.currentArray[idx1];
      this.currentArray[idx1] = this.currentArray[idx2];
      this.currentArray[idx2] = temp;
      return {
        isSearch: true,
        isCorrect: null, // Không xét đúng hay sai
        isAllSorted: false,
        badgeText: '🔄 Hoán đổi',
        message: `Đã hoán đổi vị trí ô số [${idx1}] (${temp.value}) ↔ [${idx2}] (${this.currentArray[idx1].value}) trong mảng tìm kiếm.`
      };
    }

    // Thuật toán không dùng in-place pairwise swap
    if (this.algoId === 'merge' || this.algoId === 'counting' || this.algoId === 'radix') {
      return {
        isCorrect: false,
        isAllSorted: false,
        badgeText: 'ℹ Khác cơ chế',
        message: `ℹ️ Thuật toán này không dùng đổi chỗ trực tiếp (in-place swap) mà dùng mảng phụ/chia đôi đệ quy. Bạn hãy bấm 'Chạy' để xem mô phỏng chi tiết, hoặc chuyển sang Bubble, Selection, Insertion, Quick Sort để thực hành tự giải!`
      };
    }

    if (this.algoId === 'bubble') {
      return this.verifyBubbleSwap(idx1, idx2);
    }

    if (this.algoId === 'selection') {
      return this.verifySelectionSwap(idx1, idx2);
    }

    if (this.algoId === 'insertion') {
      return this.verifyInsertionSwap(idx1, idx2);
    }

    if (this.algoId === 'quick') {
      return this.verifyQuickSwap(idx1, idx2);
    }

    return {
      isCorrect: true,
      isAllSorted: false,
      badgeText: '✓ Xếp đúng',
      message: `Đã hoán đổi A[${idx1}] ↔ A[${idx2}].`
    };
  }

  /**
   * Cung cấp gợi ý cặp phần tử cần xét hoán đổi tiếp theo mà KHÔNG can thiệp vào mảng
   * @returns {{from: number, to: number, message: string}|null}
   */
  getHint() {
    if (this.isCurrentArraySorted()) {
      return {
        from: -1,
        to: -1,
        message: '🎉 Toàn bộ mảng đã được sắp xếp tăng dần hoàn chỉnh, không cần hoán đổi thêm!'
      };
    }

    if (this.algoId === 'bubble') {
      const exp = this.getNextExpectedBubbleSwap();
      if (!exp) return null;
      const v1 = this.currentArray[exp.from].value;
      const v2 = this.currentArray[exp.to].value;
      return {
        from: exp.from,
        to: exp.to,
        message: `💡 Gợi ý Bubble Sort: Cần xét cặp liền kề A[${exp.from}] (${v1}) và A[${exp.to}] (${v2}) vì ${v1} > ${v2}. Hãy đổi chỗ 2 ô này!`
      };
    }

    if (this.algoId === 'selection') {
      const exp = this.getNextExpectedSelectionSwap();
      if (!exp) return null;
      const vCur = this.currentArray[exp.from].value;
      return {
        from: Math.min(exp.from, exp.to),
        to: Math.max(exp.from, exp.to),
        message: `💡 Gợi ý Selection Sort: Phần tử nhỏ nhất trong đoạn chưa xếp là ${exp.minVal} (tại vị trí [${exp.to}]). Hãy đổi chỗ nó với đầu đoạn A[${exp.from}] (${vCur})!`
      };
    }

    if (this.algoId === 'insertion') {
      const exp = this.getNextExpectedInsertionSwap();
      if (!exp) return null;
      const vKey = this.currentArray[exp.currPos].value;
      const vPrev = this.currentArray[exp.currPos - 1].value;
      return {
        from: exp.currPos - 1,
        to: exp.currPos,
        message: `💡 Gợi ý Insertion Sort: Cần dời phần tử key A[${exp.currPos}] (${vKey}) sang trái qua phần tử lớn hơn A[${exp.currPos - 1}] (${vPrev})!`
      };
    }

    if (this.algoId === 'quick') {
      const { swaps, swapIdx } = this.state;
      if (!swaps || swapIdx >= swaps.length) return null;
      const exp = swaps[swapIdx];
      return {
        from: exp.from,
        to: exp.to,
        message: `💡 Gợi ý Quick Sort: ${exp.desc} Hãy đổi chỗ 2 vị trí [${exp.from}] và [${exp.to}]!`
      };
    }

    return null;
  }
}
