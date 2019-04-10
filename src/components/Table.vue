<template>
    <table>
        <thead>
        <tr v-for="row in headers">
            <template v-for="column in row">
                <component :is="column.title"
                           v-if="isPlainObject(column.title)"
                           v-bind="column.attributes"
                           :class="columnClasses(column)"
                           @click="onColumnClick(column)"/>
                <th v-else
                    v-bind="column.attributes"
                    :class="columnClasses(column)"
                    @click="onColumnClick(column)">
                    {{ resolveTitle(column) }}
                </th>
            </template>
        </tr>
        </thead>
        <tbody>
        <template v-if="Array.isArray(data) && data.length > 0">
            <tr v-for="(item, index) in data" :class="resolveRowClass(item, index)">
                <template v-for="leaf in leaves">
                    <component :is="leaf.component"
                               v-if="leaf.component"
                               :data="display(item, leaf)"
                               v-bind="value(leaf.props)"/>
                    <td v-else>{{ display(item, leaf) }}</td>
                </template>
            </tr>
        </template>
        <template v-else>
            <tr>
                <td :colspan="leaves.length">
                    <slot name="no-data"/>
                </td>
            </tr>
        </template>
        </tbody>
    </table>
</template>

<script>
    import { applyOrder, decompose, get, has, isPlainObject, orderBy, value } from '../helpers';

    export default {
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
                default: () => ([]),
            },
            multipleSorting: {
                type: Boolean,
                default: false,
            },
        },
        data: () => ({
            headers: [],
            leaves: [],
            orders: {},
        }),
        watch: {
            columns: {
                handler(columns) {
                    const { headers, leaves } = decompose(columns);

                    this.headers = headers;
                    this.leaves = leaves;
                },
                immediate: true,
                deep: true,
            },
        },
        methods: {
            value,
            isPlainObject,
            resolveTitle(column) {
                if (typeof column.title === 'string') {
                    return column.title;
                }

                if (typeof column.title === 'function') {
                    return column.title();
                }

                return column.key;
            },
            resolveRowClass(item, index) {
                if (typeof this.rowClass === 'function') {
                    return this.rowClass(item, index);
                }

                return this.rowClass;
            },
            display(item, column) {
                const value = get(item, column.key);

                if (has(column, 'transform')) {
                    if (typeof column.transform === 'function') {
                        return column.transform(value);
                    }

                    if (Array.isArray(column.transform)) {
                        return column.transform.reduce((v, f) => f(v), value);
                    }
                }

                return value;
            },
            onColumnClick(cell) {
                if (cell.sortable) {
                    this.orders = applyOrder(this.orders, cell, this.multipleSorting);

                    this.$emit(
                        'sorted',
                        Object.entries(this.orders).map(([column, direction]) => ({ column, direction })),
                    );
                }
            },
            columnClasses(cell) {
                return [
                    { sortable: cell.sortable },
                    this.orders[orderBy(cell)],
                ];
            },
        },
    };
</script>
