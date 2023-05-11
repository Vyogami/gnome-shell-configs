const Me = imports.misc.extensionUtils.getCurrentExtension();
const { VersionHelper } = Me.imports.helpers.version_helper;

var LabelType;
(function (LabelType) {
    LabelType[LabelType["Gfx"] = 0] = "Gfx";
    LabelType[LabelType["GfxMenu"] = 1] = "GfxMenu";
    LabelType[LabelType["Power"] = 2] = "Power";
    LabelType[LabelType["PowerFileName"] = 3] = "PowerFileName";
    LabelType[LabelType["UserAction"] = 4] = "UserAction";
})(LabelType || (LabelType = {}));

var LabelHelper = class LabelHelper {

    constructor(vInstatce) {
        this._gfxLabels = [
            'hybrid',
            'integrated',
            'vfio',
            'egpu',
            'asusmuxdiscreet',
            'none',
        ];
        this._gfxLabelsMenu = [
            'Hybrid',
            'Integrated',
            'VFIO',
            'eGPU',
            'MUX / dGPU',
            'None',
        ];
        this._powerLabel = [
            'active',
            'suspended',
            'off',
            'disabled',
            'active',
            'unknown',
        ];
        this._powerLabelFilename = [
            'active',
            'suspended',
            'off',
            'off',
            'active',
            'active',
        ];
        this._userAction = [
            'logout',
            'reboot',
            'integrated',
            'asusgpumuxdisable',
            'none',
        ];
        if (vInstatce instanceof VersionHelper)
            this.vHelper = vInstatce;
        else
            this.vHelper = new VersionHelper(vInstatce);
    }

    get gsVersion() {
        return this.vHelper.gsVersion();
    }

    gfxLabels(type) {
        if (!(type === LabelType.Gfx || type === LabelType.GfxMenu) ||
            !this.vHelper.isBetween(this.vHelper.currentVersion, this.vHelper.allowedSgfxVersions)) {
            return [];
        }

        switch (type) {
            case LabelType.Gfx:
                return this._gfxLabels
                    .slice(0, 2)
                    .concat(this.v50 ? [] : this.v51 ? ['nvidianomodeset'] : [], this._gfxLabels.slice(-4));
            case LabelType.GfxMenu:
                return this._gfxLabelsMenu
                    .slice(0, 2)
                    .concat(this.v50 ? [] : this.v51 ? ['Nvidia (no modeset)'] : [], this._gfxLabelsMenu.slice(-4));
            default:
                return [];
        }
    }

    get userActions() {
        return this._userAction
            .slice(0, 1)
            .concat(this.v50 ? [] : this.v51 ? ['reboot'] : [], this._userAction.slice(-3));
    }

    get(type, idx) {

        switch (type) {
            case LabelType.Gfx:
            case LabelType.GfxMenu:
                return this.gfxLabels(type)[idx];
            case LabelType.Power:
                return this._powerLabel[idx];
            case LabelType.PowerFileName:
                return this._powerLabelFilename[idx];
            case LabelType.UserAction:
                return this.userActions[idx];
            default:
                return '';
        }
    }

    is(type, idx, comp) {
        return this.get(type, idx) === comp;
    }

    get v50() {
        return this.vHelper.isBetween(this.vHelper.currentVersion, [
            [5, 0, 0],
            [5, 0, 9999],
        ]);
    }

    get v51() {
        return this.vHelper.isBetween(this.vHelper.currentVersion, [
            [5, 1, 0],
            [5, 1, 9999],
        ]);
    }
}
