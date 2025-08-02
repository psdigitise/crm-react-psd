// import React, { useEffect, useState } from 'react';
// import {
//   MoreHorizontal,
//   RefreshCw,
//   TrendingUp,
//   Users,
//   DollarSign,
//   IndianRupee,
//   Target,
//   Calendar,
//   ArrowUpRight,
//   ArrowDownRight,
//   Activity,
//   CheckCircle,
//   AlertCircle,
//   Phone,
//   Mail,
// } from 'lucide-react';
// import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
// import { dashboardStats, todayTasks, openDeals, todayLeads, dealsClosingThisMonth, todaytasks } from '../data/sampleData';
// import { useTheme } from './ThemeProvider';
// import axios from 'axios';
// import { apiAxios } from '../api/apiUrl';
// import { Lead, LeadTable } from '../Dashboardtables/Leadstable';
// import { DealsTable } from './DealsTable';
// import { Deals, Dealstable } from '../Dashboardtables/DealsTable';
// import { TodayLeads, TodayLeadstable } from '../Dashboardtables/TodayLeadsTable';
// import { getUserSession } from '../utils/session';



// const session = getUserSession();
// const sessionCompany = session?.company;
// const filters = encodeURIComponent(JSON.stringify([["company", "=", sessionCompany]]));

// const priorityColors = {
//   Low: 'text-green-600',
//   Normal: 'text-yellow-600',
//   Good: 'text-blue-600'
// };

// type DealStatus = 'Qualification' | 'Lost' | 'Won' | 'Demo/Making' | 'Ready to Close' | 'Negotiation' | 'Proposal/Quotation';
// interface Deal {
//   name: string;
//   status: DealStatus;
// }
// interface StatusCounts {
//   total: number;
//   Qualification: number;
//   Lost: number;
//   Won: number;
//   'Demo/Making': number;
//   'Ready to Close': number;
//   'Negotiation': number;
//   'Proposal/Quotation': number
// }



// interface MetricCardProps {
//   title: string;
//   value: string | number;
//   change: number;
//   icon: React.ReactNode;
//   trend: 'up' | 'down';
//   color: string;
// }


// function MetricCard({ title, value, change, icon, trend, color }: MetricCardProps) {
//   const { theme } = useTheme();

//   return (
//     <div className={`rounded-3xl shadow-sm border p-6 hover:shadow-md transition-shadow relative ${theme === 'dark'
//       ? 'bg-[#6200ee] border-purple-500/30'
//       : 'bg-white border-gray-100'
//       }`}>
//       {/* <div className="flex items-center justify-between mb-4"> */}
//       <div className={`absolute right-3 top-4 p-3 rounded-full ${color}`}>
//         {icon}
//       </div>
//       {/* <div className={`flex items-center space-x-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'
//           }`}>
//           {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
//           <span>{Math.abs(change)}%</span>
//         </div> */}
//       {/* </div> */}
//       <div className="space-y-1">
//         <p className={`text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{title}</p>

//         <p className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
//       </div>
//     </div>
//   );
// }

// interface ChartCardProps {
//   title: string;
//   children: React.ReactNode;
//   action?: React.ReactNode;
// }

// function ChartCard({ title, children, action }: ChartCardProps) {
//   const { theme } = useTheme();

//   return (
//     <div className={`rounded-xl shadow-sm border-none p-6 ${theme === 'dark'
//       ? ' '
//       : 'bg-white border-gray-100'
//       }`}>
//       <div className="flex items-center justify-between mb-6">
//         <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-black' : 'text-gray-900'}`}>{title}</h3>
//         {action || (
//           <button className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
//             }`}>
//             <MoreHorizontal className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//           </button>
//         )}
//       </div>
//       {children}
//     </div>
//   );
// }

// interface ActivityItemProps {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   time: string;
//   color: string;
// }

// function ActivityItem({ icon, title, description, time, color }: ActivityItemProps) {
//   const { theme } = useTheme();

//   return (
//     <div className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
//       }`}>
//       <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
//         {icon}
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</p>
//         <p className={`text-xs truncate ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{description}</p>
//       </div>
//       <span className={`text-xs flex-shrink-0 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{time}</span>
//     </div>
//   );
// }

// interface TaskTableProps {
//   title: string;
//   data: Array<{
//     id: string;
//     subject: string;
//     StartDate: string;
//     dueDate: string;
//     status: string;
//     priority: string;
//   }>;
//   compact?: boolean;
// }


