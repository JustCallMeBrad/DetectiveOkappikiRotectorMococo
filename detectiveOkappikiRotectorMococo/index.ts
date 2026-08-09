/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addProfileBadge, ProfileBadge, removeProfileBadge } from "@api/Badges";
import { addMessageDecoration, removeMessageDecoration } from "@api/MessageDecorations";
import { definePluginSettings } from "@api/Settings";
import { Logger } from "@utils/Logger";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalRoot, ModalSize, openModal } from "@utils/modal";
import definePlugin, { OptionType } from "@utils/types";
import { Parser, React, Text } from "@webpack/common";
import ErrorBoundary from "@components/ErrorBoundary";
import { findByPropsLazy, findCssClassesLazy } from "@webpack";

const TabBarClasses = findCssClassesLazy("tabPanelScroller", "tabBarPanel");
const ProfileModalActions = findByPropsLazy("openUserProfileModal");
const IS_PATCHED = Symbol("UserFlags.Patched");

const logger = new Logger("DORM");
const flagCache = new Map<string, any>();
const fetchingUsers = new Set<string>();
const listeners = new Set<(userId?: string) => void>();

const API_BASE = "https://okappiki.com/backend/api.php";

const settings = definePluginSettings({
    badgeSize: {
        type: OptionType.NUMBER,
        description: "Badge text size (in pixels)",
        default: 11
    },
    badgeColorLoading: {
        type: OptionType.STRING,
        description: "Badge color that displays when the plugin is loading the result",
        default: "#6c757d"
    },
    badgeColorUnchecked: {
        type: OptionType.STRING,
        description: "Badge color that displays when a user hasn't been checked yet",
        default: "#4f545c"
    },
    badgeColorClean: {
        type: OptionType.STRING,
        description: "Badge color that displays when a user is not flagged",
        default: "#3ba55c"
    },
    badgeColorFlagged: {
        type: OptionType.STRING,
        description: "Badge color that displays when a user is flagged",
        default: "#f23f42"
    },
    badgeColorCreator: {
        type: OptionType.STRING,
        description: "my badge color!!",
        default: "#FDE792"
    },
    labelLoading: {
        type: OptionType.STRING,
        description: "Badge text that displays when the plugin is loading the result",
        default: "LOADING..."
    },
    labelUnchecked: {
        type: OptionType.STRING,
        description: "Badge text that displays when a user is yet to have been checked",
        default: "NOT CHECKED!"
    },
    labelClean: {
        type: OptionType.STRING,
        description: "Badge text that displays when a user is not flagged",
        default: "NOT FLAGGED!"
    },
    labelFlagged: {
        type: OptionType.STRING,
        description: "Badge text that displays when a user is flagged",
        default: "FLAGGED!"
    },
    labelCreator: {
        type: OptionType.STRING,
        description: "hi i made this!!",
        default: "DORM CREATOR"
    },
    modalTextColor: {
        type: OptionType.STRING,
        description: "Modal text color (Leave blank for it to match your default discord theme, can be buggy due to Vencord's custom CSS)",
        default: ""
    }
});

function updateCacheAndNotify(userId: string, data: any) {
    flagCache.set(userId, data);
    listeners.forEach(cb => cb(userId));
}

const APPEAL_LINKS = {
    okappiki: "https://okappiki.com/appeal",
    rotector: "https://rotector.com",
    mococo: "https://discord.gg/VH4e8Wxfmd"
};

function buildReasonSegments(flagData: any) {
    const segments: { source: string; reason: string; appealUrl: string; }[] = [];

    if (flagData?.okappiki?.flagged) segments.push({ source: "Okappiki", reason: flagData.okappiki.reason || "Flagged", appealUrl: APPEAL_LINKS.okappiki });
    if (flagData?.rotector?.flagged) segments.push({ source: "Rotector", reason: flagData.rotector.reason || "Flagged", appealUrl: APPEAL_LINKS.rotector });
    if (flagData?.mococo?.flagged) segments.push({ source: "Mococo", reason: flagData.mococo.reason || "Flagged", appealUrl: APPEAL_LINKS.mococo });

    return segments;
}

/** Returns true only when we have full detailed reasons (or the user is clean / creator). */
function hasDetailedReasons(flagData: any): boolean {
    if (!flagData) return false;

    const sources = [
        flagData.okappiki,
        flagData.rotector,
        flagData.mococo
    ];

    for (const src of sources) {
        if (src?.flagged === true && (typeof src.reason !== "string" || !src.reason.trim())) {
            return false;
        }
    }

    return !!flagData.checked;
}

