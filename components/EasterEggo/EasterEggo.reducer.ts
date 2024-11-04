import { Action, ActionType, State } from './EasterEggo.types';

export const keySequence = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
  // 'Enter',
];

export const initialState: State = Object.freeze<State>({
  success: false,
  code: [...keySequence],
  image: undefined,
  buffer: undefined,
});

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.Reset:
      return {
        ...state,
        code: [...initialState.code],
        success: initialState.success,
      };

    case ActionType.KeyUp:
      if (action.payload === state.code[0]) {
        return {
          ...state,
          success: state.code.length === 1,
          code: state.code.slice(1),
        };
      }

      return {
        ...state,
        success: initialState.success,
        code: initialState.code,
      };

    case ActionType.SetBuffer:
      return {
        ...state,
        buffer: action.payload,
      };

    case ActionType.SetImage:
      return {
        ...state,
        image: action.payload,
      };

    default:
      return state;
  }
};
