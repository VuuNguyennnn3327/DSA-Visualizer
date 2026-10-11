/**
 * DSA Visualizer - Code Snippets (js/code-snippets.js)
 * Cung cấp mã nguồn cài đặt mẫu bằng C++, Java, Python và JavaScript cho cả 9 thuật toán.
 */

export const codeSnippets = {
  bubble: {
    cpp: `// C++: Bubble Sort (Sắp xếp nổi bọt)
#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        // Nếu không có phép hoán đổi nào, mảng đã có thứ tự
        if (!swapped) break;
    }
}`,
    java: `// Java: Bubble Sort (Sắp xếp nổi bọt)
public class BubbleSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }
}`,
    python: `# Python: Bubble Sort (Sắp xếp nổi bọt)
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
    javascript: `// JavaScript: Bubble Sort (Sắp xếp nổi bọt)
function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    return arr;
}`
  },

  selection: {
    cpp: `// C++: Selection Sort (Sắp xếp chọn)
#include <iostream>
#include <vector>
using namespace std;

void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx != i) {
            swap(arr[i], arr[minIdx]);
        }
    }
}`,
    java: `// Java: Selection Sort (Sắp xếp chọn)
public class SelectionSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }
            if (minIdx != i) {
                int temp = arr[i];
                arr[i] = arr[minIdx];
                arr[minIdx] = temp;
            }
        }
    }
}`,
    python: `# Python: Selection Sort (Sắp xếp chọn)
