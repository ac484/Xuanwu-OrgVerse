export interface Comment {
  id: string;
  text: string;
  author: {
    name: string;
    avatarUrl: string;
  };
}

export interface Post {
  id: string;
  imageUrl: string;
  imageHint: string;
  width: number;
  height: number;
  caption: string;
  likes: number;
  comments: Comment[];
  author: {
    name: string;
    avatarUrl: string;
  };
}
