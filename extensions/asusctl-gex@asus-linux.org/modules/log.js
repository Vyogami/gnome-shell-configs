var log_level = 4;
function raw(text, prefix, e = null) {
    if (typeof asusctlGexInstance !== 'undefined') {
        if (asusctlGexInstance.isDebug == true) {
            log(`asusctl-gex: ${prefix} ${text}`);
            if (e) {
                log(`asusctl-gex: ${prefix} Exception:\nasusctl-gex: ${e}`);
            }
        }
    }
}
function info(text, e = null) {
    if (log_level > 0)
        raw(text, '[INFO]', e);
}
function error(text, e = null) {
    if (log_level > 1)
        raw(text, '[ERROR]', e);
}
function warn(text, e = null) {
    if (log_level > 2)
        raw(text, '[WARN]', e);
}
function debug(text, e = null) {
    if (typeof asusctlGexInstance !== 'undefined') {
        if (asusctlGexInstance.isDebug == true) {
            if (log_level > 3)
                raw(text, '[DEBUG]', e);
        }
    }
}
//# sourceMappingURL=log.js.map