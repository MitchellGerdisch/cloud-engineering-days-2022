"use strict";
// *** WARNING: this file was generated by Pulumi SDK Generator. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVersion = exports.getEnvNumber = exports.getEnvBoolean = exports.getEnv = void 0;
function getEnv(...vars) {
    for (const v of vars) {
        const value = process.env[v];
        if (value) {
            return value;
        }
    }
    return undefined;
}
exports.getEnv = getEnv;
function getEnvBoolean(...vars) {
    const s = getEnv(...vars);
    if (s !== undefined) {
        // NOTE: these values are taken from https://golang.org/src/strconv/atob.go?s=351:391#L1, which is what
        // Terraform uses internally when parsing boolean values.
        if (["1", "t", "T", "true", "TRUE", "True"].find(v => v === s) !== undefined) {
            return true;
        }
        if (["0", "f", "F", "false", "FALSE", "False"].find(v => v === s) !== undefined) {
            return false;
        }
    }
    return undefined;
}
exports.getEnvBoolean = getEnvBoolean;
function getEnvNumber(...vars) {
    const s = getEnv(...vars);
    if (s !== undefined) {
        const f = parseFloat(s);
        if (!isNaN(f)) {
            return f;
        }
    }
    return undefined;
}
exports.getEnvNumber = getEnvNumber;
function getVersion() {
    let version = require('./package.json').version;
    // Node allows for the version to be prefixed by a "v", while semver doesn't.
    // If there is a v, strip it off.
    if (version.indexOf('v') === 0) {
        version = version.slice(1);
    }
    return version;
}
exports.getVersion = getVersion;
//# sourceMappingURL=utilities.js.map