def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
    javascript: `// JavaScript: Selection Sort (Sắp xếp chọn)
function selectionSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        }
    }
    return arr;
}`
  },

  insertion: {
    cpp: `// C++: Insertion Sort (Sắp xếp chèn)
#include <iostream>
#include <vector>
using namespace std;

void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
    java: `// Java: Insertion Sort (Sắp xếp chèn)
public class InsertionSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }
}`,
    python: `# Python: Insertion Sort (Sắp xếp chèn)
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
    javascript: `// JavaScript: Insertion Sort (Sắp xếp chèn)
function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`
  },

  quick: {
    cpp: `// C++: Quick Sort (Sắp xếp nhanh)
#include <iostream>
#include <vector>
using namespace std;

int partition(vector<int>& arr, int lo, int hi) {
    int pivot = arr[hi];
    int i = lo - 1;
    for (int j = lo; j < hi; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[hi]);
    return i + 1;
}

void quickSort(vector<int>& arr, int lo, int hi) {
    if (lo < hi) {
        int p = partition(arr, lo, hi);
        quickSort(arr, lo, p - 1);
        quickSort(arr, p + 1, hi);
    }
}`,
    java: `// Java: Quick Sort (Sắp xếp nhanh)
public class QuickSort {
    private static int partition(int[] arr, int lo, int hi) {
        int pivot = arr[hi];
        int i = lo - 1;
        for (int j = lo; j < hi; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        int temp = arr[i + 1];
        arr[i + 1] = arr[hi];
        arr[hi] = temp;
        return i + 1;
    }

    public static void sort(int[] arr, int lo, int hi) {
        if (lo < hi) {
            int p = partition(arr, lo, hi);
            sort(arr, lo, p - 1);
            sort(arr, p + 1, hi);
        }
    }
}`,
    python: `# Python: Quick Sort (Sắp xếp nhanh)
def quick_sort(arr, lo, hi):
    if lo < hi:
        pivot = arr[hi]
        i = lo - 1
        for j in range(lo, hi):
            if arr[j] < pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
        arr[i + 1], arr[hi] = arr[hi], arr[i + 1]
        p = i + 1

        quick_sort(arr, lo, p - 1)
        quick_sort(arr, p + 1, hi)
    return arr`,
    javascript: `// JavaScript: Quick Sort (Sắp xếp nhanh)
function quickSort(arr, lo = 0, hi = arr.length - 1) {
    if (lo < hi) {
        const pivot = arr[hi];
        let i = lo - 1;
        for (let j = lo; j < hi; j++) {
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
        [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
        const p = i + 1;

        quickSort(arr, lo, p - 1);
        quickSort(arr, p + 1, hi);
    }
    return arr;
}`
  },

  merge: {
    cpp: `// C++: Merge Sort (Sắp xếp trộn)
#include <iostream>
#include <vector>
using namespace std;

void merge(vector<int>& arr, int lo, int mid, int hi) {
    vector<int> left(arr.begin() + lo, arr.begin() + mid + 1);
    vector<int> right(arr.begin() + mid + 1, arr.begin() + hi + 1);

    int i = 0, j = 0, k = lo;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) arr[k++] = left[i++];
        else arr[k++] = right[j++];
    }
    while (i < left.size()) arr[k++] = left[i++];
    while (j < right.size()) arr[k++] = right[j++];
}

void mergeSort(vector<int>& arr, int lo, int hi) {
    if (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        mergeSort(arr, lo, mid);
        mergeSort(arr, mid + 1, hi);
        merge(arr, lo, mid, hi);
    }
}`,
    java: `// Java: Merge Sort (Sắp xếp trộn)
public class MergeSort {
    public static void merge(int[] arr, int lo, int mid, int hi) {
        int n1 = mid - lo + 1;
        int n2 = hi - mid;
        int[] L = new int[n1];
        int[] R = new int[n2];
        for (int i = 0; i < n1; i++) L[i] = arr[lo + i];
        for (int j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

        int i = 0, j = 0, k = lo;
        while (i < n1 && j < n2) {
            if (L[i] <= R[j]) arr[k++] = L[i++];
            else arr[k++] = R[j++];
        }
        while (i < n1) arr[k++] = L[i++];
        while (j < n2) arr[k++] = R[j++];
    }

    public static void sort(int[] arr, int lo, int hi) {
        if (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            sort(arr, lo, mid);
            sort(arr, mid + 1, hi);
            merge(arr, lo, mid, hi);
        }
    }
}`,
    python: `# Python: Merge Sort (Sắp xếp trộn)
def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr) // 2
        L = arr[:mid]
        R = arr[mid:]

        merge_sort(L)
        merge_sort(R)

        i = j = k = 0
        while i < len(L) and j < len(R):
            if L[i] <= R[j]:
                arr[k] = L[i]
                i += 1
            else:
                arr[k] = R[j]
                j += 1
            k += 1

        while i < len(L):
            arr[k] = L[i]
            i += 1
            k += 1
        while j < len(R):
            arr[k] = R[j]
            j += 1
            k += 1
    return arr`,
    javascript: `// JavaScript: Merge Sort (Sắp xếp trộn)
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));

    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) result.push(left[i++]);
        else result.push(right[j++]);
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
}`
  },

  counting: {
    cpp: `// C++: Counting Sort (Sắp xếp đếm)
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void countingSort(vector<int>& arr) {
    if (arr.empty()) return;
    int maxVal = *max_element(arr.begin(), arr.end());
    vector<int> count(maxVal + 1, 0);

    for (int x : arr) count[x]++;
    for (int i = 1; i <= maxVal; i++) count[i] += count[i - 1];

    vector<int> output(arr.size());
    for (int i = arr.size() - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    arr = output;
}`,
    java: `// Java: Counting Sort (Sắp xếp đếm)
import java.util.Arrays;

public class CountingSort {
    public static void sort(int[] arr) {
        if (arr.length == 0) return;
        int max = Arrays.stream(arr).max().getAsInt();
        int[] count = new int[max + 1];

        for (int x : arr) count[x]++;
        for (int i = 1; i <= max; i++) count[i] += count[i - 1];

        int[] output = new int[arr.length];
        for (int i = arr.length - 1; i >= 0; i--) {
            output[count[arr[i]] - 1] = arr[i];
            count[arr[i]]--;
        }
        System.arraycopy(output, 0, arr, 0, arr.length);
    }
}`,
    python: `# Python: Counting Sort (Sắp xếp đếm)
def counting_sort(arr):
    if not arr: return arr
    max_val = max(arr)
    count = [0] * (max_val + 1)

    for x in arr:
        count[x] += 1
    for i in range(1, max_val + 1):
        count[i] += count[i - 1]

    output = [0] * len(arr)
    for x in reversed(arr):
        count[x] -= 1
        output[count[x]] = x

    return output`,
    javascript: `// JavaScript: Counting Sort (Sắp xếp đếm)
function countingSort(arr) {
    if (arr.length === 0) return arr;
    const max = Math.max(...arr);
    const count = new Array(max + 1).fill(0);

    for (const x of arr) count[x]++;
    for (let i = 1; i <= max; i++) count[i] += count[i - 1];

    const output = new Array(arr.length);
    for (let i = arr.length - 1; i >= 0; i--) {
        output[--count[arr[i]]] = arr[i];
    }
    return output;
}`
  },

  radix: {
    cpp: `// C++: Radix Sort (Sắp xếp cơ số LSD)
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void countSortByDigit(vector<int>& arr, int exp) {
    int n = arr.size();
    vector<int> output(n);
    int count[10] = {0};

    for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];

    for (int i = n - 1; i >= 0; i--) {
        int d = (arr[i] / exp) % 10;
        output[count[d] - 1] = arr[i];
        count[d]--;
    }
    arr = output;
}

void radixSort(vector<int>& arr) {
    if (arr.empty()) return;
    int maxVal = *max_element(arr.begin(), arr.end());
    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        countSortByDigit(arr, exp);
    }
}`,
    java: `// Java: Radix Sort (Sắp xếp cơ số)
public class RadixSort {
    public static void sort(int[] arr) {
        if (arr.length == 0) return;
        int max = arr[0];
        for (int x : arr) if (x > max) max = x;

        for (int exp = 1; max / exp > 0; exp *= 10) {
            int[] output = new int[arr.length];
            int[] count = new int[10];

            for (int x : arr) count[(x / exp) % 10]++;
            for (int i = 1; i < 10; i++) count[i] += count[i - 1];

            for (int i = arr.length - 1; i >= 0; i--) {
                int d = (arr[i] / exp) % 10;
                output[count[d] - 1] = arr[i];
                count[d]--;
            }
            System.arraycopy(output, 0, arr, 0, arr.length);
        }
    }
}`,
    python: `# Python: Radix Sort (Sắp xếp cơ số)
def radix_sort(arr):
    if not arr: return arr
    max_val = max(arr)
    exp = 1

    while max_val // exp > 0:
        buckets = [[] for _ in range(10)]
        for x in arr:
            digit = (x // exp) % 10
            buckets[digit].append(x)
        arr = [num for bucket in buckets for num in bucket]
        exp *= 10

    return arr`,
    javascript: `// JavaScript: Radix Sort (Sắp xếp cơ số)
function radixSort(arr) {
    if (arr.length === 0) return arr;
    const max = Math.max(...arr);
    let exp = 1;

    while (Math.floor(max / exp) > 0) {
        const buckets = Array.from({ length: 10 }, () => []);
        for (const num of arr) {
            const digit = Math.floor(num / exp) % 10;
            buckets[digit].push(num);
        }
        arr = buckets.flat();
        exp *= 10;
    }
    return arr;
}`
  },

  linear: {
    cpp: `// C++: Linear Search (Tìm kiếm tuyến tính)
#include <iostream>
#include <vector>
using namespace std;

int linearSearch(const vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            return i; // Tìm thấy tại chỉ số i
        }
    }
    return -1; // Không tìm thấy
}`,
    java: `// Java: Linear Search (Tìm kiếm tuyến tính)
public class LinearSearch {
    public static int search(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                return i; // Tìm thấy tại chỉ số i
            }
        }
        return -1; // Không tìm thấy
    }
}`,
    python: `# Python: Linear Search (Tìm kiếm tuyến tính)
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i # Tìm thấy tại vị trí i
    return -1    # Không tìm thấy`,
    javascript: `// JavaScript: Linear Search (Tìm kiếm tuyến tính)
function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            return i; // Tìm thấy tại vị trí i
        }
    }
    return -1; // Không tìm thấy
}`
  },

  binary: {
    cpp: `// C++: Binary Search (Tìm kiếm nhị phân)
#include <iostream>
#include <vector>
using namespace std;

int binarySearch(const vector<int>& arr, int target) {
    int lo = 0, hi = arr.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;     // Tìm thấy
        else if (arr[mid] < target) lo = mid + 1; // Tìm nửa phải
        else hi = mid - 1;                       // Tìm nửa trái
    }
    return -1; // Không tìm thấy
}`,
    java: `// Java: Binary Search (Tìm kiếm nhị phân)
public class BinarySearch {
    public static int search(int[] arr, int target) {
        int lo = 0, hi = arr.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }
}`,
    python: `# Python: Binary Search (Tìm kiếm nhị phân)
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
    javascript: `// JavaScript: Binary Search (Tìm kiếm nhị phân)
function binarySearch(arr, target) {
    let lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`
  },
  stack: {
    cpp: `// C++: Stack (Ngăn xếp mảng tĩnh / động)
#include <iostream>
#include <vector>
using namespace std;

class Stack {
private:
    vector<int> data;
public:
    void push(int val) {
        data.push_back(val);
    }
    int pop() {
        if (isEmpty()) throw runtime_error("Stack rỗng!");
        int val = data.back();
        data.pop_back();
        return val;
    }
    int peek() const {
        if (isEmpty()) throw runtime_error("Stack rỗng!");
        return data.back();
    }
    bool isEmpty() const {
        return data.empty();
    }
};`,
    java: `// Java: Stack Implementation
import java.util.ArrayList;

public class MyStack {
    private ArrayList<Integer> list = new ArrayList<>();

    public void push(int val) {
        list.add(val);
    }
    public int pop() {
        if (isEmpty()) throw new IllegalStateException("Stack Underflow!");
        return list.remove(list.size() - 1);
    }
    public int peek() {
        if (isEmpty()) throw new IllegalStateException("Stack is empty!");
        return list.get(list.size() - 1);
    }
    public boolean isEmpty() {
        return list.isEmpty();
    }
}`,
    python: `# Python: Stack Implementation
class Stack:
    def __init__(self):
        self.items = []

    def push(self, val):
        self.items.append(val)

    def pop(self):
        if self.is_empty():
            raise IndexError("Stack rỗng!")
        return self.items.pop()

    def peek(self):
        if self.is_empty():
            return None
        return self.items[-1]

    def is_empty(self):
        return len(self.items) == 0`,
    javascript: `// JavaScript: Stack Implementation
class Stack {
  constructor() {
    this.items = [];
  }
  push(val) {
    this.items.push(val);
  }
  pop() {
    if (this.isEmpty()) return null;
    return this.items.pop();
  }
  peek() {
    return this.isEmpty() ? null : this.items[this.items.length - 1];
  }
  isEmpty() {
    return this.items.length === 0;
  }
}`
  },
  queue: {
    cpp: `// C++: Queue (Hàng đợi tuyến tính / vòng tròn)
#include <iostream>
#include <queue>
using namespace std;

class Queue {
private:
    vector<int> data;
    int frontIdx = 0;
public:
    void enqueue(int val) {
        data.push_back(val);
    }
    int dequeue() {
        if (isEmpty()) throw runtime_error("Queue rỗng!");
        return data[frontIdx++];
    }
    int front() const {
        if (isEmpty()) throw runtime_error("Queue rỗng!");
        return data[frontIdx];
    }
    bool isEmpty() const {
        return frontIdx >= data.size();
    }
};`,
    java: `// Java: Queue Implementation
import java.util.LinkedList;

public class MyQueue {
    private LinkedList<Integer> list = new LinkedList<>();

    public void enqueue(int val) {
        list.addLast(val);
    }
    public int dequeue() {
        if (isEmpty()) throw new IllegalStateException("Queue is empty!");
        return list.removeFirst();
    }
    public int front() {
        if (isEmpty()) throw new IllegalStateException("Queue is empty!");
        return list.getFirst();
    }
    public boolean isEmpty() {
        return list.isEmpty();
    }
}`,
    python: `# Python: Queue Implementation (FIFO)
from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()

    def enqueue(self, val):
        self.items.append(val)

    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue rỗng!")
        return self.items.popleft()

    def front(self):
        return self.items[0] if not self.is_empty() else None

    def is_empty(self):
        return len(self.items) == 0`,
    javascript: `// JavaScript: Queue Implementation
class Queue {
  constructor() {
    this.items = [];
  }
  enqueue(val) {
    this.items.push(val);
  }
  dequeue() {
    if (this.isEmpty()) return null;
    return this.items.shift();
  }
  front() {
    return this.isEmpty() ? null : this.items[0];
  }
  isEmpty() {
    return this.items.length === 0;
  }
}`
  },
  linkedList: {
    cpp: `// C++: Singly Linked List (Danh sách liên kết đơn)
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val, Node* n = nullptr) : data(val), next(n) {}
};