function runFullCheck(userId: string) {
    return fetch(`${API_BASE}?action=vencord_full_check&discord_id=${userId}`)
        .then(res => res.json())
        .then(data => {
            if (!data.success) return null;

            const result = { ...data, checked: true };
            updateCacheAndNotify(userId, result);
            return result;
        })
        .catch(err => {
            logger.error("dorm full check failed", err);
            return null;
        });
}

function formatLastChecked(isoString: string | undefined) {
    if (!isoString) return null;

    const checkedDate = new Date(isoString);
    if (isNaN(checkedDate.getTime())) return null;

    const ageMs = Date.now() - checkedDate.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    let color = "#3ba55c";
    if (ageDays >= 30) color = "#f23f42";
    else if (ageDays >= 7) color = "#faa61a";

    return { text: checkedDate.toLocaleString(), color };
}

function DormModalContent({ userId, onClose, transitionState }: any) {
    const [data, setData] = React.useState<any>(flagCache.get(userId) ?? null);
    const [checking, setChecking] = React.useState(false);
    const { modalTextColor } = settings.use(["modalTextColor"]);

    const textColor = modalTextColor || "var(--text-normal)";
    const lastChecked = formatLastChecked(data?.last_updated);

    function handleRunCheck() {
        setChecking(true);
        runFullCheck(userId).then(result => {
            setChecking(false);
            setData(result);
        });
    }

    const isCreator = !!data?.dorm_creator;
    const segments = buildReasonSegments(data);

    let body: React.ReactNode;
    if (isCreator) {
        body = React.createElement("div", { style: { color: textColor } }, "hi i made this thing");
    } else if (segments.length > 0) {
        body = segments.map((segment, i) =>
            React.createElement("div", {
                key: i,
                style: {
                    marginBottom: "12px",
                    paddingBottom: "12px",
                    borderBottom: i < segments.length - 1 ? "1px solid var(--background-modifier-accent)" : "none"
                }
            },
                React.createElement("div", { style: { fontWeight: "bold", marginBottom: "4px", color: textColor } }, segment.source),
                React.createElement("div", { style: { whiteSpace: "pre-wrap", marginBottom: "8px", color: textColor } }, Parser.parse(segment.reason)),
                React.createElement("a", {
                    href: segment.appealUrl || undefined,
                    target: "_blank",
                    rel: "noreferrer",
                    style: {
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor: "#4f545c",
                        color: "#ffffff",
                        textDecoration: "none",
                        cursor: segment.appealUrl ? "pointer" : "not-allowed",
                        opacity: segment.appealUrl ? 1 : 0.5
                    }
                }, "Appeal")
            )
        );
    } else {
        body = React.createElement("div", { style: { color: textColor } },
            Parser.parse("No flags found across **D**etective **O**kappiki, **R**otector, or **M**ococo.")
        );
    }

    return React.createElement(ModalRoot, { transitionState, size: ModalSize.MEDIUM },
        React.createElement(ModalHeader, {
            style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%"
            }
        },
            React.createElement("div", { style: { fontWeight: "bold", fontSize: "16px", color: textColor } }, `DORM Flag Status — ${userId}`),
            React.createElement(ModalCloseButton, { onClick: onClose })
        ),
        React.createElement(ModalContent, { style: { padding: "16px 0", color: textColor } },
            lastChecked && React.createElement("div", {
                style: {
                    fontSize: "12px",
                    marginBottom: "12px",
                    color: lastChecked.color,
                    fontWeight: "bold"
                }
            }, `Last checked: ${lastChecked.text}`),
            body
        ),
        React.createElement(ModalFooter, {},
            React.createElement("button", {
                onClick: handleRunCheck,
                disabled: checking,
                style: {
                    width: "100%",
                    padding: "10px 16px",
                    borderRadius: "4px",
                    border: "none",
                    cursor: checking ? "default" : "pointer",
                    backgroundColor: "#5865f2",
                    color: "#ffffff",
                    fontWeight: "bold",
                    textAlign: "center"
                }
            }, checking ? "Checking..." : "Click here to check!")
        )
    );
}

function openDormModal(userId: string) {
    openModal(props => React.createElement(DormModalContent, { ...props, userId }));
}

