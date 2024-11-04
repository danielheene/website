export interface TimelineEvent {
  start: Date | string;
  end?: Date | string;
  title: string;
  description?: string[];
  icon: string;
  link?: string;
  tags?: string[];
}

export type Timeline = Array<TimelineEvent>;
