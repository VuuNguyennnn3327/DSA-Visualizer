/**
 * DSA Visualizer - Practice Missions (js/practice-missions.js)
 * Danh sách nhiệm vụ thực hành có hướng dẫn từng bước cho các cấu trúc dữ liệu và giải thuật mới:
 * Singly Linked List, Stack, Queue, BST, AVL Tree, Heap, Linear & Binary Search.
 */

export const PRACTICE_MISSIONS = {
  linkedList: {
    title: 'Singly Linked List (DSLK Đơn)',
    tasks: [
      {
        id: 'insert_head',
        label: '➕ Thêm đầu',
        desc: 'Thêm một Node mới vào đầu danh sách (Head)',
        hint: 'Nhập số vào ô Giá trị (vd: 25) và bấm nút [➕ Thêm đầu] (Chi phí O(1))',
        buttonId: 'btn-linear-insert-head'
      },
      {
        id: 'insert_tail',
        label: '➕ Thêm đuôi',
        desc: 'Thêm một Node mới vào đuôi danh sách (Tail)',
        hint: 'Nhập số vào ô Giá trị (vd: 60) và bấm nút [➕ Thêm đuôi] (Chi phí O(n))',
        buttonId: 'btn-linear-insert-tail'
      },
      {
        id: 'search',
        label: '🔍 Tìm kiếm',
        desc: 'Tìm kiếm một giá trị trong danh sách liên kết',
        hint: 'Nhập số cần tìm vào ô Giá trị và bấm nút [🔍 Tìm(x)]',
        buttonId: 'btn-linear-search'
      },
      {
        id: 'reverse',
        label: '🔄 Đảo ngược',
        desc: 'Đảo ngược toàn bộ chiều liên kết trong danh sách',
        hint: 'Bấm nút [🔄 Đảo ngược] để đảo chiều các con trỏ Next O(n)',
        buttonId: 'btn-linear-reverse'
      }
    ]
  },

  stack: {
    title: 'Ngăn Xếp (Stack)',
    tasks: [
      {
        id: 'push',
        label: '📥 Push(x)',
        desc: 'Đẩy phần tử thứ nhất vào đỉnh ngăn xếp',
        hint: 'Nhập một số và bấm nút [📥 Push(x)]',
        buttonId: 'btn-linear-push'
      },
      {
        id: 'push',
        label: '📥 Push(x)',
        desc: 'Đẩy tiếp phần tử thứ hai vào đỉnh ngăn xếp',
        hint: 'Bấm nút [📥 Push(x)] lần nữa để đẩy thêm số vào đỉnh Stack',
        buttonId: 'btn-linear-push'
      },
      {
        id: 'peek',
        label: '👁 Peek()',
        desc: 'Xem giá trị phần tử ở đỉnh Top',
        hint: 'Bấm nút [👁 Peek()] để đọc giá trị đỉnh mà không xóa',
        buttonId: 'btn-linear-peek'
      },
      {
        id: 'pop',
        label: '📤 Pop()',
        desc: 'Lấy phần tử trên đỉnh ra khỏi ngăn xếp (LIFO)',
        hint: 'Bấm nút [📤 Pop()] để rút phần tử ở đỉnh ra khỏi ngăn xếp',
        buttonId: 'btn-linear-pop'
      }
    ]
  },

  queue: {
    title: 'Hàng Đợi (Queue)',
    tasks: [
      {
        id: 'enqueue',
        label: '📥 Enqueue(x)',
        desc: 'Thêm phần tử thứ nhất vào đuôi hàng đợi (Rear)',
        hint: 'Nhập một số và bấm nút [📥 Enqueue(x)]',
        buttonId: 'btn-linear-enqueue'
      },
      {
        id: 'enqueue',
        label: '📥 Enqueue(x)',
        desc: 'Thêm tiếp phần tử thứ hai vào đuôi hàng đợi',
        hint: 'Bấm nút [📥 Enqueue(x)] lần nữa để thêm phần tử vào hàng',
        buttonId: 'btn-linear-enqueue'
      },
      {
        id: 'front',
        label: '👁 GetFront()',
        desc: 'Xem phần tử đang đứng đầu hàng đợi (Front)',
        hint: 'Bấm nút [👁 GetFront()] để đọc phần tử đầu',
        buttonId: 'btn-linear-front'
      },
      {
        id: 'dequeue',
        label: '📤 Dequeue()',
        desc: 'Lấy phần tử đứng đầu ra khỏi hàng đợi (FIFO)',
        hint: 'Bấm nút [📤 Dequeue()] để đưa phần tử đầu ra khỏi hàng',
        buttonId: 'btn-linear-dequeue'
      }
    ]
  },

  bst: {
    title: 'Cây Nhị Phân Tìm Kiếm (BST)',
    tasks: [
      {
        id: 'insert',
        label: '➕ Chèn Node',
        desc: 'Chèn khóa gốc (Root) vào cây BST',
        hint: 'Nhập số (vd: 50) và bấm nút [➕ Chèn(x)]',
        buttonId: 'btn-tree-insert'
      },
      {
        id: 'insert',
        label: '➕ Chèn Node',
        desc: 'Chèn thêm khóa thứ hai vào cây BST',
        hint: 'Nhập số khác (vd: 25) và bấm nút [➕ Chèn(x)]',
        buttonId: 'btn-tree-insert'
      },
      {
        id: 'search',
        label: '🔍 Tìm kiếm',
        desc: 'Tìm kiếm một khóa trên cây BST',
        hint: 'Nhập số vừa chèn và bấm [🔍 Tìm(x)] để tìm kiếm O(h)',
        buttonId: 'btn-tree-search'
      },
      {
        id: 'inorder',
        label: '📖 Duyệt Inorder',
        desc: 'Duyệt Inorder (Trái - Gốc - Phải) thu dãy khóa tăng dần',
        hint: 'Bấm nút [📖 Duyệt Inorder] để duyệt cây theo thứ tự',
        buttonId: 'btn-tree-inorder'
      }
    ]
  },

  avlTree: {
    title: 'Cây Cân Bằng AVL',
    tasks: [
      {
        id: 'insert',
        label: '➕ Chèn khóa',
        desc: 'Chèn khóa vào cây AVL',
        hint: 'Nhập số và bấm nút [➕ Chèn(x)]',
        buttonId: 'btn-avl-insert'
      },
      {
        id: 'rotate',
        label: '🔄 Phép xoay',
        desc: 'Trải nghiệm phép xoay cân bằng cây AVL',
        hint: 'Bấm một trong các nút [⚡ Xoay LL] hoặc [⚡ Xoay RR] để quan sát xoay cây',
        buttonId: 'btn-avl-case-ll'
      },
      {
        id: 'search',
        label: '🔍 Tìm kiếm',
        desc: 'Tìm kiếm khóa trên cây AVL với tốc độ O(log n)',
        hint: 'Nhập số và bấm nút [🔍 Tìm(x)]',
        buttonId: 'btn-avl-search'
      }
    ]
  },

  heap: {
    title: 'Binary Max-Heap',
    tasks: [
      {
        id: 'push',
        label: '📥 Thêm(x)',
        desc: 'Thêm phần tử mới vào Heap và Sift-up',
        hint: 'Nhập số (vd: 95) và bấm [📥 Thêm(x)] để quan sát nổi lên đỉnh',
        buttonId: 'btn-heap-push'
      },
      {
        id: 'extract',
        label: '⚡ Rút Max()',
        desc: 'Rút phần tử lớn nhất ở đỉnh Heap (Root) và Sift-down',
        hint: 'Bấm nút [⚡ Rút Max()] để lấy khóa lớn nhất và vun lại đống',
        buttonId: 'btn-heap-extract'
      }
    ]
  }
};

/**
 * Lấy nhiệm vụ thực hành của thuật toán
 * @param {string} algoId 
 * @returns {object|null}
 */
export function getPracticeMission(algoId) {
  return PRACTICE_MISSIONS[algoId] || null;
}
