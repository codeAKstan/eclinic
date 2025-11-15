"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ConsultationRoomInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [roomInput, setRoomInput] = useState("");
  const apiRef = useRef(null);

  const room = useMemo(() => {
    const r = searchParams.get("room");
    return (r && r.trim()) ? r.trim() : "eclinic-demo";
  }, [searchParams]);

  const role = useMemo(() => {
    const r = searchParams.get("role");
    return (r && r.trim()) ? r.trim() : "user";
  }, [searchParams]);

  useEffect(() => {
    setRoomInput(room);
  }, [room]);

  function joinRoom() {
    const r = (roomInput || "").trim();
    if (!r) return;
    router.replace(`/student/consultation?room=${encodeURIComponent(r)}&role=${encodeURIComponent(role)}`);
  }

  // Initialize Jitsi via External API for more reliable embedding
  useEffect(() => {
    const container = document.getElementById("jitsi-container");
    if (!container) return;

    function init() {
      try {
        // Dispose previous instance if any
        if (apiRef.current) {
          try { apiRef.current.dispose(); } catch {}
          apiRef.current = null;
        }
        const domain = "meet.jit.si";
        const options = {
          roomName: room,
          parentNode: container,
          configOverwrite: {
            prejoinPageEnabled: true,
            enableLobby: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            LOBBY_BUTTON_ENABLED: false,
          },
          userInfo: {
            displayName: role === "doctor" ? "Doctor" : "Patient",
          },
        };
        // @ts-ignore
        const api = new window.JitsiMeetExternalAPI(domain, options);
        apiRef.current = api;
      } catch (e) {
        console.error("Failed to init Jitsi", e);
      }
    }

    if (typeof window !== "undefined" && !window.JitsiMeetExternalAPI) {
      const s = document.createElement("script");
      s.src = "https://meet.jit.si/external_api.js";
      s.async = true;
      s.onload = init;
      document.body.appendChild(s);
    } else {
      init();
    }

    return () => {
      if (apiRef.current) {
        try { apiRef.current.dispose(); } catch {}
        apiRef.current = null;
      }
    };
  }, [room, role]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Video Consultation</h1>
            <p className="mt-1 text-sm text-zinc-600">Join the meeting room with your doctor</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="Enter room code"
              className="w-48 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black"
            />
            <button
              onClick={joinRoom}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Join
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-3 text-sm text-zinc-600">Room: <span className="font-medium text-zinc-900">{room}</span></div>
          <div id="jitsi-container" className="h-[72vh] w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ConsultationRoomPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Loading consultation room…</div>}>
      <ConsultationRoomInner />
    </Suspense>
  );
}