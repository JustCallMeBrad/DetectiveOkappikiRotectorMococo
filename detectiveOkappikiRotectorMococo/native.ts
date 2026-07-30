/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CspPolicies } from "@main/csp";

// We use fallback arrays to prevent overriding any existing rules for the domain
CspPolicies["okappiki.com"] = [...(CspPolicies["okappiki.com"] || []), "connect-src"];
