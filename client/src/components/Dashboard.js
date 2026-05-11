import React from 'react';
import { useSelector } from 'react-redux';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import '../styles/responsive.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const sellers = useSelector((state) => state.sellers?.sellers || []);
  const products = useSelector((state) => state.products?.products || []);
  const sales = useSelector((state) => state.sales?.sales || []);
  const purchases = useSelector((state) => state.purchases?.purchases || []);

  // Calculate total revenue and expenses
  const calculateTotalRevenue = () => {
    return sales.reduce((total, sale) => total + (sale.totalPrice || 0), 0);
  };

  const calculateTotalExpenses = () => {
    return purchases.reduce((total, purchase) => total + (purchase.totalAmount || 0), 0);
  };

  // Get monthly sales data for the last 6 months
  const getMonthlySalesData = () => {
    const months = [];
    const salesData = [];
    const purchaseData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      months.push(monthYear);

      const monthSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === date.getMonth() && 
               saleDate.getFullYear() === date.getFullYear();
      }).reduce((total, sale) => total + (sale.totalPrice || 0), 0);

      const monthPurchases = purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate.getMonth() === date.getMonth() && 
               purchaseDate.getFullYear() === date.getFullYear();
      }).reduce((total, purchase) => total + (purchase.totalAmount || 0), 0);

      salesData.push(monthSales);
      purchaseData.push(monthPurchases);
    }

    return { months, salesData, purchaseData };
  };

  // Get category-wise sales data
  const getCategorySalesData = () => {
    const categoryData = {};
    sales.forEach(sale => {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
        categoryData[product.category] = (categoryData[product.category] || 0) + sale.totalPrice;
      }
    });

    return {
      labels: Object.keys(categoryData),
      data: Object.values(categoryData)
    };
  };

  // Get top selling products data
  const getTopProductsData = () => {
    const productSales = {};
    sales.forEach(sale => {
      productSales[sale.productName] = (productSales[sale.productName] || 0) + sale.quantity;
    });

    const sortedProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      labels: sortedProducts.map(([name]) => name),
      data: sortedProducts.map(([,quantity]) => quantity)
    };
  };

  const { months, salesData, purchaseData } = getMonthlySalesData();
  const categorySales = getCategorySalesData();
  const topProducts = getTopProductsData();

  // Chart configurations
  const revenueChartData = {
    labels: months,
    datasets: [
      {
        label: 'Sales',
        data: salesData,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false
      },
      {
        label: 'Purchases',
        data: purchaseData,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        fill: false
      }
    ]
  };

  const categoryChartData = {
    labels: categorySales.labels,
    datasets: [{
      data: categorySales.data,
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)'
      ]
    }]
  };

  const topProductsChartData = {
    labels: topProducts.labels,
    datasets: [{
      label: 'Units Sold',
      data: topProducts.data,
      backgroundColor: 'rgba(54, 162, 235, 0.8)'
    }]
  };

  return (
    <div className="dashboard p-2">
      <h6 className="mb-2">Dashboard Overview</h6>
      
      {/* Summary Cards */}
      <div className="row g-2 mb-2">
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body py-1 px-2">
              <small className="text-muted">Total Products</small>
              <p className="h5 mb-0">{products.length}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body py-1 px-2">
              <small className="text-muted">Total Sellers</small>
              <p className="h5 mb-0">{sellers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body py-1 px-2">
              <small className="text-muted">Total Revenue</small>
              <p className="h5 mb-0">₹{calculateTotalRevenue().toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body py-1 px-2">
              <small className="text-muted">Total Expenses</small>
              <p className="h5 mb-0">₹{calculateTotalExpenses().toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-2">
        {/* Revenue Trend */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body p-2">
              <small className="text-muted">Revenue vs Expenses Trend</small>
              <Line 
                data={revenueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  aspectRatio: 2.5,
                  plugins: {
                    legend: {
                      position: 'top',
                      align: 'end',
                      labels: {
                        boxWidth: 8,
                        padding: 4,
                        font: { size: 10 }
                      }
                    },
                    title: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        font: { size: 9 },
                        maxTicksLimit: 5
                      }
                    },
                    x: {
                      ticks: {
                        font: { size: 9 }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body p-2">
              <small className="text-muted">Sales by Category</small>
              <Doughnut 
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  aspectRatio: 1.5,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 6,
                        padding: 2,
                        font: { size: 9 }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Top Products and Recent Activity in same row */}
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body p-2">
              <div className="row">
                {/* Top Products */}
                <div className="col-md-6 border-end">
                  <small className="text-muted">Top Selling Products</small>
                  <Bar 
                    data={topProductsChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      aspectRatio: 2,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            font: { size: 9 },
                            maxTicksLimit: 4
                          }
                        },
                        x: {
                          ticks: {
                            font: { size: 9 }
                          }
                        }
                      }
                    }}
                  />
                </div>

                {/* Recent Activity */}
                <div className="col-md-6">
                  <small className="text-muted">Recent Activity</small>
                  <table className="table table-sm small mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...sales, ...purchases]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 4)
                        .map((activity, index) => (
                          <tr key={index}>
                            <td>{new Date(activity.date).toLocaleDateString()}</td>
                            <td>{activity.productName ? 'Sale' : 'Purchase'}</td>
                            <td>₹{(activity.totalPrice || activity.totalAmount || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;