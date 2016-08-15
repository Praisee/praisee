import {CompositeDecorator} from 'draft-js';

export type TEditorPlugins = Array<{decorators?: Array<any>}>;

export default function createDecoratorFromPlugins(plugins: TEditorPlugins) {
    const pluginDecorators = plugins.reduce((decorators, plugin) => {
        if (!plugin.decorators) {
            return decorators;
        }

        return [...decorators, ...plugin.decorators];
    }, []);

    return new CompositeDecorator(pluginDecorators);
}
