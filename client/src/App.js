import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store, persistor } from './redux/store';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AddProduct from './components/AddProduct';
import ManageProducts from './components/ManageProducts';
import ManageSales from './components/ManageSales';
import ManagePurchases from './components/ManagePurchases';
import ManageSellers from './components/ManageSellers';
import Profile from './components/Profile';
import './styles/responsive.css';
import './index.css';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <div className="container-fluid">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/manage-products" element={<ManageProducts />} />
                    <Route path="/manage-sellers" element={<ManageSellers />} />
                    <Route path="/manage-purchases" element={<ManagePurchases />} />
                    <Route path="/manage-sales" element={<ManageSales />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/" element={<Dashboard />} />
                  </Routes>
                </div>
              </main>
            </div>
          </Router>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;