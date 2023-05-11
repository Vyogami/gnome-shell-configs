function raw(text, prefix = '', obj = null) {
    if (obj !== null) {
        log(`supergfxctl-gex: ${prefix} ${text}\nobj:\n${JSON.stringify(obj)}`);
    }
    else {
        log(`supergfxctl-gex: ${prefix} ${text}`);
    }
}

function info(text, obj = null) {
    raw(text, '[INFO]', obj);
}

function error(text, e = null) {
    logError(e, `supergfxctl-gex: ${text}`);
}

function warn(text, obj = null) {
    raw(text, '[WARN]', obj);
}

function debug(text, obj = null) {
    raw(text, '[DEBUG]', obj);
}
