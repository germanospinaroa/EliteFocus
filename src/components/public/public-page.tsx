import { CultureSection } from './culture-section';
import { FinalCTA } from './final-cta';
import { Hero } from './hero';
import { PlatformPrinciples } from './platform-principles';
import { PublicFooter } from './public-footer';
import { PublicHeader } from './public-header';

export function PublicPage() { return <div className="public-site"><PublicHeader /><main><Hero /><PlatformPrinciples /><CultureSection /><FinalCTA /></main><PublicFooter /></div>; }
