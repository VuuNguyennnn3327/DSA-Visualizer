# DSA Visualizer – Mô Phỏng Thuật Toán Trực Quan

Ứng dụng web tương tác trực quan hóa từng bước các thuật toán Cấu trúc dữ liệu và Giải thuật (DSA) phổ biến nhất, được xây dựng hoàn toàn bằng **HTML, CSS và JavaScript thuần (ES Modules)**, không phụ thuộc vào bất kỳ framework hoặc công cụ build nào.

---

## 1. Tính năng nổi bật

- **9 thuật toán hoàn chỉnh**:
  - **Sắp xếp O(n²)**: Bubble Sort, Selection Sort, Insertion Sort.
  - **Sắp xếp O(n log n)**: Quick Sort, Merge Sort.
  - **Sắp xếp không so sánh**: Counting Sort (hiển thị mảng đếm tần suất & tích lũy), Radix Sort (hiển thị 10 xô 0–9).
  - **Tìm kiếm**: Linear Search (tìm kiếm tuyến tính), Binary Search (tìm kiếm nhị phân với khả năng thu hẹp khung `lo..hi` và tự động sắp xếp mảng).
- **Trực quan hóa sinh động**:
  - Dạng cột cho các thuật toán sắp xếp (chiều cao tỷ lệ với giá trị).
  - Dạng dãy ô số cho các thuật toán tìm kiếm.
  - Con trỏ trực quan (`i`, `j`, `pivot`, `lo`, `mid`, `hi`, `min`, `key`) hiển thị bằng huy hiệu màu sắc và mũi tên ngay phía trên cột.
  - Đổi chỗ có hiệu ứng trượt ngang và nhấc nhẹ lên.
  - Ký hiệu trợ năng (Accessibility icons: `🔍`, `🔄`, `📌`, `✓`, `★`, `✕`) giúp người khó phân biệt màu vẫn theo dõi chính xác.
- **Bảng chạy tay từng bước (Trace Table)**: Bảng mô phỏng chuẩn xác cách chạy tay từng bước trên giấy, xuất hiện đồng bộ theo từng nhịp chạy của bảng phần tử phía trên (không in sẵn trước) với toàn bộ dãy số và ký hiệu `<--->` kết nối các phần tử đang so sánh/đổi chỗ.
- **Bộ đếm thời gian thực**: Theo dõi số lần so sánh (`comparisons`) và số lần đổi chỗ / ghi mảng (`swaps`) tích hợp trực tiếp ngay trên thanh điều khiển phát.
- **Xem chi tiết thuật toán gọn gàng**: Khung mô tả chi tiết và độ phức tạp được chuyển xuống dưới bảng Trace Table thành nút mở rộng tiện dụng, giúp khu vực mô phỏng luôn hiển thị trọn vẹn ở vị trí cao nhất.
- **Xem mã nguồn đa ngôn ngữ**: Cửa sổ xem mã cài đặt mẫu hoàn chỉnh bằng **C++, Java, Python, JavaScript và Mã giả** có hỗ trợ sao chép nhanh (copy to clipboard).
- **Cấu hình & Khởi tạo mảng tiện lợi**: Nút "⚙️ Tuỳ chọn mảng" ngay trên thanh điều hướng trên cùng, mở hộp thoại trực quan cho phép điều chỉnh 5–20 phần tử, tạo ngẫu nhiên hoặc tự nhập mảng số.
- **Bảng so sánh tổng quan**: So sánh độ phức tạp (xấu nhất, tốt nhất, bộ nhớ), tính ổn định và lời khuyên khi nào nên dùng cho cả 9 thuật toán, kèm hướng dẫn ký hiệu Big-O.
- **Điều khiển phát linh hoạt & Tối ưu bố cục**: Các nút thực thi (Chạy/Tạm dừng, Về đầu, Đến cuối, Bước trước, Bước sau) được bố trí ngay góc trên bên phải bảng phần tử trực quan, đi kèm thanh kéo chọn bước và thanh trượt tốc độ.
- **Phím tắt tiện lợi**:
  - <kbd>Space</kbd>: Chạy / Tạm dừng
  - <kbd>←</kbd>: Lùi 1 bước
  - <kbd>→</kbd>: Tiến 1 bước
