import { Mail, Link, Phone, Pencil, ArrowUpRight, Plus } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export const InfoSidebar = () => {
      const { theme } = useTheme();
  
  return (
    <div className="max-w-md mx-auto rounded-lg border border-gray-200 shadow-sm p-5 bg-white space-y-4 text-sm font-sans">
      {/* Header */}
      <div>
        <h2 className="text-xs text-gray-500">CRM-DEAL-2025-00058</h2>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-xl font-semibold">PSD</h1>
          <div className="flex gap-2 text-gray-600">
            <Mail size={16} />
            <Link size={16} />
            <Phone size={16} />
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-gray-500 font-medium">Contacts</h3>
          <Plus size={16} className="text-gray-500" />
        </div>
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
          <p  className="text-sm font-medium">H</p>
          <p  className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Primary</p>
          <ArrowUpRight size={14} />
        </div>
      </div>

      {/* Organization Details */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-gray-500 font-medium">Organization Details</h3>
          <Pencil size={14} className="text-gray-500" />
        </div>

        <div className="space-y-1 text-sm text-gray-700">
          <div className="flex justify-between">
            <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Organization</p>
            <p  className="text-blue-600 flex items-center gap-1">
              PSD <ArrowUpRight size={12} />
            </p>
          </div>
          <div className="flex justify-between">
            <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Website</p>
            <p   className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Add Website...</p>
          </div>
          <div className="flex justify-between">
            <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Territory</p>
            <p   className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Add Territory...</p>
          </div>
          <div className="flex justify-between">
            <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Annual Revenue</p>
            <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>₹ 0.00</p>
          </div>
          <div className="flex justify-between">
            <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Close Date</p>
            <p   className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Add Close Date...</p>
          </div>
          <div className="flex justify-between">
            <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Probability</p>
            <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>0.000%</p>
          </div>
          <div className="flex justify-between">
            <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Next Step</p>
            <p   className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Add Next Step...</p>
          </div>
          <div className="flex justify-between">
            <p className={`block text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Deal Owner</p>
            <p  className="flex items-center gap-1">
              <p  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-300 text-xs text-gray-800 font-semibold">
                M
              </p>
              mx techies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


