'use client';

import React, { createContext, useReducer, useContext, useEffect } from "react";
import type { User } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

const getUser = async () => {
	const response = await fetcher.get<User>('/api/users/me')
	return response.data
}

type State = {
	user: User | undefined;
};

type Action =
	| {
		type: "SET_USER";
		payload: User | undefined;
	}

type Dispatch = (action: Action) => void;
const initialState: State = {
	user: undefined,
};

const StateContext = createContext<
	{ state: State; dispatch: Dispatch } | undefined
>(undefined);

const stateReducer = (state: State, action: Action) => {
	switch (action.type) {
		case "SET_USER":
			return { ...state, user: action.payload };
		default:
			return { ...state };
	}
};

type StateProviderProps = { children: React.ReactNode };

const StateProvider = ({ children }: StateProviderProps) => {
	const [state, dispatch] = useReducer(stateReducer, initialState);
	const value = { state, dispatch };
	const { data } = useQuery({
		queryKey: ['me'],
		queryFn: getUser,
	})

	useEffect(() => {
		if (!data)
			dispatch({ type: "SET_USER", payload: undefined });
		else
			dispatch({ type: "SET_USER", payload: data });
	}, [data])

	return (
		<StateContext.Provider value={value}>{children}</StateContext.Provider>
	);
};

const useStateContext = () => {
	const context = useContext(StateContext);

	if (context) return context;
};

export { StateProvider, useStateContext };