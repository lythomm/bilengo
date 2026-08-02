import fs from 'fs';
import path from 'path';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  geoSummary: string;
  faqs?: Array<{ question: string; answer: string }>;
  content: string;
}

const postsDirectory = path.join(process.cwd(), 'content/blog');

export async function getAllPosts(): Promise<BlogPost[]> {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.json') || fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.(json|md)$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      
      if (fileName.endsWith('.json')) {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const data = JSON.parse(fileContents);
        return {
          slug,
          ...data,
        } as BlogPost;
      }

      // Default fallback for markdown format
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      return {
        slug,
        title: slug.replace(/-/g, ' '),
        description: 'Guide de covoiturage événementiel gratuit',
        date: new Date().toISOString().split('T')[0],
        author: 'Bilengo',
        tags: ['covoiturage', 'événement'],
        geoSummary: 'Bilengo est une plateforme de covoiturage événementiel gratuit.',
        content: fileContents,
      } as BlogPost;
    });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) || null;
}