class LinkedList {
public:
    Node* head = nullptr;

    void insertHead(int val) {
        head = new Node(val, head);
    }

    void insertTail(int val) {
        if (!head) { head = new Node(val); return; }
        Node* curr = head;
        while (curr->next) curr = curr->next;
        curr->next = new Node(val);
    }

    void reverse() {
        Node *prev = nullptr, *curr = head, *next = nullptr;
        while (curr) {
            next = curr->next;
            curr->next = prev;
            prev = curr;
            curr = next;
        }
        head = prev;
    }
};`,
    java: `// Java: Singly Linked List
class Node {
    int data;
    Node next;
    Node(int data) { this.data = data; this.next = null; }
}

public class MyLinkedList {
    Node head = null;

    public void insertHead(int val) {
        Node newNode = new Node(val);
        newNode.next = head;
        head = newNode;
    }

    public void reverse() {
        Node prev = null, curr = head, next = null;
        while (curr != null) {
            next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        head = prev;
    }
}`,
    python: `# Python: Singly Linked List
class Node:
    def __init__(self, data, next=None):
        self.data = data
        self.next = next

class LinkedList:
    def __init__(self):
        self.head = None

    def insert_head(self, val):
        self.head = Node(val, self.head)

    def reverse(self):
        prev = None
        curr = self.head
        while curr:
            next_node = curr.next
            curr.next = prev
            prev = curr
            curr = next_node
        self.head = prev`,
    javascript: `// JavaScript: Singly Linked List
class Node {
  constructor(data, next = null) {
    this.data = data;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }
  insertHead(val) {
    this.head = new Node(val, this.head);
  }
  reverse() {
    let prev = null, curr = this.head;
    while (curr) {
      const next = curr.next;
      curr.next = prev;
      prev = curr;
      curr = next;
    }
    this.head = prev;
  }
}`
  },
  bst: {
    cpp: `// C++: Binary Search Tree (BST)
#include <iostream>
using namespace std;

struct Node {
    int val;
    Node *left = nullptr, *right = nullptr;
    Node(int v) : val(v) {}
};

Node* insert(Node* root, int val) {
    if (!root) return new Node(val);
    if (val < root->val) root->left = insert(root->left, val);
    else if (val > root->val) root->right = insert(root->right, val);
    return root;
}

bool search(Node* root, int val) {
    if (!root) return false;
    if (root->val == val) return true;
    if (val < root->val) return search(root->left, val);
    return search(root->right, val);
}

void inorder(Node* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}`,
    java: `// Java: Binary Search Tree (BST)
class Node {
    int val;
    Node left, right;
    Node(int val) { this.val = val; }
}

public class BST {
    public static Node insert(Node root, int val) {
        if (root == null) return new Node(val);
        if (val < root.val) root.left = insert(root.left, val);
        else if (val > root.val) root.right = insert(root.right, val);
        return root;
    }

