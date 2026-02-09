/// <reference types="astro/client" />

import type { TypedPocketBase } from "./pocketbase-types";

declare global {
    namespace App {
        interface Locals {
            pb: TypedPocketBase;
        }
    }
}

export { };