function DormBadgeComponent({ userId }: { userId: string; }) {
    const [flagData, setFlagData] = React.useState<any>(() => flagCache.get(userId));
    const badgeSettings = settings.use([
        "badgeSize", "badgeColorLoading", "badgeColorUnchecked", "badgeColorClean",
        "badgeColorFlagged", "badgeColorCreator", "labelLoading", "labelUnchecked",
        "labelClean", "labelFlagged", "labelCreator"
    ]);

    React.useEffect(() => {
        setFlagData(flagCache.get(userId));

        const onUpdate = (updatedUserId?: string) => {
            if (!updatedUserId || updatedUserId === userId) {
                setFlagData(flagCache.get(userId));
            }
        };

        listeners.add(onUpdate);

        if (!flagCache.has(userId) && !fetchingUsers.has(userId)) {
            fetchingUsers.add(userId);

            fetch(`${API_BASE}?action=vencord_check_flag&discord_id=${userId}`)
                .then(res => res.json())
                .then(data => {
                    const result = data.success ? data : null;
                    updateCacheAndNotify(userId, result);
                })
                .catch(err => {
                    logger.error("dorm quick check failed", err);
                    updateCacheAndNotify(userId, null);
                })
                .finally(() => {
                    fetchingUsers.delete(userId);
                });
        }

        return () => {
            listeners.delete(onUpdate);
        };
    }, [userId]);

    const isCreator = !!flagData?.dorm_creator;
    const isLoading = flagData === undefined;
    const isChecked = !!flagData?.checked;
    const isFlagged = !isCreator && !!(
        flagData?.okappiki?.flagged === true ||
        flagData?.rotector?.flagged === true ||
        flagData?.mococo?.flagged === true
    );

    let color = badgeSettings.badgeColorUnchecked;
    let label = badgeSettings.labelUnchecked;

    if (isLoading) {
        color = badgeSettings.badgeColorLoading;
        label = badgeSettings.labelLoading;
    } else if (isCreator) {
        color = badgeSettings.badgeColorCreator;
        label = badgeSettings.labelCreator;
    } else if (!isChecked) {
        color = badgeSettings.badgeColorUnchecked;
        label = badgeSettings.labelUnchecked;
    } else if (isFlagged) {
        color = badgeSettings.badgeColorFlagged;
        label = badgeSettings.labelFlagged;
    } else {
        color = badgeSettings.badgeColorClean;
        label = badgeSettings.labelClean;
    }

    return React.createElement("span", {
        style: {
            marginLeft: "6px",
            padding: "2px 6px",
            backgroundColor: color,
            color: "#ffffff",
            borderRadius: "4px",
            fontSize: `${badgeSettings.badgeSize}px`,
            fontWeight: "bold",
            verticalAlign: "middle",
            cursor: "pointer",
            display: "inline-block",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
        },
        title: "Click for details",
        onClick: () => ProfileModalActions.openUserProfileModal({ userId, tabSection: "USER_FLAGS" })
    }, label);
}

function DormTab({ userId }: { userId: string; }) {
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
    const [checking, setChecking] = React.useState(false);

    React.useEffect(() => {
        const onUpdate = (updatedId?: string) => {
            if (!updatedId || updatedId === userId) forceUpdate();
        };
        listeners.add(onUpdate);

        const cached = flagCache.get(userId);
        if (!hasDetailedReasons(cached) && !fetchingUsers.has(userId)) {
            fetchingUsers.add(userId);
            setChecking(true);
            runFullCheck(userId).finally(() => {
                fetchingUsers.delete(userId);
                setChecking(false);
            });
        }

        return () => { listeners.delete(onUpdate); };
    }, [userId]);

    const data = flagCache.get(userId) ?? null;
    const busy = checking || fetchingUsers.has(userId);
    const lastChecked = formatLastChecked(data?.last_updated);
    const isCreator = !!data?.dorm_creator;
    const segments = buildReasonSegments(data);
    const isStillLoading = busy || !hasDetailedReasons(data);

    function handleRunCheck() {
        if (fetchingUsers.has(userId)) return;
        fetchingUsers.add(userId);
        setChecking(true);
        runFullCheck(userId).finally(() => {
            fetchingUsers.delete(userId);
            setChecking(false);
        });
    }

    const surface = "color-mix(in oklab, var(--text-default) 6%, transparent)";
    const hairline = "color-mix(in oklab, var(--text-default) 12%, transparent)";

    const cardStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        padding: "12px 14px",
        borderRadius: "10px",
        backgroundColor: surface,
        border: `1px solid ${hairline}`
    };

    const pill = React.createElement("div", {
        style: {
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            height: "18px",
            padding: "0 8px",
            borderRadius: "9px",
            backgroundColor: "#f23f42",
            color: "#fff",
            fontSize: "10px",
            fontWeight: "700",
            lineHeight: "1",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            whiteSpace: "nowrap"
        }
    }, "Flagged");


