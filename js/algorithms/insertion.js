/**
 * DSA Visualizer - Insertion Sort (js/algorithms/insertion.js)
 * Sắp xếp chèn O(n²)
 */
import { cloneArray } from '../utils.js';

export default {
  id: 'insertion',
  name: 'Insertion Sort',
  group: 'Sắp xếp O(n²)',
  description: 'Duyệt mảng từ trái sang phải, lấy từng phần tử (key) và chèn nó vào đúng vị trí tương đối trong dãy các phần tử đứng trước đã có thứ tự.',
  analogy: 'Tương tự cách sắp xếp các lá bài trên tay: mỗi khi bốc một lá mới, bạn tìm khe thích hợp trong các lá đã có để chèn vào.',
  complexity: {
    worst: 'O(n²)',
    best: 'O(n)',
    space: 'O(1)',
    stable: true
  },
  pseudocode: [
    'for i = 1 to n - 1:',
    '    key = A[i]',
    '    j = i - 1',
    '    while j >= 0 and A[j] > key:',
    '        A[j + 1] = A[j]  // dịch chuyển sang phải',
    '        j = j - 1',
    '    A[j + 1] = key      // chèn vào vị trí đúng',
    'return A'
  ],
  inputRule: { min: 5, max: 100, sorted: false },

  run(initialArray) {
    const arr = cloneArray(initialArray);
    const n = arr.length;
    const steps = [];
    let comparisons = 0;
    let swaps = 0;

    // Bước 0: Bắt đầu, phần tử đầu tiên coi như đã sắp xếp
    steps.push({
      array: cloneArray(arr),
      highlights: { 0: 'ok' },
      range: null,
      tags: { 0: 'Đã xếp' },
      groups: null,
      message: `Bắt đầu Insertion Sort. Coi phần tử đầu tiên A[0] = ${arr[0].value} là dãy đã có thứ tự.`,
      codeLine: 1,
      stats: { comparisons, swaps }
    });

    for (let i = 1; i < n; i++) {
      const keyObj = { ...arr[i] };
      const keyVal = keyObj.value;

      steps.push({
        array: cloneArray(arr),
        highlights: {
          [i]: 'piv'
        },
        range: [0, i],
        tags: {
          [i]: 'key'
        },
        groups: null,
        message: `Lấy phần tử A[${i}] = ${keyVal} làm "key" cần chèn vào đoạn [0..${i - 1}].`,
        codeLine: 2,
        stats: { comparisons, swaps }
      });

      let j = i - 1;

      while (j >= 0) {
        comparisons++;
        const needShift = arr[j].value > keyVal;

        steps.push({
          array: cloneArray(arr),
          highlights: {
            [j]: 'cmp',
            [j + 1]: 'piv'
          },
          range: [0, i],
          tags: {
            [j]: 'j',
            [j + 1]: 'key'
          },
          groups: null,
          message: `So sánh A[${j}] = ${arr[j].value} với key = ${keyVal}. ${needShift ? arr[j].value + ' > ' + keyVal + ', dời A[' + j + '] sang phải.' : arr[j].value + ' <= ' + keyVal + ', đã tìm được vị trí chèn.'}`,
          codeLine: 4,
          stats: { comparisons, swaps }
        });

        if (needShift) {
          // Dịch A[j] sang A[j+1]
          arr[j + 1] = arr[j];
          swaps++;

          steps.push({
            array: cloneArray(arr),
            highlights: {
              [j + 1]: 'swp'
            },
            range: [0, i],
            tags: {
              [j + 1]: 'Dời sang phải'
            },
            groups: null,
            message: `Dịch chuyển giá trị ${arr[j + 1].value} sang chỉ số ${j + 1}.`,
            codeLine: 5,
            stats: { comparisons, swaps }
          });

          j--;
        } else {
          break;
        }
      }

      // Đặt key vào j + 1
      arr[j + 1] = keyObj;

      const currentSorted = {};
      for (let k = 0; k <= i; k++) currentSorted[k] = 'ok';

      if (i === n - 1) {
        steps.push({
          array: cloneArray(arr),
          highlights: currentSorted,
          range: null,
          tags: {
            [j + 1]: 'Đã chèn'
          },
          groups: null,
          message: `Chèn key = ${keyVal} vào vị trí ${j + 1}. Hoàn tất Insertion Sort! Mảng đã được sắp xếp tăng dần với ${comparisons} lần so sánh và ${swaps} lần dịch chuyển/hoán đổi.`,
          codeLine: 8,
          stats: { comparisons, swaps }
        });
      } else {
        steps.push({
          array: cloneArray(arr),
          highlights: {
            ...currentSorted,
            [j + 1]: 'ok'
          },
          range: [0, i],
          tags: {
            [j + 1]: 'Đã chèn'
          },
          groups: null,
          message: `Chèn key = ${keyVal} vào vị trí ${j + 1}. Đoạn [0..${i}] hiện đã có thứ tự.`,
          codeLine: 7,
          stats: { comparisons, swaps }
        });
      }
    }

    return steps;
  }
};
