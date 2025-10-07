/**
 * SkipLink Component
 *
 * Provides keyboard accessibility by allowing users to skip directly to main content.
 * Hidden by default, becomes visible when focused via keyboard navigation.
 * Meets WCAG 2.1 Level A success criterion 2.4.1 (Bypass Blocks).
 */

export interface SkipLinkProps {
  /**
   * ID of the main content element to skip to
   * @default "main-content"
   */
  targetId?: string;
  /**
   * Text content for the skip link
   * @default "Skip to main content"
   */
  children?: string;
}

export function SkipLink({
  targetId = 'main-content',
  children = 'Skip to main content'
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-blue-600 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: '0',
      }}
      onFocus={(e) => {
        e.currentTarget.style.position = 'absolute';
        e.currentTarget.style.width = 'auto';
        e.currentTarget.style.height = 'auto';
        e.currentTarget.style.padding = '0.75rem 1.5rem';
        e.currentTarget.style.margin = '0';
        e.currentTarget.style.overflow = 'visible';
        e.currentTarget.style.clip = 'auto';
        e.currentTarget.style.whiteSpace = 'normal';
      }}
      onBlur={(e) => {
        e.currentTarget.style.position = 'absolute';
        e.currentTarget.style.width = '1px';
        e.currentTarget.style.height = '1px';
        e.currentTarget.style.padding = '0';
        e.currentTarget.style.margin = '-1px';
        e.currentTarget.style.overflow = 'hidden';
        e.currentTarget.style.clip = 'rect(0, 0, 0, 0)';
        e.currentTarget.style.whiteSpace = 'nowrap';
      }}
    >
      {children}
    </a>
  );
}
