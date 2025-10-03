export default function BreakRoomPage() {
  return (
    <div className="w-full h-screen">
      <iframe
        src="https://breakroom-vr.vercel.app"
        className="w-full h-full border-0"
        title="BreakRoom VR Experience"
        allow="camera; microphone; fullscreen"
      />
    </div>
  );
}
