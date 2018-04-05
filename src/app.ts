///<amd-module name="dryv-jquery-unobtrusive"/>
///<reference types="jquery" />

(function () {
    const createFormHandler = (form: any) => {
        const handler = () => form.data("dryv-object", null);
        form.data("dryv-handler", handler)
            .on("invalid-form", handler);
    }

    const createObject = (context: any) => {
        const form = $(context.currentForm);
        form.data("dryv-handler") || createFormHandler(form);

        const regex = /(\w+)(\[(\d)\])?/;
        const obj = {};
        $("input, select, textarea", form).each((_, element) => {
            let current = obj;
            const el = $(element);
            const names = el.attr("name").split(".");
            const max = names.length - 1;
            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                const g = name.charAt(0).toLowerCase() + name.substr(1);
                const m = regex.exec(g);
                const field = m[1];
                const index = m[3];
                const parent = current;
                current = current[field];
                if (i < max) {
                    if (!current) {
                        current = index ? [] : {};
                        parent[field] = current;
                    }

                    if (index) {
                        const idx = Number(index);
                        if (current[idx]) {
                            current = current[idx];
                        }
                        else {
                            current = current[idx] = {};
                        }
                    }
                }
                else if (index) {
                    if (!current) {
                        current = parent[field] = [];
                    }
                    current[Number(index)] = el.val();
                }
                else {
                    parent[field] = el.val();
                }
            }
        });
        form.data("dryv-object", obj);
        return obj;
    }

    const getObject = (context: any) =>
        $(context.currentForm).data("dryv-object") ||
        createObject(context);

    $.validator.addMethod("dryv", function (_, element, functions) {
        const obj = getObject(this);
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