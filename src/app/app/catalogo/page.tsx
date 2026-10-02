import Link from 'next/link';
import Image from 'next/image';
import { catalogProducts } from '@/lib/catalog/products';
import { CatalogShareDialog } from '@/components/catalog/catalog-share-dialog';

export default async function CatalogPage() {
  return <section className="catalog-workspace"><div className="page-heading catalog-heading"><div><span className="eyebrow">Biblioteca Zilis</span><h1>Catálogo</h1><p>Conoce los productos con claridad y comparte una ficha cuando tenga sentido.</p></div><div className="catalog-actions"><CatalogShareDialog targetType="CATALOG" /><Link className="secondary-button" href="/app/catalogo/compartidos">Compartidos</Link></div></div><div className="catalog-grid">{catalogProducts.map((product) => <article className="catalog-card" key={product.slug}><div className="catalog-card__media"><Image src={product.image} alt={product.name} width={320} height={320} /></div><div className="catalog-card__body"><span className="eyebrow">{product.category}</span><h2>{product.name}</h2><p>{product.description}</p><div className="catalog-card__actions"><Link className="text-link" href={`/app/catalogo/${product.slug}`}>Ver producto</Link><CatalogShareDialog targetType="PRODUCT" productSlug={product.slug} productName={product.name} compact /></div></div></article>)}</div></section>;
}
