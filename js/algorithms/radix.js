/**
 * DSA Visualizer - Radix Sort (js/algorithms/radix.js)
 * Sắp xếp theo cơ số O(d * (n + k))
 */
import { cloneArray } from '../utils.js';

export default {
  id: 'radix',
  name: 'Radix Sort',
  group: 'Sắp xếp không so sánh',
  description: 'Sắp xếp từng chữ số từ hàng thấp đến hàng cao (đơn vị -> chục -> trăm) bằng cách phân phối các số vào 10 xô (0–9) tương ứng, sau đó gom lại tuần tự.',
  analogy: 'Tương tự như phân loại thư theo mã bưu chính: xếp thư vào 10 ngăn theo số cuối cùng, rồi gom lại và lặp lại cho các chữ số phía trước.',
  complexity: {
    worst: 'O(d * (n + k))',
    best: 'O(d * (n + k))',
    space: 'O(n + k)',
    stable: true
  },
  pseudocode: [
    'maxVal = max(A)',
    'for exp = 1, 10, 100... (khi maxVal / exp > 0):',
    '    Khởi tạo 10 xô rỗng buckets[0..9]',
    '    for x in A: buckets[(x / exp) % 10].push(x) // Phân phối',
    '    A = gom các phần tử từ buckets[0..9]      // Thu thập',
    'return A'
  ],
  inputRule: { min: 0, max: 999, sorted: false },

  run(initialArray) {
    const arr = cloneArray(initialArray);
    const n = arr.length;
    const steps = [];
    let comparisons = 0;
    let swaps = 0;

    const maxVal = Math.max(...arr.map(x => x.value), 0);

    const getExpName = (exp) => {
      if (exp === 1) return 'đơn vị';
      if (exp === 10) return 'chục';
      if (exp === 100) return 'trăm';
      return `cơ số 10^${Math.log10(exp)}`;
    };

    const makeBucketsData = (buckets, activeDigit = null) => [
      {
        type: 'buckets',
        title: `10 xô phân loại theo chữ số (0 - 9)`,
        buckets: buckets.map((items, digit) => ({
          digit,
          items: items.map(it => it.value),
          active: digit === activeDigit
        }))
      }
    ];

    // Bước 0
    steps.push({
      array: cloneArray(arr),
      highlights: {},
      range: null,
      tags: {},
      groups: null,
      message: `Bắt đầu Radix Sort (LSD). Giá trị lớn nhất là ${maxVal}, cần xét các hàng chữ số.`,
      codeLine: 1,
      stats: { comparisons, swaps }
    });

    for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
      const expName = getExpName(exp);
      const buckets = Array.from({ length: 10 }, () => []);

      steps.push({
        array: cloneArray(arr),
        highlights: {},
        range: null,
        tags: {},
        groups: makeBucketsData(buckets),
        message: `Bắt đầu lượt sắp xếp theo hàng ${expName} (exp = ${exp}). Khởi tạo 10 xô trống từ 0 đến 9.`,
        codeLine: 3,
        stats: { comparisons, swaps }
      });

      // Phân phối vào các xô
      for (let i = 0; i < n; i++) {
        const item = arr[i];
        const digit = Math.floor(item.value / exp) % 10;
        buckets[digit].push(item);

        steps.push({
          array: cloneArray(arr),
          highlights: { [i]: 'piv' },
          range: null,
          tags: { [i]: `chữ số: ${digit}` },
          groups: makeBucketsData(buckets, digit),
          message: `Số ${item.value} có chữ số hàng ${expName} là ${digit} -> Phân phối vào Xô ${digit}.`,
          codeLine: 4,
          stats: { comparisons, swaps }
        });
      }

      // Thu thập các phần tử từ các xô trở lại mảng
      let index = 0;
      for (let digit = 0; digit < 10; digit++) {
        while (buckets[digit].length > 0) {
          const item = buckets[digit].shift();
          arr[index] = item;
          swaps++;

          steps.push({
            array: cloneArray(arr),
            highlights: { [index]: 'swp' },
            range: null,
            tags: { [index]: `Từ xô ${digit}` },
            groups: makeBucketsData(buckets, digit),
            message: `Lấy ${item.value} từ Xô ${digit} đưa vào vị trí mảng A[${index}].`,
            codeLine: 5,
            stats: { comparisons, swaps }
          });

          index++;
        }
      }

      steps.push({
        array: cloneArray(arr),
        highlights: {},
        range: null,
        tags: {},
        groups: null,
        message: `Đã hoàn tất gom mảng sau khi sắp xếp theo hàng ${expName}.`,
        codeLine: 5,
        stats: { comparisons, swaps }
      });
    }

    const allOk = {};
    for (let i = 0; i < n; i++) allOk[i] = 'ok';

    steps.push({
      array: cloneArray(arr),
      highlights: allOk,
      range: null,
      tags: {},
      groups: null,
      message: `Hoàn tất Radix Sort! Tất cả các chữ số đã được xử lý và mảng đã có thứ tự tăng dần.`,
      codeLine: 6,
      stats: { comparisons, swaps }
    });

    return steps;
  }
};
