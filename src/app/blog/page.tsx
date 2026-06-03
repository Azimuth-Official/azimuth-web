import Link from "next/link";

interface BlogPost {
  title: string;
  date: string;
  excerpt: string;
  readTime: string;
  href: string;
}

const posts: BlogPost[] = [
  {
    title: "Introducing Azimuth",
    date: "June 2026",
    excerpt:
      "A decentralized network of passive SDR receivers, building positioning and timing from the radio signals already around us.",
    readTime: "5 min read",
    href: "/blog/welcome",
  },
  {
    title: "What Are Signals of Opportunity?",
    date: "June 2026",
    excerpt:
      "Every cell tower and TV transmitter is already a positioning beacon — if you know how to listen.",
    readTime: "7 min read",
    href: "/blog/soop-explained",
  },
];

export default function BlogIndex() {
  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-100 mb-2">Blog</h1>
        <p className="text-slate-400">
          Updates and insights from the Azimuth project.
        </p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link key={post.href} href={post.href}>
            <article className="bg-surface border border-border rounded-xl p-6 hover:border-amber-500/50 transition-all">
              <h2 className="text-xl font-semibold text-slate-100 mb-2">
                {post.title}
              </h2>
              <div className="flex items-center gap-2 mb-3">
                <time className="text-sm text-slate-500">{post.date}</time>
                <span className="text-sm text-slate-600">•</span>
                <span className="text-sm text-slate-500">{post.readTime}</span>
              </div>
              <p className="text-slate-400 mb-4">{post.excerpt}</p>
              <div className="text-amber-500 font-medium">Read more →</div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
