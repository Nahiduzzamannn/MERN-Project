import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/home?reset=1" className="font-semibold">
            MyBlog
          </Link>
          <Link to="/home" className="px-2 py-1 rounded hover:bg-slate-100">
            Posts
          </Link>
          <Link
            to="/dashboard"
            className="px-2 py-1 rounded hover:bg-slate-100"
          >
            Dashboard
          </Link>
          <Link to="/editor" className="px-2 py-1 rounded hover:bg-slate-100">
            New Post
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-slate-600">{user.name}</span>
              <button className="px-3 py-1 border rounded" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="px-3 py-1 border rounded">
                Login
              </Link>
              <Link to="/signup" className="px-3 py-1 border rounded">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
