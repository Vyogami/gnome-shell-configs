function raw(text = '', prefix = '') {
    log(`supergfxctl-gex: ${prefix} ${text}`);
}

function info(text) {
    raw(text, '[INFO]');
}

function error(text, e = null) {
    logError(e, `supergfxctl-gex: ${text}`);
}

function warn(text) {
    raw(text, '[WARN]');
}

function debug(text) {
    raw(text, '[DEBUG]');
}