- **Giao diện hiện đại & Responsive**: Menu bên trái có thể thu gọn/mở rộng linh hoạt (collapsible sidebar), hỗ trợ Dark/Light theme tự động theo hệ điều hành hoặc chuyển đổi thủ công, tối ưu hoàn hảo trên máy tính và điện thoại di động (thanh điều khiển cố định ở đáy màn hình). Tôn trọng `prefers-reduced-motion`.

---

## 2. Cấu trúc thư mục

```text
dsa-visualizer/
├─ index.html                  # Khung giao diện HTML ngữ nghĩa
├─ README.md                   # Hướng dẫn chạy & tài liệu dự án
├─ css/
│  ├─ tokens.css               # Biến màu, font, khoảng cách, dark mode, motion
│  ├─ layout.css               # Bố cục 2 cột, sidebar thu gọn, responsive mobile
│  └─ components.css           # Cột mảng bo góc FLIP, bảng chạy tay, nút, modals
└─ js/
   ├─ main.js                  # Điểm khởi động ứng dụng, kết nối các module
   ├─ state.js                 # Quản lý trạng thái (StateStore, Pub-Sub)
   ├─ player.js                # Điều khiển phát, timer, phím tắt bàn phím
   ├─ renderer.js              # Vẽ cột mảng (FLIP), ô số, bảng chạy tay, cuộn an toàn
   ├─ ui.js                    # Quản lý sự kiện UI, modal mảng, modal code, modal tổng quan
   ├─ code-snippets.js         # Mã nguồn mẫu C++, Java, Python, JavaScript 9 thuật toán
   ├─ utils.js                 # Sinh mảng, phân tích input, hàm hỗ trợ
   └─ algorithms/
      ├─ index.js              # Đăng ký và phân nhóm thuật toán
      ├─ bubble.js             # Bubble Sort
      ├─ selection.js          # Selection Sort
      ├─ insertion.js          # Insertion Sort
      ├─ quick.js              # Quick Sort
      ├─ merge.js              # Merge Sort
      ├─ counting.js           # Counting Sort
      ├─ radix.js              # Radix Sort
      ├─ linear.js             # Linear Search
      └─ binary.js             # Binary Search
```

---

## 3. Hướng dẫn chạy dự án

Dự án sử dụng chuẩn **JavaScript ES Modules (`import`/`export`)**. Trình duyệt web hiện đại bảo vệ an ninh theo chính sách CORS sẽ **chặn** việc nạp module khi bạn nhấp đúp mở trực tiếp file `file:///.../index.html`. 

Vì vậy, bạn cần chạy trang web qua một **máy chủ web cục bộ (Local Server)** theo một trong các cách sau:

### Cách 1: Sử dụng Visual Studio Code (Khuyến nghị)
1. Cài đặt tiện ích mở rộng **Live Server** (của tác giả Ritwick Dey) trên VS Code.
2. Mở thư mục dự án trong VS Code.
3. Nhấp chuột phải vào file `index.html` và chọn **Open with Live Server** (hoặc bấm nút "Go Live" ở thanh trạng thái bên dưới).
4. Trình duyệt sẽ tự động mở tại địa chỉ `http://127.0.0.1:5500/index.html`.

### Cách 2: Sử dụng lệnh Node.js (`npx serve`)
Nếu máy đã cài Node.js, mở Terminal tại thư mục dự án và chạy:
```bash
npx serve .
```
Sau đó truy cập vào đường dẫn hiển thị trên màn hình (thường là `http://localhost:3000`).

### Cách 3: Sử dụng Python
Nếu máy có cài đặt Python, mở Terminal tại thư mục dự án và chạy:
```bash
# Đối với Python 3
python -m http.server 8000
```
Sau đó mở trình duyệt và truy cập: `http://localhost:8000`.

---

## 4. Cách thêm một thuật toán mới

