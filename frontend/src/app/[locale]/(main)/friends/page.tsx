'use client'

import React, { useState } from "react";
import Index from "./components/Index";
import Friends from "./components/friends";
import Invitations from "./components/reciev-invit";
import Blocked from "./components/blocked";
import Sent from "./components/sent-invit";

interface Friend {
	username: string;
	first_name: string;
	last_name: string;
	avatar?: string;
}

interface FriendsData {
	friends: Friend[];
	friendsBlocked: Friend[];
	friendRequests: Friend[];
	requestsReceived: Friend[];
}

export interface FriendsProps {
	data: Friend[];
}

export default function Page() {

	const [friends, setFriends] = useState<string>("friends");

	return (
		<div className="w-full h-full flex items-center justify-center">
			<div className="w-full h-[95%] flex items-center justify-center rounded-2xl bg-black/30">
				<div className="flex justify-center items-center w-[98%] h-[97%] space-x-1 bg-black/45 rounded-xl">
					<div className="w-[30%] h-[100%] rounded-tl-lg rounded-bl-lg bg-black/45">
						<Index function={setFriends}/>
					</div>
					<div className="w-[70%] h-[100%] rounded-tr-lg rounded-br-lg">
						{friends === "friends" ? <Friends/> : null}
						{friends === "sent" ? <Sent/> : null}
						{friends === "received" ? <Invitations/> : null}
						{friends === "blocked" ? <Blocked/> : null}
					</div>
				</div>
			</div>
		</div>
	);
}
