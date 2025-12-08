import React, { useEffect, useMemo, useRef, useState } from "react";
import { Megaphone, X, Send } from "lucide-react";
import {
  useGetActiveAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useListAnnouncementsQuery,
  useUpdateAnnouncementTimeWindowMutation,
  useDeleteAnnouncementMutation,
} from "../../features/announcements/announcementApi";
import { useGetOfficesQuery } from "../../features/offices/officeApi";
import { io } from "socket.io-client";

const TagMultiSelect = ({ options, value, onChange, placeholder = "Select..." }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedSet = new Set(value);
  const filtered = options.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full relative">
      <div
        className="border border-gray-200 rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center cursor-pointer bg-white hover:border-[#F42222]/40 transition focus-within:ring-2 focus-within:ring-[#F42222]/20"
        onClick={() => setOpen((p) => !p)}
      >
        {value.length === 0 && <span className="text-gray-400 text-sm">{placeholder}</span>}
        {options
          .filter((o) => selectedSet.has(o._id))
          .map((o) => (
            <span
              key={o._id}
              className="bg-[#F42222]/10 text-[#F42222] text-xs px-2 py-1 rounded-full flex items-center gap-1"
            >
              {o.name}
              <button
                type="button"
                className="hover:text-[#b71717]"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(value.filter((v) => v !== o._id));
                }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((p) => !p); 
          }}
          className="ml-auto text-xs text-gray-500 hover:text-[#F42222] px-2 py-1 rounded-md transition"
        >
          {open ? "Close" : "Select"}
        </button>

      </div>

      {open && (
        <div className="absolute z-20 mt-1 border border-gray-200 rounded-xl bg-white shadow-lg max-h-56 overflow-auto w-full animate-fadeIn">
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <input
              className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-[#F42222]/30"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ul className="divide-y divide-gray-200">
            {filtered.map((o) => {
              const selected = selectedSet.has(o._id);
              return (
                <li
                  key={o._id}
                  className={`px-3 py-2 hover:bg-[#F42222]/5 cursor-pointer flex items-center justify-between ${selected ? "bg-[#F42222]/5" : ""
                    }`}
                  onClick={() => {
                    if (selected) onChange(value.filter((v) => v !== o._id));
                    else onChange([...value, o._id]);
                  }}
                >
                  <span className="truncate pr-3 text-sm">{o.name}</span>
                  {selected && <span className="text-xxs text-[#F42222]">Selected</span>}
                </li>
              );
            })}
            {filtered.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">No results</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

const AdminChatBoard = () => {
  const chatContainerRef = useRef(null);
  const auth = useMemo(() => JSON.parse(sessionStorage.getItem("auth") || "{}"), []);
  const role = auth?.user?.role;
  const adminOfficeId = auth?.user?.officeId;

  const { data: activeData, refetch } = useGetActiveAnnouncementsQuery(undefined);
  const activeAnnouncements = activeData?.data || [];
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [updateWindow] = useUpdateAnnouncementTimeWindowMutation();
  const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementMutation();

  const showOfficeSelect = role === "SuperAdmin";
  const { data: officesData } = useGetOfficesQuery(showOfficeSelect ? { page: 1, limit: 1000 } : { page: 1, limit: 1 }, {
    skip: !showOfficeSelect,
  });
  const offices = officesData?.data || [];

  const nowIsoLocal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const plusHourIsoLocal = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedOfficeIds, setSelectedOfficeIds] = useState([]);
  const [startsAt, setStartsAt] = useState(nowIsoLocal());
  const [endsAt, setEndsAt] = useState(plusHourIsoLocal());
  const [audienceRoles, setAudienceRoles] = useState(["Admin", "Agent"]);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const { data: allListData, refetch: refetchList } = useListAnnouncementsQuery(undefined, {
    skip: role !== "SuperAdmin",
  });
  const allAnnouncements = allListData?.data || [];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeAnnouncements]);

  useEffect(() => {
    const token = auth?.token;
    if (!token) return;
    // Extract base URL by removing /api/ paths and trailing slashes
    const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/";
    const baseUrl = apiUrl.replace(/\/api\/?/g, "").replace(/\/$/, "");
    const socketUrl = baseUrl || "http://localhost:5000";
    const socket = io(socketUrl, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
    });

    const onNotification = (payload) => {
      if (payload?.type === "announcement:new") {
        refetch();
        if (role === "SuperAdmin") refetchList();
      }
    };
    socket.on("notification", onNotification);
    return () => {
      socket.off("notification", onNotification);
      socket.close();
    };
  }, [auth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", text: "" });

    try {
      const officeIds = showOfficeSelect ? selectedOfficeIds : [adminOfficeId].filter(Boolean);
      if (!message || !startsAt || !endsAt || officeIds.length === 0)
        return setFeedback({ type: "error", text: "Please fill all required fields." });

      if (new Date(startsAt) >= new Date(endsAt))
        return setFeedback({ type: "error", text: "Start time must be before end time." });

      await createAnnouncement({
        title: title || undefined,
        message,
        officeIds,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        audienceRoles,
      }).unwrap();

      setTitle("");
      setMessage("");
      setSelectedOfficeIds([]);
      setStartsAt(nowIsoLocal());
      setEndsAt(plusHourIsoLocal());
      setAudienceRoles(["Admin", "Agent"]);
      setFeedback({ type: "success", text: "Announcement created successfully!" });
      refetch();
      if (role === "SuperAdmin") refetchList();
    } catch (err) {
      setFeedback({ type: "error", text: err?.data?.message || "Failed to create announcement." });
    }
  };

  return (
    <div className="w-full mx-auto mb-10 bg-white/95 backdrop-blur shadow-2xl rounded-2xl border border-gray-200 flex flex-col h-[38rem]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#F42222] to-[#b71717] text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <span className="bg-white/20 rounded-full p-2">
            <Megaphone size={18} />
          </span>
          <h2 className="font-semibold tracking-wide">Collegium Updates</h2>
        </div>
      </div>

      {/* Create Form */}
      {(role === "SuperAdmin" || role === "Admin") && (
        <form
          onSubmit={handleSubmit}
          className="px-6 py-4 border-b border-gray-200 grid grid-cols-1 xl:grid-cols-3 gap-4 bg-gray-50/50 rounded-b-xl"
        >
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 w-full focus:ring-2 focus:ring-[#F42222]/30"
          />

          {showOfficeSelect ? (
            <div className="xl:col-span-2">
              <TagMultiSelect
                options={offices}
                value={selectedOfficeIds}
                onChange={setSelectedOfficeIds}
                placeholder="Select one or more offices"
              />
            </div>
          ) : (
            <input
              type="text"
              disabled
              value={auth?.user?.officeName || "Your office"}
              className="border border-gray-200 rounded-xl px-3 py-2.5 w-full xl:col-span-2 bg-gray-100"
            />
          )}

          <textarea
            placeholder="Announcement message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 w-full xl:col-span-3 min-h-24 focus:ring-2 focus:ring-[#F42222]/30"
          />

          <div className="flex flex-wrap gap-4 xl:col-span-2 items-end">
            <label className="text-sm text-gray-700 flex flex-col gap-1">
              <span>Start Time</span>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#F42222]/30"
              />
            </label>
            <label className="text-sm text-gray-700 flex flex-col gap-1">
              <span>End Time</span>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#F42222]/30"
              />
            </label>

            <div className="flex items-center gap-5">
              {["Admin", "Agent"].map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={audienceRoles.includes(r)}
                    onChange={(e) =>
                      setAudienceRoles((prev) =>
                        e.target.checked ? [...new Set([...prev, r])] : prev.filter((x) => x !== r)
                      )
                    }
                  />
                  {r}s
                </label>
              ))}
            </div>
          </div>

          <div className="xl:col-span-1 flex items-center justify-start xl:justify-end gap-3">
            <button
              type="submit"
              disabled={isCreating}
              className="bg-[#F42222] text-white px-5 py-2.5 rounded-xl disabled:opacity-60 shadow hover:shadow-md transition flex items-center gap-2"
            >
              <Send size={16} />
              {isCreating ? "Sending..." : "Send"}
            </button>
          </div>

          {feedback.text && (
            <div
              className={`xl:col-span-3 text-sm mt-1 ${feedback.type === "error" ? "text-red-600" : "text-green-600"
                }`}
            >
              {feedback.text}
            </div>
          )}
        </form>
      )}

      {/* Announcements Display */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-5 space-y-3 bg-white rounded-b-2xl border-t border-gray-200"
      >
        {activeAnnouncements.length > 0 ? (
          activeAnnouncements.map((a) => (
            <div
              key={a._id}
              className="flex flex-col bg-blue-50 border border-gray-200 rounded-xl p-3 shadow-sm"
            >
              {a.title && <p className="text-blue-900 font-semibold">{a.title}</p>}
              <p className="text-blue-900 whitespace-pre-wrap">{a.message}</p>
              <span className="text-[10px] text-gray-500 self-end mt-1">
                {new Date(a.startsAt).toLocaleString()} - {new Date(a.endsAt).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 text-center mt-5">No active announcements.</div>
        )}
      </div>
    </div>
  );
};

export default AdminChatBoard;
