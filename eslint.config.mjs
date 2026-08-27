import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [".next/**", "node_modules/**", "drizzle/**", "user-data/**"],
  },
  {
    // The react-three-fiber render loop drives the scene imperatively: state
    // lives in refs and useFrame mutates the camera and object transforms.
    files: ["components/game/**/*.tsx"],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
    },
  },
];

export default eslintConfig;
