import { useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";

// Riquadro videochiamata embedded (Daily.co prebuilt). Caricato solo lato client
// tramite import dinamico per evitare problemi in SSR.
export function VideoCall({
  roomUrl,
  token,
  onClose,
}: {
  roomUrl: string;
  token: string;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const frameRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let destroyed = false;

    async function start() {
      const el = containerRef.current;
      if (!el) return;
      const DailyIframe = (await import("@daily-co/daily-js")).default;
      if (destroyed) return;

      const frame = DailyIframe.createFrame(el, {
        showLeaveButton: true,
        iframeStyle: { width: "100%", height: "100%", border: "0", borderRadius: "16px" },
      });
      frameRef.current = frame;
      frame.on("left-meeting", () => onClose());
      frame.on("joined-meeting", () => setLoading(false));
      try {
        await frame.join({ url: roomUrl, token });
      } catch {
        setLoading(false);
      }
    }

    start();

    return () => {
      destroyed = true;
      try {
        frameRef.current?.destroy();
      } catch {
        /* noop */
      }
    };
  }, [roomUrl, token, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl h-[70vh] bg-background rounded-2xl overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-9 w-9 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
          aria-label="Chiudi videochiamata"
        >
          <X className="w-5 h-5" />
        </button>
        {loading && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm">Connessione alla videochiamata…</span>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
