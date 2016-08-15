# Content

This is the module for any rich text and media content. It supports fields for 
community items, topic descriptions, comments, etc. This module should also handle
uploads from the user.

## Current direction

DraftJS is the current editor of choice to power content editing. For now, we
persist DraftJS' raw content state in the database and provide some filtering on it.
For example, if a user mentions a topic, we clean the data and make sure it links
to the appropriate location.

## Future direction

Filtering may not be enough to ensure data integrity. In addition, we may desire
more access to the embedded data. For example, it may be helpful to have a table
dedicated to linked items such as topics, for statistical reasons. In the future,
it would likely be better to have dedicated tables for content and the sub-data.
This would require a large amount of work, therefore, all domain concerns related
to content should stay in this module to ensure a smooth transition at the
appropriate time.
