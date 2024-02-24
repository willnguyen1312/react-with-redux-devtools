import React from "react";
import { setupDevtools } from "./devtools";

type State = {
  value: number;
};

type Action = {
  type: "incrementOne";
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "incrementOne":
      return {
        ...state,
        value: state.value + 1,
      };

    default:
      throw new Error("Unknown action");
  }
}

type Subscriber = () => void;

const createStore = (arg: {
  reducer: (state: State, action: Action) => State;
  initialState: State;
}) => {
  let state = arg.initialState;
  const listeners: Set<Subscriber> = new Set();

  const getState = () => state;

  const setState = (newState: Partial<State>) => {
    state = { ...state, ...newState };
    listeners.forEach((listener) => listener());
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let devtoolsResult: any = undefined;

  const dispatch = (action: Action) => {
    state = arg.reducer(state, action);

    devtoolsResult?.dispatch(action);

    listeners.forEach((listener) => listener());
  };

  devtoolsResult = setupDevtools?.({
    getState,
    setState,
    dispatch,
  });

  return {
    dispatch,
    getState,
    setState,
    subscribe: (subscriber: Subscriber) => {
      listeners.add(subscriber);
      return () => {
        listeners.delete(subscriber);
      };
    },
  };
};

export default function App() {
  const storeRef = React.useRef<ReturnType<typeof createStore>>();

  if (!storeRef.current) {
    storeRef.current = createStore({
      reducer,
      initialState: {
        value: 0,
      },
    });
  }

  const state = React.useSyncExternalStore(
    storeRef.current.subscribe,
    storeRef.current.getState,
  );

  // debugger;
  // console.log(state.value);

  return (
    <div>
      <p>Value: {state.value}</p>

      <button
        onClick={() => {
          storeRef.current!.dispatch({ type: "incrementOne" });
        }}
      >
        Add one
      </button>
    </div>
  );
}
