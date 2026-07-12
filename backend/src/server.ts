import app from "./app";
import { env } from "./config/env";

const PORT = Number(env.PORT) || 4000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 FoodMart API berjalan di http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`   Mode: ${env.NODE_ENV}`);
});
