import React from 'react';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { JsonLd, getAppSchema } from '@/components/seo/JsonLd';
import { Navbar } from '@/components/Navbar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ArrowRight, Calendar, User, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Blog & Guides Covoiturage Événementiel - BilenGo',
  description:
    'Conseils, guides et comparatifs pour organiser facilement le covoiturage de vos mariages, festivals, tournois et événements sans commission.',
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();
  const appSchema = getAppSchema();

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <JsonLd data={appSchema} />

      {/* Top Navbar */}
      <Navbar />

      <main className="flex-1 w-full bg-gradient-to-b from-neutral-50/60 via-white to-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <nav className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour à l'accueil
            </Link>
          </nav>

          {/* Header Section */}
          <header className="mb-14 text-center max-w-2xl mx-auto space-y-4">
            <Badge variant="default">Guides & Ressources</Badge>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 font-heading leading-tight">
              Covoiturage Événementiel & Solutions Gratuites
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Découvrez nos guides pratiques pour organiser la mobilité de vos événements, réduire votre bilan carbone et partager des trajets sans frais ni commission.
            </p>
          </header>

          {/* Posts Grid */}
          <section className="grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <Card
                key={post.slug}
                className="p-6 sm:p-8 flex flex-col justify-between hover:border-neutral-300 transition-all group bg-white shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <time dateTime={post.date}>{post.date}</time>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                      {post.author}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-neutral-900 font-heading group-hover:text-neutral-600 transition-colors leading-snug">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {post.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:underline shrink-0"
                  >
                    Lire l'article
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </section>
        </div>
      </main>

      {/* Dark Signature Footer */}
      <footer className="bg-[#101010] text-neutral-400 py-12 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white text-[#101010] flex items-center justify-center font-bold text-sm font-heading">
              B
            </div>
            <span className="text-white font-bold tracking-tight text-base font-heading">
              BilenGo
            </span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400">Covoiturage Événementiel Sans Friction</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog & Guides</Link>
          </div>

          <p className="text-neutral-500">
            © 2026 BilenGo. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
