import React from 'react';
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
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const ComplaintTrendChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Submitted',
        data: data?.submitted || [12, 19, 15, 25, 22, 30, 28],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#4f46e5'
      },
      {
        label: 'Resolved',
        data: data?.resolved || [8, 14, 12, 20, 19, 24, 25],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#10b981'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600' } } },
      tooltip: { cornerRadius: 8, padding: 10 }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, beginAtZero: true }
    }
  };

  return (
    <div className="chart-wrapper">
      <Line data={chartData} options={options} />
    </div>
  );
};

export const StatusChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || ['Submitted', 'In Progress', 'Resolved', 'Closed'],
    datasets: [
      {
        data: data?.data || [25, 30, 35, 10],
        backgroundColor: [
          '#0ea5e9', // info
          '#f59e0b', // warning
          '#10b981', // success
          '#334155', // dark
          '#6366f1',
          '#ef4444',
          '#8b5cf6'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { boxWidth: 12, font: { family: "'Plus Jakarta Sans', sans-serif" } } }
    },
    cutout: '65%'
  };

  return (
    <div className="chart-wrapper">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export const PriorityChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        label: 'Complaints',
        data: data?.data || [15, 45, 30, 10],
        backgroundColor: ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444'],
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, beginAtZero: true }
    }
  };

  return (
    <div className="chart-wrapper">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export const CategoryChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || ['IT Support', 'Infrastructure', 'Hostel', 'Transport', 'Academic'],
    datasets: [
      {
        label: 'Count',
        data: data?.data || [40, 32, 28, 18, 15],
        backgroundColor: '#6366f1',
        borderRadius: 4
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#f1f5f9' }, beginAtZero: true },
      y: { grid: { display: false } }
    }
  };

  return (
    <div className="chart-wrapper">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export const DepartmentChart = ({ performance = [] }) => {
  const labels = performance.map((p) => p.department);
  const chartData = {
    labels: labels.length ? labels : ['Computer Science', 'Civil', 'Hostel & Transport', 'Admin'],
    datasets: [
      {
        label: 'Resolved',
        data: performance.map((p) => p.resolved),
        backgroundColor: '#10b981',
        borderRadius: 4
      },
      {
        label: 'Pending',
        data: performance.map((p) => p.pending),
        backgroundColor: '#f59e0b',
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12 } }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, beginAtZero: true }
    }
  };

  return (
    <div className="chart-wrapper">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export const SLAChart = ({ data }) => {
  const chartData = {
    labels: ['Within SLA', 'At Risk', 'Breached'],
    datasets: [
      {
        data: [data?.within_sla || 75, data?.at_risk || 15, data?.breached || 10],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12 } }
    }
  };

  return (
    <div className="chart-wrapper">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export const SatisfactionChart = ({ data }) => {
  const breakdown = data?.ratings_breakdown || { '5': 45, '4': 30, '3': 15, '2': 6, '1': 4 };
  const chartData = {
    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
    datasets: [
      {
        label: 'Reviews',
        data: [breakdown['5'], breakdown['4'], breakdown['3'], breakdown['2'], breakdown['1']],
        backgroundColor: ['#10b981', '#34d399', '#f59e0b', '#fb923c', '#ef4444'],
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, beginAtZero: true }
    }
  };

  return (
    <div className="chart-wrapper">
      <Bar data={chartData} options={options} />
    </div>
  );
};
