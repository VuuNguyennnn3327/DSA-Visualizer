/**
 * DSA Visualizer - Bubble Sort (js/algorithms/bubble.js)
 * Sắp xếp nổi bọt O(n²)
 */
import { cloneArray } from '../utils.js';

export default {
  id: 'bubble',
  name: 'Bubble Sort',
  group: 'Sắp xếp O(n²)',
  description: 'Duyệt qua mảng nhiều lần, liên tục so sánh hai phần tử liền kề và đổi chỗ nếu chúng sai thứ tự. Sau mỗi vòng lặp, phần tử lớn nhất còn lại sẽ "nổi" về đúng vị trí cuối cùng.',
  analogy: 'Tương tự những bọt khí lớn trong cốc nước ngọt luôn nổi lên bề mặt nhanh hơn các bọt khí nhỏ.',
  complexity: {
    worst: 'O(n²)',
    best: 'O(n)',
    space: 'O(1)',
    stable: true
  },
  pseudocode: [
    'for i = 0 to n - 1:',
    '    swapped = false',
    '    for j = 0 to n - i - 2:',
    '        if A[j] > A[j + 1]:',
    '            swap(A[j], A[j + 1])',
    '            swapped = true',
    '    if not swapped: break',
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
      message: `Bắt đầu Bubble Sort trên mảng gồm ${n} phần tử.`,
      codeLine: 1,
      stats: { comparisons, swaps }
    });

    for (let i = 0; i < n; i++) {
      let swapped = false;

      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;

        // Bước so sánh
        const isGreater = arr[j].value > arr[j + 1].value;
        steps.push({
          array: cloneArray(arr),
          highlights: {
            ...getOkHighlights(),
            [j]: 'cmp',
            [j + 1]: 'cmp'
          },
          range: [0, n - 1 - i],
          tags: {
            [j]: 'j',
            [j + 1]: 'j+1'
          },
          groups: null,
          message: `So sánh A[${j}] = ${arr[j].value} với A[${j + 1}] = ${arr[j + 1].value}. ${isGreater ? 'Vì ' + arr[j].value + ' > ' + arr[j + 1].value + ', cần đổi chỗ.' : 'Đã đúng thứ tự, không đổi chỗ.'}`,
          codeLine: 4,
          stats: { comparisons, swaps }
        });

        if (isGreater) {
          // Hoán đổi
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swaps++;
          swapped = true;

          // Bước sau hoán đổi
          steps.push({
            array: cloneArray(arr),
            highlights: {
              ...getOkHighlights(),
              [j]: 'swp',
              [j + 1]: 'swp'
            },
            range: [0, n - 1 - i],
            tags: {
              [j]: 'j',
              [j + 1]: 'j+1'
            },
            groups: null,
            message: `Đã hoán đổi vị trí của ${arr[j + 1].value} và ${arr[j].value}.`,
            codeLine: 5,
            stats: { comparisons, swaps }
          });
        }
      }

      // Phần tử ở cuối lượt đã đúng vị trí
      const sortedIdx = n - 1 - i;
      sortedIndices.add(sortedIdx);

      // Nếu chỉ còn 1 phần tử chưa xếp (ở vị trí 0), tự động đúng vị trí
      if (sortedIndices.size === n - 1) {
        sortedIndices.add(0);
      }

      if (!swapped || sortedIndices.size >= n) {
        for (let k = 0; k < n; k++) sortedIndices.add(k);
        steps.push({
          array: cloneArray(arr),
          highlights: { ...getOkHighlights() },
          range: null,
          tags: {},
          groups: null,
          message: !swapped
            ? `Trong lượt ${i + 1} không có phép hoán đổi nào. Mảng đã hoàn tất sắp xếp sớm với ${comparisons} lần so sánh và ${swaps} lần đổi chỗ!`
            : `Hoàn tất! Mảng đã được sắp xếp tăng dần với tổng cộng ${comparisons} lần so sánh và ${swaps} lần đổi chỗ.`,
          codeLine: 8,
          stats: { comparisons, swaps }
        });
        break;
      }

      steps.push({
        array: cloneArray(arr),
        highlights: {
          ...getOkHighlights(),
          [sortedIdx]: 'ok'
        },
        range: null,
        tags: { [sortedIdx]: 'Đúng vị trí' },
        groups: null,
        message: `Phần tử ${arr[sortedIdx].value} tại chỉ số ${sortedIdx} đã được đưa về đúng vị trí cố định.`,
        codeLine: 6,
        stats: { comparisons, swaps }
      });
    }

    return steps;
  }
};
