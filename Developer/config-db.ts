import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";

// Get stack (i.e. environment) specific config data or use defaults
const config = new pulumi.Config();
export const dbEngine = config.get("dbEngine") || "mysql";
export const dbEngineVersion = config.get("dbEngineVersion") ?? "5.7";
export const dbInstanceClass = config.get("dbInstanceClass") ?? "db.t2.micro";
export const dbStorageType = config.get("dbStorageType")  ?? "gp2";
export const dbApplyImmediately = config.getBoolean("dbApplyImmediately") ?? false;
export const dbMultiAz = config.getBoolean("dbMultiAz") ?? true;
export const dbSkipFinalSnapshot = config.getBoolean("dbSkipFinalSnapshot") ?? true;

export const dbUser = config.get("dbUser") ?? "admin";
// Get secretified password from config or create one using the "random" package
export let dbPassword = config.getSecret("dbPassword");
if (!dbPassword) {
  dbPassword = new random.RandomPassword("dbPassword", {
    length: 16,
    special: true,
    overrideSpecial: "_%",
  }).result;
}