// function TaskTable({ title, data, compact = false }: TaskTableProps) {
//   const { theme } = useTheme();
//   return (
//     <div className={`rounded-xl shadow-sm border p-2   ${theme === 'dark'
//       ? 'bg-custom-gradient border-white'
//       : 'bg-white border-gray-100'
//       }`}>
//       <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-100'}`}>
//         <div className="flex items-center justify-between">
//           <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
//           <button className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
//             }`}>
//             <MoreHorizontal className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//           </button>
//         </div>
//       </div>
//       <div className="overflow-y-auto overflow-x-auto h-[350px] table-scroll">
//         <table className="w-full table-fixed min-w-[700px]">
//           <thead className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-50'} sticky top-0 z-10`}>
//             <tr className={`divide-x-2 divide-white ${theme === 'dark' ? 'divide-white' : 'divide-white'} py-3`}>
//               <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
//                 Description
//               </th>
//               {!compact && (
//                 <>
//                   <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
//                     Start Date
//                   </th>
//                   <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
//                     Due Date
//                   </th>
//                 </>
//               )}
//               <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
//                 Priority
//               </th>
//             </tr>
//           </thead>
//           <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}>
//             {data.slice(0, compact ? 3 : data.length).map((item) => (
//               <tr key={item.id} className={`transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'
//                 }`}>
//                 <td className="px-4 sm:px-6 py-4">
//                   <div className={`text-sm font-semibold hover:text-blue-800 cursor-pointer truncate ${theme === 'dark' ? 'text-white hover:text-purple-300' : 'text-blue-600'
//                     }`}>
//                     {item.subject}
//                   </div>
//                   {compact && (
//                     <>
//                       <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
//                         {item.StartDate}
//                       </div>
//                       <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
//                         {item.dueDate}
//                       </div>
//                     </>
//                   )}
//                 </td>

//                 {!compact && (
//                   <>
//                     <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell ${theme === 'dark' ? 'text-white' : 'text-gray-900'
//                       }`}>
//                       {item.StartDate}
//                     </td>
//                     <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell ${theme === 'dark' ? 'text-white' : 'text-gray-900'
//                       }`}>
//                       {item.dueDate}
//                     </td>
//                     {/* <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell ${theme === 'dark' ? 'text-white' : 'text-gray-900'
//                       }`}>
//                       {item.status}
//                     </td> */}
//                   </>
//                 )}
//                 <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                   <span className={`text-sm font-medium text-black ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
//                     {item.priority}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//             {data.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={1}
//                   className={`px-8 py-4 text-sm text-center ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}
//                 >
//                   No Today Tasks Found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export function Dashboard() {
//   const { theme } = useTheme();
//   const [leadCount, setLeadCount] = useState(0);
//   const [statusCounts, setStatusCounts] = useState<StatusCounts>({
//     total: 0,
//     Qualification: 0,
//     Lost: 0,
//     Won: 0,
//     'Demo/Making': 0,
//     'Ready to Close': 0,
//     Negotiation: 0,
//     'Proposal/Quotation': 0
//   } as const);
//   const [taskData, setTaskData] = useState<TaskTableProps["data"]>([]);
//   console.log("taskData", taskData)
//   const [leadTableData, setLeadTableData] = useState<Lead[]>([]);
//   const [DealsTableData, setDealsTableData] = useState<Deals[]>([]);
//   const [TodayLeadsData, setTodayLeadsTableData] = useState<TodayLeads[]>([]);

//   useEffect(() => {
//     if (!sessionCompany) return;

//     axios.get(
//       `http://103.214.132.20:8002/api/v2/document/CRM Deal?fields=["name","status"]&filters=${filters}`,
//       {
//         headers: {
//           Authorization: 'token 1b670b800ace83b:f82627cb56de7f6',
//         },
//       }
//     )
//       .then((response) => {
//         const data = response.data.data;

//         // Initialize counters
//         let counts = {
//           Qualification: 0,
//           Lost: 0,
//           Won: 0,
//           'Demo/Making': 0,
//           'Ready to Close': 0,
//           'Negotiation': 0,
//           'Proposal/Quotation': 0
//         };

//         // Count each status
//         data.forEach((deal: Deal) => {
//           if (counts.hasOwnProperty(deal.status)) {
//             counts[deal.status]++;
//           } else {
//             // Optional: to handle unexpected statuses
//             counts[deal.status] = 1;
//           }
//         });

//         setStatusCounts({
//           total: data.length,
//           ...counts,
//         });
//       })
//       .catch((error) => {
//         console.error('Error fetching data:', error);
//       });
//   }, []);

