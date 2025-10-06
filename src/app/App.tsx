import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The landing page will be at the root URL "/" */}
        
        {/* Define routes for login and register */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;