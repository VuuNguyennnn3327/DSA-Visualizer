/**
 * DSA Visualizer - AVL Tree (js/algorithms/avlTree.js)
 * Cây Nhị Phân Tự Cân Bằng AVL (Adelson-Velsky and Landis)
 */

export default {
  id: 'avlTree',
  name: 'AVL Tree (Cây tự cân bằng)',
  group: 'Cấu trúc Cây',
  type: 'tree',
  isTree: true,
  treeType: 'avl',
  description: 'Cây nhị phân tìm kiếm tự cân bằng đầu tiên trong khoa học máy tính. Tại mỗi node, độ chênh lệch chiều cao (Balance Factor BF = h_left - h_right) chỉ được phép là -1, 0 hoặc +1. Nếu |BF| > 1, cây tự động thực hiện 1 trong 4 phép xoay (LL, RR, LR, RL) để duy trì chiều cao O(log n).',
  analogy: 'Tương tự chiếc bập bênh hoặc cái cân hai đĩa tự động cân bằng: khi một bên quá nặng làm lệch quá 1 nấc, hệ thống sẽ tự xoay trục để đưa hai bên về trạng thái cân bằng.',
  complexity: {
    worst: 'O(log n) Mọi thao tác',
    best: 'O(1) Thao tác tại Root',
    space: 'O(n)',
    stable: true
  },
  pseudocode: [
    'BF(node) = height(node.left) - height(node.right)',
    '// 4 trường hợp mất cân bằng và phép xoay:',
    '1. Left-Left (LL, BF > 1 & x < left.val):',
    '   return rotateRight(node)',
    '2. Right-Right (RR, BF < -1 & x > right.val):',
    '   return rotateLeft(node)',
    '3. Left-Right (LR, BF > 1 & x > left.val):',
    '   node.left = rotateLeft(node.left); return rotateRight(node)',
    '4. Right-Left (RL, BF < -1 & x < right.val):',
    '   node.right = rotateRight(node.right); return rotateLeft(node)'
  ],
  inputRule: { min: 5, max: 99, sorted: false },

  /**
   * Sinh các bước mô phỏng chi tiết chèn và tự cân bằng AVL
   */
  run(initialArray = [], options = {}) {
    const steps = [];
    // Bộ số mẫu kích hoạt các phép xoay chuẩn (RR, LL, LR)
    const valuesToInsert = [10, 20, 30, 40, 50, 25];

    let nodeCounter = 0;

    function height(node) {
      return node ? node.height : 0;
    }

    function getBF(node) {
      return node ? height(node.left) - height(node.right) : 0;
    }

    function cloneTree(node) {
      if (!node) return null;
      return {
        id: node.id,
        val: node.val,
        height: node.height,
        bf: node.bf,
        left: cloneTree(node.left),
        right: cloneTree(node.right)
      };
    }

    function updateHeightAndBF(node) {
      if (!node) return;
      node.height = 1 + Math.max(height(node.left), height(node.right));
      node.bf = getBF(node);
    }

    // Phép xoay phải (Right Rotation - giải quyết trường hợp LL)
    function rotateRight(y) {
      const x = y.left;
      const T2 = x.right;
      x.right = y;
      y.left = T2;
      updateHeightAndBF(y);
      updateHeightAndBF(x);
      return x;
    }

    // Phép xoay trái (Left Rotation - giải quyết trường hợp RR)
    function rotateLeft(x) {
      const y = x.right;
      const T2 = y.left;
      y.left = x;
      x.right = T2;
      updateHeightAndBF(x);
      updateHeightAndBF(y);
      return y;
    }

    let root = null;

    // Bước 0
    steps.push({
      treeType: 'avl',
      root: null,
      activeNodeId: null,
      activeAction: 'init',
      message: 'Khởi tạo Cây tự cân bằng AVL rỗng: Root = NULL. Tiêu chí cân bằng: |BF| <= 1 tại mọi đỉnh.',
      codeLine: 1,
      isTree: true
    });

    for (let i = 0; i < valuesToInsert.length; i++) {
      const val = valuesToInsert[i];

      function insertAVL(curr, newVal) {
        if (!curr) {
          nodeCounter++;
          const newNode = {
            id: `avl-node-${nodeCounter}`,
            val: newVal,
            height: 1,
            bf: 0,
            left: null,
            right: null
          };
          return newNode;
        }

        if (newVal < curr.val) {
          curr.left = insertAVL(curr.left, newVal);
        } else if (newVal > curr.val) {
          curr.right = insertAVL(curr.right, newVal);
        } else {
          return curr; // Không chèn trùng
        }

        updateHeightAndBF(curr);
        const balance = curr.bf;

        // Kiểm tra 4 trường hợp mất cân bằng
        // Case 1: Left Left (LL)
        if (balance > 1 && newVal < curr.left.val) {
          steps.push({
            treeType: 'avl',
            root: cloneTree(root),
            activeNodeId: curr.id,
            activeAction: 'unbalanced_ll',
            activeItem: curr.val,
            message: `⚠️ MẤT CÂN BẰNG LL tại Node(${curr.val}) với BF = ${balance} (> 1). Thực hiện phép XOAY PHẢI (Right Rotation)...`,
            codeLine: 3,
            isTree: true
          });
          const rotated = rotateRight(curr);
          steps.push({
            treeType: 'avl',
            root: cloneTree(root),
            activeNodeId: rotated.id,
            activeAction: 'rotate_done',
            activeItem: rotated.val,
            message: `✓ Đã xoay phải thành công! Node(${rotated.val}) trở thành gốc mới của nhánh. Cây đã cân bằng trở lại.`,
            codeLine: 4,
            isTree: true
          });
          return rotated;
        }

        // Case 2: Right Right (RR)
        if (balance < -1 && newVal > curr.right.val) {
          steps.push({
            treeType: 'avl',
            root: cloneTree(root),
            activeNodeId: curr.id,
            activeAction: 'unbalanced_rr',
            activeItem: curr.val,
            message: `⚠️ MẤT CÂN BẰNG RR tại Node(${curr.val}) với BF = ${balance} (< -1). Thực hiện phép XOAY TRÁI (Left Rotation)...`,
            codeLine: 5,
            isTree: true
          });
          const rotated = rotateLeft(curr);
          steps.push({
            treeType: 'avl',
            root: cloneTree(root),
            activeNodeId: rotated.id,
            activeAction: 'rotate_done',
            activeItem: rotated.val,
            message: `✓ Đã xoay trái thành công! Node(${rotated.val}) trở thành gốc mới của nhánh. Cây đã cân bằng trở lại.`,
            codeLine: 6,
            isTree: true
          });
          return rotated;
        }

        // Case 3: Left Right (LR)
        if (balance > 1 && newVal > curr.left.val) {
          steps.push({
            treeType: 'avl',
            root: cloneTree(root),
            activeNodeId: curr.id,
            activeAction: 'unbalanced_lr',
            activeItem: curr.val,
            message: `⚠️ MẤT CÂN BẰNG LR tại Node(${curr.val}) với BF = ${balance} (> 1). Thực hiện XOAY KÉP: Xoay trái con bên trái rồi xoay phải node gốc...`,
            codeLine: 7,
            isTree: true
          });
          curr.left = rotateLeft(curr.left);
          const rotated = rotateRight(curr);
          steps.push({
            treeType: 'avl',
            root: cloneTree(root),
            activeNodeId: rotated.id,
            activeAction: 'rotate_done',
            activeItem: rotated.val,
            message: `✓ Đã hoàn tất xoay kép LR! Node(${rotated.val}) đã cân bằng. Chiều cao nhánh tối ưu.`,
            codeLine: 8,
            isTree: true
          });
          return rotated;
        }

        // Case 4: Right Left (RL)
        if (balance < -1 && newVal < curr.right.val) {
          steps.push({
            treeType: 'avl',
            root: cloneTree(root),
            activeNodeId: curr.id,
            activeAction: 'unbalanced_rl',
            activeItem: curr.val,
            message: `⚠️ MẤT CÂN BẰNG RL tại Node(${curr.val}) với BF = ${balance} (< -1). Thực hiện XOAY KÉP: Xoay phải con bên phải rồi xoay trái node gốc...`,
            codeLine: 9,
            isTree: true
          });
          curr.right = rotateRight(curr.right);
          const rotated = rotateLeft(curr);
          steps.push({
            treeType: 'avl',
            root: cloneTree(root),
            activeNodeId: rotated.id,
            activeAction: 'rotate_done',
            activeItem: rotated.val,
            message: `✓ Đã hoàn tất xoay kép RL! Node(${rotated.val}) đã cân bằng. Chiều cao nhánh tối ưu.`,
            codeLine: 10,
            isTree: true
          });
          return rotated;
        }

        return curr;
      }

      root = insertAVL(root, val);

      steps.push({
        treeType: 'avl',
        root: cloneTree(root),
        activeNodeId: `avl-node-${nodeCounter}`,
        activeAction: 'insert_done',
        activeItem: val,
        message: `Đã chèn Node(${val}) vào cây AVL. Cập nhật chiều cao h = ${height(root)}, hệ số BF tại mọi đỉnh đều trong khoảng [-1, 1].`,
        codeLine: 1,
        isTree: true
      });
    }

    // Bước hoàn tất
    steps.push({
      treeType: 'avl',
      root: cloneTree(root),
      activeNodeId: null,
      activeAction: 'complete',
      message: `Hoàn tất mô phỏng Cây tự cân bằng AVL! Chiều cao cây luôn đạt O(log n), đảm bảo tốc độ tra cứu tối ưu.`,
      codeLine: 1,
      isComplete: true,
      isTree: true
    });

    return steps;
  }
};