const refreshIcon = React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 487.23 487.23",
    style: { display: "block" }
},
    React.createElement("path", {
        d: "M55.323,203.641c15.664,0,29.813-9.405,35.872-23.854c25.017-59.604,83.842-101.61,152.42-101.61 c37.797,0,72.449,12.955,100.23,34.442l-21.775,3.371c-7.438,1.153-13.224,7.054-14.232,14.512 c-1.01,7.454,3.008,14.686,9.867,17.768l119.746,53.872c5.249,2.357,11.33,1.904,16.168-1.205 c4.83-3.114,7.764-8.458,7.796-14.208l0.621-131.943c0.042-7.506-4.851-14.144-12.024-16.332 c-7.185-2.188-14.947,0.589-19.104,6.837l-16.505,24.805C370.398,26.778,310.1,0,243.615,0C142.806,0,56.133,61.562,19.167,149.06 c-5.134,12.128-3.84,26.015,3.429,36.987C29.865,197.023,42.152,203.641,55.323,203.641z",
        fill: "currentColor"
    }),
    React.createElement("path", {
        d: "M464.635,301.184c-7.27-10.977-19.558-17.594-32.728-17.594c-15.664,0-29.813,9.405-35.872,23.854 c-25.018,59.604-83.843,101.61-152.42,101.61c-37.798,0-72.45-12.955-100.232-34.442l21.776-3.369 c7.437-1.153,13.223-7.055,14.233-14.514c1.009-7.453-3.008-14.686-9.867-17.768L49.779,285.089 c-5.25-2.356-11.33-1.905-16.169,1.205c-4.829,3.114-7.764,8.458-7.795,14.207l-0.622,131.943 c-0.042,7.506,4.85,14.144,12.024,16.332c7.185,2.188,14.948-0.59,19.104-6.839l16.505-24.805 c44.004,43.32,104.303,70.098,170.788,70.098c100.811,0,187.481-61.561,224.446-149.059 C473.197,326.043,471.903,312.157,464.635,301.184z",
        fill: "currentColor"
    })
);

    const header = React.createElement("div", {
        style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "14px"
        }
    },
        React.createElement(Text, {
            variant: "text-sm/semibold",
            style: { color: "var(--text-muted)" }
        }, "Flag status"),

        React.createElement("div", {
            style: { display: "flex", alignItems: "center", gap: "8px" }
        },
            lastChecked && !isStillLoading && React.createElement(Text, {
                variant: "text-xs/medium",
                style: { color: lastChecked.color, whiteSpace: "nowrap" }
            }, `Checked ${lastChecked.text}`),

            React.createElement("button", {
    onClick: handleRunCheck,
    disabled: busy,
    title: "Run check again",
    style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",
        height: "28px",
        borderRadius: "4px",
        border: "none",
        backgroundColor: busy
            ? "color-mix(in oklab, var(--text-default) 12%, transparent)"
            : "color-mix(in oklab, var(--text-default) 8%, transparent)",
        color: "var(--interactive-normal)",   // ← important
        cursor: busy ? "default" : "pointer",
        opacity: busy ? 0.5 : 1,
        transition: "background-color 0.15s ease, color 0.15s ease",
        padding: 0
    }
}, refreshIcon)
        )
    );

    let body: React.ReactNode;

    if (isStillLoading) {
        body = React.createElement("div", {
            style: {
                ...cardStyle,
                alignItems: "center",
                justifyContent: "center",
                padding: "36px 16px",
                textAlign: "center",
                gap: "10px"
            }
        },
            React.createElement(Text, {
                variant: "text-md/semibold",
                style: { color: "var(--text-default)" }
            }, "Fetching full flag details…"),
            React.createElement(Text, {
                variant: "text-sm/normal",
                style: { color: "var(--text-muted)", lineHeight: "1.4" }
            }, "This only takes a moment")
        );
    } else if (isCreator) {
        body = React.createElement("div", { style: cardStyle },
            React.createElement(Text, {
                variant: "text-md/semibold",
                style: { color: "var(--text-default)" }
            }, "hi i made this thing")
        );
    } else if (segments.length > 0) {
        body = React.createElement("div", {
            style: { display: "flex", flexDirection: "column", gap: "8px" }
        },
            segments.map((segment, i) =>
                React.createElement("div", { key: i, style: cardStyle },
                    React.createElement("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px"
                        }
                    },
                        React.createElement(Text, {
                            variant: "text-md/semibold",
                            style: { color: "var(--text-default)" }
                        }, segment.source),
                        pill
                    ),
                    React.createElement(Text, {
                        variant: "text-sm/normal",
                        style: {
                            color: "var(--text-muted)",
                            lineHeight: "1.4",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word"
                        }
                    }, Parser.parse(segment.reason))
                )
            )
        );
    } else {
        body = React.createElement("div", {
            style: {
                ...cardStyle,
                alignItems: "center",
                gap: "4px",
                padding: "28px 16px",
                textAlign: "center"
            }
        },
            React.createElement(Text, {
                variant: "text-md/semibold",
                style: { color: "var(--text-default)" }
            }, "No flags found"),
            React.createElement(Text, {
                variant: "text-sm/normal",
                style: { color: "var(--text-muted)", lineHeight: "1.4" }
            },
                Parser.parse("Clean across **D**etective **O**kappiki, **R**otector, and **M**ococo.")
            )
        );
    }

    return React.createElement("div", {
        style: { padding: "16px" }
    },
        header,
        body
    );
}
const dormBadge: ProfileBadge = {
    id: "dorm-flag-badge",
    key: "dorm-flag-badge",
    component: (props: any) => React.createElement(DormBadgeComponent, { key: props.userId, userId: props.userId }),
    shouldShow: () => true
};

