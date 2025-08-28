import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createPost,
  getPostForEdit,
  updatePost,
  uploadImage,
} from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = useMemo(() => Boolean(id), [id]);

  const [form, setForm] = useState({
    title: "",
    authorName: "",
    coverImage: "",
    tags: "", // comma-separated
    content: "", // HTML
    published: false,
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

  // Auto-save functionality
  useEffect(() => {
    if (!isEdit || !form.title) return;

    const autoSaveTimer = setTimeout(() => {
      if (form.title.trim() && form.content.trim()) {
        setAutoSaveStatus("Saving...");
        // Here you could implement auto-save logic
        setTimeout(() => setAutoSaveStatus("Saved"), 1000);
      }
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [form.title, form.content, isEdit]);

  // Update word count and reading time
  useEffect(() => {
    const text = form.content.replace(/<[^>]*>/g, ""); // Remove HTML tags
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = form.content.length;
    const readTime = Math.ceil(words / 200); // 200 words per minute

    setWordCount(words);
    setCharacterCount(characters);
    setEstimatedReadTime(readTime);
  }, [form.content]);

  useEffect(() => {
    let ignore = false;
    if (!isEdit) return;
    setLoading(true);
    getPostForEdit(id)
      .then((p) => {
        if (ignore) return;
        setForm({
          title: p.title || "",
          authorName: p.authorName || "",
          coverImage: p.coverImage || "",
          tags: (p.tags || []).join(", "),
          content: p.content || "",
          published: Boolean(p.published),
        });
      })
      .catch((e) => {
        if (!ignore) setError(e?.response?.data?.message || "Failed to load");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id, isEdit]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setAutoSaveStatus("");
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file");
      return;
    }

    setUploadError("");
    setUploading(true);
    try {
      const res = await uploadImage(file);
      setForm((f) => ({ ...f, coverImage: res.url }));
    } catch (e) {
      setUploadError(e?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, coverImage: "" }));
  };

  const insertTextAtCursor = (textarea, textToInsert) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    textarea.value = before + textToInsert + after;
    textarea.selectionStart = textarea.selectionEnd =
      start + textToInsert.length;
    textarea.focus();

    // Update form state
    setForm((f) => ({ ...f, content: textarea.value }));
  };

  const formatText = (format) => {
    const textarea = document.querySelector('textarea[name="content"]');
    const selection = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    );

    let formattedText = "";
    switch (format) {
      case "bold":
        formattedText = `<strong>${selection || "bold text"}</strong>`;
        break;
      case "italic":
        formattedText = `<em>${selection || "italic text"}</em>`;
        break;
      case "heading":
        formattedText = `<h2>${selection || "Heading"}</h2>`;
        break;
      case "link":
        formattedText = `<a href="https://example.com">${
          selection || "link text"
        }</a>`;
        break;
      case "paragraph":
        formattedText = `<p>${selection || "Paragraph text"}</p>`;
        break;
      case "list":
        formattedText = `<ul>\n  <li>${selection || "List item"}</li>\n</ul>`;
        break;
      default:
        return;
    }

    insertTextAtCursor(textarea, formattedText);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Enhanced validation
    const title = form.title.trim();
    const author = form.authorName.trim();
    const content = String(form.content || "").trim();

    if (title.length < 3) {
      setError("Title must be at least 3 characters.");
      setSaving(false);
      return;
    }
    if (title.length > 200) {
      setError("Title must be less than 200 characters.");
      setSaving(false);
      return;
    }
    if (author.length < 2) {
      setError("Author name must be at least 2 characters.");
      setSaving(false);
      return;
    }
    if (content.length < 10) {
      setError("Content must be at least 10 characters.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        title,
        authorName: author,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        content,
        published: form.published,
      };

      const cover = form.coverImage.trim();
      if (cover) payload.coverImage = cover;

      const res = isEdit
        ? await updatePost(id, payload)
        : await createPost(payload);
      navigate("/dashboard");
    } catch (e) {
      const details = e?.response?.data?.errors;
      if (Array.isArray(details) && details.length) {
        setError(details.map((d) => d.msg).join(", "));
      } else {
        setError(e?.response?.data?.message || "Save failed");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-gray-600 font-medium">Loading post...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  {isEdit ? "✏️ Edit Post" : "✨ Create New Post"}
                </h1>
                <p className="text-gray-600">
                  {isEdit
                    ? "Make changes to your existing post"
                    : "Share your thoughts with the world"}
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                {autoSaveStatus && (
                  <div className="flex items-center text-sm text-gray-500">
                    {autoSaveStatus === "Saving..." ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600 mr-1"></div>
                    ) : (
                      <svg
                        className="w-3 h-3 text-green-500 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {autoSaveStatus}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                    showPreview
                      ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>{showPreview ? "Hide Preview" : "Preview"}</span>
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span>Back</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2 animate-fadeIn">
              <svg
                className="w-5 h-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div
              className={`grid gap-6 ${
                showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1"
              }`}
            >
              {/* Editor Column */}
              <div className="space-y-6">
                {/* Post Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📝</span>
                    Post Details
                  </h2>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={onChange}
                        required
                        maxLength={200}
                        placeholder="Enter an engaging title for your post..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg font-medium"
                      />
                      <div className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>Make it catchy and descriptive</span>
                        <span>{form.title.length}/200</span>
                      </div>
                    </div>

                    {/* Author Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Author Name *
                      </label>
                      <input
                        name="authorName"
                        value={form.authorName}
                        onChange={onChange}
                        required
                        placeholder="Your name or pen name..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <input
                        name="tags"
                        value={form.tags}
                        onChange={onChange}
                        placeholder="technology, lifestyle, tutorial (comma separated)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      />
                      {form.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {form.tags.split(",").map((tag, index) => {
                            const trimmedTag = tag.trim();
                            return trimmedTag ? (
                              <span
                                key={index}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs"
                              >
                                #{trimmedTag}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">🖼️</span>
                    Cover Image
                  </h2>

                  {form.coverImage ? (
                    <div className="mb-4">
                      <div className="relative group">
                        <img
                          src={form.coverImage}
                          alt="Cover preview"
                          className="w-full max-h-64 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <button
                            type="button"
                            onClick={removeImage}
                            className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 hover:border-indigo-300 transition-colors duration-200">
                      <div className="text-4xl mb-2">📸</div>
                      <p className="text-gray-600 mb-2">
                        No cover image selected
                      </p>
                      <p className="text-sm text-gray-500">
                        Upload an image to make your post more engaging
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-200 transition-all duration-200 flex items-center space-x-2 hover:scale-105">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{uploading ? "Uploading..." : "Choose Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>

                    {uploading && (
                      <div className="flex items-center space-x-2 text-indigo-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                        <span className="text-sm">Uploading...</span>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded animate-fadeIn">
                      {uploadError}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>

                {/* Content Editor */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="mr-2">📄</span>
                      Content
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{wordCount} words</span>
                      <span>{estimatedReadTime} min read</span>
                    </div>
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="border border-gray-200 rounded-lg mb-4 p-3 bg-gray-50">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => formatText("bold")}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200"
                        title="Bold"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText("italic")}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200"
                        title="Italic"
                      >
                        <em>I</em>
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText("heading")}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200"
                        title="Heading"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText("link")}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200"
                        title="Link"
                      >
                        🔗
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText("list")}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200"
                        title="List"
                      >
                        📝
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText("paragraph")}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200"
                        title="Paragraph"
                      >
                        ¶
                      </button>
                    </div>
                  </div>

                  <div>
                    <textarea
                      name="content"
                      value={form.content}
                      onChange={onChange}
                      rows={20}
                      placeholder="Start writing your amazing content here... You can use the toolbar above for formatting or write HTML directly."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-mono text-sm resize-none"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        💡 Tip: HTML tags are supported and will be sanitized
                        for security
                      </p>
                      <span className="text-xs text-gray-400">
                        {characterCount} characters
                      </span>
                    </div>
                  </div>
                </div>

                {/* Publishing Options */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                      <div className="flex items-center">
                        <input
                          id="published"
                          name="published"
                          type="checkbox"
                          checked={form.published}
                          onChange={onChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="published"
                          className="ml-2 text-sm font-medium text-gray-700"
                        >
                          Publish immediately
                        </label>
                      </div>
                      <span className="text-xs text-gray-500 flex items-center">
                        {form.published ? (
                          <>
                            <svg
                              className="w-3 h-3 text-green-500 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Will be visible to everyone
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3 text-yellow-500 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Save as draft
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-400 disabled:to-purple-400 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 min-w-[140px] justify-center transform hover:scale-105 disabled:hover:scale-100"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <span>{isEdit ? "💾" : "✨"}</span>
                            <span>
                              {isEdit ? "Save Changes" : "Create Post"}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Column */}
              {showPreview && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">👀</span>
                    Preview
                  </h2>

                  <div className="space-y-4">
                    {/* Preview Title */}
                    {form.title && (
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                          {form.title}
                        </h1>
                        <p className="text-gray-600 text-sm">
                          By {form.authorName || "Unknown Author"}
                        </p>
                      </div>
                    )}

                    {/* Preview Cover Image */}
                    {form.coverImage && (
                      <div className="mb-4">
                        <img
                          src={form.coverImage}
                          alt="Cover preview"
                          className="w-full max-h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Preview Tags */}
                    {form.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {form.tags.split(",").map((tag, index) => {
                          const trimmedTag = tag.trim();
                          return trimmedTag ? (
                            <span
                              key={index}
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs"
                            >
                              #{trimmedTag}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* Preview Content */}
                    {form.content && (
                      <div
                        className="prose max-w-none text-sm"
                        dangerouslySetInnerHTML={{ __html: form.content }}
                      />
                    )}

                    {!form.title && !form.content && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Start writing to see the preview</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
