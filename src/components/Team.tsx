import Image from "next/image";
import { resolvedTeam } from "@/lib/flags";
import { PlaceholderNote } from "./PlaceholderNote";
import styles from "./Team.module.css";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/** Renders nothing until there is at least one real team profile. */
export function Team() {
  const { items, isPlaceholder } = resolvedTeam;
  if (items.length === 0) return null;

  return (
    <section className="section" id="team" aria-labelledby="team-title">
      <div className="wrap">
        <div className="head">
          <p className="tag">Our people</p>
          <h2 id="team-title">Led by people who own the outcome</h2>
          <p>
            Senior roles sit across every contract, so accountability never gets
            lost between subcontractors.
          </p>
        </div>
        <ul className={styles.grid}>
          {items.map((member) => (
            <li key={member.name} className={styles.card}>
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt=""
                  className={styles.avatar}
                  sizes="56px"
                />
              ) : (
                <div className={styles.avatar} aria-hidden="true">
                  {member.initials ?? initialsOf(member.name)}
                </div>
              )}
              <h3>{member.name}</h3>
              <p className={styles.role}>{member.role}</p>
              <ul className={styles.tags}>
                {member.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <p className={styles.bio}>{member.bio}</p>
            </li>
          ))}
        </ul>
        {isPlaceholder && <PlaceholderNote what="these team profiles" />}
      </div>
    </section>
  );
}
