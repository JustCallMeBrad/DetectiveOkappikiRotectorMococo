/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CspPolicies } from "@main/csp";

// fyi, we use this so that discord doesn't get blocked cuz of my domain
CspPolicies["okappiki.com"] = [...(CspPolicies["okappiki.com"] || []), "connect-src"];
