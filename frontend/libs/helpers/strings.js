class SK_Helpers_String {
    static levenshteinDistance(s1, s2) {
        const distance = Array(s1.length + 1).fill(null).map(() => Array(s2.length + 1).fill(null));

        for (let i = 0; i <= s1.length; i++) {
            distance[i][0] = i;
        }
        for (let j = 0; j <= s2.length; j++) {
            distance[0][j] = j;
        }

        for (let i = 1; i <= s1.length; i++) {
            for (let j = 1; j <= s2.length; j++) {
                const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
                distance[i][j] = Math.min(
                    distance[i - 1][j] + 1, // Deletion
                    distance[i][j - 1] + 1, // Insertion
                    distance[i - 1][j - 1] + cost // Substitution
                );
            }
        }

        return distance[s1.length][s2.length];
    }

    static checkStringInArray(arr, str, threshold = 1) {
        for (const item of arr) {
            if (item.toLowerCase() === str.toLowerCase()) return 'exact'

            if (item.toLowerCase().indexOf(str.toLowerCase()) > -1) {
                return true; // Exact match
            }
    
            const distance = this.levenshteinDistance(item, str);
            if (distance <= threshold) {
                return true; // Similar match
            }
        }
        return false; // No match found
    }
}