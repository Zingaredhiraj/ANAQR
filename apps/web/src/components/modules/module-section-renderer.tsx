'use client';

interface ModuleSectionRendererProps {
  content: string;
  format?: 'markdown' | 'html' | 'text';
}

export function ModuleSectionRenderer({
  content,
  format = 'text',
}: ModuleSectionRendererProps) {
  if (format === 'html') {
    return (
      <div
        className="prose prose-blue max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Simple markdown-like rendering for text
  const lines = content.split('\n');
  return (
    <div className="space-y-3 text-gray-700 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('## '))
          return (
            <h2 key={i} className="text-xl font-bold text-gray-900 mt-4">
              {line.slice(3)}
            </h2>
          );
        if (line.startsWith('# '))
          return (
            <h1 key={i} className="text-2xl font-bold text-gray-900 mt-4">
              {line.slice(2)}
            </h1>
          );
        if (line.startsWith('- '))
          return (
            <li key={i} className="ml-4 list-disc text-gray-700">
              {line.slice(2)}
            </li>
          );
        if (line.startsWith('**') && line.endsWith('**'))
          return (
            <strong key={i} className="font-semibold text-gray-900">
              {line.slice(2, -2)}
            </strong>
          );
        if (line.trim() === '') return <div key={i} className="h-2" />;
        return <p key={i} className="text-gray-700">{line}</p>;
      })}
    </div>
  );
}
