import Image from 'next/image';
import { cn } from '@/lib/utils';

const sizes = {
  sm: { height: 32, width: 32, className: 'h-8 w-8' },
  md: { height: 48, width: 48, className: 'h-12 w-12' },
  lg: { height: 80, width: 80, className: 'h-20 w-20' },
  xl: { height: 112, width: 112, className: 'h-28 w-28' },
} as const;

type XoralLogoProps = {
  size?: keyof typeof sizes;
  showWordmark?: boolean;
  className?: string;
  glow?: boolean;
};

export function XoralLogo({
  size = 'sm',
  showWordmark = false,
  className,
  glow = false,
}: XoralLogoProps) {
  const { height, width, className: sizeClass } = sizes[size];

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-black">
        <Image
          src="/xoral-logo-dark.png"
          alt="XORAL"
          width={width}
          height={height}
          priority={size !== 'sm'}
          className={cn('object-contain', sizeClass, glow && 'xoral-logo-glow')}
        />
      </span>
      {showWordmark && (
        <span className="text-xl font-black tracking-tight text-foreground">XORAL</span>
      )}
    </span>
  );
}
