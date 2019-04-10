(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.VueTableJs = factory());
}(this, function () { 'use strict';

    function objectWithoutProperties (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }
    function get(object, path, fallback) {
        if ( fallback === void 0 ) fallback = undefined;

        if (!object || !isPlainObject(object)) {
            return fallback;
        }

        var result = object;

        var pieces = typeof path === 'string' ? path.split('.') : [];

        for (var i = 0; i < pieces.length; i++) {
            if (has(result, pieces[i])) {
                result = result[pieces[i]];
            } else {
                return fallback;
            }
        }

        return result;
    }

    function value(value) {
        if (typeof value === 'function') {
            return value();
        }

        return value;
    }

    function isPlainObject(object) {
        return Object.prototype.toString.call(object) === '[object Object]';
    }

    function has(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    function orderBy(ref) {
        var path = ref.path;
        var sortable = ref.sortable;

        return typeof sortable === 'string' ? sortable : path;
    }

    function applyOrder(orders, cell, multiple) {
        var obj, obj$1;

        var column = orderBy(cell);
        var direction = has(orders, column)
            ? orders[column] === 'desc'
                ? 'asc' : null
            : 'desc';

        if (direction === null) {
            var omitted = orders[column];
            var rest = objectWithoutProperties( orders, [String(column)] );
            var other = rest;

            return other;
        }

        return multiple
            ? Object.assign({}, orders, ( obj = {}, obj[column] = direction, obj ))
            : ( obj$1 = {}, obj$1[column] = direction, obj$1 );
    }

    function decompose(columns) {
        var headers = [];
        var leaves = [];

        // Max depth of given columns
        var depth = depthOf(columns);

        transform(headers, leaves, columns, depth);

        return {
            headers: headers,
            leaves: leaves,
        };
    }

    function depthOf(columns) {
        return columns.reduce(function (level, column) {
            if (isPlainObject(column) && Array.isArray(column.children) && column.children.length > 0) {
                return Math.max(depthOf(column.children) + 1, level);
            }

            return level;
        }, 1);
    }

    function transform(headers, leaves, columns, depth, level, prefix) {
        if ( level === void 0 ) level = 0;
        if ( prefix === void 0 ) prefix = '';

        columns.forEach(function (column) {
            var ref = normalizeColumn(column, prefix);
            var key = ref.key;
            var path = ref.path;
            var children = ref.children;
            var rest = objectWithoutProperties( ref, ["key", "path", "children"] );
            var props = rest;

            var record = Object.assign({}, {key: key,
                path: path,
                attributes: {
                    rowSpan: depth,
                    colSpan: 1,
                }},
                props);

            if (Array.isArray(children) && children.length > 0) {
                record.attributes.rowSpan = 1;
                record.attributes.colSpan = countColumnsLeaves(children);

                transform(headers, leaves, children, depth - 1, level + 1, path);
            } else {
                leaves.push(record);
            }

            headers[level]
                ? headers[level].push(record)
                : headers[level] = [record];
        });
    }

    function countColumnsLeaves(items) {
        return items.reduce(function (total, current) {
            if (current && Array.isArray(current.children) && current.children.length > 0) {
                return total + countColumnsLeaves(current.children);
            }

            return total + 1;
        }, 0);
    }

    function normalizeColumn(column, prefix) {
        if ( prefix === void 0 ) prefix = '';

        if (process.env.NODE_ENV !== 'production' && (typeof column !== 'string' || isPlainObject(column) === false)) {
            throw new Error(("[vue-table-js] Column must be type of \"string\" or \"Object\". Actual " + column));
        }

        return typeof column === 'string'
            ? { key: column, path: combine(prefix, column) }
            : Object.assign({}, column, {path: combine(prefix, column.key)});
    }

    function combine(first, second) {
        if (first && second) {
            return (first + "." + second);
        }

        return first || second || '';
    }

    //

    var script = {
        props: {
            columns: {
                type: Array,
                required: true,
            },
            rowClass: {
                type: [String, Function],
                default: null,
            },
            data: {
                type: Array,
                default: function () { return ([]); },
            },
            multipleSorting: {
                type: Boolean,
                default: false,
            },
        },
        data: function () { return ({
            headers: [],
            leaves: [],
            orders: {},
        }); },
        watch: {
            columns: {
                handler: function handler(columns) {
                    var ref = decompose(columns);
                    var headers = ref.headers;
                    var leaves = ref.leaves;

                    this.headers = headers;
                    this.leaves = leaves;
                },
                immediate: true,
                deep: true,
            },
        },
        methods: {
            value: value,
            isPlainObject: isPlainObject,
            resolveTitle: function resolveTitle(column) {
                if (typeof column.title === 'string') {
                    return column.title;
                }

                if (typeof column.title === 'function') {
                    return column.title();
                }

                return column.key;
            },
            resolveRowClass: function resolveRowClass(item, index) {
                if (typeof this.rowClass === 'function') {
                    return this.rowClass(item, index);
                }

                return this.rowClass;
            },
            display: function display(item, column) {
                var value = get(item, column.key);

                if (has(column, 'transform')) {
                    if (typeof column.transform === 'function') {
                        return column.transform(value);
                    }

                    if (Array.isArray(column.transform)) {
                        return column.transform.reduce(function (v, f) { return f(v); }, value);
                    }
                }

                return value;
            },
            onColumnClick: function onColumnClick(cell) {
                if (cell.sortable) {
                    this.orders = applyOrder(this.orders, cell, this.multipleSorting);

                    this.$emit(
                        'sorted',
                        Object.entries(this.orders).map(function (ref) {
                            var column = ref[0];
                            var direction = ref[1];

                            return ({ column: column, direction: direction });
                    })
                    );
                }
            },
            columnClasses: function columnClasses(cell) {
                return [
                    { sortable: cell.sortable },
                    this.orders[orderBy(cell)] ];
            },
        },
    };

    function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
    /* server only */
    , shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
      } // Vue.extend constructor export interop.


      var options = typeof script === 'function' ? script.options : script; // render functions

      if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true; // functional template

        if (isFunctionalTemplate) {
          options.functional = true;
        }
      } // scopedId


      if (scopeId) {
        options._scopeId = scopeId;
      }

      var hook;

      if (moduleIdentifier) {
        // server build
        hook = function hook(context) {
          // 2.3 injection
          context = context || // cached call
          this.$vnode && this.$vnode.ssrContext || // stateful
          this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
          // 2.2 with runInNewContext: true

          if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
            context = __VUE_SSR_CONTEXT__;
          } // inject component styles


          if (style) {
            style.call(this, createInjectorSSR(context));
          } // register component module identifier for async chunk inference


          if (context && context._registeredComponents) {
            context._registeredComponents.add(moduleIdentifier);
          }
        }; // used by ssr in case component is cached and beforeCreate
        // never gets called


        options._ssrRegister = hook;
      } else if (style) {
        hook = shadowMode ? function () {
          style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
        } : function (context) {
          style.call(this, createInjector(context));
        };
      }

      if (hook) {
        if (options.functional) {
          // register for functional component in vue file
          var originalRender = options.render;

          options.render = function renderWithStyleInjection(h, context) {
            hook.call(context);
            return originalRender(h, context);
          };
        } else {
          // inject component registration as beforeCreate hook
          var existing = options.beforeCreate;
          options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
      }

      return script;
    }

    var normalizeComponent_1 = normalizeComponent;

    /* script */
    var __vue_script__ = script;

    /* template */
    var __vue_render__ = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c("table", [
        _c(
          "thead",
          _vm._l(_vm.headers, function(row) {
            return _c(
              "tr",
              [
                _vm._l(row, function(column) {
                  return [
                    _vm.isPlainObject(column.title)
                      ? _c(
                          column.title,
                          _vm._b(
                            {
                              tag: "component",
                              class: _vm.columnClasses(column),
                              on: {
                                click: function($event) {
                                  return _vm.onColumnClick(column)
                                }
                              }
                            },
                            "component",
                            column.attributes,
                            false
                          )
                        )
                      : _c(
                          "th",
                          _vm._b(
                            {
                              class: _vm.columnClasses(column),
                              on: {
                                click: function($event) {
                                  return _vm.onColumnClick(column)
                                }
                              }
                            },
                            "th",
                            column.attributes,
                            false
                          ),
                          [
                            _vm._v(
                              "\n                " +
                                _vm._s(_vm.resolveTitle(column)) +
                                "\n            "
                            )
                          ]
                        )
                  ]
                })
              ],
              2
            )
          }),
          0
        ),
        _vm._v(" "),
        _c(
          "tbody",
          [
            Array.isArray(_vm.data) && _vm.data.length > 0
              ? _vm._l(_vm.data, function(item, index) {
                  return _c(
                    "tr",
                    { class: _vm.resolveRowClass(item, index) },
                    [
                      _vm._l(_vm.leaves, function(leaf) {
                        return [
                          leaf.component
                            ? _c(
                                leaf.component,
                                _vm._b(
                                  {
                                    tag: "component",
                                    attrs: { data: _vm.display(item, leaf) }
                                  },
                                  "component",
                                  _vm.value(leaf.props),
                                  false
                                )
                              )
                            : _c("td", [_vm._v(_vm._s(_vm.display(item, leaf)))])
                        ]
                      })
                    ],
                    2
                  )
                })
              : [
                  _c("tr", [
                    _c(
                      "td",
                      { attrs: { colspan: _vm.leaves.length } },
                      [_vm._t("no-data")],
                      2
                    )
                  ])
                ]
          ],
          2
        )
      ])
    };
    var __vue_staticRenderFns__ = [];
    __vue_render__._withStripped = true;

      /* style */
      var __vue_inject_styles__ = undefined;
      /* scoped */
      var __vue_scope_id__ = undefined;
      /* module identifier */
      var __vue_module_identifier__ = undefined;
      /* functional template */
      var __vue_is_functional_template__ = false;
      /* style inject */
      
      /* style inject SSR */
      

      
      var Table = normalizeComponent_1(
        { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
        __vue_inject_styles__,
        __vue_script__,
        __vue_scope_id__,
        __vue_is_functional_template__,
        __vue_module_identifier__,
        undefined,
        undefined
      );

    return Table;

}));