    public static boolean search(Node root, int val) {
        if (root == null) return false;
        if (root.val == val) return true;
        return val < root.val ? search(root.left, val) : search(root.right, val);
    }
}`,
    python: `# Python: Binary Search Tree (BST)
class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if not root:
        return Node(val)
    if val < root.val:
        root.left = insert(root.left, val)
    elif val > root.val:
        root.right = insert(root.right, val)
    return root

def search(root, val):
    if not root or root.val == val:
        return root
    if val < root.val:
        return search(root.left, val)
    return search(root.right, val)`,
    javascript: `// JavaScript: Binary Search Tree (BST)
class Node {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function insert(root, val) {
  if (!root) return new Node(val);
  if (val < root.val) root.left = insert(root.left, val);
  else if (val > root.val) root.right = insert(root.right, val);
  return root;
}

function search(root, val) {
  if (!root || root.val === val) return root;
  return val < root.val ? search(root.left, val) : search(root.right, val);
}`
  },
  avlTree: {
    cpp: `// C++: AVL Tree (Self-balancing BST)
#include <iostream>
#include <algorithm>
using namespace std;

struct Node {
    int val, height = 1;
    Node *left = nullptr, *right = nullptr;
    Node(int v) : val(v) {}
};

int height(Node* n) { return n ? n->height : 0; }
int getBF(Node* n) { return n ? height(n->left) - height(n->right) : 0; }

Node* rotateRight(Node* y) {
    Node* x = y->left; Node* T2 = x->right;
    x->right = y; y->left = T2;
    y->height = 1 + max(height(y->left), height(y->right));
    x->height = 1 + max(height(x->left), height(x->right));
    return x;
}

Node* rotateLeft(Node* x) {
    Node* y = x->right; Node* T2 = y->left;
    y->left = x; x->right = T2;
    x->height = 1 + max(height(x->left), height(x->right));
    y->height = 1 + max(height(y->left), height(y->right));
    return y;
}`,
    java: `// Java: AVL Tree (Self-balancing BST)
class AVLNode {
    int val, height = 1;
    AVLNode left, right;
    AVLNode(int val) { this.val = val; }
}

public class AVLTree {
    static int height(AVLNode n) { return n == null ? 0 : n.height; }
    static int getBF(AVLNode n) { return n == null ? 0 : height(n.left) - height(n.right); }

