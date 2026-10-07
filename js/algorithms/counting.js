/**
 * DSA Visualizer - Counting Sort (js/algorithms/counting.js)
 * Sắp xếp đếm phân phối O(n + k)
 */
import { cloneArray } from '../utils.js';

export default {
  id: 'counting',
  name: 'Counting Sort',
  group: 'Sắp xếp không so sánh',
  description: 'Không so sánh các phần tử với nhau mà đếm số lần xuất hiện của từng giá trị, sau đó tính vị trí tích lũy để đặt thẳng phần tử vào mảng kết quả.',
  analogy: 'Tương tự việc kiểm phiếu bầu cử: phân loại phiếu vào từng hòm của mỗi ứng viên rồi đếm số lượng, sau đó ghi lại danh sách kết quả.',
  complexity: {
    worst: 'O(n + k)',
    best: 'O(n + k)',
    space: 'O(k)',
    stable: true
  },
  pseudocode: [
    'maxVal = max(A)',
    'count = array of 0 (kích thước maxVal + 1)',
    'for x in A: count[x]++',
    'for i = 1 to maxVal: count[i] += count[i - 1] // Tích lũy',
    'for x in reverse(A): output[--count[x]] = x',
    'A = output'
  ],
  inputRule: { min: 0, max: 30, sorted: false },

  run(initialArray) {
    const arr = cloneArray(initialArray);
    const n = arr.length;
    const steps = [];
    let comparisons = 0; // Counting sort không so sánh trực tiếp các cặp
    let swaps = 0;

    // Tìm max
    const maxVal = Math.min(30, Math.max(...arr.map(x => x.value), 0));
    const countArr = new Array(maxVal + 1).fill(0);

    const makeCountGroup = (activeIdx = null) => [
      {
        type: 'counting',
        title: `Mảng đếm count[0..${maxVal}]`,
        data: countArr.map((val, idx) => ({
          index: idx,
          count: val,
          active: idx === activeIdx
        }))
      }
    ];

    // Bước 0
    steps.push({
      array: cloneArray(arr),
      highlights: {},
      range: null,
      tags: {},
      groups: makeCountGroup(),
      message: `Bắt đầu Counting Sort. Giá trị lớn nhất là max = ${maxVal}. Khởi tạo mảng đếm kích thước ${maxVal + 1}.`,
      codeLine: 2,
      stats: { comparisons, swaps }
    });

    // Bước 1: Đếm tần suất
    for (let i = 0; i < n; i++) {
      const val = arr[i].value;
      countArr[val]++;

      steps.push({
        array: cloneArray(arr),
        highlights: { [i]: 'cmp' },
        range: null,
        tags: { [i]: `Đếm: ${val}` },
        groups: makeCountGroup(val),
        message: `Đọc A[${i}] = ${val}: Tăng count[${val}] lên ${countArr[val]}.`,
        codeLine: 3,
        stats: { comparisons, swaps }
      });
    }

    // Bước 2: Tích lũy cộng dồn
    for (let i = 1; i <= maxVal; i++) {
      countArr[i] += countArr[i - 1];
      steps.push({
        array: cloneArray(arr),
        highlights: {},
        range: null,
        tags: {},
        groups: makeCountGroup(i),
        message: `Cộng dồn vị trí: count[${i}] += count[${i - 1}] = ${countArr[i]}.`,
        codeLine: 4,
        stats: { comparisons, swaps }
      });
    }

    // Bước 3: Đặt vào mảng kết quả output
    const output = new Array(n);
    const countCopy = [...countArr];

    for (let i = n - 1; i >= 0; i--) {
      const val = arr[i].value;
      const targetPos = countCopy[val] - 1;
      countCopy[val]--;
      output[targetPos] = { ...arr[i] };
      swaps++;

      steps.push({
        array: cloneArray(arr),
        highlights: { [i]: 'piv' },
        range: null,
        tags: { [i]: `Đặt vào pos ${targetPos}` },
        groups: [
          {
            type: 'counting',
            title: `Mảng đếm tích lũy - Đặt giá trị ${val} vào vị trí ${targetPos}`,
            data: countCopy.map((cnt, idx) => ({
              index: idx,
              count: cnt,
              active: idx === val
            }))
          }
        ],
        message: `Duyệt A[${i}] = ${val}: Đặt vào vị trí output[${targetPos}], giảm count[${val}] còn ${countCopy[val]}.`,
        codeLine: 5,
        stats: { comparisons, swaps }
      });
    }

    // Chép output về mảng chính
    for (let i = 0; i < n; i++) {
      arr[i] = output[i];
    }

    const allOk = {};
    for (let i = 0; i < n; i++) allOk[i] = 'ok';

    steps.push({
      array: cloneArray(arr),
      highlights: allOk,
      range: null,
      tags: {},
      groups: null,
      message: `Hoàn tất Counting Sort! Toàn bộ mảng đã được phân phối về đúng thứ tự tăng dần.`,
      codeLine: 6,
      stats: { comparisons, swaps }
    });

    return steps;
  }
};
