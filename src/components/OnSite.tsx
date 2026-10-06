import Image, { type StaticImageData } from "next/image";
import collage from "@/assets/images/onsite-crew-collage.jpg";
import serverHall from "@/assets/images/server-hall.jpg";
import facade from "@/assets/images/high-access-facade.jpg";
import warehouse from "@/assets/images/onsite-warehouse-floor.jpg";
import styles from "./OnSite.module.css";

const items: { image: StaticImageData; label: string }[] = [
  { image: collage, label: "Machine floor scrubbing" },
  { image: serverHall, label: "Data-centre & cleanroom access" },
  { image: facade, label: "High-access façade cleaning" },
  { image: warehouse, label: "Warehouse floor care" },
];

export function OnSite() {
  return (
    <ul className={styles.strip} aria-label="Nexgen on site">
      {items.map((item) => (
        <li key={item.label} className={styles.item}>
          <figure>
            {/* The caption names the photo, so the image itself is decorative. */}
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(max-width: 760px) 50vw, 25vw"
              placeholder="blur"
            />
            <figcaption>{item.label}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
