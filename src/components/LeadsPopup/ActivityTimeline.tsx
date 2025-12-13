import React, { useCallback, useEffect, useState } from "react";
import {
  SlCallIn,
  SlCallOut,
} from "react-icons/sl";
import { BsThreeDots } from "react-icons/bs";
import { Trash2 } from "react-icons/fi";
import { FaRegComment } from "react-icons/fa";
import { IoIosCalendar, IoDocument } from "react-icons/io5";
import { LuReply, LuReplyAll, LuCalendar } from "react-icons/lu";
import { PiDotsThreeOutlineBold } from "react-icons/pi";
import { SiTicktick } from "react-icons/si";
import { FiChevronDown } from "react-icons/fi";
import { Loader2, Mail } from "lucide-react";
import { RiShining2Line } from "react-icons/ri";
import { getAuthToken } from "../../api/apiUrl";


type Activity = {
  id: string;
  type: string;
  timestamp: string;
  [key: string]: any;
};

type Lead = {
  name: string;
};

const API_BASE_URL = "https://api.erpnext.ai/api";
const AUTH_TOKEN = getAuthToken();
const token = getAuthToken();

const ActivityTimeline: React.FC<{ deal: Lead; theme?: "light" | "dark" }> = ({
  deal,
  theme = "light",
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondaryColor = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  // Utility placeholders
  const getRelativeTime = (ts: string) => new Date(ts).toLocaleString();
  const formatDate = (ts: string) => new Date(ts).toDateString();
  const formatDateRelative = (ts: string) => new Date(ts).toLocaleString();

  // ✅ Fetch All Activities
  const fetchAllActivities = useCallback(async () => {
    setActivityLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/method/crm.api.activities.get_activities/`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: deal.name }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching activities: ${response.statusText}`);
      }

      const result = await response.json();
      const message = result.message;

      // Extract response data
      const timelineItems = message[0] || [];
      const rawCallLogs = message[1] || [];
      const rawNotes = message[2] || [];
      const rawTasks = message[3] || [];

      setCallLogs(rawCallLogs);
      setNotes(rawNotes);
      setTasks(rawTasks);
      setComments(timelineItems.filter((i: any) => i.timeline_type === "comment"));
      setEmails(timelineItems.filter((i: any) => i.timeline_type === "email"));

      // Map activities
      const callActivities = rawCallLogs.map((c: any) => ({
        id: c.name,
        type: "call",
        timestamp: c.creation,
      }));

      const noteActivities = rawNotes.map((n: any) => ({
        id: n.name,
        type: "note",
        timestamp: n.creation,
      }));

      const taskActivities = rawTasks.map((t: any) => ({
        id: t.name,
        type: "task",
        timestamp: t.creation,
      }));

      const timelineActivities = timelineItems.map((item: any, idx: number) => ({
        id: `timeline-${idx}`,
        type: item.timeline_type?.toLowerCase(),
        timestamp: item.creation,
        ...item,
      }));

      // Merge + sort
      const allActivities = [
        ...callActivities,
        ...noteActivities,
        ...taskActivities,
        ...timelineActivities,
      ].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setActivityLoading(false);
    }
  }, [deal.name]);

  useEffect(() => {
    fetchAllActivities();
  }, [fetchAllActivities]);

  return (
    <div
      className={`relative rounded-lg shadow-sm border p-6 pb-24 ${theme === "dark"
          ? `bg-gray-900 border-gray-700`
          : "bg-white border-gray-200"
        }`}
    >
      <h3
        className={`text-lg font-semibold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"
          }`}
      >
        Activity
      </h3>

      {activityLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <RiShining2Line
            className={`w-12 h-12 ${theme === "dark" ? "text-gray-500" : "text-gray-400"
              } mx-auto mb-4`}
          />
          <p
            className={`${theme === "dark" ? "text-white" : "text-gray-500"}`}
          >
            No activities yet
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {activities.map((activity) => {
            // calls
            if (activity.type === "call") {
              const callData = callLogs.find((c) => c.name === activity.id);
              if (!callData) return null;
              return (
                <div key={activity.id} className="border p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {callData.type === "Inbound" ? (
                        <SlCallIn className="text-blue-600" />
                      ) : (
                        <SlCallOut className="text-green-600" />
                      )}
                      <span className={textColor}>
                        {callData._caller?.label || callData.from} →{" "}
                        {callData._receiver?.label || callData.to}
                      </span>
                    </div>
                    <span className={`text-xs ${textSecondaryColor}`}>
                      {getRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className={textSecondaryColor}>
                    Duration: {callData.duration} | Status: {callData.status}
                  </p>
                </div>
              );
            }

            // notes
            if (activity.type === "note") {
              const noteData = notes.find((n) => n.name === activity.id);
              if (!noteData) return null;
              return (
                <div key={activity.id} className="border p-4 rounded-lg">
                  <h4 className={`font-semibold ${textColor}`}>
                    {noteData.title}
                  </h4>
                  <p className={`${textSecondaryColor} mt-2`}>
                    {noteData.content}
                  </p>
                </div>
              );
            }

            // tasks
            if (activity.type === "task") {
              const taskData = tasks.find((t) => t.name === activity.id);
              if (!taskData) return null;
              return (
                <div key={activity.id} className="border p-4 rounded-lg">
                  <h4 className={`font-semibold ${textColor}`}>
                    {taskData.title}
                  </h4>
                  <p className={textSecondaryColor}>
                    Status: {taskData.status} | Priority: {taskData.priority}
                  </p>
                </div>
              );
            }

            // comments
            if (activity.type === "comment") {
              const commentData = comments.find((c) => c.name === activity.id);
              if (!commentData) return null;
              return (
                <div key={activity.id} className="border p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaRegComment />
                    <span className={textColor}>{commentData.owner}</span>
                  </div>
                  <p className={textSecondaryColor}>
                    {commentData.content.replace(/<[^>]+>/g, "")}
                  </p>
                  {commentData.attachments?.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {commentData.attachments.map((a: any, idx: number) => {
                        const url = a.file_url.startsWith("http")
                          ? a.file_url
                          : `https://api.erpnext.ai${a.file_url}`;
                        return (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm border px-2 py-1 rounded"
                          >
                            <IoDocument className="w-3 h-3" /> {a.file_name}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // emails
            if (activity.type === "email") {
              const emailData = emails.find((e) => e.id === activity.id);
              if (!emailData) return null;
              return (
                <div key={activity.id} className="border p-4 rounded-lg">
                  <h4 className={`font-semibold ${textColor}`}>
                    {emailData.subject}
                  </h4>
                  <p className={textSecondaryColor}>{emailData.content}</p>
                  {emailData.attachments?.map((a: any, idx: number) => {
                    const url = a.file_url.startsWith("http")
                      ? a.file_url
                      : `https://api.erpnext.ai${a.file_url}`;
                    return (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm border px-2 py-1 rounded mt-2 inline-block"
                      >
                        <IoDocument className="w-3 h-3" /> {a.file_name}
                      </a>
                    );
                  })}
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
