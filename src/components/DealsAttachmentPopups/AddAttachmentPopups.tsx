import React from 'react';
import { IoClose } from 'react-icons/io5';
import { BiLink } from 'react-icons/bi';
import { LuMonitor } from 'react-icons/lu';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const UploadAttachmentPopup: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative">
        <button className="absolute top-4 right-4 text-gray-600 hover:text-black" onClick={onClose}>
          <IoClose size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4">Attach</h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-600 mb-6">Drag and drop files here or upload from</p>
          <div className="flex justify-center gap-6">
            <button className="flex flex-col items-center gap-2 text-sm text-gray-700 hover:text-black">
              <LuMonitor size={24} />
              <span>Device</span>
            </button>
            <button className="flex flex-col items-center gap-2 text-sm text-gray-700 hover:text-black">
              <BiLink size={24} />
              <span>Link</span>
            </button>
          </div>
        </div>

        <button
          className="mt-6 w-full bg-gray-300 text-gray-600 font-semibold py-2 rounded-lg cursor-not-allowed"
          disabled
        >
          Attach
        </button>
      </div>
    </div>
  );
};

export default UploadAttachmentPopup;
