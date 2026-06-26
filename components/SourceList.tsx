import { ExternalLink, FileText } from "lucide-react";
import type { Source } from "@/lib/schemas";

const SOURCE_TYPE_LABELS: Record<Source["type"], string> = {
  official: "公式",
  academic: "学術",
  media: "報道",
  survey: "調査",
};

interface SourceListProps {
  sources: Source[];
  title?: string;
}

export default function SourceList({ sources, title = "データ出典" }: SourceListProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>

      <ul className="space-y-2.5">
        {sources.map((source) => (
          <li key={source.id} className="flex items-start gap-2">
            <span className="shrink-0 mt-0.5 text-xs font-medium text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
              {SOURCE_TYPE_LABELS[source.type]}
            </span>
            <div className="min-w-0">
              <div className="flex items-start gap-1.5">
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-700 hover:text-teal-600 hover:underline leading-snug"
                  >
                    {source.title}
                    <ExternalLink className="inline-block w-2.5 h-2.5 ml-0.5 -mt-0.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-600 leading-snug">{source.title}</span>
                )}
              </div>
              <p className="text-xs text-slate-400">{source.organization}（{source.year}年）</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
