import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import { seedCharacters, seedPackages } from "./seed";

async function run() {
  await seedCharacters(db);
  await seedPackages(db);
  console.log("Seeded characters and Pink Coin packages");
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });