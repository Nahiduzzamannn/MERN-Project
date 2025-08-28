import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Post from "./pages/Post.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Editor from "./pages/Editor.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

function App() {
  return (
    <Routes>
      {/* Root shows Login */}
      <Route path="/" element={<Login />} />
      {/* Home feed */}
      <Route path="/home" element={<Home />} />

      {/* Posts list page */}
      <Route path="/posts" element={<Post />} />
      {/* Individual post detail by slug */}
      <Route path="/post/:slug" element={<PostDetail />} />

      {/* Keep /login as alias if someone navigates directly */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/editor"
        element={
          <PrivateRoute>
            <Editor />
          </PrivateRoute>
        }
      />
      <Route
        path="/editor/:id"
        element={
          <PrivateRoute>
            <Editor />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
