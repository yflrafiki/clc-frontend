import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';
import { checkInUrl } from './checkInUrl';

// Full-screen QR poster: print it for the wall, or open it on a phone/tablet at the entrance
export default function CheckInPoster() {
  const url = checkInUrl();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8 print:py-0">
      <div className="w-full max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#b86442]">LifeWay Church</p>
        <h1 className="church-title mt-2 text-6xl text-[#1f2d3d]">Scan to check in</h1>
        <p className="mt-3 text-base text-[#5d554d]">Open your phone camera and point it at the code.</p>

        <div className="mx-auto mt-8 w-full max-w-[22rem] rounded-[28px] border-2 border-[#1f2d3d] bg-white p-2">
          <QRCodeSVG value={url} size={512} level="M" marginSize={4} bgColor="#ffffff" fgColor="#000000" className="h-auto w-full" />
        </div>

        <ol className="mx-auto mt-8 max-w-sm space-y-2 text-left text-base text-[#1f2d3d]">
          <li><strong>1.</strong> Scan the code</li>
          <li><strong>2.</strong> Enter your member ID</li>
          <li><strong>3.</strong> Tap <strong>Mark me present</strong></li>
        </ol>
        <p className="mt-4 text-sm text-[#6d5d55]">Visiting? Choose <strong>I'm visiting</strong> and enter your name. You're welcome here.</p>
        <p className="mt-6 break-all text-xs text-[#7d6a5d]">{url}</p>

        <button
          onClick={() => window.print()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1f2d3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a3d4f] print:hidden"
        >
          <Printer className="h-4 w-4" /> Print poster
        </button>
      </div>
    </div>
  );
}