//   const conversionData = [
//     { name: 'Won', value: statusCounts.Won, color: '#5a2c93' },
//     { name: 'Lost', value: statusCounts.Lost, color: '#7e67ff' },
//     { name: 'Qualified', value: statusCounts.Qualification, color: '#b36fff' },
//     { name: 'Demo/Making', value: statusCounts['Demo/Making'], color: '#c05af7ff' },
//     { name: 'Ready to Close', value: statusCounts['Ready to Close'], color: '#aa37fc' },
//     { name: 'Negotiation', value: statusCounts.Negotiation, color: '#350e51' },
//     { name: 'Proposal/Quotation', value: statusCounts['Proposal/Quotation'], color: '#613085' },
//   ];

//   useEffect(() => {
//     if (!sessionCompany) return; // Don't run if no company

//     axios.get(
//       `http://103.214.132.20:8002/api/v2/document/CRM Lead?filters=${filters}`,
//       {
//         headers: {
//           Authorization: 'token 1b670b800ace83b:f82627cb56de7f6',
//         },
//       }
//     )
//       .then((response) => {
//         const data = response.data.data;
//         setLeadCount(data.length);
//       })
//       .catch((error) => {
//         console.error('Error fetching lead data:', error);
//       });
//   }, [sessionCompany]);

//   useEffect(() => {
//     if (!sessionCompany) return; // Don't run if no company

//     apiAxios.get(
//       `/api/v2/document/CRM Task?fields=["description","start_date","due_date","priority"]&filters=${filters}`,
//       {
//         headers: {
//           Authorization: 'token 1b670b800ace83b:f82627cb56de7f6',
//         },
//       }
//     )
//       .then((response) => {
//         const data = response.data.data;

//         // Transform API response to match TaskTableProps["data"]
//         const mappedTasks = data.map((task: any, index: number) => ({
//           id: `${index}`,
//           subject: task.description?.replace(/<[^>]+>/g, '') || 'No Description',
//           StartDate: task.start_date ? new Date(task.start_date).toLocaleDateString() : 'N/A',
//           dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A',
//           priority: task.priority === 'High' ? 'Good' :
//             task.priority === 'Medium' ? 'Normal' :
//               'Low'
//         }));

//         setTaskData(mappedTasks);
//       })
//       .catch((error) => {
//         console.error('Error fetching tasks:', error);
//       });
//   }, [sessionCompany]);

//   useEffect(() => {
//     if (!sessionCompany) return;

//     axios.get(
//       `http://103.214.132.20:8002/api/v2/document/CRM Lead?fields=["lead_name","status"]&filters=${filters}`,
//       {
//         headers: {
//           Authorization: 'token 1b670b800ace83b:f82627cb56de7f6',
//         },
//       }
//     )

//       .then((response) => {
//         const data = response.data.data;

//         const formattedLeads = data.map((item: any, index: number) => ({
//           id: `${index}`,
//           lead_name: item.lead_name,
//           status: item.status
//         }));
//         console.log("formattedLeads", formattedLeads)
//         setLeadTableData(formattedLeads);
//       })
//       .catch((error) => {
//         console.error('Error fetching lead table data:', error);
//       });
//   }, []);

//   useEffect(() => {
//     if (!sessionCompany) return; // Don't run if no company

//     apiAxios
//       .get(`/api/v2/document/CRM Deal?fields=["organization","status","close_date"]&filters=${filters}`, {
//         headers: {
//           Authorization: 'token 1b670b800ace83b:f82627cb56de7f6',
//         },
//       })
//       .then((response) => {
//         const data = response?.data?.data;

//         const formattedDeals = data.map((item: any, index: number) => ({
//           id: `${index}`,
//           organization: item.organization || 'N/A',
//           status: item.status || 'N/A',
//           close_date: item.close_date || 'N/A',
//         }));
//         console.log("formattedDeals", formattedDeals)
//         setDealsTableData(formattedDeals);
//       })
//       .catch((error) => {
//         console.error('Error fetching Deals table data:', error);
//       });
//   }, [sessionCompany]);

//   useEffect(() => {
//     if (!sessionCompany) return; // Don't run if no company

//     apiAxios
//       .get(`/api/v2/document/CRM Lead?fields=["status","creation"]&filters=${filters}`, {
//         headers: {
//           Authorization: 'token 1b670b800ace83b:f82627cb56de7f6',
//         },
//       })
//       .then((response) => {
//         const data = response?.data?.data;

