/**
 * HeapNode represents an element in the max heap with a value and its priority.
 */
interface HeapNode<T> {
  value: T;
  priority: number;
}

/**
 * MaxHeap implementation for weighted randomization.
 * Maintains max-heap property where parent priority >= children priorities.
 * Used to weight multiplication numbers based on wrong answer frequencies.
 */
export class MaxHeap<T> {
  private heap: HeapNode<T>[] = [];

  /**
   * Insert a value with its priority into the heap.
   * Time complexity: O(log n)
   */
  insert(value: T, priority: number): void {
    this.heap.push({ value, priority });
    this.heapifyUp(this.heap.length - 1);
  }

  /**
   * Extract and return the maximum priority element.
   * Time complexity: O(log n)
   * @returns The value with highest priority, or undefined if heap is empty
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
   * Time complexity: O(1)
   * @returns The value with highest priority, or undefined if heap is empty
   */
  peek(): T | undefined {
    const firstNode = this.heap[0];
    return firstNode ? firstNode.value : undefined;
  }

  /**
   * Get the number of elements in the heap.
   * Time complexity: O(1)
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * Check if heap is empty.
   * Time complexity: O(1)
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Get all values in the heap (not ordered, raw heap array).
   * Useful for debugging or getting all elements.
   */
  getAll(): T[] {
    return this.heap.map(node => node.value);
  }

  /**
   * Clear all elements from the heap.
   */
  clear(): void {
    this.heap = [];
  }

  /**
   * Restore max-heap property by moving element up.
   * Called after insertion.
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
   * Restore max-heap property by moving element down.
   * Called after extraction.
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
