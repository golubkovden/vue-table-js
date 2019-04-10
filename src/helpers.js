export function get(object, path, fallback = undefined) {
    if (!object || !isPlainObject(object)) {
        return fallback;
    }

    let result = object;

    const pieces = typeof path === 'string' ? path.split('.') : [];

    for (let i = 0; i < pieces.length; i++) {
        if (has(result, pieces[i])) {
            result = result[pieces[i]];
        } else {
            return fallback;
        }
    }

    return result;
}

export function value(value) {
    if (typeof value === 'function') {
        return value();
    }

    return value;
}

export function isPlainObject(object) {
    return Object.prototype.toString.call(object) === '[object Object]';
}

export function has(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

export function orderBy({ path, sortable }) {
    return typeof sortable === 'string' ? sortable : path;
}

export function applyOrder(orders, cell, multiple) {
    const column = orderBy(cell);
    const direction = has(orders, column)
        ? orders[column] === 'desc'
            ? 'asc' : null
        : 'desc';

    if (direction === null) {
        const { [column]: omitted, ...other } = orders;

        return other;
    }

    return multiple
        ? { ...orders, [column]: direction }
        : { [column]: direction };
}

export function decompose(columns) {
    const headers = [];
    const leaves = [];

    // Max depth of given columns
    const depth = depthOf(columns);

    transform(headers, leaves, columns, depth);

    return {
        headers,
        leaves,
    };
}

function depthOf(columns) {
    return columns.reduce((level, column) => {
        if (isPlainObject(column) && Array.isArray(column.children) && column.children.length > 0) {
            return Math.max(depthOf(column.children) + 1, level);
        }

        return level;
    }, 1);
}

function transform(headers, leaves, columns, depth, level = 0, prefix = '') {
    columns.forEach(column => {
        const { key, path, children, ...props } = normalizeColumn(column, prefix);

        const record = {
            key,
            path,
            attributes: {
                rowSpan: depth,
                colSpan: 1,
            },
            ...props,
        };

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
    return items.reduce((total, current) => {
        if (current && Array.isArray(current.children) && current.children.length > 0) {
            return total + countColumnsLeaves(current.children);
        }

        return total + 1;
    }, 0);
}

function normalizeColumn(column, prefix = '') {
    if (process.env.NODE_ENV !== 'production' && (typeof column !== 'string' || isPlainObject(column) === false)) {
        throw new Error(`[vue-table-js] Column must be type of "string" or "Object". Actual ${column}`);
    }

    return typeof column === 'string'
        ? { key: column, path: combine(prefix, column) }
        : { ...column, path: combine(prefix, column.key) };
}

function combine(first, second) {
    if (first && second) {
        return `${first}.${second}`;
    }

    return first || second || '';
}
