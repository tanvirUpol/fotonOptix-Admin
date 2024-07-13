import { Route, Routes } from 'react-router-dom';
import './App.css';
import AuthProvider from './context/AuthProvider';
import NotFound from './components/NotFound';
import ProductTable from './pages/ProductTable';
import CreateProduct from './pages/CreateProduct';
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import PrivateOutlet from './components/PrivateOutlet';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/' element={<ProductTable />} />
        <Route path='/create-product' element={<CreateProduct />} />
        <Route path='*' element={<NotFound />} />

        {/* <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} /> */}
        {/* <Route path='/' element={<PrivateOutlet />}>
        </Route> */}
        
      </Routes>
    </AuthProvider>
  );
}

export default App;
