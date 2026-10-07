/**
 * DSA Visualizer - Linear Search (js/algorithms/linear.js)
 * Tìm kiếm tuyến tính O(n)
 */
import { cloneArray } from '../utils.js';

export default {
  id: 'linear',
  name: 'Linear Search',
  group: 'Tìm kiếm',
  isSearch: true,
  description: 'Duyệt tuần tự từ phần tử đầu tiên đến phần tử cuối cùng của mảng cho đến khi tìm thấy giá trị cần tìm hoặc duyệt hết danh sách.',
  analogy: 'Như việc tìm một cuốn sổ tay để quên: bạn lần lượt lật từng ngăn kéo từ trên xuống dưới cho tới khi thấy cuốn sổ.',
  complexity: {
    worst: 'O(n)',
    best: 'O(1)',
    space: 'O(1)',
    stable: true
  },
  pseudocode: [
    'for i = 0 to n - 1:',
    '    if A[i] == target:',
    '        return i // Tìm thấy tại vị trí i',
    'return -1 // Không tìm thấy trong mảng'
  ],
  inputRule: { min: 1, max: 100, sorted: false },

  run(initialArray, options = {}) {
    const arr = cloneArray(initialArray);
    const n = arr.length;
    const target = options.target !== undefined ? Number(options.target) : (arr[Math.floor(n / 2)]?.value ?? 25);
    const steps = [];
    let comparisons = 0;
    const swaps = 0;
    const historyMiss = {};

    // Bước 0
    steps.push({
      array: cloneArray(arr),
      highlights: {},
      range: null,
      tags: {},
      groups: null,
      message: `Bắt đầu Linear Search: Tìm kiếm giá trị mục tiêu (target) = ${target} trong mảng gồm ${n} ô số.`,
      codeLine: 1,
      stats: { comparisons, swaps }
    });

    let foundIndex = -1;

    for (let i = 0; i < n; i++) {
      comparisons++;
      const val = arr[i].value;
      const isMatch = val === target;

      // Bước so sánh
      steps.push({
        array: cloneArray(arr),
        highlights: {
          ...historyMiss,
          [i]: 'cmp'
        },
        range: null,
        tags: {
          [i]: `i (đang xét)`
        },
        groups: null,
        message: `Xét ô A[${i}] = ${val}. So sánh với target = ${target}...`,
        codeLine: 2,
        stats: { comparisons, swaps }
      });

      if (isMatch) {
        foundIndex = i;
        steps.push({
          array: cloneArray(arr),
          highlights: {
            ...historyMiss,
            [i]: 'fnd'
          },
          range: null,
          tags: {
            [i]: `★ Tìm thấy!`
          },
          groups: null,
          message: `CHÍNH XÁC! Tìm thấy mục tiêu ${target} tại chỉ số ${i} sau ${comparisons} lần kiểm tra.`,
          codeLine: 3,
          stats: { comparisons, swaps }
        });
        break;
      } else {
        historyMiss[i] = 'miss';
        steps.push({
          array: cloneArray(arr),
          highlights: {
            ...historyMiss
          },
          range: null,
          tags: {
            [i]: `✕ Không khớp`
          },
          groups: null,
          message: `A[${i}] = ${val} khác mục tiêu ${target}. Đánh dấu bỏ qua và tiếp tục.`,
          codeLine: 1,
          stats: { comparisons, swaps }
        });
      }
    }

    if (foundIndex === -1) {
      steps.push({
        array: cloneArray(arr),
        highlights: {
          ...historyMiss
        },
        range: null,
        tags: {},
        groups: null,
        message: `Đã duyệt hết toàn bộ ${n} phần tử. Giá trị ${target} không tồn tại trong mảng!`,
        codeLine: 4,
        stats: { comparisons, swaps }
      });
    }

    return steps;
  }
};
