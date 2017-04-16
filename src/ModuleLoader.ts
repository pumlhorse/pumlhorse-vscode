import * as requireFromPath from 'pumlhorse/util/requireFromPath';

export class WrapperModuleLoader {

    private static cache: {[path: string]: boolean} = {};

    static load(modPath: string, directory: string, alternativeDirectories): any {
        var path = requireFromPath.resolve(modPath, directory, alternativeDirectories);
        WrapperModuleLoader.cache[path] = true;
        
        return requireFromPath(modPath, directory, alternativeDirectories);
    }

    static clearCache() {
        for (var x in WrapperModuleLoader.cache) {
            delete require.cache[x];
        }

        WrapperModuleLoader.cache = {};
    }
}