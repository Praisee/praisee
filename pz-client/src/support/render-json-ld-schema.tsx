import * as React from 'react';

export default function renderJsonLdSchema(schema: {}) {
    return (
        <script type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}
        />
    );
};
