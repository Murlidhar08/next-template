export function formatAmount(amount?: number | null) {
    if (!amount) return "0";

    return Math.abs(amount).toLocaleString("en-IN");
}

export function getInitials(name?: string | null) {
    if (!name) return "?";

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
        return parts[0][0]?.toUpperCase() ?? "?";
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
