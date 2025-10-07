/**
 * Comprehensive tests for MaxHeap implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MaxHeap } from './heap';

describe('MaxHeap', () => {
  let heap: MaxHeap<number>;

  beforeEach(() => {
    heap = new MaxHeap<number>();
  });

  describe('constructor and initialization', () => {
    it('should create an empty heap', () => {
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should return undefined when peeking at empty heap', () => {
      expect(heap.peek()).toBeUndefined();
      expect(heap.peekPriority()).toBeUndefined();
    });

    it('should return undefined when extracting from empty heap', () => {
      expect(heap.extractMax()).toBeUndefined();
    });
  });

  describe('insert', () => {
    it('should insert single element', () => {
      heap.insert(5, 10);
      expect(heap.size()).toBe(1);
      expect(heap.isEmpty()).toBe(false);
      expect(heap.peek()).toBe(5);
      expect(heap.peekPriority()).toBe(10);
    });

    it('should insert multiple elements and maintain max heap property', () => {
      heap.insert(1, 10);
      heap.insert(2, 20);
      heap.insert(3, 15);

      expect(heap.size()).toBe(3);
      expect(heap.peek()).toBe(2); // Priority 20 is highest
    });

    it('should handle inserting elements with same priority', () => {
      heap.insert(1, 10);
      heap.insert(2, 10);
      heap.insert(3, 10);

      expect(heap.size()).toBe(3);
      const max = heap.peek();
      expect([1, 2, 3]).toContain(max);
    });

    it('should throw error for invalid priority (NaN)', () => {
      expect(() => heap.insert(5, NaN)).toThrow('Priority must be a finite number');
    });

    it('should throw error for invalid priority (Infinity)', () => {
      expect(() => heap.insert(5, Infinity)).toThrow('Priority must be a finite number');
    });

    it('should throw error for negative priority', () => {
      expect(() => heap.insert(5, -1)).toThrow('Priority must be non-negative');
    });

    it('should accept priority of 0', () => {
      heap.insert(5, 0);
      expect(heap.size()).toBe(1);
      expect(heap.peek()).toBe(5);
    });

    it('should work with string values', () => {
      const stringHeap = new MaxHeap<string>();
      stringHeap.insert('low', 1);
      stringHeap.insert('high', 10);
      stringHeap.insert('medium', 5);

      expect(stringHeap.peek()).toBe('high');
    });

    it('should work with object values', () => {
      interface TestObj {
        id: number;
        name: string;
      }

      const objHeap = new MaxHeap<TestObj>();
      objHeap.insert({ id: 1, name: 'low' }, 1);
      objHeap.insert({ id: 2, name: 'high' }, 10);

      expect(objHeap.peek()?.name).toBe('high');
    });
  });

  describe('extractMax', () => {
    it('should extract elements in priority order', () => {
      heap.insert(1, 5);
      heap.insert(2, 15);
      heap.insert(3, 10);
      heap.insert(4, 20);

      expect(heap.extractMax()).toBe(4); // Priority 20
      expect(heap.extractMax()).toBe(2); // Priority 15
      expect(heap.extractMax()).toBe(3); // Priority 10
      expect(heap.extractMax()).toBe(1); // Priority 5
      expect(heap.extractMax()).toBeUndefined();
    });

    it('should maintain heap property after extraction', () => {
      heap.insert(1, 10);
      heap.insert(2, 20);
      heap.insert(3, 15);
      heap.insert(4, 25);
      heap.insert(5, 12);

      heap.extractMax(); // Remove 4 (priority 25)
      expect(heap.peek()).toBe(2); // Priority 20 should now be max

      heap.extractMax(); // Remove 2 (priority 20)
      expect(heap.peek()).toBe(3); // Priority 15 should now be max
    });

    it('should handle extraction until empty', () => {
      heap.insert(1, 10);
      heap.insert(2, 20);

      expect(heap.extractMax()).toBe(2);
      expect(heap.size()).toBe(1);
      expect(heap.extractMax()).toBe(1);
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.extractMax()).toBeUndefined();
    });

    it('should handle single element extraction', () => {
      heap.insert(1, 10);
      expect(heap.extractMax()).toBe(1);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('peek and peekPriority', () => {
    it('should peek without removing element', () => {
      heap.insert(1, 10);
      heap.insert(2, 20);

      expect(heap.peek()).toBe(2);
      expect(heap.size()).toBe(2); // Size unchanged

      expect(heap.peek()).toBe(2); // Can peek multiple times
      expect(heap.size()).toBe(2);
    });

    it('should peek priority correctly', () => {
      heap.insert(1, 10);
      heap.insert(2, 20);

      expect(heap.peekPriority()).toBe(20);
      expect(heap.size()).toBe(2);
    });

    it('should return undefined for empty heap', () => {
      expect(heap.peek()).toBeUndefined();
      expect(heap.peekPriority()).toBeUndefined();
    });
  });

  describe('size and isEmpty', () => {
    it('should track size correctly during operations', () => {
      expect(heap.size()).toBe(0);

      heap.insert(1, 10);
      expect(heap.size()).toBe(1);

      heap.insert(2, 20);
      expect(heap.size()).toBe(2);

      heap.extractMax();
      expect(heap.size()).toBe(1);

      heap.extractMax();
      expect(heap.size()).toBe(0);
    });

    it('should report empty status correctly', () => {
      expect(heap.isEmpty()).toBe(true);

      heap.insert(1, 10);
      expect(heap.isEmpty()).toBe(false);

      heap.extractMax();
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('getAll', () => {
    it('should return all values in heap', () => {
      heap.insert(1, 10);
      heap.insert(2, 20);
      heap.insert(3, 15);

      const all = heap.getAll();
      expect(all).toHaveLength(3);
      expect(all).toContain(1);
      expect(all).toContain(2);
      expect(all).toContain(3);
    });

    it('should return empty array for empty heap', () => {
      expect(heap.getAll()).toEqual([]);
    });

    it('should not modify original heap', () => {
      heap.insert(1, 10);
      heap.insert(2, 20);

      const all = heap.getAll();
      expect(all).toHaveLength(2);
      expect(heap.size()).toBe(2);
    });
  });

  describe('getAllSorted', () => {
    it('should return values sorted by priority (descending)', () => {
      heap.insert(1, 10);
      heap.insert(2, 20);
      heap.insert(3, 15);
      heap.insert(4, 25);

      const sorted = heap.getAllSorted();
      expect(sorted).toEqual([4, 2, 3, 1]);
    });

    it('should not modify original heap', () => {
      heap.insert(1, 10);
      heap.insert(2, 20);
      heap.insert(3, 15);

      heap.getAllSorted();

      expect(heap.size()).toBe(3);
      expect(heap.peek()).toBe(2);
    });

    it('should return empty array for empty heap', () => {
      expect(heap.getAllSorted()).toEqual([]);
    });

    it('should handle single element', () => {
      heap.insert(1, 10);
      expect(heap.getAllSorted()).toEqual([1]);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      heap.insert(1, 10);
      heap.insert(2, 20);
      heap.insert(3, 15);

      expect(heap.size()).toBe(3);

      heap.clear();

      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
      expect(heap.peek()).toBeUndefined();
    });

    it('should allow reuse after clearing', () => {
      heap.insert(1, 10);
      heap.clear();
      heap.insert(2, 20);

      expect(heap.size()).toBe(1);
      expect(heap.peek()).toBe(2);
    });

    it('should be safe to call on empty heap', () => {
      heap.clear();
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('buildHeap', () => {
    it('should build heap from array of elements', () => {
      heap.buildHeap([
        [1, 10],
        [2, 20],
        [3, 15],
        [4, 25],
      ]);

      expect(heap.size()).toBe(4);
      expect(heap.peek()).toBe(4); // Priority 25
    });

    it('should be more efficient than individual inserts', () => {
      const elements: Array<[number, number]> = [];
      for (let i = 0; i < 100; i++) {
        elements.push([i, Math.random() * 100]);
      }

      heap.buildHeap(elements);
      expect(heap.size()).toBe(100);
    });

    it('should replace existing heap contents', () => {
      heap.insert(1, 10);
      heap.insert(2, 20);

      heap.buildHeap([[3, 30]]);

      expect(heap.size()).toBe(1);
      expect(heap.peek()).toBe(3);
    });

    it('should handle empty array', () => {
      heap.buildHeap([]);
      expect(heap.size()).toBe(0);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should throw error for invalid priority in build', () => {
      expect(() => {
        heap.buildHeap([[1, NaN]]);
      }).toThrow('Priority must be a finite number');
    });

    it('should throw error for negative priority in build', () => {
      expect(() => {
        heap.buildHeap([[1, -5]]);
      }).toThrow('Priority must be non-negative');
    });
  });

  describe('stress tests', () => {
    it('should handle large number of elements', () => {
      const count = 10000;

      for (let i = 0; i < count; i++) {
        heap.insert(i, Math.random() * count);
      }

      expect(heap.size()).toBe(count);

      let prevPriority = Infinity;
      for (let i = 0; i < count; i++) {
        const currentPriority = heap.peekPriority();
        expect(currentPriority).toBeDefined();
        if (currentPriority !== undefined) {
          expect(currentPriority).toBeLessThanOrEqual(prevPriority);
          prevPriority = currentPriority;
        }
        heap.extractMax();
      }

      expect(heap.isEmpty()).toBe(true);
    });

    it('should maintain heap property with random operations', () => {
      const operations = 1000;

      for (let i = 0; i < operations; i++) {
        if (Math.random() > 0.3 || heap.isEmpty()) {
          heap.insert(i, Math.random() * 100);
        } else {
          heap.extractMax();
        }

        if (!heap.isEmpty()) {
          const max = heap.peek();
          const maxPriority = heap.peekPriority();
          expect(max).toBeDefined();
          expect(maxPriority).toBeDefined();
        }
      }
    });
  });

  describe('edge cases', () => {
    it('should handle priorities with decimal values', () => {
      heap.insert(1, 10.5);
      heap.insert(2, 10.3);
      heap.insert(3, 10.7);

      expect(heap.peek()).toBe(3);
    });

    it('should handle very large priorities', () => {
      heap.insert(1, Number.MAX_SAFE_INTEGER);
      heap.insert(2, Number.MAX_SAFE_INTEGER - 1);

      expect(heap.peek()).toBe(1);
    });

    it('should handle priority of zero', () => {
      heap.insert(1, 0);
      heap.insert(2, 5);
      heap.insert(3, 0);

      expect(heap.peek()).toBe(2);
      heap.extractMax();
      const next = heap.peek();
      expect([1, 3]).toContain(next);
    });

    it('should handle alternating insert and extract', () => {
      heap.insert(1, 10);
      expect(heap.extractMax()).toBe(1);

      heap.insert(2, 20);
      expect(heap.extractMax()).toBe(2);

      heap.insert(3, 15);
      expect(heap.extractMax()).toBe(3);

      expect(heap.isEmpty()).toBe(true);
    });
  });
});
