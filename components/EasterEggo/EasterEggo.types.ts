export enum ActionType {
  KeyUp = 'KEY_UP',
  Reset = 'RESET',
  SetBuffer = 'SET_BUFFER',
  SetImage = 'SET_IMAGE',
}

export type Action =
  | {
      type: ActionType.KeyUp;
      payload: string;
    }
  | {
      type: ActionType.Reset;
    }
  | {
      type: ActionType.SetBuffer;
      payload: AudioBuffer;
    }
  | {
      type: ActionType.SetImage;
      payload: string;
    };

export type State = {
  success: boolean;
  code: string[];
  buffer?: AudioBuffer;
  image?: string;
};

export interface Props {
  audioPath: string;
  imagePath: string;
}
