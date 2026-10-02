import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalogProduct } from '@/lib/catalog/products';
import { CatalogShareDialog } from '@/components/catalog/catalog-share-dialog';

export default async function CatalogProductPage({ params }: { params: { slug: string } }) {
  const product = getCatalogProduct(params.slug); if (!product) notFound();
  return <section className="catalog-detail"><Link className="back-link" href="/app/catalogo">← Volver al catálogo</Link><div className="catalog-detail__hero"><div><span className="eyebrow">{product.category}</span><h1>{product.name}</h1><p className="lead">{product.description}</p><CatalogShareDialog targetType="PRODUCT" productSlug={product.slug} productName={product.name} /></div><div className="catalog-detail__image"><Image src={product.image} alt={product.name} width={520} height={520} priority /></div></div><div className="catalog-detail__grid"><Info title="Lo esencial" items={product.benefits} /><Info title="Ingredientes" items={product.ingredients} /><Info title="Cómo usarlo" items={product.usage} /><Info title="Precauciones" items={product.precautions} /><section className="catalog-info"><span className="eyebrow">Preguntas frecuentes</span>{product.faqs.map((faq) => <div key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></div>)}</section></div></section>;
}
function Info({ title, items }: { title: string; items: string[] }) { return <section className="catalog-info"><span className="eyebrow">{title}</span><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>; }
