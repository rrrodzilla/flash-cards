/**
 * HeapNode represents an element in the max heap with a value and its priority.
 * @template T The type of value stored in the heap node
 */
interface HeapNode<T> {
  value: T;
  priority: number;
}

/**
 * MaxHeap implementation for weighted randomization using binary heap data structure.
 *
 * Properties:
 * - Maintains max-heap property where parent priority >= children priorities
 * - Complete binary tree stored as array for O(1) parent/child access
 * - Used to weight multiplication numbers based on wrong answer frequencies
 *
 * Performance:
 * - Insert: O(log n)
 * - Extract max: O(log n)
 * - Peek: O(1)
 * - Size/isEmpty: O(1)
 *
 * @template T The type of values stored in the heap
 *
 * @example
 * ```typescript
 * const heap = new MaxHeap<number>();
 * heap.insert(5, 10);  // value=5, priority=10
 * heap.insert(3, 20);  // value=3, priority=20
 * heap.peek();         // Returns 3 (highest priority)
 * heap.extractMax();   // Returns 3, removes from heap
 * ```
 */
export class MaxHeap<T> {
  private heap: HeapNode<T>[] = [];

  /**
   * Insert a value with its priority into the heap.
   * The element bubbles up to maintain heap property.
   *
   * @param value - The value to insert
   * @param priority - The priority of the value (higher = more important)
   * @throws {Error} If priority is not a valid number
   *
   * Time complexity: O(log n) where n is the number of elements
   * Space complexity: O(1)
   */
  insert(value: T, priority: number): void {
    if (!Number.isFinite(priority)) {
      throw new Error('Priority must be a finite number');
    }

    if (priority < 0) {
      throw new Error('Priority must be non-negative');
    }

    this.heap.push({ value, priority });
    this.heapifyUp(this.heap.length - 1);
  }

  /**
   * Extract and return the maximum priority element.
   * Removes the root and restructures the heap to maintain heap property.
   *
   * @returns The value with highest priority, or undefined if heap is empty
   *
   * Time complexity: O(log n)
   * Space complexity: O(1)
   */
  extractMax(): T | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    if (this.heap.length === 1) {
      const node = this.heap.pop();
      return node?.value;
    }

    const firstNode = this.heap[0];
    if (!firstNode) {
      return undefined;
    }

    const max = firstNode.value;
    const lastNode = this.heap.pop();
    if (lastNode) {
      this.heap[0] = lastNode;
      this.heapifyDown(0);
    }

    return max;
  }

  /**
   * Peek at the maximum priority element without removing it.
   *
   * @returns The value with highest priority, or undefined if heap is empty
   *
   * Time complexity: O(1)
   * Space complexity: O(1)
   */
  peek(): T | undefined {
    const firstNode = this.heap[0];
    return firstNode ? firstNode.value : undefined;
  }

  /**
   * Peek at the priority of the maximum element without removing it.
   *
   * @returns The priority of the element with highest priority, or undefined if heap is empty
   *
   * Time complexity: O(1)
   * Space complexity: O(1)
   */
  peekPriority(): number | undefined {
    const firstNode = this.heap[0];
    return firstNode ? firstNode.priority : undefined;
  }

  /**
   * Get the number of elements in the heap.
   *
   * @returns The number of elements currently in the heap
   *
   * Time complexity: O(1)
   * Space complexity: O(1)
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * Check if heap is empty.
   *
   * @returns true if the heap contains no elements, false otherwise
   *
   * Time complexity: O(1)
   * Space complexity: O(1)
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Get all values in the heap in arbitrary order (heap array order).
   * Note: Values are NOT sorted by priority - this returns raw heap structure.
   * Useful for debugging or iterating over all elements.
   *
   * @returns Array of all values in the heap
   *
   * Time complexity: O(n)
   * Space complexity: O(n)
   */
  getAll(): T[] {
    return this.heap.map(node => node.value);
  }

  /**
   * Get all values sorted by priority (descending order).
   * Warning: This creates a copy of the heap and extracts all elements, so it's expensive.
   * Use only when you need sorted output.
   *
   * @returns Array of all values sorted by priority (highest first)
   *
   * Time complexity: O(n log n)
   * Space complexity: O(n)
   */
  getAllSorted(): T[] {
    const tempHeap = new MaxHeap<T>();
    for (const node of this.heap) {
      tempHeap.insert(node.value, node.priority);
    }

    const sorted: T[] = [];
    while (!tempHeap.isEmpty()) {
      const value = tempHeap.extractMax();
      if (value !== undefined) {
        sorted.push(value);
      }
    }

    return sorted;
  }

  /**
   * Clear all elements from the heap.
   * Resets the heap to empty state.
   *
   * Time complexity: O(1)
   * Space complexity: O(1)
   */
  clear(): void {
    this.heap = [];
  }

  /**
   * Build a heap from an array of values with priorities.
   * More efficient than inserting elements one by one.
   *
   * @param elements - Array of [value, priority] tuples
   *
   * Time complexity: O(n)
   * Space complexity: O(n)
   */
  buildHeap(elements: Array<[T, number]>): void {
    this.heap = elements.map(([value, priority]) => {
      if (!Number.isFinite(priority)) {
        throw new Error('Priority must be a finite number');
      }
      if (priority < 0) {
        throw new Error('Priority must be non-negative');
      }
      return { value, priority };
    });

    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.heapifyDown(i);
    }
  }

  /**
   * Restore max-heap property by moving element up the tree.
   * Called after insertion to bubble up the new element to its correct position.
   *
   * @param index - Index of the element to bubble up
   *
   * Time complexity: O(log n) in worst case (element bubbles to root)
   * Space complexity: O(log n) due to recursion (can be optimized to O(1) with iteration)
   */
  private heapifyUp(index: number): void {
    if (index === 0) {
      return;
    }

    const parentIndex = Math.floor((index - 1) / 2);
    const currentNode = this.heap[index];
    const parentNode = this.heap[parentIndex];

    if (currentNode && parentNode && currentNode.priority > parentNode.priority) {
      this.swap(index, parentIndex);
      this.heapifyUp(parentIndex);
    }
  }

  /**
   * Restore max-heap property by moving element down the tree.
   * Called after extraction to sink down the root replacement to its correct position.
   *
   * @param index - Index of the element to sink down
   *
   * Time complexity: O(log n) in worst case (element sinks to leaf)
   * Space complexity: O(log n) due to recursion (can be optimized to O(1) with iteration)
   */
  private heapifyDown(index: number): void {
    const leftChildIndex = 2 * index + 1;
    const rightChildIndex = 2 * index + 2;
    let largest = index;

    const currentNode = this.heap[index];
    const leftChild = this.heap[leftChildIndex];
    const rightChild = this.heap[rightChildIndex];

    if (leftChild && currentNode && leftChild.priority > currentNode.priority) {
      largest = leftChildIndex;
    }

    const largestNode = this.heap[largest];
    if (rightChild && largestNode && rightChild.priority > largestNode.priority) {
      largest = rightChildIndex;
    }

    if (largest !== index) {
      this.swap(index, largest);
      this.heapifyDown(largest);
    }
  }

  /**
   * Swap two elements in the heap array.
   * Helper method for maintaining heap property during heapify operations.
   *
   * @param i - Index of first element
   * @param j - Index of second element
   *
   * Time complexity: O(1)
   * Space complexity: O(1)
   */
  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    const other = this.heap[j];
    if (temp && other) {
      this.heap[i] = other;
      this.heap[j] = temp;
    }
  }
}
