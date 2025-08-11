import React, { useState } from 'react';
import { IoCloseOutline, IoDocumentTextOutline } from 'react-icons/io5';
import { SlCallIn, SlCallOut } from 'react-icons/sl';
import { FaRegCheckCircle, FaRegClock } from 'react-icons/fa';
import { LuSquareUserRound, LuTimer } from 'react-icons/lu';
import { BsCheckCircle } from 'react-icons/bs';
import { HiOutlineArrowRight, HiOutlineLightningBolt } from 'react-icons/hi';
import { GoArrowUpRight } from 'react-icons/go';
import { PiDotsThreeOutlineFill } from 'react-icons/pi';


interface CallDetailsPopupProps {
    onClose: () => void;
    onAddTask?: () => void;  // Add this
    theme?: 'light' | 'dark';
    call: {
        type: string;
        caller: string;
        receiver: string;
        date: string;
        duration: string;
        status: string;
    };
}



export const CallDetailsPopup = ({ onClose, theme = 'light', call, onAddTask }: CallDetailsPopupProps) => {

    const [openMenu, setOpenMenu] = useState(false);

    const toggleMenu = () => {
        setOpenMenu((prev) => !prev);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-lg ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'}`}>

                {/* Close */}
                <div className="absolute top-0 right-0 flex items-center gap-2 p-4">
                    <button
                        type="button"
                        className={`${theme === "dark" ? "text-white" : "text-gray-500"} hover:text-gray-700`}
                        onClick={toggleMenu}
                    >
                        <PiDotsThreeOutlineFill size={24} />
                    </button>
                    <button
                        type="button"
                        className={`${theme === "dark" ? "text-white" : "text-gray-500"} hover:text-gray-700`}
                        onClick={onClose}
                    >
                        <IoCloseOutline size={24} />
                    </button>
                </div>

                {/* Dropdown */}
                {openMenu && (
                    <div
                        className="absolute top-12 right-4 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left">
                            <IoDocumentTextOutline className="w-4 h-4 text-white" />
                            <span className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>Add Note</span>
                        </button>
                        <button
                            onClick={() => {
                                setOpenMenu(false);
                                onAddTask(); // This will trigger the parent's function
                            }}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left">
                            <FaRegCheckCircle className="w-4 h-4 text-white" />
                            <span className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>Add Task</span>
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="p-6">
                    <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Call Details
                    </h3>

                    {/* Details */}
                    <div className="space-y-4">
                        {/* Call Type */}
                        <div className="flex items-center gap-2">
                            {call.type === 'Inbound' ? (
                                <SlCallIn className="text-blue-500" />
                            ) : (
                                <SlCallOut className="text-green-500" />
                            )}
                            <span className="text-white">
                                {call.type === 'Inbound' ? 'Incoming Call' : 'Outgoing Call'}
                            </span>
                        </div>



                        {/* Caller */}
                        <div className="flex items-center gap-2">
                            {/* Caller icon */}
                            <LuSquareUserRound className="text-white w-5 h-5" />

                            {/* Caller initial circle */}
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm">
                                {call.caller?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <span className="text-white">{call.caller || "Unknown"}</span>

                            {/* Arrow */}
                            <HiOutlineArrowRight className="text-white w-4 h-4" />

                            {/* Receiver initial circle */}
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm">
                                {call.receiver?.charAt(0).toUpperCase() || "?"}
                            </div>

                            {/* Receiver name */}
                            <span className="text-white">{call.receiver || "Unknown"}</span>
                        </div>

                        {/* Deal */}
                        <div className="flex items-center gap-1 text-white">
                            <HiOutlineLightningBolt />
                            Deal<GoArrowUpRight />
                        </div>


                        {/* Date */}
                        <div className="flex items-center gap-2">
                            <FaRegClock className='text-white' />
                            <span className='text-white'>{call.date}</span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2">
                            <LuTimer className='text-white' />
                            <span className='text-white'>{call.duration}</span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                            <BsCheckCircle className='text-white' />
                            <span className='text-white'>{call.status}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
