// Lesson bodies, keyed by slug. Titles and order live in src/lib/learn.ts.

import WhatIsAnApi from "./what-is-an-api";
import HttpRequests from "./http-requests";
import HttpResponses from "./http-responses";
import HttpMethods from "./http-methods";
import Json from "./json";
import FirstRequests from "./first-requests";
import TestCases from "./test-cases";
import CrudTesting from "./crud-testing";
import ValidationErrors from "./validation-errors";
import QueryParameters from "./query-parameters";
import Authentication from "./authentication";
import HeadersCachingCookies from "./headers-caching-cookies";
import Automation from "./automation";
import SchemasContracts from "./schemas-contracts";
import Reliability from "./reliability";
import AsyncApis from "./async-apis";
import SecurityTesting from "./security-testing";
import Performance from "./performance";
import CiStrategy from "./ci-strategy";

export const lessonContent: Record<string, () => React.ReactNode> = {
  "what-is-an-api": WhatIsAnApi,
  "http-requests": HttpRequests,
  "http-responses": HttpResponses,
  "http-methods": HttpMethods,
  "json": Json,
  "first-requests": FirstRequests,
  "test-cases": TestCases,
  "crud-testing": CrudTesting,
  "validation-errors": ValidationErrors,
  "query-parameters": QueryParameters,
  "authentication": Authentication,
  "headers-caching-cookies": HeadersCachingCookies,
  "automation": Automation,
  "schemas-contracts": SchemasContracts,
  "reliability": Reliability,
  "async-apis": AsyncApis,
  "security-testing": SecurityTesting,
  "performance": Performance,
  "ci-strategy": CiStrategy,
};
