/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as datasets from "../datasets.js";
import type * as diagrams from "../diagrams.js";
import type * as http from "../http.js";
import type * as questionGeneration from "../questionGeneration.js";
import type * as questions from "../questions.js";
import type * as reset from "../reset.js";
import type * as resources from "../resources.js";
import type * as seed from "../seed.js";
import type * as tutor from "../tutor.js";
import type * as tutorStore from "../tutorStore.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  datasets: typeof datasets;
  diagrams: typeof diagrams;
  http: typeof http;
  questionGeneration: typeof questionGeneration;
  questions: typeof questions;
  reset: typeof reset;
  resources: typeof resources;
  seed: typeof seed;
  tutor: typeof tutor;
  tutorStore: typeof tutorStore;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
