export const LoadingModal = () => {
  return (
    <div
      className="flex overflow-hidden fixed top-0 right-0 bottom-0 left-0 z-50 flex-col justify-center items-center w-full h-screen bg-gray-900 opacity-80"
      style={{ margin: 0 }}
    >
      <img alt="Pixel Logo" className="mb-5 w-[50px] h-[50px] animate-spin-slow" src="/pixel.png" />
      <p className="w-1/3 font-bold text-center text-white">Uploading assets and metadata. This may take a while...</p>
    </div>
  )
}
