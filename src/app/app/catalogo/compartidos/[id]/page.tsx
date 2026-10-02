import { SharedLinkDetail } from '@/components/catalog/shared-link-detail';
export default function SharedLinkDetailPage({ params }: { params: { id: string } }) { return <section className="catalog-workspace"><SharedLinkDetail id={params.id} /></section>; }
