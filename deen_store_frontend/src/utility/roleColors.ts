// utils/roleColors.ts
const ROLE_COLORS = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6'];

export const getRoleColor = (roleId: string, selectedColor?: string): string => {
    // Return selected color if provided and valid
    if (selectedColor && ROLE_COLORS.includes(selectedColor)) {
        return selectedColor;
    }

    // Check localStorage for existing color with different key variations
    const keysToCheck = [
        `role-color-${roleId}`,
        `role-color-${roleId.toLowerCase()}`,
        `role-color-${roleId.toUpperCase()}`
    ];

    for (const key of keysToCheck) {
        const storedColor = localStorage.getItem(key);
        if (storedColor && ROLE_COLORS.includes(storedColor)) {
            return storedColor;
        }
    }

    // Generate new deterministic color
    const hash = Array.from(roleId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ROLE_COLORS[hash % ROLE_COLORS.length];
};

export const setRoleColor = (roleId: string, color: string): void => {
    if (ROLE_COLORS.includes(color)) {
        // Store with both original and lowercase keys for consistency
        localStorage.setItem(`role-color-${roleId}`, color);
        localStorage.setItem(`role-color-${roleId.toLowerCase()}`, color);
    }
};