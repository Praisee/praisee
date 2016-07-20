import * as Relay from 'react-relay';
export var viewerQuery = {
    queries: {
        viewer: function () { return (_a = ["\n            query {\n                viewer\n            }\n        "], _a.raw = ["\n            query {\n                viewer\n            }\n        "], Relay.QL(_a)); var _a; }
    }
};
export var appQuery = {
    queries: {
        currentUser: function () { return (_a = ["\n            query {\n                currentUser\n            }\n        "], _a.raw = ["\n            query {\n                currentUser\n            }\n        "], Relay.QL(_a)); var _a; }
    }
};
export var homeQuery = {
    queries: {
        viewer: function () { return (_a = ["\n            query {\n                viewer\n            }\n        "], _a.raw = ["\n            query {\n                viewer\n            }\n        "], Relay.QL(_a)); var _a; },
        currentUser: function () { return (_a = ["\n            query {\n                currentUser\n            }\n        "], _a.raw = ["\n            query {\n                currentUser\n            }\n        "], Relay.QL(_a)); var _a; }
    }
};
export var topicQuery = {
    queries: {
        topic: function () { return (_a = ["\n            query {\n                topic(urlSlug: $urlSlug)\n            }\n        "], _a.raw = ["\n            query {\n                topic(urlSlug: $urlSlug)\n            }\n        "], Relay.QL(_a)); var _a; }
    }
};
export var reviewQuery = {
    queries: {
        review: function () { return (_a = ["\n            query {\n                review(urlSlug: $urlSlug)\n            }\n        "], _a.raw = ["\n            query {\n                review(urlSlug: $urlSlug)\n            }\n        "], Relay.QL(_a)); var _a; }
    }
};