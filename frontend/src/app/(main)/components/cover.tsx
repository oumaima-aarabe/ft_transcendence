const Cover = () => {
  return (
    <div
      className="border border-yellow w-full h-[20%] rounded-2xl bg-cover bg-center flex justify-center items-center"
      style={{ backgroundImage: "url('/cover.svg')" }}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="rounded-full h-36 w-36 flex items-center justify-center mb-3 border-8 border-white">
          <div className="div">
            <img
              src="/logo.svg"
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-white text-center mb-3">
          <h2 className="text-xl font-semibold">kawtatr aboussi</h2>
        </div>

        <div className="mb-3">
          level will be here
        </div>
      </div>
    </div>
  );
}

export default Cover;