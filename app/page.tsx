'use client';

import dynamic from 'next/dynamic';

const VoiceBot = dynamic(() => import('@/components/VoiceBot'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-orange-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-[#e40046] flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-rose-200 animate-pulse">
          S
        </div>
        <p className="text-sm font-semibold text-slate-700">Connecting to Snapdeal Virtual KAM...</p>
        <span className="text-xs text-slate-400">Loading voice modules and seller data</span>
      </div>
    </div>
  ),
});

export default function Home() {
  return <VoiceBot />;
}
