import { MoreHorizontal } from 'lucide-react';
import { useTheme } from "../components/ThemeProvider"

export interface Deals {
   
    id: string;
    organization: string;
    status: string;
    closed_date: string;
}

interface DealsTableProps {
    title: string;
    data: Deals[];
}

export function Dealstable({ title, data }: DealsTableProps) {
    const { theme } = useTheme();

    return (
        // <div className={`rounded-xl shadow-sm border p-2 ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-100'}`}>
        <div className={`rounded-xl shadow-sm border p-2 h-[436px] flex flex-col ${theme === 'dark' ? 'bg-custom-gradient border-white' : 'bg-white border-gray-100'}`}>
            <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-purple-500/30' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between">
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                    {/* <button className={`p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'}`}>
                        <MoreHorizontal className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`} />
                    </button> */}
                </div>
            </div>
            <div className="overflow-y-auto overflow-x-auto table-scroll !h-[345px]">
                <table className="w-full table-fixed min-w-[500px]">
                    <thead className={`${theme === 'dark' ? 'bg-purplebg' : 'bg-gray-50'} sticky top-0 z-10`}>
                        <tr className='divide-x divide-white '>
                            <th className={`px-4 py-3 text-gray-500 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'} `}>
                                Organization
                            </th>
                            <th className={`px-4 py-3 text-gray-500  text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                                Status
                            </th>
                            <th className={`px-4 py-3 text-gray-500  text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                                Close Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-white' : 'divide-gray-200'}`}>
                        {data.map((deals) => (
                            <tr key={deals.id} className={`${theme === 'dark' ? 'hover:bg-purple-800/20' : 'hover:bg-gray-50'}`}>
                                <td className={`px-4 py-4 text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`}>{deals.organization}</td>
                                <td className={`px-4 py-4 text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>{deals.status}</td>
                                <td className={`px-4 py-4 text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>{deals.closed_date}</td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={3}
                                    className={`px-4 py-4 text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                                >
                                    No Deals Closing This Month Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
