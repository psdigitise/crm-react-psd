import React, { useEffect, useState } from 'react';
import {
  MoreHorizontal,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Menu,
  User,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { dashboardStats, todayTasks, openDeals, todayLeads, dealsClosingThisMonth, todaytasks } from '../data/sampleData';
import { useTheme } from './ThemeProvider';
import axios from 'axios';
import { apiAxios, AUTH_TOKEN, getAuthToken } from '../api/apiUrl';
import { Lead, LeadTable } from '../Dashboardtables/Leadstable';
import { DealsTable } from './DealsTable';
import { Deals, Dealstable } from '../Dashboardtables/DealsTable';
import { TodayLeads, TodayLeadstable } from '../Dashboardtables/TodayLeadsTable';
import { getUserSession } from '../utils/session';
import { api } from '../api/apiService';
import { useNavigate } from 'react-router-dom';

const priorityColors = {
  Low: 'text-green-600',
  Normal: 'text-yellow-600',
  Good: 'text-blue-600'
};

type DealStatus = 'Qualification' | 'Lost' | 'Won' | 'Demo/Making' | 'Ready to Close' | 'Negotiation' | 'Proposal/Quotation';
interface Deal {
  name: string;
  status: DealStatus;
}
interface StatusCounts {
  total: number;
  Qualification: number;
  Lost: number;
  Won: number;
  'Demo/Making': number;
  'Ready to Close': number;
  Negotiation: number;
  'Proposal/Quotation': number
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  color: string;
}

function MetricCard({ title, value, change, icon, trend, color }: MetricCardProps) {
  const { theme } = useTheme();

  // Define icon colors based on theme
  const getIconColor = () => {
    if (color === 'bg-black') {
      return theme === 'dark' ? 'text-white' : 'text-white';
    }
    return theme === 'dark' ? 'text-white' : 'text-purple-600';
  };

  return (
    <div className={`rounded-3xl shadow-sm border p-6 hover:shadow-md transition-shadow relative ${theme === 'dark'
      ? 'bg-[#6200ee] border-purple-500/30'
      : 'bg-white border-gray-100'
      }`}>
      <div className={`absolute right-3 top-4 p-3 rounded-full ${color} ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-100'}`}>
        <div className={getIconColor()}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className={`text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{title}</p>
        <p className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function ChartCard({ title, description, children, action }: ChartCardProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-xl shadow-sm h-[100%] border-white  p-6 ${theme === 'dark' ? 'bg-custom-gradient border ' : 'bg-white border-gray-100'
        }`}
    >
      <div className="mb-6">
        <h3
          className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
        >
          {title}
        </h3>
        {description && (
          <p
            className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
          >
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  color: string;
}

function ActivityItem({ icon, title, description, time, color }: ActivityItemProps) {
  const { theme } = useTheme();

  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
      }`}>
      <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</p>
        <p className={`text-xs truncate ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{description}</p>
      </div>
      <span className={`text-xs flex-shrink-0 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{time}</span>
    </div>
  );
}

interface TaskTableProps {
  title: string;
  data: Array<{
    id: string;
    subject: string;
    StartDate: string;
    dueDate: string;
    status: string;
    priority: string;
  }>;
  compact?: boolean;
}

function TaskTable({ title, data, compact = false }: TaskTableProps) {
  const { theme } = useTheme();
  return (
    <div className={`rounded-xl shadow-sm border p-2   ${theme === 'dark'
      ? 'bg-custom-gradient border-white'
      : 'bg-white border-gray-100'
      }`}>
      <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        </div>
      </div>
      <div className="overflow-y-auto overflow-x-auto h-[430px] table-scroll">
        <table className="w-full table-fixed min-w-[500px]">
          <thead className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-50'} sticky top-0 z-10`}>
            <tr className={`divide-x-2 divide-white ${theme === 'dark' ? 'divide-white' : 'divide-white'} py-3`}>
              <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                Description
              </th>
              {!compact && (
                <>
                  <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                    Start Date
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                    Due Date
                  </th>
                </>
              )}
              {/* <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                Priority
              </th> */}
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}>
            {data.slice(0, compact ? 3 : data.length).map((item) => (
              <tr key={item.id} className={`transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
                }`}>
                <td className="px-4 sm:px-6 py-4">
                  <div className={`text-sm font-semibold hover:text-blue-800 cursor-pointer truncate ${theme === 'dark' ? 'text-white hover:text-purple-300' : 'text-blue-600'
                    }`}>
                    {item.subject}
                  </div>
                  {compact && (
                    <>
                      <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                        {item.StartDate}
                      </div>
                      <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                        {item.dueDate}
                      </div>
                    </>
                  )}
                </td>

                {!compact && (
                  <>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                      }`}>
                      {item.StartDate}
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell ${theme === 'dark' ? 'text-white' : 'text-gray-500'
                      }`}>
                      {item.dueDate}
                    </td>
                  </>
                )}
                {/* <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium text-black ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
                    {item.priority}
                  </span>
                </td> */}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className={`px-8 py-4 text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  No Today Tasks Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Interface for Sales Trend data
interface SalesTrendData {
  date: string;
  leads: number;
  deals: number;
  won_deals: number;
}

// Interface for Forecasted Revenue data
interface ForecastedRevenueData {
  date: string;
  time?: string;
  forecasted: number;
  actual: number;
}

interface DashboardProps {
  onMenuToggle: () => void;
}

export function Dashboard({ onMenuToggle }: DashboardProps) {
  const { theme } = useTheme();
  const [leadCount, setLeadCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    total: 0,
    Qualification: 0,
    Lost: 0,
    Won: 0,
    'Demo/Making': 0,
    'Ready to Close': 0,
    Negotiation: 0,
    'Proposal/Quotation': 0
  } as const);
  const [taskData, setTaskData] = useState<TaskTableProps["data"]>([]);
  const [leadTableData, setLeadTableData] = useState<Lead[]>([]);
  const [DealsTableData, setDealsTableData] = useState<Deals[]>([]);
  const [TodayLeadsData, setTodayLeadsTableData] = useState<TodayLeads[]>([]);
  const [contactCount, setContactCount] = useState(0);
  const [organizationCount, setOrganizationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // New state for charts
  const [salesTrendData, setSalesTrendData] = useState<SalesTrendData[]>([]);
  const [forecastedRevenueData, setForecastedRevenueData] = useState<ForecastedRevenueData[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(false);

  const navigate = useNavigate();
  const userSession = getUserSession();
  const sessionfullname = userSession?.full_name;
  const sessionUsername = userSession?.username || sessionfullname;
  const token = getAuthToken();

  const fetchSalesTrendData = async () => {
    try {
      setLoadingCharts(true);
      const userSession = getUserSession();
      const Company = userSession?.company;

      // Calculate date range (last 30 days)
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);

      const formattedFromDate = fromDate.toISOString().split('T')[0];
      const formattedToDate = toDate.toISOString().split('T')[0];

      const response = await api.post(
        '/api/method/customcrm.overrides.custom_crm_dashboard.get_sales_trend',
        {
          from_date: formattedFromDate,
          to_date: formattedToDate,
          company: Company,
        }
      );


      console.log("✅ Raw Sales Trend Response:", response);

      // ✅ Universal data extraction to handle different shapes
      const rawData =
        response?.data?.message?.data ||
        response?.message?.data ||
        response?.data?.data?.message?.data ||
        [];

      if (Array.isArray(rawData) && rawData.length > 0) {
        const formattedData = rawData.map((item: any) => ({
          ...item,
          leads: Number(item.leads) || 0,
          deals: Number(item.deals) || 0,
          won_deals: Number(item.won_deals) || 0,
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
        setSalesTrendData(formattedData);
      } else {
        console.warn("⚠️ No valid data found in API response.");
        setSalesTrendData([]);
      }
    } catch (error) {
      console.error("❌ Error fetching sales trend data:", error);
      setSalesTrendData([]);
    } finally {
      setLoadingCharts(false);
    }
  };

  const fetchForecastedRevenueData = async () => {
    try {
      setLoadingCharts(true);
      const userSession = getUserSession();
      const Company = userSession?.company;

      // Calculate date range (last 30 days)
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);

      const formattedFromDate = fromDate.toISOString().split('T')[0];
      const formattedToDate = toDate.toISOString().split('T')[0];

      const response = await api.post(
        '/api/method/customcrm.overrides.custom_crm_dashboard.get_forecasted_revenue',
        {
          from_date: formattedFromDate,
          to_date: formattedToDate,
          company: Company,
        }
      );


      console.log('✅ Forecasted Revenue API Response:', response.data);

      // ✅ Extract the data array safely
      const rawData =
        response?.data?.message?.data ||
        response?.message?.data ||
        response?.data?.data?.message?.data ||
        [];

      if (Array.isArray(rawData) && rawData.length > 0) {
        // ✅ Convert month field into readable format
        const formattedData = rawData.map((item: any) => ({
          date: item.month
            ? new Date(item.month.replace('%Y-%m-01', new Date().toISOString())).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })
            : 'N/A',
          forecasted: Number(item.forecasted) || 0,
          actual: Number(item.actual) || 0,
        }));

        setForecastedRevenueData(formattedData);
      } else {
        console.warn('⚠️ No valid forecasted revenue data found.');
        setForecastedRevenueData([]);
      }
    } catch (error) {
      console.error('❌ Error fetching forecasted revenue data:', error);
      setForecastedRevenueData([]);
    } finally {
      setLoadingCharts(false);
    }
  };

  const fetchDealCount = async () => {
    try {
      const userSession = getUserSession();
      const company = userSession?.company; // "PS creationss"

      const response = await apiAxios.get(
        '/api/resource/CRM Deal',
        {
          params: {
            fields: JSON.stringify(["name", "status"]),
            filters: JSON.stringify([["company", "=", company]]),
            limit_page_length: 0,
          },
          headers: {
            Authorization: token,
          },
        }
      );

      const deals = response?.data?.data || [];
      let counts = {
        Qualification: 0,
        Lost: 0,
        Won: 0,
        'Demo/Making': 0,
        'Ready to Close': 0,
        'Negotiation': 0,
        'Proposal/Quotation': 0
      };

      deals.forEach((deal: Deal) => {
        if (counts.hasOwnProperty(deal.status)) {
          counts[deal.status as keyof typeof counts]++;
        }
      });

      setStatusCounts({
        total: deals.length,
        ...counts,
      });

    } catch (error) {
      console.error('❌ Error fetching deal count:', error);
      setStatusCounts((prev) => ({
        ...prev,
        total: 0,
      }));
    }
  };


  const fetchTotalContactCount = async () => {
    try {
      const userSession = getUserSession();
      const company = userSession?.company; // "PS Creationss"

      const response = await apiAxios.get(
        '/api/resource/Contact',
        {
          params: {
            fields: JSON.stringify(["name"]),
            filters: JSON.stringify([["company", "=", company]]),
            limit_page_length: 0,
          },
          headers: {
            Authorization: token,
          },
        }
      );

      const contacts = response?.data?.data || [];

      setContactCount(contacts.length); // ✅ TOTAL CONTACT COUNT

    } catch (error) {
      console.error('❌ Error fetching contact count:', error);
      setContactCount(0);
    }
  };



  // Function to fetch organization count
  const fetchOrganizationCount = async () => {
    try {
      const userSession = getUserSession();
      const company = userSession?.company; // "PS Creationss"

      const response = await apiAxios.get(
        '/api/resource/CRM Organization',
        {
          params: {
            fields: JSON.stringify(["name"]),
            filters: JSON.stringify([["company", "=", company]]),
            limit_page_length: 0,
          },
          headers: {
            Authorization: token,
          },
        }
      );

      const organizations = response?.data?.data || [];

      setOrganizationCount(organizations.length); // ✅ TOTAL ORGANIZATION COUNT

    } catch (error) {
      console.error('❌ Error fetching organization count:', error);
      setOrganizationCount(0);
    }
  };


  // Function to fetch lead count
  const fetchLeadCount = async () => {
    try {
      const userSession = getUserSession();
      const company = userSession?.company; // "PS Creationss"

      const response = await apiAxios.get(
        '/api/resource/CRM Lead',
        {
          params: {
            fields: JSON.stringify(["name"]),
            filters: JSON.stringify([
              ["company", "=", company],
              ["converted", "=", 0],
            ]),
            limit_page_length: 0,
          },
          headers: {
            Authorization: token,
          },
        }
      );

      const leads = response?.data?.data || [];

      setLeadCount(leads.length); // ✅ ACTIVE LEAD COUNT

    } catch (error) {
      console.error('❌ Error fetching lead count:', error);
      setLeadCount(0);
    }
  };

  // Function to fetch tasks data
  const fetchTasksData = async () => {
    try {
      const userSession = getUserSession();
      const Company = userSession?.company;
      const response = await api.get('/api/v2/document/CRM Task', {
        fields: JSON.stringify(["description", "start_date", "due_date", "priority"]),
        filters: JSON.stringify({ company: Company }),
      });

      const data = response.data;
      const mappedTasks = data.map((task: any, index: number) => ({
        id: `${index}`,
        subject: task.description?.replace(/<[^>]+>/g, '') || 'No Description',
        StartDate: task.start_date ? new Date(task.start_date).toLocaleDateString() : 'N/A',
        dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A',
        priority: task.priority === 'High' ? 'Good' :
          task.priority === 'Medium' ? 'Normal' : 'Low',
      }));

      setTaskData(mappedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Function to fetch lead table data
  const fetchLeadTableData = async () => {
    try {
      const userSession = getUserSession();
      const Company = userSession?.company;
      const response = await api.get('/api/v2/document/CRM Lead', {
        fields: JSON.stringify(["lead_name", "status"]),
        filters: JSON.stringify({ company: Company, converted: 0 }),
      });

      const data = response.data;
      const formattedLeads = data.map((item: any, index: number) => ({
        id: `${index}`,
        lead_name: item.lead_name,
        status: item.status
      }));
      setLeadTableData(formattedLeads);
    } catch (error) {
      console.error('Error fetching lead table data:', error);
    }
  };

  const fetchDealsTableData = async () => {
    try {
      const userSession = getUserSession();
      const Company = userSession?.company;
      const response = await api.get('/api/v2/document/CRM Deal', {
        fields: JSON.stringify(["organization", "status", "closed_date"]),
        filters: JSON.stringify({ company: Company }),
      });

      const data = response?.data;
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const dealsThisMonth = data.filter((item: any) => {
        if (!item.closed_date) return false;
        const closeDate = new Date(item.closed_date);
        return closeDate.getMonth() === currentMonth &&
          closeDate.getFullYear() === currentYear;
      });

      const formattedDeals = dealsThisMonth.map((item: any, index: number) => ({
        id: `${index}`,
        organization: item.organization || 'N/A',
        status: item.status || 'N/A',
        closed_date: item.closed_date ? new Date(item.closed_date).toLocaleDateString() : 'N/A',
      }));

      setDealsTableData(formattedDeals);
    } catch (error) {
      console.error('Error fetching Deals table data:', error);
      setDealsTableData([]);
    }
  };

  // Function to fetch today's leads data
  const fetchTodayLeadsData = async () => {
    try {
      const userSession = getUserSession();
      const Company = userSession?.company;
      const today = new Date().toISOString().split('T')[0];

      const response = await api.get('/api/v2/document/CRM Lead', {
        fields: JSON.stringify(["lead_name", "status", "creation", "name"]),
        filters: JSON.stringify({
          company: Company,
          creation: ['>=', today],
          converted: 0
        }),
      });

      const data = response?.data || [];
      const formattedLeads = data.map((item: any, index: number) => ({
        id: item.name || `${index}`,
        lead_name: item.lead_name || 'Unnamed Lead',
        status: item.status || 'N/A',
        creation: item.creation ? new Date(item.creation).toLocaleDateString() : 'N/A',
      }));

      setTodayLeadsTableData(formattedLeads);

    } catch (error) {
      console.error('Error fetching Today Leads table data:', error);
      setTodayLeadsTableData([]);
    }
  };

  // Main refresh function
  const refreshDashboard = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDealCount(),
        fetchTotalContactCount(),
        fetchOrganizationCount(),
        fetchLeadCount(),
        fetchTasksData(),
        fetchLeadTableData(),
        fetchDealsTableData(),
        fetchTodayLeadsData(),
        fetchSalesTrendData(),
        fetchForecastedRevenueData()
      ]);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    refreshDashboard();
  }, []);

  const conversionData = [
    { name: 'Won', value: statusCounts.Won, color: '#5a2c93' },
    { name: 'Lost', value: statusCounts.Lost, color: '#7e67ff' },
    { name: 'Qualified', value: statusCounts.Qualification, color: '#b36fff' },
    { name: 'Demo/Making', value: statusCounts['Demo/Making'], color: '#c05af7ff' },
    { name: 'Ready to Close', value: statusCounts['Ready to Close'], color: '#aa37fc' },
    { name: 'Negotiation', value: statusCounts.Negotiation, color: '#350e51' },
    { name: 'Proposal/Quotation', value: statusCounts['Proposal/Quotation'], color: '#613085' },
  ];

  // Calculate if there's any data to show in the funnel
  const hasFunnelData = conversionData.some(item => item.value > 0);

  return (
    <div className={`p-4 sm:p-6 space-y-6 min-h-screen ${theme === 'dark'
      ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
      : 'bg-gray-50'
      }`}>
      <div className='flex'>
        {/* Welcome Header - Made responsive */}
        <div className="lg:hidden flex items-center justify-between">
          <button
            onClick={onMenuToggle}
            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'}`}
          >
            <Menu className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
          </button>
        </div>
        <div className="">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              <span className="mr-3 text-2xl">👋</span>
              Hello, {sessionfullname}!
            </h1>
          </div>
        </div>
      </div>
      <div className="mb-4 !mt-0">
        <div>
          <p className={`mt-4 mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Here's your sales performance snapshot for today.</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Contacts"
          value={contactCount}
          change={12.5}
          trend="up"
          icon={<User className="w-6 h-6" />}
          color={theme === 'dark' ? 'bg-purple-600' : 'bg-purple-100'}
        />
        <MetricCard
          title="Active Leads"
          value={leadCount}
          change={8.2}
          trend="up"
          icon={<TrendingUp className="w-6 h-6" />}
          color={theme === 'dark' ? 'bg-purple-600' : 'bg-purple-100'}
        />
        <MetricCard
          title="Open Deals"
          value={statusCounts.total}
          change={-3.1}
          trend="down"
          icon={<Target className="w-6 h-6" />}
          color={theme === 'dark' ? 'bg-purple-600' : 'bg-purple-100'}
        />
        <MetricCard
          title="Total Organizations"
          value={organizationCount}
          change={5.4}
          trend="up"
          icon={<Users className="w-6 h-6" />}
          color={theme === 'dark' ? 'bg-purple-600' : 'bg-purple-100'}
        />
      </div>

      {/* Charts Section - Sales Trend and Forecasted Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <ChartCard
          title="Sales trend"
          description="Daily performance of leads, deals, and wins"
        >
          <div className=" rounded-lg p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Count</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Leads</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Deals</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Won Deals</span>
                  </div>
                </div>
              </div>

              {loadingCharts ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-500" />
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading chart data...</p>
                  </div>
                </div>
              ) : salesTrendData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>No data available</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={salesTrendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                      fontSize={12}
                    />
                    <YAxis
                      stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        border: theme === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: theme === 'dark' ? '#f3f4f6' : '#374151'
                      }}
                      formatter={(value: any) => [value, 'Count']}
                    />
                    <Line
                      type="monotone"
                      dataKey="leads"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#3b82f6' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="deals"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#8b5cf6' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="won_deals"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </ChartCard>

        {/* Forecasted Revenue Chart */}
        <ChartCard
          title="Forecasted revenue"
          description="Projected vs actual revenue based on deal probability"
        >
          <div className="rounded-lg p-4 forecast-chart">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Revenue (₹)
                </span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: theme === 'dark' ? '#f59e0b' : '#f97316'
                      }}
                    ></div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Forecasted
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: theme === 'dark' ? '#60a5fa' : '#3b82f6'
                      }}
                    ></div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Actual
                    </span>
                  </div>
                </div>
              </div>

              {loadingCharts ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-500" />
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Loading chart data...
                    </p>
                  </div>
                </div>
              ) : forecastedRevenueData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      No data available
                    </p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <ScatterChart
                    data={forecastedRevenueData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme === 'dark' ? '#4B5563' : '#E5E7EB'}
                      strokeOpacity={0.6}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={theme === 'dark' ? '#D1D5DB' : '#4B5563'}
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: theme === 'dark' ? '#4B5563' : '#D1D5DB' }}
                      tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#4B5563' }}
                    />
                    <YAxis
                      stroke={theme === 'dark' ? '#D1D5DB' : '#4B5563'}
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: theme === 'dark' ? '#4B5563' : '#D1D5DB' }}
                      tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#4B5563' }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const forecastedValue = payload.find(p => p.name === 'forecasted')?.value;
                          const actualValue = payload.find(p => p.name === 'actual')?.value;

                          return (
                            <div className={`
                      p-3 rounded-lg shadow-lg border backdrop-blur-sm
                      ${theme === 'dark'
                                ? 'bg-gray-800 border-gray-600 text-white'
                                : 'bg-white border-gray-200 text-gray-900'
                              }
                    `}>
                              <p className="font-semibold mb-2">{`Date: ${label}`}</p>
                              {forecastedValue !== undefined && (
                                <p className="text-sm flex items-center">
                                  <span
                                    className="w-2 h-2 rounded-full mr-2"
                                    style={{ backgroundColor: theme === 'dark' ? '#f59e0b' : '#f97316' }}
                                  ></span>
                                  Forecasted: <span className="font-semibold ml-1">₹{forecastedValue?.toLocaleString('en-IN')}</span>
                                </p>
                              )}
                              {actualValue !== undefined && (
                                <p className="text-sm flex items-center mt-1">
                                  <span
                                    className="w-2 h-2 rounded-full mr-2"
                                    style={{ backgroundColor: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}
                                  ></span>
                                  Actual: <span className="font-semibold ml-1">₹{actualValue?.toLocaleString('en-IN')}</span>
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter
                      name="forecasted"
                      dataKey="forecasted"
                      fill={theme === 'dark' ? '#f59e0b' : '#f97316'}
                      stroke={theme === 'dark' ? '#d97706' : '#ea580c'}
                      strokeWidth={1}
                      shape="circle"
                      r={6}
                    />
                    <Scatter
                      name="actual"
                      dataKey="actual"
                      fill={theme === 'dark' ? '#60a5fa' : '#3b82f6'}
                      stroke={theme === 'dark' ? '#2563eb' : '#1d4ed8'}
                      strokeWidth={1}
                      shape="circle"
                      r={6}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      content={({ payload }) => (
                        <div className="flex justify-center space-x-4 mt-2">
                          {payload?.map((entry, index) => (
                            <div key={`legend-${index}`} className="flex items-center space-x-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              ></div>
                              <span className={`
                        text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
                      `}>
                                {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskTable title="Today Task" data={taskData} compact={false} />
        <TodayLeadstable title="Today Leads" data={TodayLeadsData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Dealstable title="Deals Closing This Month" data={DealsTableData} />

        {/* Deal Conversion Funnel - Updated layout */}
        <div className='h-[100%]'>
          <ChartCard title="Deal Conversion Funnel">
            {!hasFunnelData ? (
              <div className="flex items-center justify-center h-64 ">
                <div className="text-center">
                  <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No conversion data available</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row items-center lg:items-start">
                {/* Pie Chart - Left aligned */}
                {/* <div className="w-full lg:w-1/2 flex justify-center lg:justify-start mb-4 lg:mb-0"> */}
                <div className="transform scale-90 sm:scale-75 lg:scale-100 origin-center w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height={250} className="mt-10 sm:mt-10">
                    <PieChart>
                      <Pie
                        data={conversionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {conversionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const percentage = ((data.value / statusCounts.total) * 100).toFixed(1);

                            return (
                              <div className={`
                                        p-3 rounded-lg shadow-lg border min-w-[140px]
                                        ${theme === 'dark'
                                  ? 'bg-gray-800 border-gray-600 text-white'
                                  : 'bg-white border-gray-200 text-gray-900'
                                } `}>
                                <div className='d-flex flex justify-between'>
                                  <p className="font-semibold text-sm content-center">{data.name}</p>
                                  <p className="text-lg font-bold ">{data.value}</p>
                                </div>
                                <p className="text-sm opacity-75">{percentage}% of total</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend - Right aligned */}
                <div className="w-full lg:w-1/2 grid grid-cols-1 gap-3 pl-0 lg:pl-6">
                  {conversionData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-opacity-10"
                      style={{
                        backgroundColor: theme === 'dark' ? `${item.color}50` : `${item.color}10`,
                        border: theme === 'dark' ? `1px solid ${item.color}30` : `1px solid ${item.color}20`
                      }}>
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                          {item.name}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}