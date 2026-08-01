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
import { Parser, React } from "@webpack/common";

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

    const isCreator = !!flagData?.dorm_creator;/* Thanks pizzaGPT for the idea to fix this issue! */
    const isLoading = flagData === undefined;/* Thanks pizzaGPT for the idea to fix this issue! */
    const isChecked = !!flagData?.checked;/* Thanks pizzaGPT for the idea to fix this issue! */
    const isFlagged = !isCreator && !!(/* Thanks pizzaGPT for the idea to fix this issue! */
        flagData?.okappiki?.flagged === true ||/* Thanks pizzaGPT for the idea to fix this issue! */
        flagData?.rotector?.flagged === true ||/* Thanks pizzaGPT for the idea to fix this issue! */
        flagData?.mococo?.flagged === true/* Thanks pizzaGPT for the idea to fix this issue! */
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
        onClick: () => openDormModal(userId)
    }, label);
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
