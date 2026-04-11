export const TOP_ITEMS = [
  {
    id: '1',
    title: 'PUBG Mobile Account Level 90',
    category: 'gaming',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    level: 90,
    follower_count: 0,
    price: 15000,
    created_at: new Date(Date.now() - 100000000).toISOString(),
    seller: { id: 's1', name: 'ProGamer123', rating: 4.8, avatar: 'https://placehold.co/100/ffa500/fff?text=P' },
  },
  {
    id: '2',
    title: 'Instagram Page 50k',
    category: 'social',
    image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    level: 0,
    follower_count: '50k',
    price: 8000,
    created_at: new Date(Date.now() - 200000000).toISOString(),
    seller: { id: 's2', name: 'SocialMaster', rating: 4.5, avatar: 'https://placehold.co/100/0000ff/fff?text=S' },
  },
  {
    id: '3',
    title: 'TikTok Account 100k',
    category: 'social',
    image_url: 'https://images.unsplash.com/photo-1596550190719-dd3a288410d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    level: 0,
    follower_count: '100k',
    price: 12000,
    created_at: new Date(Date.now() - 50000000).toISOString(),
    seller: { id: 's2', name: 'SocialMaster', rating: 4.5, avatar: 'https://placehold.co/100/0000ff/fff?text=S' },
  },
  {
    id: 'top4',
    title: 'Gaming PC Setup Full',
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    level: 0,
    follower_count: 0,
    price: 45000,
    created_at: new Date(Date.now() - 800000000).toISOString(),
    seller: { id: 's1', name: 'ProGamer123', rating: 4.8, avatar: 'https://placehold.co/100/ffa500/fff?text=P' },
  }
];

export const RECENT_ITEMS = [
  {
    id: '4',
    title: 'PUBG Lite Account',
    category: 'gaming',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    level: 40,
    follower_count: 0,
    price: 1500,
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    seller: { id: 's3', name: 'NewbieSeller', rating: 0, avatar: 'https://placehold.co/100/green/fff?text=N' },
  },
  {
    id: '5',
    title: 'Telegram Channel 2k',
    category: 'social',
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    level: 0,
    follower_count: '2k',
    price: 500,
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    seller: { id: 's2', name: 'SocialMaster', rating: 4.5, avatar: 'https://placehold.co/100/0000ff/fff?text=S' },
  },
  {
    id: '6',
    title: 'Clash of Clans TH12',
    category: 'gaming',
    image_url: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    level: 150,
    follower_count: 0,
    price: 2500,
    created_at: new Date(Date.now() - 100000).toISOString(), // Just now
    seller: { id: 's1', name: 'ProGamer123', rating: 4.8, avatar: 'https://placehold.co/100/ffa500/fff?text=P' },
  },
  {
    id: 'recent7',
    title: 'Twitter Account Old',
    category: 'social',
    image_url: 'https://images.unsplash.com/photo-1611605698383-ee989149bf0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    level: 0,
    follower_count: '500',
    price: 300,
    created_at: new Date(Date.now() - 5000).toISOString(), // Just now
    seller: { id: 's3', name: 'NewbieSeller', rating: 0, avatar: 'https://placehold.co/100/green/fff?text=N' },
  }
];

export const CATEGORIES = [
  { id: '1', name: 'Telegram', icon: 'Send', color: '#0088cc' },
  { id: '2', name: 'Instagram', icon: 'Instagram', color: '#E1306C' },
  { id: '3', name: 'TikTok', icon: 'Video', color: '#000000' },
  { id: '4', name: 'X (Twitter)', icon: 'Twitter', color: '#000000' },
  { id: '5', name: 'YouTube', icon: 'Youtube', color: '#FF0000' },
  { id: '6', name: 'Facebook', icon: 'Facebook', color: '#1877F2' },
  { id: '7', name: 'LinkedIn', icon: 'Linkedin', color: '#0A66C2' },
  { id: '8', name: 'Gaming', icon: 'Gamepad2', color: '#9146FF' },
  { id: '9', name: 'Discord', icon: 'MessageSquare', color: '#5865F2' },
  { id: '10', name: 'Reddit', icon: 'MessageCircle', color: '#FF4500' },
  { id: '11', name: 'Pinterest', icon: 'Image', color: '#BD081C' },
  { id: '12', name: 'WhatsApp', icon: 'Phone', color: '#25D366' },
];
