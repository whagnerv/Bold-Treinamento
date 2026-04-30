export interface VideoItem {
  id: string;
  name: string;
  link: string;
  createdAt: number;
  image?: string;
}

export interface Feedback {
  id: string;
  user: string;
  text: string;
  createdAt: number;
}

