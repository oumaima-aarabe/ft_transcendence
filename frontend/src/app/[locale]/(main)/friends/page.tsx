import React from "react";
import Index from "./components/Index";
import Friends from "./components/friends";

export default function page() {

	
	return (
		// const []
		<div className="w-full h-full flex items-center justify-center">
			<div className="w-full h-[95%] flex items-center justify-center rounded-2xl bg-black/30">
				<div className="flex justify-center items-center w-[98%] h-[97%] space-x-1 bg-black/45 rounded-xl">
					<div className=" w-[30%] h-[100%] rounded-tl-lg rounded-bl-lg bg-black/45">
						<Index />
					</div>
					<div className="w-[70%] h-[100%] rounded-tr-lg rounded-br-lg">
						<Friends/>
					</div>
				</div>
			</div>
		</div>
	);
}