export default definePlugin({
    name: "DORM",
    description: "Allows you to check users for flags on the Detective Okappiki, Rotector and Mococo databases.",
    authors: [{ name: "DullBrad", id: 382599761145888769n }],
    dependencies: ["BadgeAPI", "MessageDecorationsAPI"],
    settings,
    patches: [
        {
            find: ".WIDGETS?",
            replacement: [
                {
                    match: /(\]=\i\.useState\()(\i)(\.find\(\i=>\{let\{section:\i\}=\i;return \i===\i\}\)\?\?\i\[0\]\))/,
                    replace: "$1($self.pushSection($2,arguments[0].user),$2)$3"
                },
                {
                    match: /(function \i\(\i\)\{let\{user:\i,currentUser:\i,section:(\i),.+?\}=\i;return )/,
                    replace: "$1$2==='USER_FLAGS'?$self.renderUserFlags(arguments[0]):"
                },
                {
                    match: /type:"top",/,
                    replace: '$&className:"vc-userflags-modal-v2-tab-bar",'
                }
            ]
        }
    ],
    pushSection(sections: any[], user: any) {
        if (sections[IS_PATCHED]) return;
        sections[IS_PATCHED] = true;
        sections.push({ text: "DORM", section: "USER_FLAGS" });

        try {
            const userId = user?.id;
            const cached = flagCache.get(userId);
            if (userId && !hasDetailedReasons(cached) && !fetchingUsers.has(userId)) {
                fetchingUsers.add(userId);
                runFullCheck(userId).finally(() => fetchingUsers.delete(userId));
            }
        } catch (e) {
            logger.error("dorm auto full check failed", e);
        }
    },
    renderUserFlags: ErrorBoundary.wrap(({ user }: { user: any; }) => {
        return React.createElement(DormTab, { key: user.id, userId: user.id });
    }),

    start() {
        addProfileBadge(dormBadge);

        addMessageDecoration("dorm-flag-badge", (props: any) => {
            const authorId = props?.message?.author?.id;
            if (!authorId) return null;

            return React.createElement(DormBadgeComponent, { key: authorId, userId: authorId });
        });

        logger.info("DORM Plugin started.");
    },

    stop() {
        removeProfileBadge(dormBadge);
        removeMessageDecoration("dorm-flag-badge");
        flagCache.clear();
        fetchingUsers.clear();
        listeners.clear();
        logger.info("DORM Plugin stopped.");
    }
});