function escapeSvgText(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function placeholderImage(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
    <rect width="800" height="1000" fill="#f0e9de"/>
    <g transform="translate(400,420)" fill="none" stroke="#b3874a" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">
      <rect x="-90" y="-55" width="180" height="130" rx="14"/>
      <circle cx="0" cy="14" r="42"/>
      <path d="M -40 -55 L -25 -85 L 25 -85 L 40 -55"/>
    </g>
    <text x="400" y="545" font-family="Georgia, serif" font-size="32" fill="#4a4038" text-anchor="middle">${escapeSvgText(label)}</text>
    <text x="400" y="585" font-family="Arial, sans-serif" font-size="18" letter-spacing="3" fill="#8a7f74" text-anchor="middle">PHOTO COMING SOON</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function avatarPlaceholder(initials) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="60" fill="#241f1b"/>
    <text x="60" y="73" font-family="Georgia, serif" font-size="38" fill="#faf6f0" text-anchor="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const studio = {
  name: "GG Studio",
  tagline: "Photography, crafted with care.",
  phone: "9087765482",
  phoneDisplay: "+91 90877 65482",
  whatsappLink: "https://wa.me/919087765482",
  address: {
    line1: "GG Studio, No R30A, TNHB Complex",
    line2: "Spartan Nagar, Anna Nagar West Ext",
    line3: "Chennai - 101",
  },
  mapEmbedSrc:
    "https://www.google.com/maps?q=GG+Studio+Wedding+Photographers+Family+Photo+Studio+Mogappair+Chennai&ll=13.0874144,80.1862416&z=17&output=embed",
  mapLink:
    "https://www.google.com/maps/place/GG+Studio+-+Wedding+Photographers+%2F+Family+Photo+Studio+in+Mogappair/@13.0874144,80.1862416,17z/data=!3m1!4b1!4m6!3m5!1s0x3a52640f15555547:0x926cfb9bbef802b1!8m2!3d13.0874144!4d80.1862416!16s%2Fg%2F11cn5mywnf",
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
};

export const heroImage = {
  srcset: [
    { src: "/photos/hero/hero-800.jpg", width: 800 },
    { src: "/photos/hero/hero-1200.jpg", width: 1200 },
    { src: "/photos/hero/hero-1800.jpg", width: 1800 },
  ],
  src: "/photos/hero/hero-1800.jpg",
  alt: "Bride in traditional gold jewelry and silk saree, studio portrait",
};

export const services = [
  {
    title: "Bride Portraits",
    src: "/photos/services/bride.jpg",
    alt: "Bride portrait session",
    photos: [
      { src: "/photos/services/bride.jpg", alt: "Bride portrait session" },
      { src: "/photos/gallery/bride-pooja.jpg", alt: "Bride holding a ceremonial pooja plate" },
      { src: "/photos/gallery/bride-portrait.jpg", alt: "Bride in white gown holding a bouquet" },
      { src: "/photos/gallery/bride-joyful.jpg", alt: "Bride smiling with gold jewelry raised" },
      { src: "/photos/gallery/bride-elegant.jpg", alt: "Bride portrait leaning against a pillar" },
    ],
  },
  {
    title: "Groom Portraits",
    src: "/photos/services/groom.jpg",
    alt: "Groom portrait session",
    photos: [
      { src: "/photos/services/groom.jpg", alt: "Groom portrait session" },
      { src: "/photos/gallery/groom-hall.jpg", alt: "Groom walking through a decorated wedding hall" },
    ],
  },
  {
    title: "Couple Portraits",
    src: "/photos/services/couple.jpg",
    alt: "Couple portrait session",
    photos: [
      { src: "/photos/services/couple.jpg", alt: "Couple portrait session" },
      { src: "/photos/gallery/couple-sofa.jpg", alt: "Couple seated together in front of a floral backdrop" },
      { src: "/photos/gallery/couple-romantic.jpg", alt: "Couple smiling closely under pink lighting" },
      { src: "/photos/gallery/outdoor-heart.jpg", alt: "Couple framed inside a heart-shaped floral display" },
      { src: "/photos/gallery/outdoor-archway.jpg", alt: "Couple standing under a floral archway" },
    ],
  },
  {
    title: "Pre / Post Wedding",
    src: "/photos/services/pre-post-wedding.jpg",
    alt: "Bride descending a grand staircase, pre-wedding photoshoot",
    photos: [
      { src: "/photos/services/pre-post-wedding.jpg", alt: "Bride descending a grand staircase, pre-wedding photoshoot" },
      { src: "/photos/gallery/wedding-staircase.jpg", alt: "Bride descending a grand staircase in a flowing gown" },
      { src: "/photos/gallery/wedding-editorial.jpg", alt: "Bride in a silver gown, outdoor editorial portrait" },
      { src: "/photos/gallery/wedding-garden.jpg", alt: "Bride standing outside a church with a bouquet" },
      { src: "/photos/gallery/wedding-bouquet-bw.jpg", alt: "Black and white portrait of a bride holding a bouquet" },
    ],
  },
  {
    title: "Candid Photography",
    src: "/photos/services/candid.jpg",
    alt: "Candid photo of a groom walking through a lit venue",
    photos: [
      { src: "/photos/services/candid.jpg", alt: "Candid photo of a groom walking through a lit venue" },
      { src: "/photos/gallery/candid-ritual.jpg", alt: "Candid moment of a couple during a wedding ritual" },
      { src: "/photos/gallery/candid-ceremony.jpg", alt: "Candid moment of a couple seated during a ceremony" },
    ],
  },
  {
    title: "Maternity",
    src: "/photos/services/maternity.jpg",
    alt: "Maternity portrait in a traditional saree",
    photos: [
      { src: "/photos/services/maternity.jpg", alt: "Maternity portrait in a traditional saree" },
      { src: "/photos/gallery/maternity-couple.jpg", alt: "Expecting couple portrait during a Seemantham ceremony" },
    ],
  },
  {
    title: "New Born Portraits",
    src: "/photos/services/newborn-portrait.jpg",
    alt: "Baby in a white outfit, portrait session",
    photos: [
      { src: "/photos/services/newborn-portrait.jpg", alt: "Baby in a white outfit, portrait session" },
      { src: "/photos/gallery/birthday-mother.jpg", alt: "Mother embracing her baby in a flower headband" },
    ],
  },
  {
    title: "Modeling / Portfolio Shoot",
    src: "/photos/services/modeling.jpg",
    alt: "Portfolio modeling photoshoot",
    photos: [
      { src: "/photos/services/modeling.jpg", alt: "Portfolio modeling photoshoot" },
      { src: "/photos/gallery/modeling-outdoor.jpg", alt: "Portfolio shoot portrait among green leaves" },
      { src: "/photos/gallery/modeling-red.jpg", alt: "Portfolio shoot portrait in red and gold attire" },
      { src: "/photos/gallery/modeling-saree.jpg", alt: "Portfolio shoot portrait in a blue saree" },
      { src: "/photos/gallery/modeling-veil.jpg", alt: "Portfolio shoot portrait in a red veil" },
    ],
  },
  {
    title: "Bharatanatyam / Dance Photoshoot",
    src: "/photos/services/bharatanatyam.jpg",
    alt: "Bharatanatyam dancer in costume, studio photoshoot",
    photos: [
      { src: "/photos/services/bharatanatyam.jpg", alt: "Bharatanatyam dancer in costume, studio photoshoot" },
      { src: "/photos/gallery/dance-1.jpg", alt: "Bharatanatyam dancer in a dramatic pose" },
      { src: "/photos/gallery/dance-2.jpg", alt: "Bharatanatyam dancer seated in costume" },
      { src: "/photos/gallery/dance-group.jpg", alt: "Group of Bharatanatyam dancers in a dramatic pose" },
      { src: "/photos/gallery/dance-solo.jpg", alt: "Bharatanatyam dancer in a dynamic pose" },
    ],
  },
  {
    title: "Gifts & Frames",
    src: "/photos/services/gifts-frames.jpg",
    alt: "Photo frame and gift bag with tissue paper",
    photos: [
      { src: "/photos/services/gifts-frames.jpg", alt: "Photo frame and gift bag with tissue paper" },
    ],
  },
];

export const testimonials = [
  {
    quote:
      "Every frame felt like it understood the moment before we did. Our wedding album still gives us goosebumps.",
    name: "Priya & Arun",
    role: "Wedding clients",
    avatar: avatarPlaceholder("PA"),
  },
  {
    quote:
      "Patient, warm, and incredibly skilled with newborns. We got portraits we'll treasure forever.",
    name: "Divya R.",
    role: "Newborn shoot",
    avatar: avatarPlaceholder("DR"),
  },
  {
    quote:
      "Professional from the first call to the final print. The candid shots captured emotions we didn't even notice happening.",
    name: "Karthik S.",
    role: "Couple portraits",
    avatar: avatarPlaceholder("KS"),
  },
  {
    quote:
      "Our daughter's portfolio shoot came out stunning — confident, camera-ready photos we'll use for years.",
    name: "Meera & Vishal",
    role: "Portfolio shoot",
    avatar: avatarPlaceholder("MV"),
  },
];

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];
