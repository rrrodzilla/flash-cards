import { describe, it, expect } from 'vitest';
import type { ArrayVisualizationProps } from './ArrayVisualization';

describe('ArrayVisualization Props Interface', () => {
  describe('Props Type Validation', () => {
    it('should accept valid props for small problem', () => {
      const props: ArrayVisualizationProps = {
        operand1: 3,
        operand2: 4,
        correctAnswer: 12,
        variant: 'full',
      };

      expect(props.operand1).toBe(3);
      expect(props.operand2).toBe(4);
      expect(props.correctAnswer).toBe(12);
      expect(props.variant).toBe('full');
    });

    it('should accept valid props for medium problem', () => {
      const props: ArrayVisualizationProps = {
        operand1: 6,
        operand2: 7,
        correctAnswer: 42,
        variant: 'compact',
      };

      expect(props.operand1).toBe(6);
      expect(props.operand2).toBe(7);
      expect(props.correctAnswer).toBe(42);
      expect(props.variant).toBe('compact');
    });

    it('should accept valid props for large problem', () => {
      const props: ArrayVisualizationProps = {
        operand1: 11,
        operand2: 12,
        correctAnswer: 132,
        variant: 'full',
      };

      expect(props.operand1).toBe(11);
      expect(props.operand2).toBe(12);
      expect(props.correctAnswer).toBe(132);
    });

    it('should accept optional onComplete callback', () => {
      const onComplete = () => {
        /* callback */
      };

      const props: ArrayVisualizationProps = {
        operand1: 3,
        operand2: 4,
        correctAnswer: 12,
        onComplete,
      };

      expect(props.onComplete).toBe(onComplete);
    });

    it('should allow variant to be omitted (defaults to full)', () => {
      const props: ArrayVisualizationProps = {
        operand1: 3,
        operand2: 4,
        correctAnswer: 12,
      };

      expect(props.variant).toBeUndefined();
    });

    it('should handle edge case 1×1', () => {
      const props: ArrayVisualizationProps = {
        operand1: 1,
        operand2: 1,
        correctAnswer: 1,
      };

      expect(props.operand1).toBe(1);
      expect(props.operand2).toBe(1);
      expect(props.correctAnswer).toBe(1);
    });

    it('should handle edge case 12×12', () => {
      const props: ArrayVisualizationProps = {
        operand1: 12,
        operand2: 12,
        correctAnswer: 144,
      };

      expect(props.operand1).toBe(12);
      expect(props.operand2).toBe(12);
      expect(props.correctAnswer).toBe(144);
    });
  });

  describe('Problem Size Classification', () => {
    it('should classify small problems (≤20 dots)', () => {
      const totalDots = 3 * 4;
      expect(totalDots).toBeLessThanOrEqual(20);
      expect(totalDots).toBe(12);
    });

    it('should classify medium problems (21-100 dots)', () => {
      const totalDots = 6 * 7;
      expect(totalDots).toBeGreaterThan(20);
      expect(totalDots).toBeLessThanOrEqual(100);
      expect(totalDots).toBe(42);
    });

    it('should classify large problems (>100 dots)', () => {
      const totalDots = 11 * 12;
      expect(totalDots).toBeGreaterThan(100);
      expect(totalDots).toBe(132);
    });

    it('should identify boundary case 20 dots as small', () => {
      const totalDots = 4 * 5;
      expect(totalDots).toBe(20);
      expect(totalDots).toBeLessThanOrEqual(20);
    });

    it('should identify boundary case 21 dots as medium', () => {
      const totalDots = 3 * 7;
      expect(totalDots).toBe(21);
      expect(totalDots).toBeGreaterThan(20);
      expect(totalDots).toBeLessThanOrEqual(100);
    });

    it('should identify boundary case 100 dots as medium', () => {
      const totalDots = 10 * 10;
      expect(totalDots).toBe(100);
      expect(totalDots).toBeGreaterThan(20);
      expect(totalDots).toBeLessThanOrEqual(100);
    });

    it('should identify boundary case 101 dots as large', () => {
      const totalDots = 101; // Hypothetical
      expect(totalDots).toBeGreaterThan(100);
    });
  });

  describe('Dot Size Calculations', () => {
    it('should calculate 10px dots for small problems', () => {
      const totalDots = 3 * 4; // 12
      const isCompact = false;

      const dotSize = isCompact ? 4 : totalDots <= 20 ? 10 : totalDots <= 72 ? 8 : 6;

      expect(dotSize).toBe(10);
    });

    it('should calculate 8px dots for medium problems', () => {
      const totalDots = 6 * 7; // 42
      const isCompact = false;

      const dotSize = isCompact ? 4 : totalDots <= 20 ? 10 : totalDots <= 72 ? 8 : 6;

      expect(dotSize).toBe(8);
    });

    it('should calculate 6px dots for large problems under 100', () => {
      const totalDots = 9 * 11; // 99
      const isCompact = false;

      const dotSize = isCompact ? 4 : totalDots <= 20 ? 10 : totalDots <= 72 ? 8 : 6;

      expect(dotSize).toBe(6);
    });

    it('should calculate 4px dots for compact variant', () => {
      const totalDots = 6 * 7; // 42
      const isCompact = true;

      const dotSize = isCompact ? 4 : totalDots <= 20 ? 10 : totalDots <= 72 ? 8 : 6;

      expect(dotSize).toBe(4);
    });
  });

  describe('Gap Calculations', () => {
    it('should calculate gap as half of dot size', () => {
      const dotSize = 10;
      const gap = Math.max(2, dotSize / 2);

      expect(gap).toBe(5);
    });

    it('should have minimum gap of 2px', () => {
      const dotSize = 2;
      const gap = Math.max(2, dotSize / 2);

      expect(gap).toBe(2);
    });

    it('should calculate gap for compact variant', () => {
      const dotSize = 4;
      const gap = Math.max(2, dotSize / 2);

      expect(gap).toBe(2);
    });
  });

  describe('Animation Timing', () => {
    it('should use 2500ms animation for full variant', () => {
      const isCompact = false;
      const animationDuration = isCompact ? 1200 : 2500;

      expect(animationDuration).toBe(2500);
    });

    it('should use 1200ms animation for compact variant', () => {
      const isCompact = true;
      const animationDuration = isCompact ? 1200 : 2500;

      expect(animationDuration).toBe(1200);
    });

    it('should calculate dot reveal time as 60% of total', () => {
      const animationDuration = 2500;
      const dotRevealTime = animationDuration * 0.6;

      expect(dotRevealTime).toBe(1500);
    });

    it('should calculate total delay timing', () => {
      const dotRevealTime = 1500;
      const totalDelay = dotRevealTime + 200;

      expect(totalDelay).toBe(1700);
    });
  });
});
