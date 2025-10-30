import React, { useEffect, useMemo, useRef, useState } from "react";
import { Megaphone, X, Trash2, Save } from "lucide-react";
import { useGetActiveAnnouncementsQuery, useCreateAnnouncementMutation, useListAnnouncementsQuery, useUpdateAnnouncementTimeWindowMutation, useDeleteAnnouncementMutation } from "../../features/announcements/announcementApi";
import { useGetOfficesQuery } from "../../features/offices/officeApi";
import { io } from "socket.io-client";

const TagMultiSelect = ({ options, value, onChange, placeholder = "Select..." }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedSet = new Set(value);
  const filtered = options.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full relative">
      <div className="border rounded-lg px-2 py-1.5 flex flex-wrap gap-1.5 items-center cursor-text bg-white focus-within:ring-2 focus-within:ring-[#F42222]/30">
        {value.length === 0 && <span className="text-gray-400 text-sm">{placeholder}</span>}
        {options.filter((o) => selectedSet.has(o._id)).map((o) => (
          <span key={o._id} className="bg-[#F42222]/10 text-[#F42222] text-xs px-2 py-1 rounded-full flex items-center gap-1">
            {o.name}
            <button
              type="button"
              className="hover:text-[#b71717]"
              onClick={(e) => {
                e.stopPropagation();
                onChange(value.filter((v) => v !== o._id));
              }}
              aria-label={`Remove ${o.name}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <button type="button" onClick={() => setOpen((p) => !p)} className="ml-auto text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md">
          {open ? "Close" : "Select"}
        </button>
      </div>
      {open && (
        <div className="absolute z-10 mt-1 border rounded-lg bg-white shadow-xl max-h-56 overflow-auto w-full">
          <div className="p-2 border-b bg-gray-50">
            <input
              className="w-full border rounded-md px-2 py-1.5 text-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ul className="divide-y">
            {filtered.map((o) => {
              const selected = selectedSet.has(o._id);
              return (
                <li
                  key={o._id}
                  className={`px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${selected ? "bg-gray-50" : ""}`}
                  onClick={() => {
                    if (selected) onChange(value.filter((v) => v !== o._id));
                    else onChange([...value, o._id]);
                  }}
                >
                  <span className="truncate pr-3">{o.name}</span>
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
  const [updateWindow, { isLoading: isUpdating }] = useUpdateAnnouncementTimeWindowMutation();
  const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementMutation();

  const showOfficeSelect = role === "SuperAdmin";
  const { data: officesData } = useGetOfficesQuery(showOfficeSelect ? { page: 1, limit: 1000 } : { page: 1, limit: 1 }, { skip: !showOfficeSelect });
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Management (SuperAdmin)
  const { data: allListData, refetch: refetchList } = useListAnnouncementsQuery(undefined, { skip: role !== "SuperAdmin" });
  const allAnnouncements = allListData?.data || [];
  const [editTimes, setEditTimes] = useState({}); // {id: {start, end}}

  const toLocalInputValue = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeAnnouncements]);

  // Socket listener for real-time announcements
  useEffect(() => {
    const token = auth?.token;
    if (!token) return;
    const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000", {
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
    setError("");
    setSuccess("");

    try {
      const officeIds = showOfficeSelect ? selectedOfficeIds : [adminOfficeId].filter(Boolean);
      if (!message || !startsAt || !endsAt || officeIds.length === 0) {
        setError("Please fill message, time window, and office selection.");
        return;
      }
      if (new Date(startsAt) >= new Date(endsAt)) {
        setError("Start time must be before end time.");
        return;
      }

      // Normalize to ISO UTC strings to avoid timezone ambiguity
      const startsIso = new Date(startsAt).toISOString();
      const endsIso = new Date(endsAt).toISOString();

      await createAnnouncement({
        title: title || undefined,
        message,
        officeIds,
        startsAt: startsIso,
        endsAt: endsIso,
        audienceRoles,
      }).unwrap();

      setTitle("");
      setMessage("");
      setSelectedOfficeIds([]);
      setStartsAt(nowIsoLocal());
      setEndsAt(plusHourIsoLocal());
      setAudienceRoles(["Admin", "Agent"]);
      setSuccess("Announcement created and sent.");
      refetch();
      if (role === "SuperAdmin") refetchList();
    } catch (err) {
      setError(err?.data?.message || "Failed to create announcement.");
    }
  };

  const handleUpdateWindow = async (id, startValue, endValue) => {
    const payload = editTimes[id] || {};
    try {
      const body = { ...payload };
      const startToUse = body.start || startValue;
      const endToUse = body.end || endValue;
      if (startToUse) body.startsAt = new Date(startToUse).toISOString();
      if (endToUse) body.endsAt = new Date(endToUse).toISOString();
      delete body.start;
      delete body.end;
      await updateWindow({ id, ...body }).unwrap();
      setEditTimes((prev) => ({ ...prev, [id]: undefined }));
      refetch();
      if (role === "SuperAdmin") refetchList();
    } catch (err) {
      // no-op
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAnnouncement(id).unwrap();
      refetch();
      refetchList();
    } catch (err) {
      // no-op
    }
  };

  return (
    <div className="w-full mx-auto bg-white shadow-xl rounded-2xl border border-gray-100 flex flex-col h-[38rem] mb-10">
      <div className="flex items-center justify-between gap-2 px-5 py-4 bg-gradient-to-r from-[#F42222] to-[#b71717] text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <span className="bg-white/20 rounded-full p-2"><Megaphone size={18} /></span>
          <h2 className="font-semibold tracking-wide">Collegium Updates</h2>
        </div>
      </div>

      {(role === "SuperAdmin" || role === "Admin") && (
        <form onSubmit={handleSubmit} className="px-5 py-4 border-b border-gray-100 grid grid-cols-1 xl:grid-cols-3 gap-4 bg-gray-50/50">
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded-lg px-3 py-2.5 w-full xl:col-span-1 focus:ring-2 focus:ring-[#F42222]/30"
          />

          {showOfficeSelect ? (
            <div className="xl:col-span-2">
              <TagMultiSelect
                options={offices}
                value={selectedOfficeIds}
                onChange={setSelectedOfficeIds}
                placeholder="Select one or more offices"
              />
              <div className="mt-1 text-xs text-gray-500">Choose multiple offices to broadcast.</div>
            </div>
          ) : (
            <input type="text" disabled value={auth?.user?.officeName || "Your office"} className="border rounded-lg px-3 py-2.5 w-full xl:col-span-2 bg-gray-100" />
          )}

          <textarea
            placeholder="Announcement message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border rounded-lg px-3 py-2.5 w-full xl:col-span-3 min-h-24 focus:ring-2 focus:ring-[#F42222]/30"
          />

          <div className="flex flex-wrap gap-4 xl:col-span-2 items-end">
            <label className="text-sm text-gray-700 flex flex-col gap-1">
              <span>Start</span>
              <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#F42222]/30" />
            </label>
            <label className="text-sm text-gray-700 flex flex-col gap-1">
              <span>End</span>
              <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#F42222]/30" />
            </label>
            <div className="flex items-center gap-5">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={audienceRoles.includes("Admin")} onChange={(e) => setAudienceRoles((prev) => e.target.checked ? Array.from(new Set([...prev, "Admin"])) : prev.filter(r => r !== "Admin"))} />
                Admins
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={audienceRoles.includes("Agent")} onChange={(e) => setAudienceRoles((prev) => e.target.checked ? Array.from(new Set([...prev, "Agent"])) : prev.filter(r => r !== "Agent"))} />
                Agents
              </label>
            </div>
          </div>

          <div className="xl:col-span-1 flex items-center gap-3">
            <button type="submit" disabled={isCreating} className="bg-[#F42222] text-white px-4 py-2.5 rounded-lg disabled:opacity-60 shadow hover:shadow-md transition w-full xl:w-auto">{isCreating ? "Sending..." : "Send Announcement"}</button>
            <div className="text-xs text-gray-500">Times are in your local timezone.</div>
      </div>

          <div className="xl:col-span-3 flex items-center gap-3">
            {error && <span className="text-red-600 text-sm">{error}</span>}
            {success && <span className="text-green-600 text-sm">{success}</span>}
          </div>
        </form>
      )}

      {role === "SuperAdmin" && (
        <div className="px-5 py-4 border-b border-gray-100 bg-white">
          <h3 className="font-semibold mb-3">Current Announcements</h3>
          <div className="space-y-3 max-h-56 overflow-auto">
            {allAnnouncements.map((a) => {
              const current = editTimes[a._id] || { start: toLocalInputValue(a.startsAt), end: toLocalInputValue(a.endsAt) };
              return (
                <div key={a._id} className="border rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{a.title || "Untitled"}</div>
                      <div className="text-xs text-gray-600 truncate max-w-xl">{a.message}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 flex items-center gap-1">
                        <span>Start</span>
                        <input
                          type="datetime-local"
                          value={current.start}
                          onChange={(e) => setEditTimes((prev) => ({ ...prev, [a._id]: { ...(prev[a._id] || {}), start: e.target.value } }))}
                          className="border rounded px-2 py-1 text-xs"
                        />
                      </label>
                      <label className="text-xs text-gray-600 flex items-center gap-1">
                        <span>End</span>
                        <input
                          type="datetime-local"
                          value={current.end}
                          onChange={(e) => setEditTimes((prev) => ({ ...prev, [a._id]: { ...(prev[a._id] || {}), end: e.target.value } }))}
                          className="border rounded px-2 py-1 text-xs"
                        />
                      </label>
                      <button onClick={() => handleUpdateWindow(a._id, current.start, current.end)} className="inline-flex items-center gap-1 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded hover:bg-indigo-700">
                        <Save size={14} /> Update
                      </button>
                      <button onClick={() => handleDelete(a._id)} className="inline-flex items-center gap-1 bg-red-600 text-white text-xs px-3 py-1.5 rounded hover:bg-red-700" disabled={isDeleting}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {allAnnouncements.length === 0 && <div className="text-sm text-gray-500">No announcements.</div>}
          </div>
        </div>
      )}

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-3 bg-white">
        {activeAnnouncements.map((a) => (
          <div key={a._id} className="flex flex-col items-start bg-blue-50 border border-blue-200 rounded-xl p-3 w-fit max-w-[80%]">
            {a.title && <p className="text-blue-900 font-semibold">{a.title}</p>}
            <p className="text-blue-900 whitespace-pre-wrap">{a.message}</p>
            <span className="text-xxs text-gray-500 self-end">{new Date(a.startsAt).toLocaleString()} - {new Date(a.endsAt).toLocaleString()}</span>
          </div>
        ))}
        {activeAnnouncements.length === 0 && (
          <div className="text-sm text-gray-500">No active announcements.</div>
        )}
      </div>
    </div>
  );
};

export default AdminChatBoard;
