(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "jquery"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = require("jquery");
    (function () {
        // const createFormHandler = (form: any) => {
        //     const handler = () => form.data("dryv-object", null);
        //     form.data("dryv-handler", handler)
        //         .on("invalid-form", handler);
        // };
        var convert = function (value, type) {
            switch (type) {
                case "number": return Number(value);
                case "boolean": value.toLowerCase() === "true" || !!value;
                default: return value;
            }
        };
        var getValue = function ($el) {
            var type = $el.attr("type").toLowerCase();
            switch (type) {
                case "checkbox":
                case "radio":
                    return $el[0]["checked"];
                default:
                    return convert($el.val(), $el.attr("data-type-dryv"));
            }
        };
        var updateField = function (element, obj) {
            var el = $(element);
            if (el.data("dryv-ignore")) {
                return;
            }
            var names = el.attr("name").replace(/^\w|\.\w/g, function (m) { return m.toLowerCase(); }).split(".");
            var max = names.length - 1;
            for (var i = 0; i < names.length; i++) {
                var name_1 = names[i];
                var m = /(\w+)(\[(\d)\])?/.exec(name_1);
                var field = m[1];
                var index = m[3];
                var parent_1 = obj;
                obj = obj[field];
                if (i < max) {
                    if (!obj) {
                        obj = index ? [] : {};
                        parent_1[field] = obj;
                    }
                    if (index) {
                        var idx = Number(index);
                        if (obj[idx]) {
                            obj = obj[idx];
                        }
                        else {
                            obj = obj[idx] = {};
                        }
                    }
                }
                else if (index) {
                    if (!obj) {
                        obj = parent_1[field] = [];
                    }
                    obj[Number(index)] = getValue(el);
                }
                else {
                    parent_1[field] = getValue(el);
                }
            }
        };
        var createObject = function ($form) {
            var obj = {};
            $("input, select, textarea", $form).each(function (_, element) { return updateField(element, obj); });
            $form.data("dryv-object", obj);
            return obj;
        };
        var getObject = function ($form) {
            var existing;
            var obj = (existing = $form.data("dryv-object"))
                || createObject($form);
            obj.isNew = !existing;
            return obj;
        };
        $.validator.addMethod("dryv", function (_, element, functions) {
            var obj = getObject($(this.currentForm));
            if (!obj.isNew) {
                updateField(element, obj);
            }
            var e = $(element);
            e.data("msgDryv", null);
            for (var _i = 0, functions_1 = functions; _i < functions_1.length; _i++) {
                var fn = functions_1[_i];
                var error = fn(obj);
                if (error) {
                    e.data("msgDryv", error.message || error);
                    return false;
                }
            }
            return true;
        });
        $.validator.unobtrusive.adapters.add("dryv", function (options) {
            var form = options.form;
            var $form = $(form);
            if (!$form.data("dryv-init")) {
                $form.data("dryv-init", true);
                $form.bind("submit", function () { $(this).data("dryv-object", null); });
                $("input:not([data-val-dryv]), textarea:not([data-val-dryv])", $form)
                    .each(function (i, el) {
                    if (el["type"] === "hidden" &&
                        $("input[type=checkbox][name='" + el["name"] + "']", $form).length) {
                        $(el).data("dryv-ignore", true);
                        return;
                    }
                    $(el).change(function () {
                        var obj = getObject($form);
                        updateField(this, obj);
                    });
                });
            }
            try {
                options.rules["dryv"] = eval(options.message);
            }
            catch (ex) {
                console.error("Failed to parse Dryv validation: " + ex + ".\nThe expression that was parsed is:\n" + options.message);
            }
        });
    })();
});
