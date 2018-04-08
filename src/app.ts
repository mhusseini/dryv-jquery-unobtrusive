///<amd-module name="dryv-jquery-unobtrusive"/>
///<reference types="jquery" />

(function () {
    const createFormHandler = (form: any) => {
        const handler = () => form.data("dryv-object", null);
        form.data("dryv-handler", handler)
            .on("invalid-form", handler);
    };

    const updateField = (element, obj) => {
        const el = $(element);
        const names = el.attr("name").replace(/^\w|\.\w/g, m => m.toLowerCase()).split(".");
        const max = names.length - 1;
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const m = /(\w+)(\[(\d)\])?/.exec(name);
            const field = m[1];
            const index = m[3];
            const parent = obj;
            obj = obj[field];
            if (i < max) {
                if (!obj) {
                    obj = index ? [] : {};
                    parent[field] = obj;
                }

                if (index) {
                    const idx = Number(index);
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
                    obj = parent[field] = [];
                }
                obj[Number(index)] = el.val();
            }
            else {
                parent[field] = el.val();
            }
        }
    };

    const createObject = (context: any) => {
        const form = $(context.currentForm);
        form.data("dryv-handler") || createFormHandler(form);

        const obj = {};
        $("input, select, textarea", form).each((_, element) => updateField(element, obj));
        form.data("dryv-object", obj);
        return obj;
    };

    const getObject = (context: any) => {
        let existing;
        const obj = (existing = $(context.currentForm).data("dryv-object"))
            || createObject(context);
        obj.isNew = !existing;
        return obj;
    };

    $.validator.addMethod("dryv", function (_, element, functions) {
        const obj = getObject(this);
        if (!obj.isNew) {
            updateField(element, obj);
        }
        const e = $(element);
        e.data("msgDryv", null);
        for (let fn of functions) {
            const error = fn(obj);
            if (error) {
                e.data("msgDryv", error.message || error);
                return false;
            }
        }

        return true;
    });

    $.validator.unobtrusive.adapters.add("dryv", options => {
        try {
            options.rules["dryv"] = eval(options.message);
        } catch (ex) {
            console.error(`Failed to parse Dryv validation: ${ex}.\nThe expression that was parsed is:\n${options.message}`);
        }
    });
})();