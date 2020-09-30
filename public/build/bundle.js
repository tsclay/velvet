
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.28.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/HeroGrid.svelte generated by Svelte v3.28.0 */

    const file = "src/components/HeroGrid.svelte";
    const get_lower_right_slot_changes = dirty => ({});
    const get_lower_right_slot_context = ctx => ({});
    const get_lower_mid_slot_changes = dirty => ({});
    const get_lower_mid_slot_context = ctx => ({});
    const get_lower_left_slot_changes = dirty => ({});
    const get_lower_left_slot_context = ctx => ({});
    const get_center_right_slot_changes = dirty => ({});
    const get_center_right_slot_context = ctx => ({});
    const get_center_mid_slot_changes = dirty => ({});
    const get_center_mid_slot_context = ctx => ({});
    const get_center_left_slot_changes = dirty => ({});
    const get_center_left_slot_context = ctx => ({});
    const get_upper_right_slot_changes = dirty => ({});
    const get_upper_right_slot_context = ctx => ({});
    const get_upper_mid_slot_changes = dirty => ({});
    const get_upper_mid_slot_context = ctx => ({});
    const get_upper_left_slot_changes = dirty => ({});
    const get_upper_left_slot_context = ctx => ({});

    // (47:2) {#if imgSrc}
    function create_if_block_9(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*imgSrc*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*imgAlt*/ ctx[1]);
    			attr_dev(img, "class", "svelte-1b6bfht");
    			add_location(img, file, 46, 14, 856);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*imgSrc*/ 1 && img.src !== (img_src_value = /*imgSrc*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*imgAlt*/ 2) {
    				attr_dev(img, "alt", /*imgAlt*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(47:2) {#if imgSrc}",
    		ctx
    	});

    	return block;
    }

    // (48:2) {#if upperLeft}
    function create_if_block_8(ctx) {
    	let div;
    	let current;
    	const upper_left_slot_template = /*#slots*/ ctx[13]["upper-left"];
    	const upper_left_slot = create_slot(upper_left_slot_template, ctx, /*$$scope*/ ctx[12], get_upper_left_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (upper_left_slot) upper_left_slot.c();
    			set_style(div, "grid-area", "upper-left");
    			attr_dev(div, "class", "svelte-1b6bfht");
    			add_location(div, file, 48, 4, 917);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (upper_left_slot) {
    				upper_left_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (upper_left_slot) {
    				if (upper_left_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(upper_left_slot, upper_left_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_upper_left_slot_changes, get_upper_left_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(upper_left_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(upper_left_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (upper_left_slot) upper_left_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(48:2) {#if upperLeft}",
    		ctx
    	});

    	return block;
    }

    // (53:2) {#if upperMid}
    function create_if_block_7(ctx) {
    	let div;
    	let current;
    	const upper_mid_slot_template = /*#slots*/ ctx[13]["upper-mid"];
    	const upper_mid_slot = create_slot(upper_mid_slot_template, ctx, /*$$scope*/ ctx[12], get_upper_mid_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (upper_mid_slot) upper_mid_slot.c();
    			set_style(div, "grid-area", "upper-mid");
    			attr_dev(div, "class", "svelte-1b6bfht");
    			add_location(div, file, 53, 4, 1026);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (upper_mid_slot) {
    				upper_mid_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (upper_mid_slot) {
    				if (upper_mid_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(upper_mid_slot, upper_mid_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_upper_mid_slot_changes, get_upper_mid_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(upper_mid_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(upper_mid_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (upper_mid_slot) upper_mid_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(53:2) {#if upperMid}",
    		ctx
    	});

    	return block;
    }

    // (58:2) {#if upperRight}
    function create_if_block_6(ctx) {
    	let div;
    	let current;
    	const upper_right_slot_template = /*#slots*/ ctx[13]["upper-right"];
    	const upper_right_slot = create_slot(upper_right_slot_template, ctx, /*$$scope*/ ctx[12], get_upper_right_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (upper_right_slot) upper_right_slot.c();
    			attr_dev(div, "id", "hero-grid-upperRight");
    			set_style(div, "grid-area", "upper-right");
    			attr_dev(div, "class", "svelte-1b6bfht");
    			add_location(div, file, 58, 4, 1135);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (upper_right_slot) {
    				upper_right_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (upper_right_slot) {
    				if (upper_right_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(upper_right_slot, upper_right_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_upper_right_slot_changes, get_upper_right_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(upper_right_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(upper_right_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (upper_right_slot) upper_right_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(58:2) {#if upperRight}",
    		ctx
    	});

    	return block;
    }

    // (63:2) {#if centerLeft}
    function create_if_block_5(ctx) {
    	let div;
    	let current;
    	const center_left_slot_template = /*#slots*/ ctx[13]["center-left"];
    	const center_left_slot = create_slot(center_left_slot_template, ctx, /*$$scope*/ ctx[12], get_center_left_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (center_left_slot) center_left_slot.c();
    			set_style(div, "grid-area", "center-left");
    			attr_dev(div, "class", "svelte-1b6bfht");
    			add_location(div, file, 63, 4, 1275);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (center_left_slot) {
    				center_left_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (center_left_slot) {
    				if (center_left_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(center_left_slot, center_left_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_center_left_slot_changes, get_center_left_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(center_left_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(center_left_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (center_left_slot) center_left_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(63:2) {#if centerLeft}",
    		ctx
    	});

    	return block;
    }

    // (68:2) {#if centerMid}
    function create_if_block_4(ctx) {
    	let div;
    	let current;
    	const center_mid_slot_template = /*#slots*/ ctx[13]["center-mid"];
    	const center_mid_slot = create_slot(center_mid_slot_template, ctx, /*$$scope*/ ctx[12], get_center_mid_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (center_mid_slot) center_mid_slot.c();
    			set_style(div, "grid-area", "center-mid");
    			attr_dev(div, "class", "svelte-1b6bfht");
    			add_location(div, file, 68, 4, 1387);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (center_mid_slot) {
    				center_mid_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (center_mid_slot) {
    				if (center_mid_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(center_mid_slot, center_mid_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_center_mid_slot_changes, get_center_mid_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(center_mid_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(center_mid_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (center_mid_slot) center_mid_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(68:2) {#if centerMid}",
    		ctx
    	});

    	return block;
    }

    // (73:2) {#if centerRight}
    function create_if_block_3(ctx) {
    	let div;
    	let current;
    	const center_right_slot_template = /*#slots*/ ctx[13]["center-right"];
    	const center_right_slot = create_slot(center_right_slot_template, ctx, /*$$scope*/ ctx[12], get_center_right_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (center_right_slot) center_right_slot.c();
    			set_style(div, "grid-area", "center-right");
    			attr_dev(div, "class", "svelte-1b6bfht");
    			add_location(div, file, 73, 4, 1499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (center_right_slot) {
    				center_right_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (center_right_slot) {
    				if (center_right_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(center_right_slot, center_right_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_center_right_slot_changes, get_center_right_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(center_right_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(center_right_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (center_right_slot) center_right_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(73:2) {#if centerRight}",
    		ctx
    	});

    	return block;
    }

    // (78:2) {#if lowerLeft}
    function create_if_block_2(ctx) {
    	let div;
    	let current;
    	const lower_left_slot_template = /*#slots*/ ctx[13]["lower-left"];
    	const lower_left_slot = create_slot(lower_left_slot_template, ctx, /*$$scope*/ ctx[12], get_lower_left_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (lower_left_slot) lower_left_slot.c();
    			set_style(div, "grid-area", "lower-left");
    			attr_dev(div, "class", "svelte-1b6bfht");
    			add_location(div, file, 78, 4, 1613);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (lower_left_slot) {
    				lower_left_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (lower_left_slot) {
    				if (lower_left_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(lower_left_slot, lower_left_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_lower_left_slot_changes, get_lower_left_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lower_left_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lower_left_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (lower_left_slot) lower_left_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(78:2) {#if lowerLeft}",
    		ctx
    	});

    	return block;
    }

    // (83:2) {#if lowerMid}
    function create_if_block_1(ctx) {
    	let div;
    	let current;
    	const lower_mid_slot_template = /*#slots*/ ctx[13]["lower-mid"];
    	const lower_mid_slot = create_slot(lower_mid_slot_template, ctx, /*$$scope*/ ctx[12], get_lower_mid_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (lower_mid_slot) lower_mid_slot.c();
    			set_style(div, "grid-area", "lower-mid");
    			attr_dev(div, "class", "svelte-1b6bfht");
    			add_location(div, file, 83, 4, 1722);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (lower_mid_slot) {
    				lower_mid_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (lower_mid_slot) {
    				if (lower_mid_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(lower_mid_slot, lower_mid_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_lower_mid_slot_changes, get_lower_mid_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lower_mid_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lower_mid_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (lower_mid_slot) lower_mid_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(83:2) {#if lowerMid}",
    		ctx
    	});

    	return block;
    }

    // (88:2) {#if lowerRight}
    function create_if_block(ctx) {
    	let div;
    	let current;
    	const lower_right_slot_template = /*#slots*/ ctx[13]["lower-right"];
    	const lower_right_slot = create_slot(lower_right_slot_template, ctx, /*$$scope*/ ctx[12], get_lower_right_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (lower_right_slot) lower_right_slot.c();
    			set_style(div, "grid-area", "lower-right");
    			attr_dev(div, "class", "svelte-1b6bfht");
    			add_location(div, file, 88, 4, 1831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (lower_right_slot) {
    				lower_right_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (lower_right_slot) {
    				if (lower_right_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(lower_right_slot, lower_right_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_lower_right_slot_changes, get_lower_right_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lower_right_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lower_right_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (lower_right_slot) lower_right_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(88:2) {#if lowerRight}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let current;
    	let if_block0 = /*imgSrc*/ ctx[0] && create_if_block_9(ctx);
    	let if_block1 = /*upperLeft*/ ctx[2] && create_if_block_8(ctx);
    	let if_block2 = /*upperMid*/ ctx[3] && create_if_block_7(ctx);
    	let if_block3 = /*upperRight*/ ctx[4] && create_if_block_6(ctx);
    	let if_block4 = /*centerLeft*/ ctx[5] && create_if_block_5(ctx);
    	let if_block5 = /*centerMid*/ ctx[6] && create_if_block_4(ctx);
    	let if_block6 = /*centerRight*/ ctx[7] && create_if_block_3(ctx);
    	let if_block7 = /*lowerLeft*/ ctx[8] && create_if_block_2(ctx);
    	let if_block8 = /*lowerMid*/ ctx[9] && create_if_block_1(ctx);
    	let if_block9 = /*lowerRight*/ ctx[10] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			t5 = space();
    			if (if_block6) if_block6.c();
    			t6 = space();
    			if (if_block7) if_block7.c();
    			t7 = space();
    			if (if_block8) if_block8.c();
    			t8 = space();
    			if (if_block9) if_block9.c();
    			attr_dev(div, "class", "wrapper svelte-1b6bfht");
    			attr_dev(div, "style", /*gridOverride*/ ctx[11]);
    			add_location(div, file, 45, 0, 799);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t2);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t3);
    			if (if_block4) if_block4.m(div, null);
    			append_dev(div, t4);
    			if (if_block5) if_block5.m(div, null);
    			append_dev(div, t5);
    			if (if_block6) if_block6.m(div, null);
    			append_dev(div, t6);
    			if (if_block7) if_block7.m(div, null);
    			append_dev(div, t7);
    			if (if_block8) if_block8.m(div, null);
    			append_dev(div, t8);
    			if (if_block9) if_block9.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*imgSrc*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_9(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*upperLeft*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*upperLeft*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_8(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*upperMid*/ ctx[3]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*upperMid*/ 8) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_7(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*upperRight*/ ctx[4]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*upperRight*/ 16) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_6(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*centerLeft*/ ctx[5]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty & /*centerLeft*/ 32) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_5(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div, t4);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*centerMid*/ ctx[6]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);

    					if (dirty & /*centerMid*/ 64) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block_4(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div, t5);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (/*centerRight*/ ctx[7]) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);

    					if (dirty & /*centerRight*/ 128) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_3(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div, t6);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (/*lowerLeft*/ ctx[8]) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);

    					if (dirty & /*lowerLeft*/ 256) {
    						transition_in(if_block7, 1);
    					}
    				} else {
    					if_block7 = create_if_block_2(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(div, t7);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}

    			if (/*lowerMid*/ ctx[9]) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);

    					if (dirty & /*lowerMid*/ 512) {
    						transition_in(if_block8, 1);
    					}
    				} else {
    					if_block8 = create_if_block_1(ctx);
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(div, t8);
    				}
    			} else if (if_block8) {
    				group_outros();

    				transition_out(if_block8, 1, 1, () => {
    					if_block8 = null;
    				});

    				check_outros();
    			}

    			if (/*lowerRight*/ ctx[10]) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);

    					if (dirty & /*lowerRight*/ 1024) {
    						transition_in(if_block9, 1);
    					}
    				} else {
    					if_block9 = create_if_block(ctx);
    					if_block9.c();
    					transition_in(if_block9, 1);
    					if_block9.m(div, null);
    				}
    			} else if (if_block9) {
    				group_outros();

    				transition_out(if_block9, 1, 1, () => {
    					if_block9 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*gridOverride*/ 2048) {
    				attr_dev(div, "style", /*gridOverride*/ ctx[11]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(if_block7);
    			transition_in(if_block8);
    			transition_in(if_block9);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(if_block7);
    			transition_out(if_block8);
    			transition_out(if_block9);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;

    	validate_slots("HeroGrid", slots, [
    		'upper-left','upper-mid','upper-right','center-left','center-mid','center-right','lower-left','lower-mid','lower-right'
    	]);

    	let { imgSrc } = $$props, { imgAlt } = $$props;

    	let { upperLeft } = $$props,
    		{ upperMid } = $$props,
    		{ upperRight } = $$props,
    		{ centerLeft } = $$props,
    		{ centerMid } = $$props,
    		{ centerRight } = $$props,
    		{ lowerLeft } = $$props,
    		{ lowerMid } = $$props,
    		{ lowerRight } = $$props;

    	let { gridOverride } = $$props;

    	const writable_props = [
    		"imgSrc",
    		"imgAlt",
    		"upperLeft",
    		"upperMid",
    		"upperRight",
    		"centerLeft",
    		"centerMid",
    		"centerRight",
    		"lowerLeft",
    		"lowerMid",
    		"lowerRight",
    		"gridOverride"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HeroGrid> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("imgSrc" in $$props) $$invalidate(0, imgSrc = $$props.imgSrc);
    		if ("imgAlt" in $$props) $$invalidate(1, imgAlt = $$props.imgAlt);
    		if ("upperLeft" in $$props) $$invalidate(2, upperLeft = $$props.upperLeft);
    		if ("upperMid" in $$props) $$invalidate(3, upperMid = $$props.upperMid);
    		if ("upperRight" in $$props) $$invalidate(4, upperRight = $$props.upperRight);
    		if ("centerLeft" in $$props) $$invalidate(5, centerLeft = $$props.centerLeft);
    		if ("centerMid" in $$props) $$invalidate(6, centerMid = $$props.centerMid);
    		if ("centerRight" in $$props) $$invalidate(7, centerRight = $$props.centerRight);
    		if ("lowerLeft" in $$props) $$invalidate(8, lowerLeft = $$props.lowerLeft);
    		if ("lowerMid" in $$props) $$invalidate(9, lowerMid = $$props.lowerMid);
    		if ("lowerRight" in $$props) $$invalidate(10, lowerRight = $$props.lowerRight);
    		if ("gridOverride" in $$props) $$invalidate(11, gridOverride = $$props.gridOverride);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		imgSrc,
    		imgAlt,
    		upperLeft,
    		upperMid,
    		upperRight,
    		centerLeft,
    		centerMid,
    		centerRight,
    		lowerLeft,
    		lowerMid,
    		lowerRight,
    		gridOverride
    	});

    	$$self.$inject_state = $$props => {
    		if ("imgSrc" in $$props) $$invalidate(0, imgSrc = $$props.imgSrc);
    		if ("imgAlt" in $$props) $$invalidate(1, imgAlt = $$props.imgAlt);
    		if ("upperLeft" in $$props) $$invalidate(2, upperLeft = $$props.upperLeft);
    		if ("upperMid" in $$props) $$invalidate(3, upperMid = $$props.upperMid);
    		if ("upperRight" in $$props) $$invalidate(4, upperRight = $$props.upperRight);
    		if ("centerLeft" in $$props) $$invalidate(5, centerLeft = $$props.centerLeft);
    		if ("centerMid" in $$props) $$invalidate(6, centerMid = $$props.centerMid);
    		if ("centerRight" in $$props) $$invalidate(7, centerRight = $$props.centerRight);
    		if ("lowerLeft" in $$props) $$invalidate(8, lowerLeft = $$props.lowerLeft);
    		if ("lowerMid" in $$props) $$invalidate(9, lowerMid = $$props.lowerMid);
    		if ("lowerRight" in $$props) $$invalidate(10, lowerRight = $$props.lowerRight);
    		if ("gridOverride" in $$props) $$invalidate(11, gridOverride = $$props.gridOverride);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		imgSrc,
    		imgAlt,
    		upperLeft,
    		upperMid,
    		upperRight,
    		centerLeft,
    		centerMid,
    		centerRight,
    		lowerLeft,
    		lowerMid,
    		lowerRight,
    		gridOverride,
    		$$scope,
    		slots
    	];
    }

    class HeroGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			imgSrc: 0,
    			imgAlt: 1,
    			upperLeft: 2,
    			upperMid: 3,
    			upperRight: 4,
    			centerLeft: 5,
    			centerMid: 6,
    			centerRight: 7,
    			lowerLeft: 8,
    			lowerMid: 9,
    			lowerRight: 10,
    			gridOverride: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeroGrid",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*imgSrc*/ ctx[0] === undefined && !("imgSrc" in props)) {
    			console.warn("<HeroGrid> was created without expected prop 'imgSrc'");
    		}

    		if (/*imgAlt*/ ctx[1] === undefined && !("imgAlt" in props)) {
    			console.warn("<HeroGrid> was created without expected prop 'imgAlt'");
    		}

    		if (/*upperLeft*/ ctx[2] === undefined && !("upperLeft" in props)) {
    			console.warn("<HeroGrid> was created without expected prop 'upperLeft'");
    		}

    		if (/*upperMid*/ ctx[3] === undefined && !("upperMid" in props)) {
    			console.warn("<HeroGrid> was created without expected prop 'upperMid'");
    		}

    		if (/*upperRight*/ ctx[4] === undefined && !("upperRight" in props)) {
    			console.warn("<HeroGrid> was created without expected prop 'upperRight'");
    		}

    		if (/*centerLeft*/ ctx[5] === undefined && !("centerLeft" in props)) {
    			console.warn("<HeroGrid> was created without expected prop 'centerLeft'");
    		}

    		if (/*centerMid*/ ctx[6] === undefined && !("centerMid" in props)) {
    			console.warn("<HeroGrid> was created without expected prop 'centerMid'");
    		}

    		if (/*centerRight*/ ctx[7] === undefined && !("centerRight" in props)) {
    			console.warn("<HeroGrid> was created without expected prop 'centerRight'");
    		}

    		if (/*lowerLeft*/ ctx[8] === undefined && !("lowerLeft" in props)) {
    			console.warn("<HeroGrid> was created without expected prop 'lowerLeft'");
    		}

    		if (/*lowerMid*/ ctx[9] === undefined && !("lowerMid" in props)) {
    			console.warn("<HeroGrid> was created without expected prop 'lowerMid'");
    		}

    		if (/*lowerRight*/ ctx[10] === undefined && !("lowerRight" in props)) {
    			console.warn("<HeroGrid> was created without expected prop 'lowerRight'");
    		}

    		if (/*gridOverride*/ ctx[11] === undefined && !("gridOverride" in props)) {
    			console.warn("<HeroGrid> was created without expected prop 'gridOverride'");
    		}
    	}

    	get imgSrc() {
    		throw new Error("<HeroGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgSrc(value) {
    		throw new Error("<HeroGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imgAlt() {
    		throw new Error("<HeroGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgAlt(value) {
    		throw new Error("<HeroGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get upperLeft() {
    		throw new Error("<HeroGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set upperLeft(value) {
    		throw new Error("<HeroGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get upperMid() {
    		throw new Error("<HeroGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set upperMid(value) {
    		throw new Error("<HeroGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get upperRight() {
    		throw new Error("<HeroGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set upperRight(value) {
    		throw new Error("<HeroGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerLeft() {
    		throw new Error("<HeroGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerLeft(value) {
    		throw new Error("<HeroGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerMid() {
    		throw new Error("<HeroGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerMid(value) {
    		throw new Error("<HeroGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerRight() {
    		throw new Error("<HeroGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerRight(value) {
    		throw new Error("<HeroGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lowerLeft() {
    		throw new Error("<HeroGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lowerLeft(value) {
    		throw new Error("<HeroGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lowerMid() {
    		throw new Error("<HeroGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lowerMid(value) {
    		throw new Error("<HeroGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lowerRight() {
    		throw new Error("<HeroGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lowerRight(value) {
    		throw new Error("<HeroGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gridOverride() {
    		throw new Error("<HeroGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gridOverride(value) {
    		throw new Error("<HeroGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Dropdown.svelte generated by Svelte v3.28.0 */

    const file$1 = "src/components/Dropdown.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (147:8) {#if showOptions}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*options*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options, handleSelection*/ 10) {
    				each_value = /*options*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(147:8) {#if showOptions}",
    		ctx
    	});

    	return block;
    }

    // (148:10) {#each options as option, i}
    function create_each_block(ctx) {
    	let div;
    	let t0_value = /*option*/ ctx[7] + "";
    	let t0;
    	let t1;
    	let div_value_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "value", div_value_value = /*option*/ ctx[7].toLowerCase());
    			attr_dev(div, "class", "svelte-5cn0ol");
    			add_location(div, file$1, 148, 12, 3098);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*handleSelection*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 2 && t0_value !== (t0_value = /*option*/ ctx[7] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*options*/ 2 && div_value_value !== (div_value_value = /*option*/ ctx[7].toLowerCase())) {
    				attr_dev(div, "value", div_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(148:10) {#each options as option, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let button;
    	let svg;
    	let g;
    	let path;
    	let path_class_value;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let div2;
    	let div1;
    	let mounted;
    	let dispose;
    	let if_block = /*showOptions*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			button = element("button");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*selected*/ ctx[0]);
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(path, "d", "M 155.46289,78.494058 42.636336,144.00382 42.636333,13.648303 Z");
    			attr_dev(path, "class", path_class_value = "arrow-icon " + (/*showOptions*/ ctx[2] ? "active" : "rest") + " svelte-5cn0ol");
    			add_location(path, file$1, 135, 12, 2705);
    			add_location(g, file$1, 134, 10, 2689);
    			attr_dev(svg, "xmlns:svg", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "100");
    			attr_dev(svg, "height", "15");
    			attr_dev(svg, "viewBox", "0 0 158.75 158.75");
    			attr_dev(svg, "version", "1.1");
    			add_location(svg, file$1, 127, 8, 2473);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svg-wrapper svelte-5cn0ol");
    			add_location(button, file$1, 121, 6, 2314);
    			attr_dev(span, "class", "svelte-5cn0ol");
    			add_location(span, file$1, 141, 6, 2915);
    			attr_dev(div0, "class", "sel-text svelte-5cn0ol");
    			add_location(div0, file$1, 116, 4, 2193);
    			attr_dev(div1, "class", "folding-animation svelte-5cn0ol");
    			add_location(div1, file$1, 145, 6, 2989);
    			attr_dev(div2, "class", "dropdown-menu svelte-5cn0ol");
    			add_location(div2, file$1, 144, 4, 2955);
    			attr_dev(div3, "class", "sel-options svelte-5cn0ol");
    			add_location(div3, file$1, 115, 2, 2163);
    			attr_dev(div4, "class", "velvet-dropdown svelte-5cn0ol");
    			add_location(div4, file$1, 114, 0, 2131);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, button);
    			append_dev(button, svg);
    			append_dev(svg, g);
    			append_dev(g, path);
    			append_dev(div0, t0);
    			append_dev(div0, span);
    			append_dev(span, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", stop_propagation(/*click_handler*/ ctx[5]), false, false, true),
    					listen_dev(div0, "click", stop_propagation(/*click_handler_1*/ ctx[6]), false, false, true)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*showOptions*/ 4 && path_class_value !== (path_class_value = "arrow-icon " + (/*showOptions*/ ctx[2] ? "active" : "rest") + " svelte-5cn0ol")) {
    				attr_dev(path, "class", path_class_value);
    			}

    			if (dirty & /*selected*/ 1) set_data_dev(t1, /*selected*/ ctx[0]);

    			if (/*showOptions*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dropdown", slots, []);
    	let { options } = $$props, { defaultOption } = $$props;
    	let showOptions = false;

    	const handleSelection = e => {
    		$$invalidate(0, selected = e.target.innerText);
    		$$invalidate(2, showOptions = false);
    	};

    	let { selected = defaultOption || options[0] } = $$props;
    	const writable_props = ["options", "defaultOption", "selected"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dropdown> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => {
    		$$invalidate(2, showOptions = !showOptions);
    	};

    	const click_handler_1 = e => {
    		$$invalidate(2, showOptions = !showOptions);
    	};

    	$$self.$$set = $$props => {
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    		if ("defaultOption" in $$props) $$invalidate(4, defaultOption = $$props.defaultOption);
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({
    		options,
    		defaultOption,
    		showOptions,
    		handleSelection,
    		selected
    	});

    	$$self.$inject_state = $$props => {
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    		if ("defaultOption" in $$props) $$invalidate(4, defaultOption = $$props.defaultOption);
    		if ("showOptions" in $$props) $$invalidate(2, showOptions = $$props.showOptions);
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selected,
    		options,
    		showOptions,
    		handleSelection,
    		defaultOption,
    		click_handler,
    		click_handler_1
    	];
    }

    class Dropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			options: 1,
    			defaultOption: 4,
    			selected: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dropdown",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*options*/ ctx[1] === undefined && !("options" in props)) {
    			console.warn("<Dropdown> was created without expected prop 'options'");
    		}

    		if (/*defaultOption*/ ctx[4] === undefined && !("defaultOption" in props)) {
    			console.warn("<Dropdown> was created without expected prop 'defaultOption'");
    		}
    	}

    	get options() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultOption() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultOption(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.28.0 */

    const { console: console_1 } = globals;
    const file$2 = "src/App.svelte";

    function create_fragment$2(ctx) {
    	let dropdown0;
    	let updating_selected;
    	let t0;
    	let span0;
    	let t1;
    	let t2;
    	let dropdown1;
    	let updating_selected_1;
    	let t3;
    	let span1;
    	let t4;
    	let current;

    	function dropdown0_selected_binding(value) {
    		/*dropdown0_selected_binding*/ ctx[4].call(null, value);
    	}

    	let dropdown0_props = {
    		options: /*options*/ ctx[2],
    		defaultOption: /*defaultOption*/ ctx[3]
    	};

    	if (/*testValue*/ ctx[0] !== void 0) {
    		dropdown0_props.selected = /*testValue*/ ctx[0];
    	}

    	dropdown0 = new Dropdown({ props: dropdown0_props, $$inline: true });
    	binding_callbacks.push(() => bind(dropdown0, "selected", dropdown0_selected_binding));

    	function dropdown1_selected_binding(value) {
    		/*dropdown1_selected_binding*/ ctx[5].call(null, value);
    	}

    	let dropdown1_props = {
    		options: ["Blue", "Red", "Green", "Yellow", "White", "Black", "Hat", "A", "Bat"],
    		defaultOption: "Red"
    	};

    	if (/*anotherTest*/ ctx[1] !== void 0) {
    		dropdown1_props.selected = /*anotherTest*/ ctx[1];
    	}

    	dropdown1 = new Dropdown({ props: dropdown1_props, $$inline: true });
    	binding_callbacks.push(() => bind(dropdown1, "selected", dropdown1_selected_binding));

    	const block = {
    		c: function create() {
    			create_component(dropdown0.$$.fragment);
    			t0 = space();
    			span0 = element("span");
    			t1 = text(/*testValue*/ ctx[0]);
    			t2 = space();
    			create_component(dropdown1.$$.fragment);
    			t3 = space();
    			span1 = element("span");
    			t4 = text(/*anotherTest*/ ctx[1]);
    			add_location(span0, file$2, 25, 0, 681);
    			add_location(span1, file$2, 31, 0, 856);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(dropdown0, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span0, anchor);
    			append_dev(span0, t1);
    			insert_dev(target, t2, anchor);
    			mount_component(dropdown1, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, t4);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const dropdown0_changes = {};

    			if (!updating_selected && dirty & /*testValue*/ 1) {
    				updating_selected = true;
    				dropdown0_changes.selected = /*testValue*/ ctx[0];
    				add_flush_callback(() => updating_selected = false);
    			}

    			dropdown0.$set(dropdown0_changes);
    			if (!current || dirty & /*testValue*/ 1) set_data_dev(t1, /*testValue*/ ctx[0]);
    			const dropdown1_changes = {};

    			if (!updating_selected_1 && dirty & /*anotherTest*/ 2) {
    				updating_selected_1 = true;
    				dropdown1_changes.selected = /*anotherTest*/ ctx[1];
    				add_flush_callback(() => updating_selected_1 = false);
    			}

    			dropdown1.$set(dropdown1_changes);
    			if (!current || dirty & /*anotherTest*/ 2) set_data_dev(t4, /*anotherTest*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dropdown0.$$.fragment, local);
    			transition_in(dropdown1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dropdown0.$$.fragment, local);
    			transition_out(dropdown1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dropdown0, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t2);
    			destroy_component(dropdown1, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(span1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let testValue, anotherTest;
    	console.log(testValue, "before");

    	const options = [
    		"Email",
    		"Phone",
    		"Boats",
    		"Supercalifragiliciousexpealidocious",
    		"What is your most favorite pet ever on Earth?"
    	];

    	const defaultOption = options[2];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function dropdown0_selected_binding(value) {
    		testValue = value;
    		$$invalidate(0, testValue);
    	}

    	function dropdown1_selected_binding(value) {
    		anotherTest = value;
    		$$invalidate(1, anotherTest);
    	}

    	$$self.$capture_state = () => ({
    		HeroGrid,
    		Dropdown,
    		testValue,
    		anotherTest,
    		options,
    		defaultOption
    	});

    	$$self.$inject_state = $$props => {
    		if ("testValue" in $$props) $$invalidate(0, testValue = $$props.testValue);
    		if ("anotherTest" in $$props) $$invalidate(1, anotherTest = $$props.anotherTest);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		testValue,
    		anotherTest,
    		options,
    		defaultOption,
    		dropdown0_selected_binding,
    		dropdown1_selected_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
