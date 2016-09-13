import {pzPath} from 'pz-support/src/pz-path';
import createSlug from '../url-slugs/slugger';

var profiler;
var fs;

if (process.env.NODE_ENV !== 'production') {
    profiler = require('v8-profiler');
    fs = require('fs');
}

var id = 1;
var benchmarks = new Map();

export function startBenchmark(message: string): number {
    if (process.env.NODE_ENV === 'production') {
        return 0;
    }

    let profilerId = 'profile ' + id;

    if (process.env.PZ_PROFILE) {
        profiler.startProfiling(profilerId);
    }

    const uniqueMessage = `(${id}) ${message}`;

    console.time(uniqueMessage);

    benchmarks.set(id, {message, uniqueMessage, profilerId});

    return id++;
}

export function endBenchmark(benchmarkId: number) {
    if (process.env.NODE_ENV === 'production') {
        return;
    }

    const benchmark = benchmarks.get(benchmarkId);

    if (!benchmark) {
        throw new Error('Could not find benchmark for ID: ' + benchmarkId);
    }

    const {message, uniqueMessage, profilerId} = benchmark;

    console.timeEnd(uniqueMessage);

    if (process.env.PZ_PROFILE) {
        const profile = profiler.stopProfiling(profilerId);

        if (profile) {
            const profileName = process.env.PZ_PROFILE.length ? process.env.PZ_PROFILE : 'praisee';
            const messageSlug = createSlug(message, {minChars: 1, reservedWords: [], onFailureThrowError: true});
            const profilePath = `${profileName}_${messageSlug}_${benchmarkId}.profile.cpuprofile`;

            profile.export()
                .pipe(fs.createWriteStream(pzPath('pz-root', profilePath)))
                .on('finish', function() {
                    profile.delete();
                });

        } else {

            console.warn('Could not find profile for ' + message + ' ' + id);
        }
    }

    benchmarks.delete(id);
}
