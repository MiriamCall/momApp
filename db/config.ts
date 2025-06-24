import { defineDb, defineTable } from "astro:db";

const FeedingTimer = defineTable({
  columns: {
    id: { type: "number", primaryKey: true },
    lable: { type: "string" },
    startedAt: { type: "date" },
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { FeedingTimer },
});

// import { defineDb, defineTable, column } from 'astro:db';

// const Comment = defineTable({
//   columns: {
//     author: column.text(),
//     body: column.text(),
//   }
// })

// export default defineDb({
//   tables: { Comment },
// })