    static AVLNode rotateRight(AVLNode y) {
        AVLNode x = y.left; AVLNode T2 = x.right;
        x.right = y; y.left = T2;
        y.height = 1 + Math.max(height(y.left), height(y.right));
        x.height = 1 + Math.max(height(x.left), height(x.right));
        return x;
    }
}`,
    python: `# Python: AVL Tree Rotations
class AVLNode:
    def __init__(self, val):
        self.val = val
        self.height = 1
        self.left = None
        self.right = None

def get_height(node):
    return node.height if node else 0

def get_balance(node):
    return get_height(node.left) - get_height(node.right) if node else 0

def rotate_right(y):
    x = y.left
    T2 = x.right
    x.right = y
    y.left = T2
    y.height = 1 + max(get_height(y.left), get_height(y.right))
    x.height = 1 + max(get_height(x.left), get_height(x.right))
    return x`,
    javascript: `// JavaScript: AVL Tree
class AVLNode {
  constructor(val) {
    this.val = val;
    this.height = 1;
    this.left = null;
    this.right = null;
  }
}

function getHeight(n) { return n ? n.height : 0; }
function getBF(n) { return n ? getHeight(n.left) - getHeight(n.right) : 0; }

function rotateRight(y) {
  const x = y.left; const T2 = x.right;
  x.right = y; y.left = T2;
  y.height = 1 + Math.max(getHeight(y.left), getHeight(y.right));
  x.height = 1 + Math.max(getHeight(x.left), getHeight(x.right));
  return x;
}`
  },
  heap: {
    cpp: `// C++: Max-Heap & Heap Sort
#include <iostream>
#include <vector>
using namespace std;

void heapify(vector<int>& arr, int n, int i) {
    int largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

void heapSort(vector<int>& arr) {
    int n = arr.size();
    // Build heap O(n)
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    // Extract elements O(n log n)
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}`,
    java: `// Java: Max-Heap & Heap Sort
public class HeapSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
        for (int i = n - 1; i > 0; i--) {
            int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
            heapify(arr, i, 0);
        }
    }

    static void heapify(int[] arr, int n, int i) {
        int largest = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && arr[l] > arr[largest]) largest = l;
        if (r < n && arr[r] > arr[largest]) largest = r;
        if (largest != i) {
            int temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp;
            heapify(arr, n, largest);
        }
    }
}`,
    python: `# Python: Max-Heap & Heap Sort
def heapify(arr, n, i):
    largest = i
    l = 2 * i + 1
    r = 2 * i + 2
    if l < n and arr[l] > arr[largest]:
        largest = l
    if r < n and arr[r] > arr[largest]:
        largest = r
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)`,
    javascript: `// JavaScript: Max-Heap & Heap Sort
function heapify(arr, n, i) {
  let largest = i, l = 2 * i + 1, r = 2 * i + 2;
  if (l < n && arr[l] > arr[largest]) largest = l;
  if (r < n && arr[r] > arr[largest]) largest = r;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}

function heapSort(arr) {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
}`
  }
};