Kiến trúc dự án được thiết kế hoàn toàn theo nguyên lý **Open/Closed Principle**. Để bổ sung một thuật toán mới, bạn **chỉ cần tạo một file thuật toán mới** và **đăng ký vào `js/algorithms/index.js`**, hoàn toàn không cần can thiệp vào mã nguồn của `renderer.js`, `player.js` hay `state.js`.

### Bước 1: Tạo file thuật toán mới trong `js/algorithms/`
Ví dụ tạo file `js/algorithms/heap.js`:

```javascript
import { cloneArray } from '../utils.js';

export default {
  id: 'heap',
  name: 'Heap Sort (Vun đống)',
  group: 'Sắp xếp O(n log n)',
  description: 'Xây dựng cây nhị phân Max-Heap từ mảng, sau đó lần lượt trích xuất phần tử lớn nhất ở gốc về cuối mảng.',
  analogy: 'Tương tự việc tìm người giỏi nhất trong một giải đấu đấu loại, trao huy chương rồi tiếp tục tìm người giỏi tiếp theo.',
  complexity: {
    worst: 'O(n log n)',
    best: 'O(n log n)',
    space: 'O(1)',
    stable: false
  },
  pseudocode: [
    'buildMaxHeap(A)',
    'for i = n - 1 down to 1:',
    '    swap(A[0], A[i])',
    '    heapify(A, 0, i)',
    'return A'
  ],
  inputRule: { min: 5, max: 100, sorted: false },

  // Hàm thuần: nhận mảng đầu vào và trả về danh sách các bước (steps)
  run(initialArray, options) {
    const arr = cloneArray(initialArray);
    const steps = [];
    let comparisons = 0;
    let swaps = 0;

    // Bước khởi đầu
    steps.push({
      array: cloneArray(arr),
      highlights: {},
      range: null,
      tags: {},
      groups: null,
      message: 'Bắt đầu Heap Sort...',
      codeLine: 1,
      stats: { comparisons, swaps }
    });

    // ... Cài đặt logic thuật toán và push các bước vào mảng steps ...

    return steps;
  }
};
```

#### Quy ước của mỗi object bước (`step`):
```javascript
{
  array: [...],            // Trạng thái mảng sau bước này: danh sách { id, value }
  highlights: {            // Trạng thái tô màu:
    [index]: 'cmp'         // - 'cmp': Đang so sánh
           | 'swp'         // - 'swp': Đổi chỗ / ghi
           | 'piv'         // - 'piv': Chốt / min / phần tử đang xét
           | 'ok'          // - 'ok': Đã đúng vị trí
           | 'fnd'         // - 'fnd': Tìm thấy mục tiêu
           | 'miss'        // - 'miss': Bị loại / ngoài phạm vi
  },
  range: [lo, hi] | null,  // Đoạn đang xử lý (phần ngoài bị mờ)
  tags: { [index]: 'i' },  // Nhãn con trỏ hiển thị badge trên đầu cột/ô số
  groups: [...] | null,    // Vùng phụ trợ (buckets, mảng đếm, nửa merge)
  message: 'Câu giải thích tiếng Việt ngắn gọn, dễ hiểu',
  codeLine: 2,             // Dòng mã giả đang thực thi (1-indexed)
  stats: { comparisons, swaps }
}
```

### Bước 2: Đăng ký thuật toán trong `js/algorithms/index.js`
Mở `js/algorithms/index.js`, thêm 2 dòng:
```javascript
import heap from './heap.js'; // 1. Import module mới

export const algorithms = [
  bubble,
  selection,
  insertion,
  quick,
  merge,
  counting,
  radix,
  linear,
  binary,
  heap // 2. Thêm vào danh sách
];
```

Hệ thống sẽ **tự động**:
- Thêm thuật toán vào đúng nhóm trên Sidebar.
- Cập nhật vào Bảng so sánh tổng quan.
- Tự động áp dụng bộ kiểm tra dữ liệu đầu vào theo `inputRule`.
- Đồng bộ bộ đếm thống kê, tô sáng mã giả và điều khiển phát.

---

## 5. Giấy phép
Dự án được xây dựng phục vụ mục đích học tập và nghiên cứu các giải thuật cấu trúc dữ liệu cơ bản. Tự do sử dụng, chỉnh sửa và phát triển.
