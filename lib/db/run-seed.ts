import { db } from "./index";
import { seedCharacters, seedPinkCoinPackages } from "./seed";

seedCharacters(db)
  .then(() => seedPinkCoinPackages(db))
  .then(() => {
    console.log("Seeded characters and pink coin packages");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
