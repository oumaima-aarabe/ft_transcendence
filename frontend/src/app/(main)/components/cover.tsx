const Cover = () => {
  return (
    <div className=" relative border border-yellow w-[100%] h-[20%] rounded-2xl bg-cover bg-center">
            <div className="absolute tp-[60%] border border-red-50 ">

            </div>
            <div></div>
    </div>
//     <div className="relative w-[80%] h-[60%] border border-yellow-300 bg-cover bg-center" style={{ backgroundImage: "url('/path/to/your/cover.svg')" }}>
    
//     <!-- Circular Avatar on top of the cover image -->
//     <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//       <img src="/path/to/your/avatar.jpg" alt="Avatar" className="w-32 h-32 rounded-full border-4 border-white" />
//     </div>
    
//     <!-- Content of the card -->
//     <div className="relative z-10 text-center mt-[40%]">
//       <h2 className="text-xl">Card Title</h2>
//       <p>This is a card content with an SVG background and an avatar.</p>
//     </div>
//   </div>
  );
}

export default Cover;