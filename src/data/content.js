function unsplash(base, width) {
  return `${base}?auto=format&fit=crop&w=${width}&q=80`;
}

export const studio = {
  name: "CraftNexa",
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
    "https://www.google.com/maps?q=TNHB+Complex+Annanagar+West+Extension+Chennai+101&output=embed",
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
};

export const heroImage = {
  base: "https://images.unsplash.com/photo-1600685890506-593fdf55949b",
  alt: "Bride in traditional wedding attire, portrait",
};

export const services = [
  {
    title: "Bride Portraits",
    base: "https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9",
    alt: "Bride portrait session",
  },
  {
    title: "Groom Portraits",
    base: "https://images.unsplash.com/photo-1635919254131-cbaa334ef53e",
    alt: "Groom portrait session",
  },
  {
    title: "Couple Portraits",
    base: "https://images.unsplash.com/photo-1591604466107-ec97de577aff",
    alt: "Couple portrait session",
  },
  {
    title: "Pre / Post Wedding",
    base: "https://images.unsplash.com/photo-1587271636175-90d58cdad458",
    alt: "Pre and post wedding photoshoot",
  },
  {
    title: "Candid Photography",
    base: "https://images.unsplash.com/photo-1574397188309-e83dfe918ecb",
    alt: "Candid wedding moment",
  },
  {
    title: "Maternity",
    base: "https://images.unsplash.com/photo-1711313530954-39421910bc82",
    alt: "Maternity photoshoot",
  },
  {
    title: "New Born Photoshoot",
    base: "https://images.unsplash.com/photo-1596252732610-fce5ac542f8e",
    alt: "Newborn baby photoshoot",
  },
  {
    title: "Toddler Modeling Shoot",
    base: "https://images.unsplash.com/photo-1566513857792-9a52cd97e06d",
    alt: "Toddler modeling photoshoot",
  },
  {
    title: "Gifts & Frames",
    base: "https://images.unsplash.com/photo-1683523946422-64283e8af4d5",
    alt: "Printed photo gifts and frames",
  },
].map((service) => ({
  ...service,
  src: unsplash(service.base, 640),
}));

export const galleryImages = [
  {
    base: "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2",
    alt: "Wedding ceremony moment",
  },
  {
    base: "https://images.unsplash.com/photo-1633104502646-eb5ea88b3190",
    alt: "Groom getting ready",
  },
  {
    base: "https://images.unsplash.com/photo-1722952934708-749c22eb2e58",
    alt: "Couple sharing a quiet moment",
  },
  {
    base: "https://images.unsplash.com/photo-1601121868898-4581104b29de",
    alt: "Candid celebration moment",
  },
  {
    base: "https://images.unsplash.com/photo-1721655426078-954f8967d9ea",
    alt: "Maternity portrait outdoors",
  },
  {
    base: "https://images.unsplash.com/photo-1610901137736-d7cc46657b11",
    alt: "Newborn sleeping portrait",
  },
  {
    base: "https://images.unsplash.com/photo-1662122071926-9dfd4e518dec",
    alt: "Toddler portrait smiling",
  },
  {
    base: "https://images.unsplash.com/photo-1621533748467-27c570b23883",
    alt: "Framed photo prints as gifts",
  },
].map((image) => ({
  ...image,
  src: unsplash(image.base, 720),
}));

export const testimonials = [
  {
    quote:
      "Every frame felt like it understood the moment before we did. Our wedding album still gives us goosebumps.",
    name: "Priya & Arun",
    role: "Wedding clients",
    avatar: unsplash(
      "https://images.unsplash.com/photo-1506863530036-1efeddceb993",
      120,
    ),
  },
  {
    quote:
      "Patient, warm, and incredibly skilled with newborns. We got portraits we'll treasure forever.",
    name: "Divya R.",
    role: "Newborn shoot",
    avatar: unsplash(
      "https://images.unsplash.com/photo-1567516364473-233c4b6fcfbe",
      120,
    ),
  },
  {
    quote:
      "Professional from the first call to the final print. The candid shots captured emotions we didn't even notice happening.",
    name: "Karthik S.",
    role: "Couple portraits",
    avatar: unsplash(
      "https://images.unsplash.com/photo-1528892952291-009c663ce843",
      120,
    ),
  },
  {
    quote:
      "Our toddler wouldn't sit still for anyone else, but the team made the whole shoot feel like play.",
    name: "Meera & Vishal",
    role: "Toddler shoot",
    avatar: unsplash(
      "https://images.unsplash.com/photo-1600603406200-5b2a104684ac",
      120,
    ),
  },
];

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];
