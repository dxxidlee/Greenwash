export default function HueScanPage() {
  return (
    <div className="w-full h-screen">
      <iframe
        src="https://huescan-camera.vercel.app"
        className="w-full h-full border-0"
        title="HueScan Camera Experience"
        allow="camera; microphone; fullscreen"
      />
    </div>
  );
}