//         const today = new Date().toISOString().split("T")[0];
//         // Filter and map only leads created today, and show status
//         const filteredLeads = (data || [])
//           .filter((item: any) => {
//             if (!item.creation) return false;
//             const createdDate = item.creation.split("T")[0];
//             return createdDate === today;
//           })
//           .map((item: any, index: number) => ({
//             id: `${index}`,
//             status: item.status || 'N/A',
//             creation: item.creation || 'N/A',
//           }));

//         setTodayLeadsTableData(filteredLeads);
//       })
//       .catch((error) => {
//         console.error('Error fetching Today Leads table data:', error);
//       });
//   }, [sessionCompany]);


//   return (
//     <div className={`p-4 sm:p-6 space-y-6 min-h-screen ${theme === 'dark'
//       ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
//       : 'bg-gray-50'
//       }`}>
//       {/* Welcome Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className={`text-2xl sm:text-3xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'
//             }`}>
//             <span className="mr-3 text-2xl">👋</span>
//             Welcome back, Administrator
//           </h1>
//           <p className={`mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Here's what's happening with your sales today.</p>
//         </div>
//         <div className="flex items-center space-x-2">
//           <button className={`p-2 rounded-lg transition-all ${theme === 'dark'
//             ? 'hover:bg-purple-800/50 hover:shadow-sm'
//             : 'hover:bg-white hover:shadow-sm'
//             }`}>
//             <RefreshCw className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//           </button>
//           <button className={`p-2 rounded-lg transition-all ${theme === 'dark'
//             ? 'hover:bg-purple-800/50 hover:shadow-sm'
//             : 'hover:bg-white hover:shadow-sm'
//             }`}>
//             <MoreHorizontal className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
//           </button>
//         </div>
//       </div>

//       {/* Key Metrics */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//         <MetricCard
//           title="Total Revenue"
//           value="₹ 0.00"
//           change={12.5}
//           trend="up"
//           icon={<IndianRupee className="w-6 h-6 text-purplebg" />}
//           color="bg-black"
//         />
//         <MetricCard
//           title="Active Leads"
//           value={leadCount}
//           change={8.2}
//           trend="up"
//           icon={<Users className="w-6 h-6 text-purplebg" />}
//           color="bg-black"
//         />
//         <MetricCard
//           title="Open Deals"
//           value={statusCounts.total}
//           change={-3.1}
//           trend="down"
//           icon={<Target className="w-6 h-6 text-purplebg" />}
//           color="bg-black"
//         />
//         <MetricCard
//           title="Conversion Rate"
//           value="0%"
//           change={5.4}
//           trend="up"
//           icon={<TrendingUp className="w-6 h-6 text-purplebg" />}
//           color="bg-black"
//         />
//       </div>

//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//         {/* <TaskTable title="Today Task" data={todaytasks} compact={true} /> */}
//         <TaskTable title="Today Task" data={taskData} compact={false} />
//          <TodayLeadstable title="Today Leads" data={TodayLeadsData} />
//         <LeadTable title="Total Leads" data={leadTableData} />

//         <Dealstable title="Deals on Track to Close" data={DealsTableData} />
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-lg ">
//         {/* <div className="grid grid-cols-1 xl:">
//           <TaskTable title="My Deals Closing This Month" data={dealsClosingThisMonth} compact={true} />
//         </div> */}

