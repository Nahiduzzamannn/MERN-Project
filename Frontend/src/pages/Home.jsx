import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchPosts, fetchTags } from "../services/api";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";
import useDebouncedValue from "../hooks/useDebouncedValue";
import useCachedResource from "../hooks/useCachedResource";
import Footer from "../components/Footer";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const bottomRef = useRef(null);
  const [isBottomVisible, setIsBottomVisible] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 400);

  const { data: tags = [] } = useCachedResource(["tags"], fetchTags, {
    ttlMs: 5 * 60 * 1000,
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Reset filters when navigating with ?reset=1 from navbar
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has("reset")) {
      setQuery("");
      setTag("");
      setPage(1);
      navigate("/home", { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setPage(1);
    fetchPosts({ page: 1, limit: 10, search: debouncedQuery, tag })
      .then((res) => {
        if (!ignore) {
          setPosts(res.data);
          setHasMore(res.hasMore);
        }
      })
      .catch(() => {
        if (!ignore) {
          setPosts([]);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [debouncedQuery, tag]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    const nextPage = page + 1;
    try {
      const res = await fetchPosts({
        page: nextPage,
        limit: 10,
        search: debouncedQuery,
        tag,
      });
      setPosts((p) => [...p, ...res.data]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, page, debouncedQuery, tag]);

  // Observe only: keep visibility in state to avoid missing events while loading
  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        setIsBottomVisible(Boolean(first?.isIntersecting));
      },
      { root: null, rootMargin: "400px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Trigger loading when sentinel is visible and we're not already loading
  useEffect(() => {
    if (isBottomVisible && hasMore && !loading) {
      loadMore();
    }
  }, [isBottomVisible, hasMore, loading, loadMore]);

  // Fallback: also load when scrolling near bottom (in case IO misses)
  useEffect(() => {
    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 300;
      if (nearBottom && hasMore && !loading) {
        loadMore();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasMore, loading, loadMore]);

  // Ensure the page auto-loads until it can scroll (useful when few posts)
  useEffect(() => {
    if (!loading && hasMore) {
      const el = document.documentElement;
      const short = el.scrollHeight <= window.innerHeight + 100;
      if (short) {
        loadMore();
      }
    }
  }, [loading, hasMore, loadMore, posts.length]);

  const clearFilters = () => {
    setQuery("");
    setTag("");
    setPage(1);
  };

  const hasActiveFilters = query || tag;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full animate-pulse delay-1000"></div>
          </div>
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Discover Amazing Stories
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Explore a world of knowledge, creativity, and inspiration through
              our community's stories
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                <span className="mr-2">📚</span>
                <span>{posts.length}+ Articles</span>
              </div>
              <div className="flex items-center bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                <span className="mr-2">🏷️</span>
                <span>{tags.length}+ Topics</span>
              </div>
              <div className="flex items-center bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                <span className="mr-2">✨</span>
                <span>Fresh Content Daily</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8 transform transition-all duration-300 hover:shadow-xl">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Bar */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔍 Search Articles
                </label>
                <div className="relative">
                  <input
                    name="q"
                    type="search"
                    placeholder="Search by title, content, or tags..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="lg:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👁️ View Mode
                </label>
                <div className="flex rounded-xl bg-gray-100 p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm text-indigo-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-white shadow-sm text-indigo-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* Tags Filter */}
            {tags.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    🏷️ Filter by Tags
                  </label>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Clear Filters
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                      !tag
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg transform scale-105"
                        : "bg-white text-gray-700 border-gray-300 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md"
                    }`}
                    onClick={() => setTag("")}
                  >
                    All Topics
                  </button>
                  {tags.map((t) => (
                    <button
                      key={t}
                      className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                        tag.toLowerCase() === String(t).toLowerCase()
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg transform scale-105"
                          : "bg-white text-gray-700 border-gray-300 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md"
                      }`}
                      onClick={() => setTag(t)}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-indigo-800">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Active filters:
                    {query && (
                      <span className="ml-2 px-2 py-1 bg-white rounded-md">
                        Search: "{query}"
                      </span>
                    )}
                    {tag && (
                      <span className="ml-2 px-2 py-1 bg-white rounded-md">
                        Tag: #{tag}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-gray-600">
              {loading && posts.length === 0 ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  Loading articles...
                </div>
              ) : (
                <span>
                  {posts.length === 0
                    ? "No articles found"
                    : hasActiveFilters
                    ? `Found ${posts.length} article${
                        posts.length !== 1 ? "s" : ""
                      }`
                    : `Showing ${posts.length} article${
                        posts.length !== 1 ? "s" : ""
                      }`}
                </span>
              )}
            </div>
          </div>

          {/* Posts Grid/List */}
          {posts.length === 0 && !loading ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Be the first to share your story with the community!"}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => navigate("/editor")}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Write Your First Post
                </button>
              )}
            </div>
          ) : (
            <div
              className={`transition-all duration-300 ${
                viewMode === "grid"
                  ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "space-y-4"
              }`}
            >
              {posts.map((post, index) => (
                <div
                  key={post.slug}
                  className="transform transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PostCard post={post} viewMode={viewMode} />
                </div>
              ))}
            </div>
          )}

          {/* Infinite scroll sentinel + status */}
          <div
            ref={bottomRef}
            className="flex justify-center items-center my-8 text-gray-500 h-12"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className="font-medium">Loading more articles...</span>
              </div>
            ) : hasMore ? (
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm">Scroll down for more</p>
              </div>
            ) : posts.length > 0 ? (
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium">You've reached the end!</p>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
