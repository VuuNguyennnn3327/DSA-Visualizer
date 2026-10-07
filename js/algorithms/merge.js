/**
 * DSA Visualizer - Merge Sort (js/algorithms/merge.js)
 * Sắp xếp trộn O(n log n)
 */
import { cloneArray } from '../utils.js';

export default {
  id: 'merge',
  name: 'Merge Sort',
  group: 'Sắp xếp O(n log n)',
  description: 'Chia đôi mảng liên tục cho đến khi thu được các mảng con 1 phần tử, sau đó lần lượt trộn (merge) các mảng con đã sắp xếp lại với nhau theo đúng thứ tự.',
  analogy: 'Tương tự việc chia đôi một xấp bài cho 2 người xếp thứ tự trước, sau đó so sánh lá đầu mỗi xấp để rút lần lượt ghép thành xấp bài hoàn chỉnh.',
  complexity: {
    worst: 'O(n log n)',
    best: 'O(n log n)',
    space: 'O(n)',
    stable: true
  },
  pseudocode: [
    'mergesort(lo, hi):',
    '    if lo >= hi: return',
    '    mid = floor((lo + hi) / 2)',
    '    mergesort(lo, mid)',
    '    mergesort(mid + 1, hi)',
    '    merge(lo, mid, hi) // Trộn 2 nửa trái/phải'
  ],
  inputRule: { min: 5, max: 100, sorted: false },

  run(initialArray) {
    const arr = cloneArray(initialArray);
    const n = arr.length;
    const steps = [];
    let comparisons = 0;
    let swaps = 0; // Số lần ghi/chuyển phần tử

    // Bước 0
    steps.push({
      array: cloneArray(arr),
      highlights: {},
      range: null,
      tags: {},
      groups: null,
      message: `Bắt đầu Merge Sort trên mảng gồm ${n} phần tử.`,
      codeLine: 1,
      stats: { comparisons, swaps }
    });

    function mergeSortRecursive(lo, hi) {
      if (lo >= hi) return;

      const mid = Math.floor((lo + hi) / 2);

      steps.push({
        array: cloneArray(arr),
        highlights: {
          [mid]: 'piv'
        },
        range: [lo, hi],
        tags: {
          [lo]: 'lo',
          [mid]: 'mid',
          [hi]: 'hi'
        },
        groups: null,
        message: `Chia đoạn [${lo}..${hi}] tại điểm giữa mid = ${mid}.`,
        codeLine: 3,
        stats: { comparisons, swaps }
      });

      mergeSortRecursive(lo, mid);
      mergeSortRecursive(mid + 1, hi);

      // Tiến hành trộn hai nửa [lo..mid] và [mid+1..hi]
      const leftArr = [];
      for (let k = lo; k <= mid; k++) leftArr.push({ ...arr[k] });

      const rightArr = [];
      for (let k = mid + 1; k <= hi; k++) rightArr.push({ ...arr[k] });

      let i = 0;
      let j = 0;
      let k = lo;

      const makeGroups = (activeLeft = null, activeRight = null) => [
        {
          type: 'merge',
          title: `Trộn hai nửa: Trái [${lo}..${mid}] và Phải [${mid + 1}..${hi}]`,
          left: leftArr.map((item, idx) => ({
            ...item,
            active: idx === activeLeft
          })),
          right: rightArr.map((item, idx) => ({
            ...item,
            active: idx === activeRight
          }))
        }
      ];

      steps.push({
        array: cloneArray(arr),
        highlights: {},
        range: [lo, hi],
        tags: { [lo]: 'Trộn', [hi]: 'Trộn' },
        groups: makeGroups(i, j),
        message: `Chuẩn bị trộn nửa trái (${leftArr.map(x => x.value).join(', ')}) và nửa phải (${rightArr.map(x => x.value).join(', ')}).`,
        codeLine: 6,
        stats: { comparisons, swaps }
      });

      while (i < leftArr.length && j < rightArr.length) {
        comparisons++;
        const chooseLeft = leftArr[i].value <= rightArr[j].value;

        steps.push({
          array: cloneArray(arr),
          highlights: {
            [k]: 'cmp'
          },
          range: [lo, hi],
          tags: { [k]: 'k' },
          groups: makeGroups(i, j),
          message: `So sánh Trái [${leftArr[i].value}] với Phải [${rightArr[j].value}]. ${chooseLeft ? 'Chọn giá trị Trái ' + leftArr[i].value : 'Chọn giá trị Phải ' + rightArr[j].value} đưa vào A[${k}].`,
          codeLine: 6,
          stats: { comparisons, swaps }
        });

        if (chooseLeft) {
          arr[k] = leftArr[i];
          i++;
        } else {
          arr[k] = rightArr[j];
          j++;
        }
        swaps++;

        steps.push({
          array: cloneArray(arr),
          highlights: {
            [k]: 'swp'
          },
          range: [lo, hi],
          tags: { [k]: 'Đã ghi' },
          groups: makeGroups(i, j),
          message: `Ghi giá trị ${arr[k].value} vào vị trí A[${k}].`,
          codeLine: 6,
          stats: { comparisons, swaps }
        });

        k++;
      }

      // Đưa các phần tử còn lại của mảng trái (nếu có)
      while (i < leftArr.length) {
        arr[k] = leftArr[i];
        swaps++;
        steps.push({
          array: cloneArray(arr),
          highlights: { [k]: 'swp' },
          range: [lo, hi],
          tags: { [k]: 'Ghi còn lại' },
          groups: makeGroups(i, j),
          message: `Đưa phần tử còn lại của mảng trái (${leftArr[i].value}) vào A[${k}].`,
          codeLine: 6,
          stats: { comparisons, swaps }
        });
        i++;
        k++;
      }

      // Đưa các phần tử còn lại của mảng phải (nếu có)
      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        swaps++;
        steps.push({
          array: cloneArray(arr),
          highlights: { [k]: 'swp' },
          range: [lo, hi],
          tags: { [k]: 'Ghi còn lại' },
          groups: makeGroups(i, j),
          message: `Đưa phần tử còn lại của mảng phải (${rightArr[j].value}) vào A[${k}].`,
          codeLine: 6,
          stats: { comparisons, swaps }
        });
        j++;
        k++;
      }

      // Đánh dấu đoạn vừa trộn xong là ok
      const segOk = {};
      for (let idx = lo; idx <= hi; idx++) segOk[idx] = 'ok';

      const isFinalMerge = (lo === 0 && hi === n - 1);

      steps.push({
        array: cloneArray(arr),
        highlights: segOk,
        range: isFinalMerge ? null : [lo, hi],
        tags: {},
        groups: null,
        message: isFinalMerge
          ? `Hoàn tất Merge Sort! Toàn bộ mảng đã được trộn và sắp xếp tăng dần (${comparisons} lần so sánh, ${swaps} lần ghi mảng).`
          : `Đoạn [${lo}..${hi}] đã được trộn và sắp xếp hoàn chỉnh.`,
        codeLine: isFinalMerge ? 1 : 6,
        stats: { comparisons, swaps }
      });
    }

    mergeSortRecursive(0, n - 1);
    return steps;
  }
};
