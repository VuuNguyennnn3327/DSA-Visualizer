/**
 * DSA Visualizer - Quick Sort (js/algorithms/quick.js)
 * Sắp xếp nhanh O(n log n)
 */
import { cloneArray } from '../utils.js';

export default {
  id: 'quick',
  name: 'Quick Sort',
  group: 'Sắp xếp O(n log n)',
  description: 'Dùng kỹ thuật chia để trị: chọn một phần tử làm mốc (pivot), phân hoạch mảng để đưa các số nhỏ hơn về bên trái và lớn hơn về bên phải pivot, sau đó đệ quy sắp xếp hai nửa.',
  analogy: 'Như chọn một bạn làm chuẩn chiều cao: các bạn thấp hơn xếp sang trái, cao hơn xếp sang phải, rồi tiếp tục làm tương tự cho từng nhóm.',
  complexity: {
    worst: 'O(n²)',
    best: 'O(n log n)',
    space: 'O(log n)',
    stable: false
  },
  pseudocode: [
    'quicksort(lo, hi):',
    '    if lo >= hi: return',
    '    p = partition(lo, hi) // chọn pivot = A[hi]',
    '    quicksort(lo, p - 1)',
    '    quicksort(p + 1, hi)'
  ],
  inputRule: { min: 5, max: 100, sorted: false },

  run(initialArray) {
    const arr = cloneArray(initialArray);
    const n = arr.length;
    const steps = [];
    let comparisons = 0;
    let swaps = 0;
    const sortedIndices = new Set();

    const getOkHighlights = () => {
      const h = {};
      sortedIndices.forEach(idx => {
        h[idx] = 'ok';
      });
      return h;
    };

    // Bước 0
    steps.push({
      array: cloneArray(arr),
      highlights: {},
      range: null,
      tags: {},
      groups: null,
      message: `Bắt đầu Quick Sort trên mảng gồm ${n} phần tử.`,
      codeLine: 1,
      stats: { comparisons, swaps }
    });

    function quickSortRecursive(lo, hi) {
      if (lo > hi) return;
      if (lo === hi) {
        sortedIndices.add(lo);
        steps.push({
          array: cloneArray(arr),
          highlights: { ...getOkHighlights() },
          range: [lo, hi],
          tags: { [lo]: 'ok' },
          groups: null,
          message: `Đoạn chỉ có 1 phần tử tại chỉ số ${lo} (giá trị ${arr[lo].value}), tự động đúng vị trí.`,
          codeLine: 2,
          stats: { comparisons, swaps }
        });
        return;
      }

      const pivotVal = arr[hi].value;

      steps.push({
        array: cloneArray(arr),
        highlights: {
          ...getOkHighlights(),
          [hi]: 'piv'
        },
        range: [lo, hi],
        tags: {
          [lo]: 'lo',
          [hi]: 'pivot'
        },
        groups: null,
        message: `Phân hoạch đoạn [${lo}..${hi}]: Chọn pivot = A[${hi}] = ${pivotVal}.`,
        codeLine: 3,
        stats: { comparisons, swaps }
      });

      let i = lo - 1;

      for (let j = lo; j < hi; j++) {
        comparisons++;
        const isSmaller = arr[j].value < pivotVal;

        steps.push({
          array: cloneArray(arr),
          highlights: {
            ...getOkHighlights(),
            [hi]: 'piv',
            [j]: 'cmp',
            ...(i >= lo ? { [i]: 'swp' } : {})
          },
          range: [lo, hi],
          tags: {
            [hi]: 'pivot',
            [j]: 'j',
            ...(i >= lo ? { [i]: 'i' } : {})
          },
          groups: null,
          message: `So sánh A[${j}] = ${arr[j].value} với pivot = ${pivotVal}. ${isSmaller ? arr[j].value + ' < ' + pivotVal + ', tăng i và đổi chỗ với A[i].' : arr[j].value + ' >= ' + pivotVal + ', giữ nguyên.'}`,
          codeLine: 3,
          stats: { comparisons, swaps }
        });

        if (isSmaller) {
          i++;
          if (i !== j) {
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            swaps++;

            steps.push({
              array: cloneArray(arr),
              highlights: {
                ...getOkHighlights(),
                [hi]: 'piv',
                [i]: 'swp',
                [j]: 'swp'
              },
              range: [lo, hi],
              tags: {
                [hi]: 'pivot',
                [i]: 'i',
                [j]: 'j'
              },
              groups: null,
              message: `Đổi chỗ A[${i}] (${arr[i].value}) và A[${j}] (${arr[j].value}) để đưa số nhỏ hơn sang trái.`,
              codeLine: 3,
              stats: { comparisons, swaps }
            });
          }
        }
      }

      // Đổi chỗ pivot về vị trí i + 1
      const p = i + 1;
      if (p !== hi) {
        const temp = arr[p];
        arr[p] = arr[hi];
        arr[hi] = temp;
        swaps++;

        steps.push({
          array: cloneArray(arr),
          highlights: {
            ...getOkHighlights(),
            [p]: 'swp',
            [hi]: 'swp'
          },
          range: [lo, hi],
          tags: {
            [p]: 'pivot mới',
            [hi]: 'cũ'
          },
          groups: null,
          message: `Đưa pivot ${arr[p].value} về đúng vị trí phân hoạch tại chỉ số ${p}.`,
          codeLine: 3,
          stats: { comparisons, swaps }
        });
      }

      sortedIndices.add(p);

      steps.push({
        array: cloneArray(arr),
        highlights: {
          ...getOkHighlights()
        },
        range: [lo, hi],
        tags: {
          [p]: 'Pivot cố định'
        },
        groups: null,
        message: `Pivot ${arr[p].value} tại chỉ số ${p} đã ở đúng vị trí cố định cuối cùng của nó.`,
        codeLine: 3,
        stats: { comparisons, swaps }
      });

      // Đệ quy hai nửa
      if (p - 1 >= lo) {
        quickSortRecursive(lo, p - 1);
      }
      if (p + 1 <= hi) {
        quickSortRecursive(p + 1, hi);
      }
    }

    quickSortRecursive(0, n - 1);

    for (let k = 0; k < n; k++) sortedIndices.add(k);

    const lastStep = steps[steps.length - 1];
    const isLastAllOk = lastStep && arr.every((_, idx) => lastStep.highlights && lastStep.highlights[idx] === 'ok');

    if (!isLastAllOk) {
      steps.push({
        array: cloneArray(arr),
        highlights: { ...getOkHighlights() },
        range: null,
        tags: {},
        groups: null,
        message: `Hoàn tất Quick Sort! Mảng đã được sắp xếp tăng dần (${comparisons} lần so sánh, ${swaps} lần đổi chỗ).`,
        codeLine: 1,
        stats: { comparisons, swaps }
      });
    } else if (lastStep) {
      lastStep.message = `Hoàn tất Quick Sort! Mảng đã được sắp xếp tăng dần (${comparisons} lần so sánh, ${swaps} lần đổi chỗ).`;
      lastStep.range = null;
      lastStep.tags = {};
      lastStep.codeLine = 1;
    }

    return steps;
  }
};
