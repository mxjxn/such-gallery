import { Inter, Comic_Neue } from "next/font/google";

export const inter = Inter({ subsets: ["latin"] });
export const comicNeue = Comic_Neue({
	weight: [ "300", "400", "700" ],
	subsets: [ "latin" ],
	style: [ "normal", "italic" ],
});
