import Image from 'next/image';

type EliteFocusLogoProps = { variant?: 'full' | 'compact'; className?: string };

export function EliteFocusLogo({ variant = 'full', className = '' }: EliteFocusLogoProps) {
  return <Image className={`public-logo public-logo--${variant} ${className}`} src="/ef-logo.png" alt="Elite Focus - Zilis Team" width={variant === 'full' ? 420 : 150} height={variant === 'full' ? 420 : 150} priority />;
}
