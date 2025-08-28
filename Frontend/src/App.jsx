import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Post from './pages/Post.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/post/:slug" element={<Post />} />
    </Routes>
  )
}

export default App