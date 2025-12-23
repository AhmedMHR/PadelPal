export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  category: 'Rules' | 'Technique' | 'Highlights';
  youtubeId: string;
}

export const VIDEO_LIBRARY: Video[] = [
  {
    id: '1',
    title: 'Padel Rules in 3 Minutes',
    thumbnail: 'https://img.youtube.com/vi/4id5X7W6x9w/maxresdefault.jpg',
    category: 'Rules',
    youtubeId: '4id5X7W6x9w' // Real YouTube ID
  },
  {
    id: '2',
    title: 'Master the Bandeja Shot',
    thumbnail: 'https://img.youtube.com/vi/bYw9u8_yP5c/maxresdefault.jpg',
    category: 'Technique',
    youtubeId: 'bYw9u8_yP5c'
  },
  {
    id: '3',
    title: 'World Padel Tour Best Points',
    thumbnail: 'https://img.youtube.com/vi/97K4w_G7t-U/maxresdefault.jpg',
    category: 'Highlights',
    youtubeId: '97K4w_G7t-U'
  },
  {
    id: '4',
    title: 'How to Serve like a Pro',
    thumbnail: 'https://img.youtube.com/vi/L-54K4XWzJg/maxresdefault.jpg',
    category: 'Technique',
    youtubeId: 'L-54K4XWzJg'
  }
];