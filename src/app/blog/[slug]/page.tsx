'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Leaf, ArrowLeft, Calendar, Tag, Loader2, Share2 } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import MobileBottomNav from '@/components/MobileBottomNav';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  status: string;
  published_at: string;
  cover_image_url: string;
}

interface PageProps {
  params: { slug: string };
}

export default function BlogPostPage({ params }: PageProps) {
  const supabase = createClient();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single();

      if (error || !data) {
        router.push('/blog');
        return;
      }
      setPost(data);

      // Fetch related posts from same category
      const { data: relatedData } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, category, published_at, cover_image_url, author')
        .eq('status', 'published')
        .eq('category', data.category)
        .neq('id', data.id)
        .limit(3);
      setRelated(relatedData || []);
      setLoading(false);
    };
    fetchPost();
  }, [params.slug]);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: post?.title, url: window.location.href });
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#1b4d3e]" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: post.cover_image_url || undefined,
            author: { '@type': 'Person', name: post.author },
            publisher: {
              '@type': 'Organization',
              name: 'PJHERBAL CLINIC',
              logo: { '@type': 'ImageObject', url: `${process.env.NEXT_PUBLIC_SITE_URL}/assets/images/app_logo.png` },
            },
            datePublished: post.published_at,
            mainEntityOfPage: { '@type': 'WebPage', '@id': typeof window !== 'undefined' ? window.location.href : '' },
          }),
        }}
      />

      <header className="sticky top-0 z-40 bg-white border-b border-[#e8e4dc] shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/blog" className="flex items-center gap-1.5 text-[#555] hover:text-[#1b4d3e] transition-colors">
            <ArrowLeft size={16} />
            <span className="text-xs font-medium">Blog</span>
          </Link>
          <Link href="/"><AppLogo size={30} /></Link>
          <button onClick={handleShare} className="p-2 rounded-lg hover:bg-[#f0f7f4] text-[#888] hover:text-[#1b4d3e] transition-colors">
            <Share2 size={16} />
          </button>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-6">
        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="rounded-2xl overflow-hidden mb-6 h-56 sm:h-72">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {/* Meta */}
        <div className="mb-4">
          {post.category && (
            <span className="text-[10px] font-bold text-[#4e9f3d] bg-[#f0f7f4] px-2.5 py-1 rounded-full">{post.category}</span>
          )}
          <h1 className="text-2xl font-bold text-[#222] mt-3 leading-tight">{post.title}</h1>
          {post.excerpt && <p className="text-sm text-[#666] mt-2 leading-relaxed">{post.excerpt}</p>}
          <div className="flex items-center gap-4 mt-3 text-xs text-[#aaa]">
            <span className="flex items-center gap-1.5"><Calendar size={12} />
              {new Date(post.published_at).toLocaleDateString('en-TZ', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5"><Tag size={12} /> {post.author}</span>
          </div>
        </div>

        <hr className="border-[#e8e4dc] my-5" />

        {/* Content */}
        <div className="prose prose-sm max-w-none text-[#444] leading-relaxed">
          {post.content ? (
            post.content.split('\n').map((paragraph, i) => (
              paragraph.trim() ? (
                <p key={i} className="mb-4 text-sm text-[#444] leading-relaxed">{paragraph}</p>
              ) : <br key={i} />
            ))
          ) : (
            <p className="text-sm text-[#888] italic">No content available.</p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8 p-5 bg-gradient-to-r from-[#1b4d3e] to-[#4e9f3d] rounded-2xl text-white text-center">
          <Leaf size={24} className="mx-auto mb-2 text-white/80" />
          <p className="font-bold text-sm">Explore Our Herbal Products</p>
          <p className="text-white/70 text-xs mt-1">Natural wellness solutions for every need</p>
          <Link href="/shop" className="inline-block mt-3 px-5 py-2 bg-white text-[#1b4d3e] rounded-xl text-xs font-bold hover:bg-white/90 transition-colors">
            Shop Now
          </Link>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-bold text-[#222] mb-4">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(r => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group bg-white rounded-xl border border-[#e8e4dc] overflow-hidden hover:shadow-md hover:border-[#1b4d3e]/30 transition-all">
                  <div className="h-28 bg-gradient-to-br from-[#1b4d3e] to-[#4e9f3d] flex items-center justify-center overflow-hidden">
                    {r.cover_image_url ? (
                      <img src={r.cover_image_url} alt={r.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <Leaf size={24} className="text-white/40" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-bold text-[#222] line-clamp-2 group-hover:text-[#1b4d3e] transition-colors">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <MobileBottomNav />
    </div>
  );
}