//         <div className=''>
//           <ChartCard title="Lead Conversion Funnel">
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={conversionData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={60}
//                   outerRadius={120}
//                   paddingAngle={5}
//                   dataKey="value"
//                 >
//                   {conversionData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: theme === 'dark' ? 'white' : 'white',
//                     border: theme === 'dark' ? '1px solid #6366F1' : '1px solid #e5e7eb',
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//                     color: theme === 'dark' ? '#E5E7EB' : '#374151'
//                   }}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//             <div className="grid grid-cols-2 gap-4 mt-4">
//               {conversionData.map((item, index) => (
//                 <div key={index} className="flex items-center space-x-2">
//                   <div
//                     className="w-3 h-3 rounded-full"
//                     style={{ backgroundColor: item.color }}
//                   />
//                   <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>{item.name}</span>
//                   <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.value}</span>
//                 </div>
//               ))}
//             </div>
//           </ChartCard>
//         </div>


//         {/* Quick Actions */}
//         <div className="grid grid-cols-1 relative">
//           <div className='before:absolute before:content-[""] before:w-[2px] before:h-[70%] before:bg-black before:top-[20%]'></div>

//           <ChartCard title="Quick Actions">
//             <div className="space-y-6">
//               <button className={`w-full p-3 text-left rounded-lg transition-colors group ${theme === 'dark'
//                 ? 'bg-[#076eff4f] hover:bg-blue-300'
//                 : 'bg-blue-50 hover:bg-blue-100'
//                 }`}
//                 onClick={() => {
//                   window.history.pushState({}, '', '/leads');
//                   window.dispatchEvent(new PopStateEvent('popstate'));
//                 }}
//               >
//                 <div className="flex items-center space-x-3 g">
//                   <div className={`p-2 rounded-lg transition-colors ${theme === 'dark'
//                     ? 'bg-blue-600 group-hover:bg-blue-700'
//                     : 'bg-blue-500 group-hover:bg-blue-600'
//                     }`}>
//                     <Users className="w-4 h-4 text-white " />
//                   </div>
//                   <div >
//                     <p className={`font-medium ${theme === 'dark' ? 'text-black' : 'text-gray-900'}`} >Add New Lead</p>
//                     <p className={`text-sm ${theme === 'dark' ? 'text-black' : 'text-gray-600'}`}>Create a new lead entry</p>
//                   </div>
//                 </div>
//               </button>

//               <button className={`w-full p-3 text-left rounded-lg transition-colors group ${theme === 'dark'
//                 ? 'bg-[#7e6dff5d] hover:bg-[#7e6dff96]'
//                 : 'bg-green-50 hover:bg-green-100'
//                 }`}

//                 onClick={() => {
//                   window.history.pushState({}, '', '/deals');
//                   window.dispatchEvent(new PopStateEvent('popstate')); // Manually trigger React Router (if used)
//                 }}
//               >
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-[#7e6dff] rounded-lg group-hover:bg-[#7e6dff] transition-colors">
//                     <Target className="w-4 h-4 text-white" />
//                   </div>
//                   <div>
//                     <p className={`font-medium ${theme === 'dark' ? 'text-black' : 'text-gray-900'}`}>Create Deal</p>
//                     <p className={`text-sm ${theme === 'dark' ? 'text-black' : 'text-gray-600'}`}>Start a new deal</p>
//                   </div>
//                 </div>
//               </button>

//               <button className={`w-full p-3 text-left rounded-lg transition-colors group ${theme === 'dark'
//                 ? 'bg-purple-800/30 hover:bg-purple-700/50'
//                 : 'bg-purple-50 hover:bg-purple-100'
//                 }`}>
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purplebg transition-colors">
//                     <Calendar className="w-4 h-4 text-white" />
//                   </div>
//                   <div>
//                     <p className={`font-medium ${theme === 'dark' ? 'text-black' : 'text-gray-900'}`}>Schedule Meeting</p>
//                     <p className={`text-sm ${theme === 'dark' ? 'text-black' : 'text-gray-600'}`}>Book a new meeting</p>
//                   </div>
//                 </div>
//               </button>

//               <button className={`w-full p-3 text-left rounded-lg transition-colors group ${theme === 'dark'
//                 ? 'bg-[#7e6dff5d] hover:bg-[#7e6dff96]'
//                 : 'bg-orange-50 hover:bg-orange-100'
//                 }`}>
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-[#7e6dff] rounded-lg group-hover:bg-[#7e6dff]  transition-colors">
//                     <Activity className="w-4 h-4 text-white" />
//                   </div>
//                   <div>
//                     <p className={`font-medium ${theme === 'dark' ? 'text-black' : 'text-gray-900'}`}>View Reports</p>
//                     <p className={`text-sm ${theme === 'dark' ? 'text-black' : 'text-gray-600'}`}>Check analytics</p>
//                   </div>
//                 </div>
//               </button>
//             </div>
//           </ChartCard>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState, useCallback } from 'react';
import {
  MoreHorizontal,
  RefreshCw,
  TrendingUp,
  Users,
  IndianRupee,
  Target,
  Calendar,
  Activity,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from './ThemeProvider';
import axios from 'axios';
import { apiAxios } from '../api/apiUrl';
import { LeadTable } from '../Dashboardtables/Leadstable';
import { Dealstable } from '../Dashboardtables/DealsTable';
import { TodayLeadstable } from '../Dashboardtables/TodayLeadsTable';
import { getUserSession } from '../utils/session';

const session = getUserSession();
const sessionCompany = session?.company;
const filters = encodeURIComponent(JSON.stringify([["company", "=", sessionCompany]]));

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
  return (
    <div className={`rounded-3xl shadow-sm border p-6 hover:shadow-md transition-shadow relative ${theme === 'dark'
      ? 'bg-[#6200ee] border-purple-500/30'
      : 'bg-white border-gray-100'
      }`}>
      <div className={`absolute right-3 top-4 p-3 rounded-full ${color}`}>
        {icon}
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
  children: React.ReactNode;
  action?: React.ReactNode;
}

function ChartCard({ title, children, action }: ChartCardProps) {
  const { theme } = useTheme();
  return (
    <div className={`rounded-xl shadow-sm border-none p-6 ${theme === 'dark'
      ? ' '
      : 'bg-white border-gray-100'
      }`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-black' : 'text-gray-900'}`}>{title}</h3>
        {action || (
          <button className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
            }`}>
            <MoreHorizontal className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
          </button>
        )}
      </div>
      {children}
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
      <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <button className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'
            }`}>
            <MoreHorizontal className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
          </button>
        </div>
      </div>
      <div className="overflow-y-auto overflow-x-auto h-[350px] table-scroll">
        <table className="w-full table-fixed min-w-[700px]">
          <thead className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-50'} sticky top-0 z-10`}>
            <tr className={`divide-x-2 divide-white ${theme === 'dark' ? 'divide-white' : 'divide-white'} py-3`}>
              <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                Description
              </th>
              {!compact && (
                <>
                  <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                    Start Date
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                    Due Date
                  </th>
                </>
              )}
              <th className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                Priority
              </th>
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
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      {item.StartDate}
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      {item.dueDate}
                    </td>
                  </>
                )}
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium text-black ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
                    {item.priority}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={1}
                  className={`px-8 py-4 text-sm text-center ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}
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

export function Dashboard() {
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
  const [leadTableData, setLeadTableData] = useState<any[]>([]);
  const [DealsTableData, setDealsTableData] = useState<any[]>([]);
  const [TodayLeadsData, setTodayLeadsTableData] = useState<any[]>([]);

  // --- All fetch functions ---
  const fetchDealStatusCounts = useCallback(() => {
    if (!sessionCompany) return;
    axios.get(
      `http://103.214.132.20:8002/api/v2/document/CRM Deal?fields=["name","status"]&filters=${filters}`,
      {
        headers: {
          Authorization: 'token 1b670b800ace83b:f82627cb56de7f6',
        },
      }
    )
      .then((response) => {
        const data = response.data.data;
        let counts = {
          Qualification: 0,
          Lost: 0,
          Won: 0,
          'Demo/Making': 0,
          'Ready to Close': 0,
          Negotiation: 0,
          'Proposal/Quotation': 0
        };
        data.forEach((deal: Deal) => {
          if (counts.hasOwnProperty(deal.status)) {
            counts[deal.status]++;
          } else {
            counts[deal.status] = 1;
          }
        });
        setStatusCounts({
          total: data.length,
          ...counts,
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const fetchLeadCount = useCallback(() => {
    if (!sessionCompany) return;
    axios.get(
      `http://103.214.132.20:8002/api/v2/document/CRM Lead?filters=${filters}`,
      {
        headers: {
          Authorization: 'token 1b670b800ace83b:f82627cb56de7f6',
        },
      }
    )
      .then((response) => {
        const data = response.data.data;
        setLeadCount(data.length);
      })
      .catch((error) => {
        console.error('Error fetching lead data:', error);
      });
  }, []);

  const fetchTaskData = useCallback(() => {
    if (!sessionCompany) return;
    apiAxios.get(
      `/api/v2/document/CRM Task?fields=["description","start_date","due_date","priority"]&filters=${filters}`,
      {
        headers: {
          Authorization: 'token 1b670b800ace83b:f82627cb56de7f6',
        },
      }
    )
      .then((response) => {
        const data = response.data.data;
        const mappedTasks = data.map((task: any, index: number) => ({
          id: `${index}`,
          subject: task.description?.replace(/<[^>]+>/g, '') || 'No Description',
          StartDate: task.start_date ? new Date(task.start_date).toLocaleDateString() : 'N/A',
          dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A',
          priority: task.priority === 'High' ? 'Good' :
            task.priority === 'Medium' ? 'Normal' :
              'Low'
        }));
        setTaskData(mappedTasks);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  }, []);

  const fetchLeadTableData = useCallback(() => {
    if (!sessionCompany) return;
    axios.get(
      `http://103.214.132.20:8002/api/v2/document/CRM Lead?fields=["lead_name","status"]&filters=${filters}`,
      {
        headers: {
          Authorization: 'token 1b670b800ace83b:f82627cb56de7f6',
        },
      }
    )
      .then((response) => {
        const data = response.data.data;
        const formattedLeads = data.map((item: any, index: number) => ({
          id: `${index}`,
          lead_name: item.lead_name,
          status: item.status
        }));
        setLeadTableData(formattedLeads);
      })
      .catch((error) => {
        console.error('Error fetching lead table data:', error);
      });
  }, []);

  const fetchDealsTableData = useCallback(() => {
    if (!sessionCompany) return;
    apiAxios
      .get(`/api/v2/document/CRM Deal?fields=["organization","status","close_date"]&filters=${filters}`, {
        headers: {
          Authorization: 'token 1b670b800ace83b:f82627cb56de7f6',
        },
      })
      .then((response) => {
        const data = response?.data?.data;
        const formattedDeals = data.map((item: any, index: number) => ({
          id: `${index}`,
          organization: item.organization || 'N/A',
          status: item.status || 'N/A',
          close_date: item.close_date || 'N/A',
        }));
        setDealsTableData(formattedDeals);
      })
      .catch((error) => {
        console.error('Error fetching Deals table data:', error);
      });
  }, []);

  const fetchTodayLeadsTableData = useCallback(() => {
    if (!sessionCompany) return;
    apiAxios
      .get(`/api/v2/document/CRM Lead?fields=["status","creation"]&filters=${filters}`, {
        headers: {
          Authorization: 'token 1b670b800ace83b:f82627cb56de7f6',
        },
      })
      .then((response) => {
        const data = response?.data?.data;
        const today = new Date().toISOString().split("T")[0];
        const filteredLeads = (data || [])
          .filter((item: any) => {
            if (!item.creation) return false;
            const createdDate = item.creation.split("T")[0];
            return createdDate === today;
          })
          .map((item: any, index: number) => ({
            id: `${index}`,
            status: item.status || 'N/A',
            creation: item.creation || 'N/A',
          }));
        setTodayLeadsTableData(filteredLeads);
      })
      .catch((error) => {
        console.error('Error fetching Today Leads table data:', error);
      });
  }, []);

  // --- Refresh all ---
  const refreshAll = useCallback(() => {
    console.log("refreshAll called at", new Date().toLocaleTimeString());
    fetchDealStatusCounts();
    fetchLeadCount();
    fetchTaskData();
    fetchLeadTableData();
    fetchDealsTableData();
    fetchTodayLeadsTableData();
  }, [
    fetchDealStatusCounts,
    fetchLeadCount,
    fetchTaskData,
    fetchLeadTableData,
    fetchDealsTableData,
    fetchTodayLeadsTableData
  ]);

  // --- Auto-refresh every 60 seconds ---
  // useEffect(() => {
  //   refreshAll(); // Initial fetch
  //   const interval = setInterval(() => {
  //     refreshAll();
  //   }, 1000); // 60 seconds
  //   return () => clearInterval(interval);
  // }, [refreshAll]);

  useEffect(() => {
    // refreshAll(); // Initial fetch
    const interval = setInterval(() => {
      refreshAll();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [refreshAll]);

  // --- Conversion Data for Pie Chart ---
  const conversionData = [
    { name: 'Won', value: statusCounts.Won, color: '#5a2c93' },
    { name: 'Lost', value: statusCounts.Lost, color: '#7e67ff' },
    { name: 'Qualified', value: statusCounts.Qualification, color: '#b36fff' },
    { name: 'Demo/Making', value: statusCounts['Demo/Making'], color: '#c05af7ff' },
    { name: 'Ready to Close', value: statusCounts['Ready to Close'], color: '#aa37fc' },
    { name: 'Negotiation', value: statusCounts.Negotiation, color: '#350e51' },
    { name: 'Proposal/Quotation', value: statusCounts['Proposal/Quotation'], color: '#613085' },
  ];

  return (
    <div className={`p-4 sm:p-6 space-y-6 min-h-screen ${theme === 'dark'
      ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary'
      : 'bg-gray-50'
      }`}>
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            <span className="mr-3 text-2xl">👋</span>
            Welcome back, Administrator
          </h1>
          <p className={`mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Here's what's happening with your sales today.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className={`p-2 rounded-lg transition-all ${theme === 'dark'
              ? 'hover:bg-purple-800/50 hover:shadow-sm'
              : 'hover:bg-white hover:shadow-sm'
              }`}
            onClick={refreshAll}
          >
            <RefreshCw className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
          </button>
          <button className={`p-2 rounded-lg transition-all ${theme === 'dark'
            ? 'hover:bg-purple-800/50 hover:shadow-sm'
            : 'hover:bg-white hover:shadow-sm'
            }`}>
            <MoreHorizontal className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Revenue"
          value="₹ 0.00"
          change={12.5}
          trend="up"
          icon={<IndianRupee className="w-6 h-6 text-purplebg" />}
          color="bg-black"
        />
        <MetricCard
          title="Active Leads"
          value={leadCount}
          change={8.2}
          trend="up"
          icon={<Users className="w-6 h-6 text-purplebg" />}
          color="bg-black"
        />
        <MetricCard
          title="Open Deals"
          value={statusCounts.total}
          change={-3.1}
          trend="down"
          icon={<Target className="w-6 h-6 text-purplebg" />}
          color="bg-black"
        />
        <MetricCard
          title="Conversion Rate"
          value="0%"
          change={5.4}
          trend="up"
          icon={<TrendingUp className="w-6 h-6 text-purplebg" />}
          color="bg-black"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TaskTable title="Today Task" data={taskData} compact={false} />
        <TodayLeadstable title="Today Leads" data={TodayLeadsData} />
        <LeadTable title="Total Leads" data={leadTableData} />
        <Dealstable title="Deals on Track to Close" data={DealsTableData} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-lg ">
        <div className=''>
          <ChartCard title="Lead Conversion Funnel">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={conversionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {conversionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? 'white' : 'white',
                    border: theme === 'dark' ? '1px solid #6366F1' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    color: theme === 'dark' ? '#E5E7EB' : '#374151'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {conversionData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>{item.name}</span>
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 relative">
          <div className='before:absolute before:content-[""] before:w-[2px] before:h-[70%] before:bg-black before:top-[20%]'></div>
          <ChartCard title="Quick Actions">
            <div className="space-y-6">
              <button className={`w-full p-3 text-left rounded-lg transition-colors group ${theme === 'dark'
                ? 'bg-[#076eff4f] hover:bg-blue-300'
                : 'bg-blue-50 hover:bg-blue-100'
                }`}
                onClick={() => {
                  window.history.pushState({}, '', '/leads');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                <div className="flex items-center space-x-3 g">
                  <div className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                    ? 'bg-blue-600 group-hover:bg-blue-700'
                    : 'bg-blue-500 group-hover:bg-blue-600'
                    }`}>
                    <Users className="w-4 h-4 text-white " />
                  </div>
                  <div >
                    <p className={`font-medium ${theme === 'dark' ? 'text-black' : 'text-gray-900'}`} >Add New Lead</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-black' : 'text-gray-600'}`}>Create a new lead entry</p>
                  </div>
                </div>
              </button>

              <button className={`w-full p-3 text-left rounded-lg transition-colors group ${theme === 'dark'
                ? 'bg-[#7e6dff5d] hover:bg-[#7e6dff96]'
                : 'bg-green-50 hover:bg-green-100'
                }`}

                onClick={() => {
                  window.history.pushState({}, '', '/deals');
                  window.dispatchEvent(new PopStateEvent('popstate')); // Manually trigger React Router (if used)
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#7e6dff] rounded-lg group-hover:bg-[#7e6dff] transition-colors">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-black' : 'text-gray-900'}`}>Create Deal</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-black' : 'text-gray-600'}`}>Start a new deal</p>
                  </div>
                </div>
              </button>

              <button className={`w-full p-3 text-left rounded-lg transition-colors group ${theme === 'dark'
                ? 'bg-purple-800/30 hover:bg-purple-700/50'
                : 'bg-purple-50 hover:bg-purple-100'
                }`}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purplebg transition-colors">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-black' : 'text-gray-900'}`}>Schedule Meeting</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-black' : 'text-gray-600'}`}>Book a new meeting</p>
                  </div>
                </div>
              </button>

              <button className={`w-full p-3 text-left rounded-lg transition-colors group ${theme === 'dark'
                ? 'bg-[#7e6dff5d] hover:bg-[#7e6dff96]'
                : 'bg-orange-50 hover:bg-orange-100'
                }`}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#7e6dff] rounded-lg group-hover:bg-[#7e6dff]  transition-colors">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-black' : 'text-gray-900'}`}>View Reports</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-black' : 'text-gray-600'}`}>Check analytics</p>
                  </div>
                </div>
              </button>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}