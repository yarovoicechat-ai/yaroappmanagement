"use client";
import { useCallback, useEffect, useState } from "react";
import { Radio, Users, Pin, RefreshCw, VideoOff } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

type Room = {
  _id: string;
  title: string;
  category: string;
  coverImage: string;
  host?: { name?: string; userId?: number };
  status: string;
  viewerCount: number;
  isPinned: boolean;
  createdAt: string;
  endedAt?: string;
  endReason?: string;
};
export default function LiveBroadcastManager({ hostId }: { hostId?: string } = {}) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("live");
  const load = useCallback(async () => {
    try {
      const res = await apiClient.get<Room[]>(`/api/live/admin/rooms${hostId ? "?hostId=" + encodeURIComponent(hostId) : ""}`);
      if (!res.success)
        throw new Error(res.message || "Unable to load live rooms");
      setRooms(res.data || []);
      setError("");
    } catch (e: any) {
      setError(e.message || "Unable to load live rooms");
    } finally {
      setLoading(false);
    }
  }, [hostId]);
  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load]);
  const action = async (room: Room, type: "end" | "pin") => {
    if (
      type === "end" &&
      !window.confirm(`End "${room.title}" for all viewers?`)
    )
      return;
    setBusy(room._id);
    try {
      await apiClient.post(
        `/api/live/admin/rooms/${room._id}/${type}`,
        type === "pin" ? { isPinned: !room.isPinned } : {}
      );
      await load();
    } catch (e: any) {
      setError(e.message || "Live action failed");
    } finally {
      setBusy("");
    }
  };
  const active = rooms.filter((room) => room.status === "live");
  const filtered = rooms.filter(
    (room) =>
      (status === "all" || room.status === status) &&
      `${room.title} ${room.host?.name || ""} ${room.host?.userId || ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Radio className="text-rose-500" />
            Video Live Rooms
          </h1>
          <p className="mt-2 text-slate-400">
            Monitor broadcasts, feature rooms on Home, and end live sessions.
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-xl border border-slate-600 px-4 py-3 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Live now", value: active.length, icon: Radio },
          {
            label: "Current viewers",
            value: active.reduce((sum, room) => sum + room.viewerCount, 0),
            icon: Users,
          },
          {
            label: "Pinned live rooms",
            value: active.filter((room) => room.isPinned).length,
            icon: Pin,
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-700 p-5"
          >
            <metric.icon size={22} className="text-rose-400" />
            <p className="text-3xl font-bold mt-3">{metric.value}</p>
            <p className="text-sm text-slate-400 mt-1">{metric.label}</p>
          </div>
        ))}
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-red-500/10 p-4 text-red-400">
          {error}
        </p>
      )}
      <div className="flex gap-3 flex-wrap">
        <input
          aria-label="Search live rooms"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search room, host or user ID"
          className="rounded-xl border border-slate-600 bg-transparent p-3 flex-1 min-w-56"
        />
        <select
          aria-label="Filter live status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-600 bg-slate-900 text-white p-3"
        >
          <option value="live">Live now</option>
          <option value="ended">Ended</option>
          <option value="all">All sessions</option>
        </select>
      </div>
      <div className="rounded-2xl border border-slate-700 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              {[
                "Room / Host",
                "Category",
                "Status",
                "Viewers",
                "Started",
                "Actions",
              ].map((label) => (
                <th key={label} className="p-4">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((room) => (
              <tr key={room._id} className="border-b border-slate-700/50">
                <td className="p-4">
                  <p className="font-bold">
                    {room.isPinned && "★ "}
                    {room.title}
                  </p>
                  <p className="text-slate-400 mt-1">
                    {room.host?.name || "Host"} · {room.host?.userId || ""}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {room.endReason || room._id}
                  </p>
                </td>
                <td className="p-4">{room.category}</td>
                <td className="p-4">
                  <span
                    className={
                      room.status === "live"
                        ? "text-rose-400 font-bold"
                        : "text-slate-400"
                    }
                  >
                    {room.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">{room.viewerCount}</td>
                <td className="p-4 whitespace-nowrap">
                  {new Date(room.createdAt).toLocaleString()}
                </td>
                <td className="p-4">
                  {room.status === "live" && (
                    <div className="flex gap-3">
                      <button
                        disabled={busy === room._id}
                        onClick={() => action(room, "pin")}
                        className="rounded-lg border border-slate-600 p-2 disabled:opacity-40 flex gap-2"
                      >
                        <Pin size={16} />
                        {room.isPinned ? "Unpin" : "Pin"}
                      </button>
                      <button
                        disabled={busy === room._id}
                        onClick={() => action(room, "end")}
                        className="rounded-lg bg-rose-600 p-2 text-white disabled:opacity-40 flex gap-2"
                      >
                        <VideoOff size={16} />
                        End live
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400">
                  {loading ? "Loading live rooms…" : "No live sessions found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        Updates every 15 seconds. Disconnected hosts expire after 90 seconds.
        Showing the latest 200 sessions.
      </p>
    </div>
  );
}
