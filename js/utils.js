/**
 * DSA Visualizer - Utility Functions (js/utils.js)
 * Các hàm tiện ích: sinh mảng ngẫu nhiên, kiểm tra tính hợp lệ dữ liệu nhập,
 * sao chép mảng và các phép toán hỗ trợ.
 */

let elementIdCounter = 0;

/**
 * Tạo ID duy nhất cho phần tử trong mảng để theo dõi chuyển động trượt ngang DOM
 * @returns {string} ID duy nhất
 */
export function generateUniqueId() {
  elementIdCounter += 1;
  return `el-${elementIdCounter}-${Date.now().toString(36)}`;
}

/**
 * Sinh mảng ngẫu nhiên với các ràng buộc về số lượng và khoảng giá trị
 * @param {number} size - Số lượng phần tử (5 - 20)
 * @param {number} min - Giá trị nhỏ nhất
 * @param {number} max - Giá trị lớn nhất
 * @param {boolean} sorted - Có cần sắp xếp tăng dần không (cho Binary Search)
 * @returns {Array<{id: string, value: number}>} Mảng các phần tử
 */
export function generateRandomArray(size = 10, min = 5, max = 100, sorted = false) {
  const safeSize = Math.max(5, Math.min(20, Math.round(size)));
  const result = [];

  for (let i = 0; i < safeSize; i++) {
    const randomVal = Math.floor(Math.random() * (max - min + 1)) + min;
    result.push({
      id: generateUniqueId(),
      value: randomVal
    });
  }

  if (sorted) {
    result.sort((a, b) => a.value - b.value);
  }

  return result;
}

/**
 * Kiểm tra và phân tích chuỗi nhập mảng từ người dùng
 * Hỗ trợ dấu phẩy hoặc khoảng trắng làm dấu phân cách
 * @param {string} inputStr - Chuỗi nhập từ người dùng (ví dụ: "12, 45, 7, 23")
 * @param {number} minVal - Giá trị tối thiểu cho phép
 * @param {number} maxVal - Giá trị tối đa cho phép
 * @param {boolean} sorted - Yêu cầu sắp xếp (cho Binary Search)
 * @returns {{valid: boolean, data?: Array<{id: string, value: number}>, error?: string}}
 */
export function parseArrayInput(inputStr, minVal = 0, maxVal = 100, sorted = false) {
  if (!inputStr || typeof inputStr !== 'string' || inputStr.trim() === '') {
    return {
      valid: false,
      error: 'Vui lòng nhập ít nhất một dãy số (ví dụ: 15, 30, 8, 42).'
    };
  }

  // Tách bằng dấu phẩy hoặc khoảng trắng
  const parts = inputStr
    .trim()
    .split(/[\s,]+/)
    .filter(p => p.length > 0);

  if (parts.length < 5 || parts.length > 20) {
    return {
      valid: false,
      error: `Số lượng phần tử phải từ 5 đến 20 (hiện tại có ${parts.length} số).`
    };
  }

  const values = [];
  for (const part of parts) {
    const num = Number(part);
    if (isNaN(num) || !Number.isInteger(num)) {
      return {
        valid: false,
        error: `Giá trị "${part}" không phải là số nguyên hợp lệ.`
      };
    }
    if (num < minVal || num > maxVal) {
      return {
        valid: false,
        error: `Giá trị ${num} nằm ngoài khoảng cho phép [${minVal}, ${maxVal}].`
      };
    }
    values.push(num);
  }

  if (sorted) {
    values.sort((a, b) => a - b);
  }

  const result = values.map(val => ({
    id: generateUniqueId(),
    value: val
  }));

  return {
    valid: true,
    data: result
  };
}

/**
 * Deep copy một mảng phần tử { id, value }
 * @param {Array<{id: string, value: number}>} arr 
 * @returns {Array<{id: string, value: number}>}
 */
export function cloneArray(arr) {
  return arr.map(item => ({ ...item }));
}

/**
 * Giới hạn giá trị trong khoảng [min, max]
 * @param {number} val 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Trì hoãn thực thi một khoảng thời gian (dùng khi cần await)
 * @param {number} ms 
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sinh mảng đã sắp xếp tăng dần sẵn (Best Case)
 */
export function generateSortedArray(size = 10, min = 5, max = 100) {
  const arr = generateRandomArray(size, min, max, true);
  return arr;
}

/**
 * Sinh mảng đảo ngược hoàn toàn từ lớn đến bé (Worst Case)
 */
export function generateReverseSortedArray(size = 10, min = 5, max = 100) {
  const arr = generateRandomArray(size, min, max, false);
  arr.sort((a, b) => b.value - a.value);
  return arr;
}

/**
 * Sinh mảng gần như đã sắp xếp (chỉ 1 hoặc 2 cặp bị đảo lộn)
 */
export function generateNearlySortedArray(size = 10, min = 5, max = 100) {
  const arr = generateRandomArray(size, min, max, true);
  // Hoán đổi 1 hoặc 2 cặp liền kề
  const n = arr.length;
  if (n > 3) {
    const idx1 = Math.floor(n / 3);
    const temp1 = arr[idx1];
    arr[idx1] = arr[idx1 + 1];
    arr[idx1 + 1] = temp1;

    if (n >= 8) {
      const idx2 = Math.floor((2 * n) / 3);
      const temp2 = arr[idx2];
      arr[idx2] = arr[idx2 + 1];
      arr[idx2 + 1] = temp2;
    }
  }
  return arr;
}

/**
 * Sinh mảng có nhiều phần tử trùng lặp (Duplicates / Few Unique Values)
 */
export function generateDuplicatesArray(size = 10, min = 5, max = 100) {
  const safeSize = Math.max(5, Math.min(20, Math.round(size)));
  const poolSize = Math.max(3, Math.floor(safeSize / 3));
  const pool = [];
  for (let i = 0; i < poolSize; i++) {
    pool.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  const result = [];
  for (let i = 0; i < safeSize; i++) {
    const val = pool[Math.floor(Math.random() * pool.length)];
    result.push({
      id: generateUniqueId(),
      value: val
    });
  }
  return result;
}
