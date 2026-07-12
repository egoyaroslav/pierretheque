export type InstagramPost = {
  image: string;
  href: string;
};

export const instagramFeeds = {
  shop: {
    handle: "pierretheque",
    label: "Pierrètèque",
    role: "The Shop",
    profileUrl: "https://www.instagram.com/pierretheque/",
    posts: [
      { image: "/instagram/pierretheque/1.jpg", href: "https://www.instagram.com/pierretheque/reel/DXZNvM3CAKq/" },
      { image: "/instagram/pierretheque/2.jpg", href: "https://www.instagram.com/pierretheque/reel/DXPtj5giLiT/" },
      { image: "/instagram/pierretheque/3.jpg", href: "https://www.instagram.com/pierretheque/reel/DWywCvXiOXV/" },
      { image: "/instagram/pierretheque/4.jpg", href: "https://www.instagram.com/pierretheque/p/DZuceNyCKR2/" },
      { image: "/instagram/pierretheque/5.jpg", href: "https://www.instagram.com/pierretheque/p/DZaFka8iBnq/" },
      { image: "/instagram/pierretheque/6.jpg", href: "https://www.instagram.com/pierretheque/p/DZaDvOgCO1Q/" },
    ] as InstagramPost[],
  },
  founder: {
    handle: "vampyerre",
    label: "Pierre Ma",
    role: "Founder & Curator",
    profileUrl: "https://www.instagram.com/vampyerre/",
    posts: [
      { image: "/instagram/vampyerre/1.jpg", href: "https://www.instagram.com/vampyerre/p/DZLDe2QqBRw/" },
      { image: "/instagram/vampyerre/2.jpg", href: "https://www.instagram.com/vampyerre/p/DIJnjdRsLda/" },
      { image: "/instagram/vampyerre/3.jpg", href: "https://www.instagram.com/vampyerre/reel/DG2rsvJMuA1/" },
      { image: "/instagram/vampyerre/4.jpg", href: "https://www.instagram.com/vampyerre/reel/DXZQ_UMiupV/" },
    ] as InstagramPost[],
  },
};
