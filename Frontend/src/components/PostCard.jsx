
import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  const date = new Date(post.publishedAt).toLocaleDateString();
  return (
    <article className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
      {post.coverImage && (
        <Link to={`/post/${post.slug}`}>
          <img className="w-full h-48 object-cover" src={post.coverImage} alt={post.title} />
        </Link>
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-1">
          <Link className="hover:underline" to={`/post/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="text-slate-500 text-sm mb-2">By {post.authorName} · {date}</p>
        <p className="text-slate-700 line-clamp-3">{post.excerpt}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(post.tags || []).map((t) => (
            <span key={t} className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">#{t}</span>
          ))}
        </div>
      </div>
    </article>
  );
}