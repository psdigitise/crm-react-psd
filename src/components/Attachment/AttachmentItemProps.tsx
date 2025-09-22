import { Paperclip } from "lucide-react";
import { showToast } from "../../utils/toast";

interface AttachmentItemProps {
  file: {
    name: string;
    url: string;
  };
  theme: 'light' | 'dark';
}

export const AttachmentItem = ({ file, theme }: AttachmentItemProps) => {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // First try to download directly
      window.open(file.url, '_blank');
      
      // If that fails, try fetching and downloading
      const response = await fetch(file.url, {
        headers: {
          'Authorization': 'token 1b670b800ace83b:889d6aca3f96abd'
        }
      });
      
      if (!response.ok) throw new Error('Failed to download');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Failed to download file', { type: 'error' });
    }
  };

  return (
    <div 
      onClick={handleDownload}
      className={`text-sm px-2 py-1 rounded flex items-center gap-2 cursor-pointer ${
        theme === 'dark' 
          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      }`}
      title={`Download ${file.name}`}
    >
      <Paperclip className="w-3 h-3" />
      <span className="truncate max-w-xs">{file.name}</span>
    </div>
  );
};