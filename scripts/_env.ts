// Load env for CLI scripts the same way Next does: .env.local wins over .env
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });
