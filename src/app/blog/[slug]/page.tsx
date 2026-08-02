import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { GeoAnswerBlock } from '@/components/seo/GeoAnswerBlock';
import { JsonLd, getArticleSchema, getFaqSchema } from '@/components/seo/JsonLd';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Calendar, User, ArrowRight } from 'lucide-react';
import { formatDate } from '@/utils/date';

export const dynamic = 'force-static';

function renderFormattedText(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-neutral-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);
  if (!post) return {};

  return {
    title: `${post.title} | BilenGo`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const articleSchema = getArticleSchema(post);
  const faqSchema = post.faqs ? getFaqSchema(post.faqs) : null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <JsonLd data={articleSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* Navbar BilenGo */}
      <Navbar />

      <main className="flex-1 w-full bg-gradient-to-b from-neutral-50/60 via-white to-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <article className="max-w-3xl mx-auto">
            {/* Breadcrumb Navigation */}
            <nav className="mb-8">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour au blog
              </Link>
            </nav>

            {/* Article Header */}
            <header className="mb-10 space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="default">Guide</Badge>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 font-heading leading-tight">
                {post.title}
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
                {post.description}
              </p>

              <div className="flex items-center gap-3 pt-2 text-xs text-neutral-500 border-b border-neutral-200/80 pb-6">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  {post.author}
                </span>
              </div>
            </header>

            {/* Bloc d'accroche / En résumé */}
            {post.geoSummary && (
              <GeoAnswerBlock title="En résumé">
                {renderFormattedText(post.geoSummary)}
              </GeoAnswerBlock>
            )}

            {/* Article Content */}
            <div className="prose prose-neutral max-w-none my-10 leading-relaxed space-y-6 text-neutral-700 text-sm sm:text-base">
              {post.content.split('\n\n').map((paragraph, idx) => {
                const trimmed = paragraph.trim();

                if (trimmed.startsWith('## ')) {
                  return (
                    <h2
                      key={`h2-${idx}`}
                      className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-heading mt-10 mb-4 pt-4 border-t border-neutral-100"
                    >
                      {renderFormattedText(trimmed.replace('## ', ''))}
                    </h2>
                  );
                }

                if (trimmed.startsWith('### ')) {
                  return (
                    <h3
                      key={`h3-${idx}`}
                      className="text-lg sm:text-xl font-semibold text-neutral-900 font-heading mt-6 mb-3"
                    >
                      {renderFormattedText(trimmed.replace('### ', ''))}
                    </h3>
                  );
                }

                if (trimmed.startsWith('| ')) {
                  const rows = trimmed.split('\n').filter(Boolean);
                  return (
                    <div
                      key={`table-${idx}`}
                      className="overflow-x-auto my-8 border border-neutral-200/80 rounded-xl shadow-xs bg-white"
                    >
                      <table className="w-full text-xs sm:text-sm border-collapse">
                        <tbody>
                          {rows.map((row, rIdx) => {
                            if (row.includes(':---')) return null;
                            const cells = row.split('|').filter(Boolean);
                            return (
                              <tr
                                key={`tr-${rIdx}`}
                                className={
                                  rIdx === 0
                                    ? 'bg-neutral-100 font-semibold text-neutral-900 font-heading'
                                    : 'border-t border-neutral-200/60'
                                }
                              >
                                {cells.map((cell, cIdx) => (
                                  <td
                                    key={`td-${rIdx}-${cIdx}`}
                                    className="p-3 sm:p-4 text-neutral-800"
                                  >
                                    {renderFormattedText(cell.trim())}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                // Numbered List
                if (/^\d+\.\s/.test(trimmed)) {
                  const items = trimmed.split(/\n(?=\d+\.\s)/).filter(Boolean);
                  return (
                    <ol
                      key={`ol-${idx}`}
                      className="list-decimal list-inside space-y-2.5 my-5 text-neutral-800"
                    >
                      {items.map((item, itemIdx) => {
                        const cleaned = item.replace(/^\d+\.\s*/, '');
                        return (
                          <li key={`li-${idx}-${itemIdx}`} className="leading-relaxed">
                            {renderFormattedText(cleaned)}
                          </li>
                        );
                      })}
                    </ol>
                  );
                }

                // Bullet List
                if (/^[-*]\s/.test(trimmed)) {
                  const items = trimmed.split(/\n(?=[-*]\s)/).filter(Boolean);
                  return (
                    <ul
                      key={`ul-${idx}`}
                      className="list-disc list-inside space-y-2.5 my-5 text-neutral-800"
                    >
                      {items.map((item, itemIdx) => {
                        const cleaned = item.replace(/^[-*]\s*/, '');
                        return (
                          <li key={`li-${idx}-${itemIdx}`} className="leading-relaxed">
                            {renderFormattedText(cleaned)}
                          </li>
                        );
                      })}
                    </ul>
                  );
                }

                return (
                  <p key={`p-${idx}`} className="leading-relaxed">
                    {renderFormattedText(trimmed)}
                  </p>
                );
              })}
            </div>

            {/* Section FAQ */}
            {post.faqs && post.faqs.length > 0 && (
              <section className="mt-14 pt-10 border-t border-neutral-200/80 space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900 font-heading">
                  Foire Aux Questions (FAQ)
                </h2>
                <div className="space-y-4">
                  {post.faqs.map((faq, index) => (
                    <Card key={`faq-${index}`} className="p-5 space-y-2">
                      <h3 className="font-semibold text-neutral-900 font-heading text-base">
                        {renderFormattedText(faq.question)}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                        {renderFormattedText(faq.answer)}
                      </p>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* CTA Box */}
            <Card className="mt-14 p-8 bg-neutral-900 text-white rounded-3xl text-center space-y-4" variant='dark'>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                Prêt à organiser le covoiturage de votre événement ?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
                Créez votre rassemblement sur BilenGo en 2 minutes. 100% gratuit et sans aucune commission.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-neutral-900 font-semibold hover:bg-neutral-100 transition-colors text-sm shadow-xl"
                >
                  Créer mon événement
                  <ArrowRight className="w-4 h-4 text-neutral-900" />
                </Link>
              </div>
            </Card>
          </article>
        </div>
      </main>

      {/* Dedicated Footer */}
      <Footer />
    </div>
  );
}
