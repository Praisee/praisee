export interface ISluggerOptions {
    duplicateOffset?: number
    separator?: string
    minChars?: number
    replacementPattern?: RegExp
    reservedWords?: Array<string>
    
    onFailureThrowError?: boolean
    onFailureUse?: string
    onFailureCall?: Function
}

export var defaultOptions: ISluggerOptions = {
    duplicateOffset: 0,
    
    separator: '-',
    
    minChars: 4,
    
    replacementPattern: /[^a-zA-Z0-9_\.]/g,
    
    reservedWords: [
        'about', 'account', 'accounts', 'contact', 'settings', 'admin', 'admins',
        'api', 'app', 'index', 'login', 'logout', 'signin', 'signup', 'register',
        'user', 'profile', 'session', 'sitemap'
    ]
};

export default function createSlug(fromText: string, options: ISluggerOptions) {
    const mergedOptions = Object.assign({}, defaultOptions, options);
    const {duplicateOffset, minChars, reservedWords, separator} = mergedOptions;
    
    if (everyCharIsANumber(fromText)) {
        return handleFailure(fromText, mergedOptions);
    }
    
    const normalizedText = normalizeText(fromText, mergedOptions);
    
    if (normalizedText.length < minChars) {
        return handleFailure(fromText, mergedOptions);
    }
    
    const lowercaseNormalizedText = normalizedText.toLowerCase();
    
    if (reservedWords.indexOf(lowercaseNormalizedText) !== -1) {
        return handleFailure(fromText, mergedOptions);
    }
    
    if (duplicateOffset) {
        return normalizedText + separator + duplicateOffset;
    } else {
        return normalizedText;
    }
}

function handleFailure(fromText: string, options: ISluggerOptions) {
    if (options.onFailureUse) {
        return options.onFailureUse;
    } else if (options.onFailureCall) {
        return options.onFailureCall(fromText, options);
    } else {
        throw new Error('Unable to create slug from text: ' + fromText);
    }
}

function everyCharIsANumber(fromText: string) {
    return /^\d+$/.test(fromText);
}

function normalizeText(fromText: string, options: ISluggerOptions) {
    const {replacementPattern, separator} = options;
    
    const replacedText = fromText.replace(replacementPattern, separator);
    
    const dedupedSeparator = replacedText.replace(
        new RegExp(separator + '{2,}', 'g'),
        separator
    );
    
    const removeSeparatorFromEdges = dedupedSeparator.replace(
        new RegExp('^' + separator + '|' + separator + '$', 'g'),
        ''
    );
    
    return removeSeparatorFromEdges;
}
