import { db } from "./index";
import { seedCharacters } from "./seed";

seedCharacters(db)
  .then(() => {
    console.log("Seeded characters");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
