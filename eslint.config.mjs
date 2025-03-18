import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Menangani variabel yang didefinisikan tapi tidak digunakan
      "@typescript-eslint/no-unused-vars": [
        "warn", // Mengubah level dari error menjadi warning
        {
          argsIgnorePattern: "^_", // Mengabaikan parameter yang dimulai dengan underscore
          varsIgnorePattern: "^_", // Mengabaikan variabel yang dimulai dengan underscore
          caughtErrorsIgnorePattern: "^_", // Mengabaikan error yang dimulai dengan underscore
        },
      ],
    },
  },
];

export default eslintConfig;
