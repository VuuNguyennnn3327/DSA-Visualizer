/**
 * DSA Visualizer - Selection Sort (js/algorithms/selection.js)
 * Sắp xếp chọn trực tiếp O(n²)
 */
import { cloneArray } from '../utils.js';

export default {
  id: 'selection',
  name: 'Selection Sort',
  group: 'Sắp xếp O(n²)',
  description: 'Chia mảng thành hai phần: đã sắp xếp và chưa sắp xếp. Mỗi lượt tìm phần tử nhỏ nhất trong phần chưa sắp xếp rồi hoán đổi với phần tử đầu tiên của phần đó.',
  analogy: 'Tương tự như việc bạn chọn ra cuốn sách mỏng nhất trong chồng sách và xếp riêng sang một bên, lặp lại cho đến hết.',
  complexity: {
    worst: 'O(n²)',
    best: 'O(n²)',
    space: 'O(1)',
    stable: false
  },
  pseudocode: [
    'for i = 0 to n - 1:',
    '    min_idx = i',
    '    for j = i + 1 to n - 1:',
    '        if A[j] < A[min_idx]:',
    '            min_idx = j',
    '    if min_idx != i:',
    '        swap(A[i], A[min_idx])',
    'return A'
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

    // Bước 0: Bắt đầu
    steps.push({
      array: cloneArray(arr),
      highlights: {},
      range: null,
      tags: {},
      groups: null,
      message: `Bắt đầu Selection Sort với mảng ${n} phần tử.`,
      codeLine: 1,
      stats: { comparisons, swaps }
    });

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      steps.push({
        array: cloneArray(arr),
        highlights: {
          ...getOkHighlights(),
          [i]: 'piv'
        },
        range: [i, n - 1],
        tags: {
          [i]: 'min=i'
        },
        groups: null,
        message: `Lượt ${i + 1}: Giả định phần tử nhỏ nhất hiện tại là A[${i}] = ${arr[i].value}.`,
        codeLine: 2,
        stats: { comparisons, swaps }
      });

      for (let j = i + 1; j < n; j++) {
        comparisons++;
        const isSmaller = arr[j].value < arr[minIdx].value;

        steps.push({
          array: cloneArray(arr),
          highlights: {
            ...getOkHighlights(),
            [minIdx]: 'piv',
            [j]: 'cmp'
          },
          range: [i, n - 1],
          tags: {
            [minIdx]: 'min',
            [j]: 'j'
          },
          groups: null,
          message: `So sánh A[${j}] = ${arr[j].value} với min hiện tại A[${minIdx}] = ${arr[minIdx].value}. ${isSmaller ? 'Phát hiện giá trị nhỏ hơn!' : 'Không nhỏ hơn min.'}`,
          codeLine: 4,
          stats: { comparisons, swaps }
        });

        if (isSmaller) {
          minIdx = j;
          steps.push({
            array: cloneArray(arr),
            highlights: {
              ...getOkHighlights(),
              [minIdx]: 'piv'
            },
            range: [i, n - 1],
            tags: {
              [minIdx]: 'min mới'
            },
            groups: null,
            message: `Cập nhật chỉ số nhỏ nhất mới min_idx = ${minIdx} (giá trị ${arr[minIdx].value}).`,
            codeLine: 5,
            stats: { comparisons, swaps }
          });
        }
      }

      if (minIdx !== i) {
        // Đổi chỗ
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        swaps++;

        steps.push({
          array: cloneArray(arr),
          highlights: {
            ...getOkHighlights(),
            [i]: 'swp',
            [minIdx]: 'swp'
          },
          range: [i, n - 1],
          tags: {
            [i]: 'Đổi',
            [minIdx]: 'Đổi'
          },
          groups: null,
          message: `Hoán đổi phần tử nhỏ nhất ${arr[i].value} (tại vị trí ${minIdx}) với A[${i}] = ${arr[minIdx].value}.`,
          codeLine: 7,
          stats: { comparisons, swaps }
        });
      }

      // Đánh dấu i đã đúng vị trí
      sortedIndices.add(i);

      steps.push({
        array: cloneArray(arr),
        highlights: {
          ...getOkHighlights(),
          [i]: 'ok'
        },
        range: null,
        tags: {
          [i]: 'Đúng vị trí'
        },
        groups: null,
        message: `Phần tử ${arr[i].value} tại chỉ số ${i} đã được cố định đúng vị trí.`,
        codeLine: 8,
        stats: { comparisons, swaps }
      });
    }

    // Phần tử cuối cùng n - 1 tự động đúng vị trí
    sortedIndices.add(n - 1);

    steps.push({
      array: cloneArray(arr),
      highlights: { ...getOkHighlights() },
      range: null,
      tags: {},
      groups: null,
      message: `Hoàn tất! Mảng đã được sắp xếp tăng dần với ${comparisons} lần so sánh và ${swaps} lần đổi chỗ.`,
      codeLine: 8,
      stats: { comparisons, swaps }
    });

    return steps;
  }
};
