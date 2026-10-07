/**
 * DSA Visualizer - Binary Search (js/algorithms/binary.js)
 * Tìm kiếm nhị phân O(log n)
 */
import { cloneArray } from '../utils.js';

export default {
  id: 'binary',
  name: 'Binary Search',
  group: 'Tìm kiếm',
  isSearch: true,
  description: 'Áp dụng trên mảng ĐÃ SẮP XẾP: liên tục so sánh giá trị cần tìm với phần tử ở chính giữa (mid) để loại bỏ một nửa không gian tìm kiếm sau mỗi bước.',
  analogy: 'Tương tự việc tra từ điển dày: bạn mở ngay trang giữa, nếu từ cần tra đứng trước thì chỉ cần tìm ở nửa đầu, bỏ qua hẳn nửa sau.',
  complexity: {
    worst: 'O(log n)',
    best: 'O(1)',
    space: 'O(1)',
    stable: true
  },
  pseudocode: [
    'lo = 0, hi = n - 1',
    'while lo <= hi:',
    '    mid = floor((lo + hi) / 2)',
    '    if A[mid] == target: return mid // Tìm thấy!',
    '    if target < A[mid]: hi = mid - 1 // Bỏ nửa phải',
    '    else: lo = mid + 1               // Bỏ nửa trái',
    'return -1 // Không tìm thấy'
  ],
  inputRule: { min: 1, max: 100, sorted: true },

  run(initialArray, options = {}) {
    const arr = cloneArray(initialArray);
    const n = arr.length;
    const target = options.target !== undefined ? Number(options.target) : (arr[Math.floor(n / 2)]?.value ?? 25);
    const steps = [];
    let comparisons = 0;
    const swaps = 0;

    let lo = 0;
    let hi = n - 1;
    let foundIndex = -1;

    const buildHighlightsAndTags = (currentLo, currentHi, currentMid = null, found = false) => {
      const h = {};
      const t = {};

      for (let idx = 0; idx < n; idx++) {
        if (idx < currentLo || idx > currentHi) {
          h[idx] = 'miss';
        }
      }

      if (currentMid !== null) {
        if (found) {
          h[currentMid] = 'fnd';
          t[currentMid] = '★ Tìm thấy!';
        } else {
          h[currentMid] = 'cmp';
          t[currentMid] = 'mid';
        }
      }

      if (currentLo <= currentHi) {
        t[currentLo] = (t[currentLo] ? t[currentLo] + ' / ' : '') + 'lo';
        t[currentHi] = (t[currentHi] ? t[currentHi] + ' / ' : '') + 'hi';
      }

      return { highlights: h, tags: t };
    };

    // Bước 0
    steps.push({
      array: cloneArray(arr),
      highlights: {},
      range: [lo, hi],
      tags: { [lo]: 'lo', [hi]: 'hi' },
      groups: null,
      message: `Bắt đầu Binary Search: Mảng đã được sắp xếp tăng dần. Cần tìm target = ${target} trong đoạn [0..${hi}].`,
      codeLine: 1,
      stats: { comparisons, swaps }
    });

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      comparisons++;
      const midVal = arr[mid].value;

      const state1 = buildHighlightsAndTags(lo, hi, mid);
      steps.push({
        array: cloneArray(arr),
        highlights: state1.highlights,
        range: [lo, hi],
        tags: state1.tags,
        groups: null,
        message: `Đoạn tìm kiếm [${lo}..${hi}]: Tính vị trí giữa mid = floor((${lo} + ${hi}) / 2) = ${mid} (A[${mid}] = ${midVal}).`,
        codeLine: 3,
        stats: { comparisons, swaps }
      });

      if (midVal === target) {
        foundIndex = mid;
        const stateFound = buildHighlightsAndTags(lo, hi, mid, true);
        steps.push({
          array: cloneArray(arr),
          highlights: stateFound.highlights,
          range: [lo, hi],
          tags: stateFound.tags,
          groups: null,
          message: `CHÍNH XÁC! A[${mid}] = ${target} khớp với mục tiêu tìm kiếm sau ${comparisons} lần so sánh.`,
          codeLine: 4,
          stats: { comparisons, swaps }
        });
        break;
      } else if (target < midVal) {
        steps.push({
          array: cloneArray(arr),
          highlights: state1.highlights,
          range: [lo, hi],
          tags: state1.tags,
          groups: null,
          message: `Vì target (${target}) < A[mid] (${midVal}), toàn bộ nửa phải từ [${mid}..${hi}] bị loại bỏ. Cập nhật hi = ${mid - 1}.`,
          codeLine: 5,
          stats: { comparisons, swaps }
        });
        hi = mid - 1;
      } else {
        steps.push({
          array: cloneArray(arr),
          highlights: state1.highlights,
          range: [lo, hi],
          tags: state1.tags,
          groups: null,
          message: `Vì target (${target}) > A[mid] (${midVal}), toàn bộ nửa trái từ [${lo}..${mid}] bị loại bỏ. Cập nhật lo = ${mid + 1}.`,
          codeLine: 6,
          stats: { comparisons, swaps }
        });
        lo = mid + 1;
      }
    }

    if (foundIndex === -1) {
      const allMiss = {};
      for (let i = 0; i < n; i++) allMiss[i] = 'miss';

      steps.push({
        array: cloneArray(arr),
        highlights: allMiss,
        range: null,
        tags: {},
        groups: null,
        message: `Khoảng tìm kiếm rỗng (lo > hi). Không tìm thấy giá trị ${target} trong mảng sau ${comparisons} bước!`,
        codeLine: 7,
        stats: { comparisons, swaps }
      });
    }

    return steps;
  }
};
