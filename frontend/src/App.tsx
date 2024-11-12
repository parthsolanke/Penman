import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Playground from './pages/Playground';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/playground" element={<Playground />} />
      </Routes>
    </Router>
  );
}

export default App;
