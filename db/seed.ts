import { FeedingTimer } from "./config";

// https://astro.build/db/seed
export default async function seed({ db }) {
  await db
    .insert(FeedingTimer)
    .values([{ lable: "First Feed", startedAt: new Date() }]);
  // TODO
}

// import { db, Comment, Author } from 'astro:db';

// export default async function() {
//   await db.insert(Author).values([
//     { id: 1, name: "Kasim" },
//     { id: 2, name: "Mina" },
//   ]);

//   await db.insert(Comment).values([
//     { authorId: 1, body: 'Hope you like Astro DB!' },
//     { authorId: 2, body: 'Enjoy!'},
//   ])
// }
