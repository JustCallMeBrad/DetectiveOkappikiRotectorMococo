/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addProfileBadge, ProfileBadge, removeProfileBadge } from "@api/Badges";
import { addMessageDecoration, removeMessageDecoration } from "@api/MessageDecorations";
import { Logger } from "@utils/Logger";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalRoot, ModalSize, openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import { Parser, React } from "@webpack/common";

const logger = new Logger("DORM");
const flagCache = new Map<string, any>();
const fetchingUsers = new Set<string>();
const listeners = new Set<(userId?: string) => void>();

const API_BASE = "https://okappiki.com/backend/api.php";

const COLORS = {
    creator: "#FDE792",
    loading: "#6c757d",
    flagged: "#f23f42",
    clean: "#3ba55c"
};

function updateCacheAndNotify(userId: string, data: any) {
    flagCache.set(userId, data);
    listeners.forEach(cb => cb(userId));
}

function getBadgeColor(isCreator: boolean, isLoading: boolean, isFlagged: boolean) {
    if (isCreator) return COLORS.creator;
    if (isLoading) return COLORS.loading;
    if (isFlagged) return COLORS.flagged;
    return COLORS.clean;
}

function getBadgeLabel(isLoading: boolean, isCreator: boolean, isFlagged: boolean) {
    if (isLoading) return "LOADING...";
    if (isCreator) return "DORM CREATOR";
    if (isFlagged) return "FLAGGED!";
    return "NOT FLAGGED!";
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

            const anyFlagged = data.okappiki?.flagged || data.rotector?.flagged || data.mococo?.flagged;
            const result = anyFlagged ? data : null;

            updateCacheAndNotify(userId, result);
            return result;
        })
        .catch(err => {
            logger.error("dorm full check failed", err);
            return null;
        });
}

function DormModalContent({ userId, onClose, transitionState }: any) {
    const [data, setData] = React.useState<any>(flagCache.get(userId) ?? null);
    const [checking, setChecking] = React.useState(false);

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
        body = React.createElement("div", { style: { color: "var(--text-normal)" } }, "hi i made this thing");
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
                React.createElement("div", { style: { fontWeight: "bold", marginBottom: "4px", color: "var(--header-primary)" } }, segment.source),
                React.createElement("div", { style: { whiteSpace: "pre-wrap", marginBottom: "8px", color: "var(--text-normal)" } }, Parser.parse(segment.reason)),
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
        body = React.createElement("div", { style: { color: "var(--text-normal)" } },
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
            React.createElement("div", { style: { fontWeight: "bold", fontSize: "16px", color: "var(--header-primary)" } }, `DORM Flag Status — ${userId}`),
            React.createElement(ModalCloseButton, { onClick: onClose })
        ),
        React.createElement(ModalContent, { style: { padding: "16px 0", color: "var(--text-normal)" } }, body),
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
                    const result = (data.success && data.checked) ? data : null;
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
    const isFlagged = !isCreator && !!flagData;

    return React.createElement("span", {
        style: {
            marginLeft: "6px",
            padding: "2px 6px",
            backgroundColor: getBadgeColor(isCreator, isLoading, isFlagged),
            color: "#ffffff",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: "bold",
            verticalAlign: "middle",
            cursor: "pointer",
            display: "inline-block",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
        },
        title: "Click for details",
        onClick: () => openDormModal(userId)
    }, getBadgeLabel(isLoading, isCreator, isFlagged));
}

const dormBadge: ProfileBadge = {
    id: "dorm-flag-badge",
    key: "dorm-flag-badge",
    component: (props: any) => React.createElement(DormBadgeComponent, { userId: props.userId }),
    shouldShow: () => true
};

export default definePlugin({
    name: "DORM",
    description: "Allows you to check users for flags on the Detective Okappiki, Rotector and Mococo databases.",
    authors: [{ name: "DullBrad", id: 382599761145888769n }],
    dependencies: ["BadgeAPI", "MessageDecorationsAPI"],

    start() {
        addProfileBadge(dormBadge);

        addMessageDecoration("dorm-flag-badge", (props: any) => {
            const authorId = props?.message?.author?.id;
            if (!authorId) return null;

            return React.createElement(DormBadgeComponent, { userId: authorId });
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
