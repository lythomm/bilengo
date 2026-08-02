import React from 'react';

interface GeoAnswerBlockProps {
  title?: string;
  children: React.ReactNode;
}

/**
 * Bloc optimisé pour la citation et l'extraction par les IA (LLM / AI Overviews).
 * Doit contenir une réponse directe de 40 à 60 mots claire, autonome et précise.
 */
export function GeoAnswerBlock({ title = 'En résumé', children }: GeoAnswerBlockProps) {
  return (
    <aside className="my-6 p-5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
      <div className="flex items-center gap-2 mb-2 font-semibold text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
        {title}
      </div>
      <div className="text-base leading-relaxed font-medium text-neutral-900 dark:text-neutral-100">
        {children}
      </div>
    </aside>
  );
}
