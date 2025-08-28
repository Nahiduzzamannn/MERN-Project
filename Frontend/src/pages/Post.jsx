
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPostBySlug } from '../services/api';

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchPostBySlug(slug)
      .then((data) => { if (!ignore) setPost(data); })
      .catch(() => { if (!ignore) setNotFound(true); });
    return () => { ignore = true; };
  }, [slug]);

  if (notFound) return <div className="max-w-3xl mx-auto p-4">Post not found. <Link className="underline" to="/">Go home</Link></div>;
  if (!post) return <div className="max-w-3xl mx-auto p-4">Loading...</div>;

  const date = new Date(post.publishedAt).toLocaleDateString();

  return (
    <div className="max-w-3xl mx-auto p-4">
      <p className="text-slate-500 text-sm">By {post.authorName} · {date}</p>
      <h1 className="text-3xl font-bold mt-1 mb-3">{post.title}</h1>
      {post.coverImage && <img className="w-full rounded my-3" src={post.coverImage} alt={post.title} />}
      <div className="flex flex-wrap gap-2 mb-4">
        {(post.tags || []).map((t) => <span key={t} className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">#{t}</span>)}
      </div>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}