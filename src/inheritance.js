function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function patternToRegex(pattern) {
    // temporarily protect the wildcards
    const MULTI = "__MULTI__";
    const SINGLE = "__SINGLE__";

    pattern = pattern
        .replace(/%%%/g, MULTI)
        .replace(/\.{3}/g, SINGLE);

    // escape everything else
    pattern = escapeRegex(pattern);

    // restore wildcard regex
    pattern = pattern
        // matches one or more subtag segments
        .replace(MULTI, "([^/]+(?:/[^/]+)*)")
        // matches exactly one subtag segment
        .replace(SINGLE, "([^/]+)");

    return new RegExp(`^${pattern}$`);
}

function matchesPattern(pattern, tag) {
    return patternToRegex(pattern).test(tag);
}

export function getInheritedSetting(tag, settings) {
    const parts = tag.split("/");

    for (let i = parts.length; i > 0; i--) {
        const current = parts.slice(0, i).join("/");

        const foundSettings = settings.filter(s => {
            if (!(s.tagname === current || matchesPattern(s.tagname, current))) {
                return false;
            }

            return (
                s.tagname === tag ||
                s.settingInheritable ||
                matchesPattern(s.tagname, tag)
            );
        });

        if (foundSettings.length > 0) {
            return foundSettings;
        }
    }

    return [];
}