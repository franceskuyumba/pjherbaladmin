import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('name, description, image_url, category, price')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!data) {
    return {
      title: 'Product Not Found | PJHERBAL CLINIC',
    };
  }

  const title = `${data.name} | PJHERBAL CLINIC`;
  const description = data.description
    ? data.description.slice(0, 160)
    : `Buy ${data.name} – ${data.category} herbal supplement from PJHERBAL CLINIC. TZS ${Number(data.price).toLocaleString()}. Free delivery across Tanzania.`;
  const imageUrl = data.image_url || '/assets/images/app_logo.png';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pjherbalad2363.builtwithrocket.new';

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url: `${siteUrl}/product/${params.slug}`,
      title,
      description,
      images: [{ url: imageUrl, width: 800, height: 800, alt: `${data.name} – PJHERBAL herbal supplement` }],
      siteName: 'PJHERBAL CLINIC',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function ProductDetailPage({ params }: PageProps) {
  return <ProductDetailClient slug={params.slug} />;
}
