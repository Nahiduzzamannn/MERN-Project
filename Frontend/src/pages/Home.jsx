import { useEffect, useState } from 'react';
import { fetchPosts, fetchTags } from '../services/api';
import PostCard from '../components/PostCard';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => { fetchTags().then(setTags).catch(() => setTags([])); }, []);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setPage(1);
    fetchPosts({ page: 1, limit: 10, search, tag })
      .then((res) => { if (!ignore) { setPosts(res.data); setHasMore(res.hasMore); } })
      .catch(() => { if (!ignore) { setPosts([]); setHasMore(false); } })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [search, tag]);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    const nextPage = page + 1;
    try {
      const res = await fetchPosts({ page: nextPage, limit: 10, search, tag });
      setPosts((p) => [...p, ...res.data]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSearch(query.trim());
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Latest Posts</h1>

      <form className="flex gap-2 mb-4" onSubmit={onSubmit}>
        <input
          name="q"
          type="search"
          placeholder="Search by title or tag..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-slate-300 rounded px-3 py-2"
        />
        <button type="submit" className="px-4 py-2 rounded bg-slate-900 text-white">Search</button>
      </form>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`px-3 py-1 rounded-full border ${!tag ? 'bg-slate-900 text-white' : ''}`}
            onClick={() => setTag('')}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t}
              className={`px-3 py-1 rounded-full border ${
                tag.toLowerCase() === String(t).toLowerCase() ? 'bg-slate-900 text-white' : ''
              }`}
              onClick={() => setTag(t)}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => <PostCard key={p.slug} post={p} />)}
      </div>

      <div className="flex justify-center my-6">
        {hasMore ? (
          <button
            disabled={loading}
            onClick={loadMore}
            className="px-4 py-2 rounded bg-slate-900 text-white disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        ) : (
          <span className="text-slate-500">No more posts</span>
        )}
      </div>
    </div>
  );
}