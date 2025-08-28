import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { prefetchResource } from "../hooks/useCachedResource";
import { fetchPostBySlug } from "../services/api";

function PostCard({ post, viewMode = "grid" }) {
  const navigate = useNavigate();
  const date = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const go = () => {
    if (post?.slug) navigate(`/post/${post.slug}`);
  };

  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  };

  const prefetch = () => {
    if (post?.slug)
      prefetchResource(["post", post.slug], () => fetchPostBySlug(post.slug));
  };

  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content?.split(" ").length || 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes < 1 ? "< 1 min read" : `${minutes} min read`;
  };

  if (viewMode === "list") {
    return (
      <article
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
        onClick={go}
        onMouseEnter={prefetch}
        onFocus={prefetch}
        role="button"
        tabIndex={0}
        onKeyDown={onKey}
      >
        <div className="flex flex-col md:flex-row">
          {post.coverImage && (
            <div className="md:w-80 md:flex-shrink-0 relative overflow-hidden">
              <img
                className="w-full h-48 md:h-full object-cover transition-transform duration-300 group-hover:scale-110"
                src={post.coverImage}
                alt={post.title}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          )}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-wrap gap-2">
                  {(post.tags || []).slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 transition-colors duration-200 group-hover:bg-indigo-100"
                    >
                      #{t}
                    </span>
                  ))}
                  {post.tags?.length > 3 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      +{post.tags.length - 3} more
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {getReadingTime(post.content || post.excerpt)}
                </div>
              </div>

              <h2 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
                <Link className="hover:underline" to={`/post/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>

              <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {post.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {post.authorName}
                  </p>
                  <p className="text-xs text-gray-500">{date}</p>
                </div>
              </div>

              <div className="flex items-center text-indigo-600 group-hover:text-indigo-800 transition-colors duration-200">
                <span className="text-sm font-medium mr-1">Read more</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Grid view (default)
  return (
    <article
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group animate-fadeInUp"
      onClick={go}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      role="button"
      tabIndex={0}
      onKeyDown={onKey}
    >
      {post.coverImage && (
        <div className="relative overflow-hidden">
          <img
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Reading time badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700">
            {getReadingTime(post.content || post.excerpt)}
          </div>

          {/* Featured tag for popular posts */}
          {post.tags?.includes("featured") && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg">
              ⭐ Featured
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {(post.tags || []).slice(0, 2).map((t) => (
            <span
              key={t}
              className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 transition-all duration-200 group-hover:bg-indigo-100 group-hover:scale-105"
            >
              #{t}
            </span>
          ))}
          {post.tags?.length > 2 && (
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 transition-all duration-200 group-hover:bg-gray-200">
              +{post.tags.length - 2}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
          <Link className="hover:underline" to={`/post/${post.slug}`}>
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Author and Date */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
              {post.authorName.charAt(0).toUpperCase()}
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                {post.authorName}
              </p>
              <p className="text-xs text-gray-500">{date}</p>
            </div>
          </div>

          {/* Read more indicator */}
          <div className="flex items-center text-indigo-600 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Hover overlay for better click affordance */}
      <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </article>
  );
}

export default memo(PostCard);
